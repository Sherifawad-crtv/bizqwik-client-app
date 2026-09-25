import { test, expect, type Page } from "@playwright/test";
import { mockBackend } from "./mocks";

// The scanner is opened via the global FAB (App.tsx), reachable from any tab
// — signing in and landing on Home is enough.
async function signIn(page: Page) {
  await mockBackend(page);
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
}

// Exercises the REAL getUserMedia + <video> rendering path (no mock) against
// a synthetic camera device the Chromium launch flags provide (see
// playwright.config.ts). This is what actually proves the camera opens and
// the frame renders without the double-overlay bug — a network mock alone
// can't touch this code path.
test("QR scanner: opens the camera and renders a live frame (fake device)", async ({ page }) => {
  await signIn(page);

  await page.getByRole("button", { name: "Scan to check in" }).click();
  await expect(page.getByRole("heading", { name: "Scan QR Code" })).toBeVisible();

  // No error banner — the camera started successfully.
  await expect(page.getByText("Camera unavailable")).toHaveCount(0);

  // A live video element inside the scanner region, actually producing frames.
  const video = page.locator("#qr-reader video");
  await expect(video).toBeVisible({ timeout: 10_000 });
  await expect
    .poll(async () => video.evaluate((el: HTMLVideoElement) => el.readyState), { timeout: 10_000 })
    .toBeGreaterThanOrEqual(2); // HAVE_CURRENT_DATA — frames are flowing

  // The decorative corner-bracket overlay renders too (regression guard for
  // the double-frame/misalignment bug: with no `qrbox` passed to the
  // library, it never injects its own competing shaded region).
  await expect(page.locator("#qr-shaded-region")).toHaveCount(0);

  await page.getByRole("button", { name: "Close scanner" }).click();
  await expect(page.getByRole("heading", { name: "Scan QR Code" })).toHaveCount(0);
});

// Deterministically exercises the permission-denied path (can't rely on OS
// camera-permission plumbing headlessly) by making getUserMedia reject the
// way a real "Don't Allow" tap does on iOS Safari, and asserts the friendly,
// actionable message + retry affordance.
test("QR scanner: camera permission denied shows an actionable error", async ({ page }) => {
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator.mediaDevices as any).getUserMedia = () =>
      Promise.reject(new DOMException("Permission denied", "NotAllowedError"));
  });

  await signIn(page);
  await page.getByRole("button", { name: "Scan to check in" }).click();

  await expect(page.getByText("Camera unavailable")).toBeVisible();
  await expect(page.getByText(/Website Settings.*Camera.*Allow/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Try again/i })).toBeVisible();
});

// The FAB is reachable from Home directly — no need to navigate to Bookings
// first. That's the whole point of moving it out of MyBookings.
test("QR scanner: reachable from Home without navigating to Bookings", async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
  await page.getByRole("button", { name: "Scan to check in" }).click();
  await expect(page.getByRole("heading", { name: "Scan QR Code" })).toBeVisible();
});
