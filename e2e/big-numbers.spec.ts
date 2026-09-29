import { test, expect } from "@playwright/test";
import { mockBackend } from "./mocks";

// However large an amount is, it must stay inside its row: the page never
// grows sideways.
const HUGE = 1.03e56;

test("absurdly large amounts are shortened and never overflow the page", async ({ page }) => {
  await mockBackend(page, { home: { wallet: HUGE } });
  await page.route(/\/client\/wallet$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        balance: HUGE,
        transactions: [],
        activity: [
          { id: "wt-big", kind: "credit", title: "Refund to wallet", detail: null, amount: HUGE, method: "wallet", walletDelta: HUGE, at: "2026-09-29T14:45:00Z" },
          { id: "wt-big2", kind: "credit", title: "Refund to wallet", detail: null, amount: 1e13, method: "wallet", walletDelta: 1e13, at: "2026-09-29T14:44:00Z" },
        ],
      }),
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByTestId("membership-hero")).toBeVisible();
  await page.getByRole("button", { name: "Wallet" }).click();
  await expect(page.getByRole("heading", { name: "Wallet" })).toBeVisible();
  const rows = page.getByTestId("money-row");
  await expect(rows).toHaveCount(2);

  // Shortened, not written out in full.
  await expect(rows.nth(0)).toContainText("999T+");
  await expect(rows.nth(1)).toContainText("+10T EGP");

  const overflow = await page.evaluate(() => {
    const root = document.querySelector("[data-scroll-root]") as HTMLElement;
    const over = [...document.querySelectorAll('[data-testid="money-row"]')].some((r) => (r as HTMLElement).scrollWidth > (r as HTMLElement).clientWidth + 1);
    return { page: document.documentElement.scrollWidth > window.innerWidth, root: root.scrollWidth > root.clientWidth + 1, over };
  });
  expect(overflow).toEqual({ page: false, root: false, over: false });
});
