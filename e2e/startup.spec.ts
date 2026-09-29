import { test, expect, type Page } from "@playwright/test";
import { mockBackend, BUNDLE_PLAN, MEMBER, type MockOptions } from "./mocks";

// Opening the app: few requests, nothing shown that turns out wrong a moment
// later, returning members straight onto Home, and only members of this gym
// get in.

const NINE_AM = new Date(new Date().setHours(9, 0, 0, 0));

async function open(page: Page, opts: MockOptions = {}) {
  await page.clock.install({ time: NINE_AM });
  await mockBackend(page, { home: { groupPlan: BUNDLE_PLAN, package: null }, ...opts });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?gym=revolt");
}
async function signIn(page: Page) {
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
}
const slow = (page: Page, pattern: RegExp, ms: number) =>
  page.route(pattern, async (route) => {
    await new Promise((r) => setTimeout(r, ms));
    await route.fallback();
  });

test("Home loads with one data request, and asks who the member is only once", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", (r) => {
    const m = r.url().match(/make-server-980e1cbf\/([^?]+)/);
    if (m && r.method() !== "OPTIONS") calls.push(m[1]);
  });
  await open(page);
  await signIn(page);
  await expect(page.getByTestId("membership-hero")).toContainText("10-Class Pack");
  await page.waitForTimeout(500);
  expect(calls.filter((c) => c === "me")).toHaveLength(1);
  expect(calls.filter((c) => c === "client/home")).toHaveLength(1);
  expect(calls.filter((c) => c === "client/classes" || c === "client/notifications")).toEqual([]);
});

test("quick actions never show one that isn't this member's while loading", async ({ page }) => {
  await open(page);
  await slow(page, /\/client\/home$/, 1500);
  const seen = new Set<string>();
  await signIn(page);
  // Watch every frame until Home has its data.
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    for (const t of await page.getByRole("group", { name: "Quick actions" }).getByRole("button").allInnerTexts()) seen.add(t.trim());
    if (seen.size) break;
    await page.waitForTimeout(40);
  }
  await expect(page.getByRole("group", { name: "Quick actions" }).getByRole("button")).toHaveText(["Book a class", "Check in", "My bookings"]);
  for (const t of await page.getByRole("group", { name: "Quick actions" }).getByRole("button").allInnerTexts()) seen.add(t.trim());
  expect([...seen].sort()).toEqual(["Book a class", "Check in", "My bookings"]);
});

test("a returning member opens straight onto their Home, even before the server answers", async ({ page }) => {
  await open(page);
  await signIn(page);
  await expect(page.getByTestId("membership-hero")).toContainText("10-Class Pack");
  // Next launch: a slow network.
  await slow(page, /\/client\/(branding|home)$|\/me$/, 3000);
  await page.reload();
  await expect(page.getByTestId("membership-hero")).toContainText("10-Class Pack", { timeout: 1500 });
  await expect(page.getByRole("group", { name: "Quick actions" }).getByRole("button")).toHaveText(["Book a class", "Check in", "My bookings"]);
});

test("the gym's colours are there from the very first frame on a return visit", async ({ page }) => {
  await open(page, { primaryColor: "#E5322D" });
  await signIn(page);
  await expect(page.getByTestId("membership-hero")).toBeVisible();
  await slow(page, /\/client\/branding$/, 3000);
  await page.reload({ waitUntil: "commit" });
  await page.waitForSelector("#root");
  const color = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bq-primary").trim().toLowerCase());
  expect(color).toBe("#e5322d");
});

test("a staff login is turned away with a clear message", async ({ page }) => {
  await open(page, { me: { client: null, profile: { id: "staff-1", role: "coach", name: "Coach" } } });
  await signIn(page);
  await expect(page.getByRole("alert")).toContainText("This app is for gym members");
  await expect(page.getByTestId("membership-hero")).toHaveCount(0);
});

test("a member of another gym can't use this gym's app", async ({ page }) => {
  await open(page, { me: { client: { ...MEMBER, orgId: "org-other" } } });
  await signIn(page);
  await expect(page.getByText("This isn't your gym's app")).toBeVisible();
  await expect(page.getByTestId("membership-hero")).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

test("signing out forgets the member's data on this device", async ({ page }) => {
  await open(page);
  await signIn(page);
  await expect(page.getByTestId("membership-hero")).toBeVisible();
  const before = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("bq:")).sort());
  expect(before).toEqual(expect.arrayContaining(["bq:me", "bq:home:client-zz"]));
  await page.getByRole("button", { name: "Profile" }).click();
  await page.getByRole("button", { name: /Log out/ }).click();
  await expect(page.locator('input[type="email"]').or(page.getByRole("button", { name: "Skip" }))).toBeVisible();
  const after = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("bq:")).sort());
  expect(after.filter((k) => k === "bq:me" || k.startsWith("bq:home:"))).toEqual([]);
});
