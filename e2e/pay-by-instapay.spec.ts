import { test, expect } from "@playwright/test";
import { mockBackend } from "./mocks";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
}

// A real 1x1 PNG so the browser can decode it for compression.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

test("solo gym: Prices tab replaces Bookings and lists Kids / Adults / PT", async ({ page }) => {
  await mockBackend(page, { mode: "solo" });
  await signIn(page);
  await expect(page.getByRole("button", { name: "Bookings", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Prices", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Prices", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kids classes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Adults classes" })).toBeVisible();
  await expect(page.getByText("Adults 24 classes")).toBeVisible();
  // Private training is behind the toggle at the top.
  await expect(page.getByText("No expiry")).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Classes" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Private training" }).click();
  await expect(page.getByText("No expiry")).toBeVisible();
  await expect(page.getByText("8 sessions", { exact: true })).toBeVisible();
  await expect(page.getByText("Adults 24 classes")).toHaveCount(0);
  await expect(page.getByText("9,000", { exact: true })).toBeVisible();
});

test("team gym has no Prices tab", async ({ page }) => {
  await mockBackend(page, { mode: "team" });
  await signIn(page);
  await expect(page.getByRole("button", { name: "Prices", exact: true })).toHaveCount(0);
});

test("pay by InstaPay: copy the address, upload the receipt, send for approval", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const sent: Record<string, unknown>[] = [];
  await mockBackend(page, {
    mode: "solo",
    onPay: (b) => {
      sent.push(b);
      return { body: { request: { id: "req-1", offerType: "plan_type", name: "Adults 8 classes", price: 5000, status: "pending", note: null, createdAt: "2026-10-04T10:00:00Z" } } };
    },
  });
  await signIn(page);
  await page.getByRole("button", { name: "Prices", exact: true }).click();
  await page.getByText("Adults 8 classes").locator("xpath=ancestor::div[contains(@class,'rounded-[1.25rem]')][1]").getByRole("button", { name: "Pay with InstaPay" }).click();
  await expect(page.getByTestId("ipa")).toHaveText("hh@instapay");
  await page.getByRole("button", { name: "Copy InstaPay address" }).click();
  await expect(page.getByText("Copied")).toBeVisible();
  const send = page.getByRole("button", { name: "Send for approval" });
  await expect(send).toBeDisabled();
  await page.getByTestId("proof-input").setInputFiles({ name: "receipt.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByAltText("Your receipt")).toBeVisible();
  await send.click();
  await expect(page.getByText("Sent for approval")).toBeVisible();
  expect(sent).toHaveLength(1);
  expect(sent[0]).toMatchObject({ offerType: "plan_type", id: "pt-a8" });
  expect(String(sent[0].proof)).toMatch(/^data:image\/jpeg;base64,/);
});

test("waiting for approval locks the buttons and can be cancelled", async ({ page }) => {
  let cancelled = 0;
  await mockBackend(page, {
    mode: "solo",
    prices: { pending: { id: "req-1", offerType: "plan_type", name: "Adults 8 classes", price: 5000, status: "pending", note: null, createdAt: "2026-10-04T10:00:00Z" } },
    onCancelPay: () => cancelled++,
  });
  await signIn(page);
  await page.getByRole("button", { name: "Prices", exact: true }).click();
  await expect(page.getByTestId("pending-payment")).toContainText("Waiting for approval");
  await expect(page.getByRole("button", { name: "Waiting for approval" }).first()).toBeDisabled();
  await page.getByRole("button", { name: "Cancel this payment" }).click();
  await expect.poll(() => cancelled).toBe(1);
});

test("a rejected payment shows the reason; an active plan blocks another plan", async ({ page }) => {
  await mockBackend(page, {
    mode: "solo",
    prices: {
      recent: [{ id: "req-0", offerType: "plan_type", name: "Adults 8 classes", price: 5000, status: "rejected", note: "Amount didn't match", createdAt: "2026-10-03T10:00:00Z" }],
      offers: [
        { offerType: "plan_type", id: "pt-a8", name: "Adults 8 classes", price: 5000, months: 1, count: 8, canRequest: false },
        { offerType: "bundle_type", id: "bt-1", name: "Adults personal training 8 sessions", price: 9000, months: null, expiryDays: null, count: 8, canRequest: true },
      ],
    },
  });
  await signIn(page);
  await page.getByRole("button", { name: "Prices", exact: true }).click();
  await expect(page.getByTestId("rejected-payment")).toContainText("Amount didn't match");
  await expect(page.getByRole("button", { name: "You have an active plan" })).toBeDisabled();
  await page.getByRole("tab", { name: "Private training" }).click();
  await expect(page.getByRole("button", { name: "Pay with InstaPay" })).toBeEnabled();
});

test("only one kind on sale: no toggle, just that list", async ({ page }) => {
  await mockBackend(page, { mode: "solo", prices: { offers: [{ offerType: "plan_type", id: "pt-a8", name: "Adults 8 classes", price: 5000, months: 1, count: 8, canRequest: true }] } });
  await signIn(page);
  await page.getByRole("button", { name: "Prices", exact: true }).click();
  await expect(page.getByText("Adults 8 classes")).toBeVisible();
  await expect(page.getByRole("tablist")).toHaveCount(0);
});

test("what you get: a 1-month plan has a 1 week freeze, a 3-month plan 2 weeks, PT none", async ({ page }) => {
  await mockBackend(page, { mode: "solo" });
  await signIn(page);
  await page.getByRole("button", { name: "Prices", exact: true }).click();
  const one = page.getByRole("list", { name: "What you get with Adults 8 classes" });
  await expect(one).toContainText("8 classes");
  await expect(one).toContainText("Valid 1 month");
  await expect(one).toContainText("1 week freeze");
  const three = page.getByRole("list", { name: "What you get with Adults 24 classes" });
  await expect(three).toContainText("Valid 3 months");
  await expect(three).toContainText("2 weeks freeze");
  await page.getByRole("tab", { name: "Private training" }).click();
  await expect(page.getByRole("list", { name: /What you get with Adults personal training/ })).not.toContainText("freeze");
});

test("the pay sheet repeats what they get, freeze included", async ({ page }) => {
  await mockBackend(page, { mode: "solo" });
  await signIn(page);
  await page.getByRole("button", { name: "Prices", exact: true }).click();
  await page.getByText("Adults 24 classes").locator("xpath=ancestor::div[contains(@class,'rounded-[1.25rem]')][1]").getByRole("button", { name: "Pay with InstaPay" }).click();
  await expect(page.getByRole("dialog").getByText("24 classes · Valid 3 months · 2 weeks freeze")).toBeVisible();
});
