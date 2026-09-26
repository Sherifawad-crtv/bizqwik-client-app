import { test, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import QRCode from "qrcode";
import { mockBackend } from "./mocks";

// End-to-end decode: Chromium's fake camera plays a video of the gym's printed
// check-in QR ("revolt"), and the scanner must read it and check the member in.
// (html5-qrcode showed the camera but never decoded — this guards the fix.)
function writeQrVideo(text: string): string {
  const W = 640, H = 480, scale = 10, quiet = 4;
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const side = (n + quiet * 2) * scale;
  const x0 = (W - side) / 2, y0 = (H - side) / 2;
  const y = Buffer.alloc(W * H, 200);
  for (let py = 0; py < side; py++)
    for (let px = 0; px < side; px++) {
      const mx = Math.floor(px / scale) - quiet, my = Math.floor(py / scale) - quiet;
      const dark = mx >= 0 && my >= 0 && mx < n && my < n && qr.modules.get(my, mx);
      y[(y0 + py) * W + (x0 + px)] = dark ? 0 : 255;
    }
  const uv = Buffer.alloc((W / 2) * (H / 2), 128);
  const frame = Buffer.concat([Buffer.from("FRAME\n"), y, uv, uv]);
  const file = join(tmpdir(), `bq-qr-${text}.y4m`);
  writeFileSync(file, Buffer.concat([Buffer.from(`YUV4MPEG2 W${W} H${H} F10:1 Ip A1:1 C420jpeg\n`), frame, frame]));
  return file;
}

test.use({
  launchOptions: {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || "/opt/pw-browsers/chromium",
    args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", `--use-file-for-fake-video-capture=${writeQrVideo("revolt")}`],
  },
});

test("QR scanner: reads the gym's check-in code from the camera and checks the member in", async ({ page }) => {
  let sent: unknown = null;
  await mockBackend(page);
  await page.route(/client\/check-in$/, (r) => {
    sent = r.request().postDataJSON();
    return r.fulfill({ status: 200, headers: { "access-control-allow-origin": "*", "content-type": "application/json" }, body: '{"ok":true}' });
  });
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();

  await page.getByRole("button", { name: "Scan to check in" }).click();
  await expect(page.getByText("Checked in — enjoy your session!", { exact: false })).toBeVisible({ timeout: 10_000 });
  expect(sent).toEqual({ token: "revolt" });
  // The scanner closes and releases the camera.
  await expect(page.getByRole("heading", { name: "Scan QR Code" })).toHaveCount(0);
});

async function signInAndScan(page: import("@playwright/test").Page, reply: { status: number; body: unknown }) {
  await mockBackend(page);
  await page.route(/client\/check-in$/, (r) =>
    r.fulfill({ status: reply.status, headers: { "access-control-allow-origin": "*", "content-type": "application/json" }, body: JSON.stringify(reply.body) }),
  );
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
  await page.getByRole("button", { name: "Scan to check in" }).click();
}

// A class bundle loses one session per check-in: the member is told how many remain.
test("check-in on a class bundle says a session was used and how many are left", async ({ page }) => {
  await signInAndScan(page, { status: 200, body: { ok: true, deducted: true, plan: { name: "10 Classes", kind: "bundle", creditsRemaining: 7, creditsTotal: 10 } } });
  await expect(page.getByText("1 session used · 7 of 10 left on 10 Classes", { exact: false })).toBeVisible({ timeout: 10_000 });
});

// A used-up bundle is refused with a clear popup that points to renewing.
test("check-in with no sessions left opens the no-sessions popup", async ({ page }) => {
  await signInAndScan(page, {
    status: 400,
    body: { error: "You've used all 10 sessions of 10 Classes. Renew at the front desk to keep training.", code: "no_sessions", plan: { name: "10 Classes" } },
  });
  const sheet = page.getByRole("dialog", { name: "No sessions left" });
  await expect(sheet).toBeVisible({ timeout: 10_000 });
  await expect(sheet.getByText("10 Classes · 0 sessions remaining")).toBeVisible();
  await expect(sheet.getByText(/Renew at the front desk/)).toBeVisible();
  await sheet.getByRole("button", { name: "Got it" }).click();
  await expect(sheet).toHaveCount(0);
});
