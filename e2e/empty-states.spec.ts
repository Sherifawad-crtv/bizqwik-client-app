import { test, expect, type Page } from "@playwright/test";
import { mockBackend } from "./mocks";

// A brand-new member at a gym with nothing set up: each screen says what's
// missing and what happens next, never a bare blank.
const CORS = { "access-control-allow-origin": "*", "content-type": "application/json" };

async function go(page: Page) {
  await mockBackend(page, {
    home: { package: null, groupPlan: null, membership: null, eligible: false, wallet: 0, points: 0, pointsValueEgp: 0, upcomingClasses: [] } as never,
    classes: [],
    plans: { offers: [], wallet: 0, canBuy: true, activePlan: null, history: [] },
    points: { enabled: true, total: 0, valueEgp: 0, rate: 500, earnRate: 10, checkinPoints: 50, minRedeem: 10000, nextExpiry: null, ledger: [] },
    pt: [],
  });
  await page.route(/\/client\/bookings$/, (r) => r.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ bookings: [] }) }));
  await page.route(/\/client\/wallet$/, (r) => r.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ balance: 0, transactions: [], activity: [] }) }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
}
test("new member: home and bookings explain the empty schedule", async ({ page }) => {
  await go(page);
  await expect(page.getByText("No classes on this day")).toBeVisible();
  await expect(page.getByText("Your gym hasn't scheduled any classes yet.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Bookings" }).click();
  await expect(page.getByText("No bookings yet")).toBeVisible();
  await page.getByRole("button", { name: "Browse classes" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
});

test("new member: plan, wallet and points explain what fills them", async ({ page }) => {
  await go(page);
  await page.getByRole("button", { name: "Profile" }).click();
  await page.getByText("My plan", { exact: true }).click();
  await expect(page.getByText("Nothing on sale yet")).toBeVisible();
  await expect(page.getByText("You can still drop in and pay per class.")).toBeVisible();
  await page.getByRole("button", { name: "Profile" }).click();
  await page.getByText("Wallet", { exact: true }).click();
  await expect(page.getByText("No transactions yet")).toBeVisible();
  await page.getByRole("button", { name: "Profile" }).click();
  await page.getByText("Points", { exact: true }).click();
  await expect(page.getByText("No points yet")).toBeVisible();
});
