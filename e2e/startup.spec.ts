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

test("until Home's data is here there is only a loading screen, then everything appears together", async ({ page }) => {
  await open(page);
  await slow(page, /\/client\/home$/, 1500);
  await signIn(page);
  const app = [
    page.getByRole("group", { name: "Quick actions" }),
    page.getByTestId("membership-hero"),
    page.getByRole("heading", { name: /Hi, Zara/ }),
    page.getByRole("button", { name: "Profile" }),
    page.getByRole("button", { name: "Bookings" }),
  ];
  // Check every 40ms across the wait: none of the app may appear early.
  const deadline = Date.now() + 1200;
  while (Date.now() < deadline) {
    for (const el of app) expect(await el.count()).toBe(0);
    await page.waitForTimeout(40);
  }
  await expect(page.getByTestId("membership-hero")).toBeVisible();
  // The moment one part is there, all of it is.
  for (const el of app) expect(await el.count()).toBeGreaterThan(0);
  await expect(page.getByRole("group", { name: "Quick actions" }).getByRole("button")).toHaveText(["Book a class", "Check in", "My bookings"]);
});

test("the gym's colours are already applied when the app first appears", async ({ page }) => {
  await open(page, { primaryColor: "#E5322D" });
  await signIn(page);
  await expect(page.getByTestId("membership-hero")).toBeVisible();
  const color = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bq-primary").trim().toLowerCase());
  expect(color).toBe("#e5322d");
});

test("nothing about the member is kept on the device, and old saved copies are cleared", async ({ page }) => {
  // A copy left on the device by an older version.
  await page.addInitScript(() => localStorage.setItem("bq:home:client-zz", '{"wallet":999}'));
  await open(page);
  await signIn(page);
  await expect(page.getByTestId("membership-hero")).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("bq:")))).toEqual([]);
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
