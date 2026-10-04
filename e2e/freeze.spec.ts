import { test, expect, type Page } from "@playwright/test";
import { mockBackend, BUNDLE_PLAN, type MockOptions } from "./mocks";

async function signIn(page: Page, opts: MockOptions = {}) {
  await mockBackend(page, opts);
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
}
const openPlan = async (page: Page) => {
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page.getByText("My plan", { exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "My plan" })).toBeVisible();
};

test("a plan with a freeze to use offers it, explains it, and freezes once confirmed", async ({ page }) => {
  let froze = 0;
  const plan = { ...BUNDLE_PLAN, freezeDays: 7, canFreeze: true, frozenUntil: null };
  await signIn(page, { mode: "solo", home: { groupPlan: plan, package: null }, plans: { activePlan: plan, canBuy: false }, onFreeze: () => froze++ });
  await openPlan(page);
  await page.getByRole("button", { name: /Freeze my plan · 1 week/ }).click();
  const sheet = page.getByRole("dialog", { name: /Freeze 10-Class Pack/ });
  await expect(sheet).toContainText("pauses today for 1 week");
  await expect(sheet).toContainText("restarts by itself");
  await expect(sheet).toContainText("each plan can be frozen once");
  await sheet.getByRole("button", { name: "Freeze now" }).click();
  await expect(page.getByText("Plan frozen")).toBeVisible();
  expect(froze).toBe(1);
});

test("a frozen plan says until when and that it restarts by itself — no freeze button", async ({ page }) => {
  const until = new Date(Date.now() + 5 * 86400000).toISOString();
  const plan = { ...BUNDLE_PLAN, freezeDays: 7, canFreeze: false, frozenUntil: until };
  await signIn(page, { mode: "solo", home: { groupPlan: plan, package: null }, plans: { activePlan: plan, canBuy: false } });
  await expect(page.getByTestId("membership-hero")).toContainText("Frozen until");
  await openPlan(page);
  await expect(page.getByTestId("frozen-note")).toContainText("restarts by itself");
  await expect(page.getByRole("button", { name: /Freeze my plan/ })).toHaveCount(0);
});

test("a plan with no freeze (or an already used one) shows no freeze button", async ({ page }) => {
  const plan = { ...BUNDLE_PLAN, freezeDays: 7, canFreeze: false, frozenUntil: null };
  await signIn(page, { mode: "solo", home: { groupPlan: plan, package: null }, plans: { activePlan: plan, canBuy: false } });
  await openPlan(page);
  await expect(page.getByRole("button", { name: /Freeze my plan/ })).toHaveCount(0);
});
