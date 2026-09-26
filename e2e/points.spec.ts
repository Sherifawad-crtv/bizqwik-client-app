import { test, expect, type Page } from "@playwright/test";
import { mockBackend, type MockOptions } from "./mocks";

// Points v2: big point numbers, small EGP value; redeem in whole EGP once past
// the gym's minimum, leftovers stay.

async function openPoints(page: Page, opts: MockOptions) {
  await mockBackend(page, opts);
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
  await page.getByRole("button", { name: /Points/ }).first().click();
  await expect(page.getByRole("heading", { name: "Points" })).toBeVisible();
}

const CFG = { enabled: true, rate: 500, earnRate: 10, checkinPoints: 50, minRedeem: 10000 };

test("member: below the minimum shows progress and can't redeem yet", async ({ page }) => {
  await openPoints(page, {
    points: { ...CFG, total: 7400, valueEgp: 14, nextExpiry: { points: 7400, at: "2027-09-24T09:00:00Z" }, ledger: [{ id: "pl-1", points: 7400, reason: "purchase", createdAt: "2026-09-24T09:00:00Z" }] },
  });
  await expect(page.getByText("7,400", { exact: true })).toBeVisible();
  await expect(page.getByText("worth 14 EGP")).toBeVisible();
  await expect(page.getByText("7,400 / 10,000 points until you can redeem 20 EGP")).toBeVisible();
  await expect(page.getByRole("button", { name: "Redeem from 10,000 points" })).toBeDisabled();
  await expect(page.getByText(/7,400 points expire on/)).toBeVisible();
  await expect(page.getByText("Earn 10 points per EGP you spend and 50 per check-in. 500 points = 1 EGP of wallet credit.")).toBeVisible();
});

test("member: redeems points into wallet credit", async ({ page }) => {
  const sent: Record<string, unknown>[] = [];
  let redeemed = false;
  await openPoints(page, {
    points: () =>
      redeemed
        ? { ...CFG, total: 250, valueEgp: 0, nextExpiry: null, ledger: [{ id: "pl-2", points: -15000, reason: "redeem", createdAt: "2026-09-26T10:00:00Z" }, { id: "pl-1", points: 15250, reason: "purchase", createdAt: "2026-09-24T09:00:00Z" }] }
        : { ...CFG, total: 15250, valueEgp: 30, nextExpiry: null, ledger: [{ id: "pl-1", points: 15250, reason: "purchase", createdAt: "2026-09-24T09:00:00Z" }] },
    onRedeem: (b) => {
      sent.push(b);
      redeemed = true;
      return { body: { pointsSpent: 15000, egpCredited: 30, points: 250, wallet: 6830 } };
    },
  });

  await page.getByRole("button", { name: "Redeem 30 EGP to wallet" }).click();
  await expect(page.getByText("15,000 points become 30 EGP in your wallet. The other 250 points stay for next time.")).toBeVisible();
  await page.getByRole("button", { name: "Redeem", exact: true }).click();

  await expect(page.getByText("30 EGP added to your wallet")).toBeVisible();
  expect(sent).toEqual([{}]);
  await expect(page.getByText("Redeemed to wallet")).toBeVisible();
  await expect(page.getByText("−15,000")).toBeVisible();
});

test("member: no redeem button when the gym has points off", async ({ page }) => {
  await openPoints(page, { points: { enabled: false, total: 0, valueEgp: 0, rate: 500, earnRate: null, checkinPoints: 50, minRedeem: 10000, nextExpiry: null, ledger: [] } });
  await expect(page.getByText("Points aren't running at your gym yet.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Redeem/ })).toHaveCount(0);
});
