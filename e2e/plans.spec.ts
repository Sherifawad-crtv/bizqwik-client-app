import { test, expect, type Page } from "@playwright/test";
import { BUNDLE_PLAN, CLASSES, mockBackend, type MockOptions } from "./mocks";

// Services model, member side: plan coverage on the schedule, the booking
// resolver (plan seat vs drop-in, with the "you still have X" confirm), and
// the My plan shop (wallet purchase, one plan at a time).

async function signIn(page: Page, opts: MockOptions) {
  await mockBackend(page, opts);
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
}

test("member: a class the plan covers books on the plan (bundle spends a credit)", async ({ page }) => {
  const sent: Record<string, unknown>[] = [];
  await signIn(page, {
    home: { groupPlan: BUNDLE_PLAN, package: null },
    classes: [{ ...CLASSES[0], coverage: "plan" }],
    onBook: (b) => {
      sent.push(b);
      return { body: { booking: { id: "bk-p", coverage: "plan" } } };
    },
  });
  await expect(page.getByText("10-Class Pack")).toBeVisible();
  await expect(page.getByText(/7 of 10 classes left/)).toBeVisible();
  await expect(page.getByText("On your plan")).toBeVisible();

  await page.getByRole("button", { name: "Book", exact: true }).click();
  await expect(page.getByText("Included in 10-Class Pack")).toBeVisible();
  await expect(page.getByText("Uses 1 of your 7 class credits")).toBeVisible();
  await page.getByRole("button", { name: "Book with my plan" }).click();
  await expect(page.getByText("Booked — 1 class credit used")).toBeVisible();
  expect(sent).toEqual([{}]);
});

test("member: a drop-in while a plan is running asks first, then charges", async ({ page }) => {
  const sent: Record<string, unknown>[] = [];
  await signIn(page, {
    home: { groupPlan: { ...BUNDLE_PLAN, kind: "class_monthly", name: "Yoga · Monthly", creditsTotal: null, creditsRemaining: null }, package: null },
    classes: [{ ...CLASSES[0], coverage: "drop_in" }],
    onBook: (b) => {
      sent.push(b);
      if (!b.confirmActivePlan) {
        return { status: 409, body: { error: "You still have Yoga · Monthly (until Nov 14). Pay for this class as a drop-in anyway?", code: "active_plan_confirm" } };
      }
      return { body: { booking: { id: "bk-d", coverage: "drop_in" } } };
    },
  });
  await expect(page.getByText("150 EGP").first()).toBeVisible();

  await page.getByRole("button", { name: "Book", exact: true }).click();
  await expect(page.getByText("Your Yoga · Monthly doesn't include this class, so it's paid per visit.")).toBeVisible();
  await page.getByRole("button", { name: /Pay from wallet/ }).click();

  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect(page.getByText("You still have a plan running")).toBeVisible();
  await expect(page.getByText(/You still have Yoga · Monthly/)).toBeVisible();
  await page.getByRole("button", { name: "Pay the drop-in" }).click();
  await expect(page.getByText("Booked — paid from wallet")).toBeVisible();

  expect(sent).toHaveLength(2);
  expect(sent[0]).toMatchObject({ payMethod: "wallet", confirmActivePlan: false });
  expect(sent[1]).toMatchObject({ payMethod: "wallet", confirmActivePlan: true });
});

test("member: buys a class bundle from the shop with wallet credit", async ({ page }) => {
  let bought: Record<string, unknown> | null = null;
  await signIn(page, {
    home: { package: null },
    onBuy: (b) => {
      bought = b;
      return { body: { plan: BUNDLE_PLAN, wallet: 5000 } };
    },
  });
  await page.getByText("No active plan").click();
  await expect(page.getByRole("heading", { name: "My plan" })).toBeVisible();
  await expect(page.getByText("All-Access · 1 Month")).toBeVisible();
  await expect(page.getByText("10 classes, any class · valid 2 months")).toBeVisible();
  await expect(page.getByText("Morning HIIT · Monthly")).toBeVisible();

  await page.getByRole("button", { name: "Buy with wallet" }).nth(1).click();
  await expect(page.getByText("Buy 10-Class Pack?")).toBeVisible();
  await page.getByRole("button", { name: "Buy now" }).click();
  await expect(page.getByText("10-Class Pack is active — enjoy! 💪")).toBeVisible();
  expect(bought).toEqual({ planTypeId: "pt-10" });
});

test("member: the shop is locked while a plan is still running", async ({ page }) => {
  await signIn(page, { home: { groupPlan: BUNDLE_PLAN }, plans: { activePlan: BUNDLE_PLAN, canBuy: false } });
  await page.getByText("10-Class Pack").first().click();
  await expect(page.getByRole("heading", { name: "My plan" })).toBeVisible();
  await expect(page.getByText(/You can have one plan at a time/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Buy with wallet" })).toHaveCount(0);
});

test("member: each running PT bundle shows its own code for the coach to scan", async ({ page }) => {
  await signIn(page, {
    home: { package: null },
    pt: [
      { id: "pk1", name: "PT · 8 Sessions", coachName: "Coach Nour", sessionsRemaining: 5, sessionsIncluded: 8, expiryDate: "2026-12-01", qrToken: "bqpt_abc", loggedToday: false },
      { id: "pk2", name: "PT · 4 Sessions", coachName: "Coach Omar", sessionsRemaining: 2, sessionsIncluded: 4, expiryDate: "2026-11-01", qrToken: "bqpt_def", loggedToday: true },
    ],
  });
  await page.getByText("No active plan").click();
  await expect(page.getByRole("heading", { name: "My plan" })).toBeVisible();
  await expect(page.getByTestId("pt-bundle")).toHaveCount(2);
  await expect(page.getByText("Private training · Coach Nour")).toBeVisible();
  await expect(page.getByText("5 of 8 sessions left")).toBeVisible();

  await page.getByRole("button", { name: "Show code to your coach" }).nth(1).click();
  const sheet = page.getByRole("dialog", { name: "PT code" });
  await expect(sheet.getByText("Show this to Coach Omar when your session starts.")).toBeVisible();
  await expect(sheet.getByTestId("pt-qr")).toBeVisible();
  await expect(sheet.getByText("Today's session is already logged")).toBeVisible();
  await sheet.getByRole("button", { name: "Close code" }).click();
  await expect(sheet).toHaveCount(0);
});

test("member: no PT codes once bundles are finished", async ({ page }) => {
  await signIn(page, { home: { package: null }, pt: [] });
  await page.getByText("No active plan").click();
  await expect(page.getByRole("heading", { name: "My plan" })).toBeVisible();
  await expect(page.getByTestId("pt-bundle")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Show code to your coach" })).toHaveCount(0);
});
