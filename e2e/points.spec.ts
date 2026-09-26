import { test, expect, type Page } from "@playwright/test";
import { mockBackend, type MockOptions } from "./mocks";

// Points → wallet: redeem in whole EGP at the gym's rate, leftover points stay.

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

test("member: redeems points into wallet credit", async ({ page }) => {
  const sent: Record<string, unknown>[] = [];
  let redeemed = false;
  await openPoints(page, {
    points: () =>
      redeemed
        ? { total: 4, valueEgp: 0.8, rate: 5, ledger: [{ id: "pl-2", points: -1230, reason: "redeem", createdAt: "2026-09-26T10:00:00Z" }, { id: "pl-1", points: 1234, reason: "checkin", createdAt: "2026-09-24T09:00:00Z" }] }
        : { total: 1234, valueEgp: 246.8, rate: 5, ledger: [{ id: "pl-1", points: 1234, reason: "checkin", createdAt: "2026-09-24T09:00:00Z" }] },
    onRedeem: (b) => {
      sent.push(b);
      redeemed = true;
      return { body: { pointsSpent: 1230, egpCredited: 246, points: 4, wallet: 7046 } };
    },
  });

  await expect(page.getByText("Worth 246 EGP · 5 points = 1 EGP")).toBeVisible();
  await page.getByRole("button", { name: "Redeem 246 EGP to wallet" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect(page.getByText("1,230 points become 246 EGP in your wallet. The other 4 points stay for next time.")).toBeVisible();
  await page.getByRole("button", { name: "Redeem", exact: true }).click();

  await expect(page.getByText("246 EGP added to your wallet")).toBeVisible();
  expect(sent).toEqual([{}]);
  await expect(page.getByText("Redeemed to wallet")).toBeVisible();
  await expect(page.getByText("−1,230")).toBeVisible();
  await expect(page.getByRole("button", { name: "Collect 5 points to redeem" })).toBeDisabled();
});

test("member: no redeem button when the gym hasn't set a points rate", async ({ page }) => {
  await openPoints(page, { points: { total: 30, valueEgp: 0, rate: null, ledger: [] } });
  await expect(page.getByText("30", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Redeem|Collect/ })).toHaveCount(0);
});
