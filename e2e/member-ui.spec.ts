import { test, expect, type Page } from "@playwright/test";
import { mockBackend, BUNDLE_PLAN, NOTIFICATIONS, type MockOptions } from "./mocks";

// Times on a fixed "today" (the page clock is pinned to 9:00 AM) so the Today
// row never depends on when the suite runs.
const NINE_AM = new Date(new Date().setHours(9, 0, 0, 0));
const today = (h: number, m = 0) => new Date(new Date(NINE_AM).setHours(h, m)).toISOString();
const tomorrow = (h: number) => { const d = new Date(NINE_AM); d.setDate(d.getDate() + 1); d.setHours(h, 0, 0, 0); return d.toISOString(); };
const cls = (id: string, title: string, startsAt: string | number, extra: Record<string, unknown> = {}) => ({
  id, seriesId: `s-${id}`, title, description: null, startsAt: new Date(startsAt).toISOString(), price: 150, status: "active", booked: false, coverage: "drop_in", imageUrl: null, going: { count: 0, initials: [] }, ...extra,
});
const CLASSES = [
  cls("a", "Sunrise HIIT", today(18), { going: { count: 38, initials: ["AK", "MS", "LH", "NR"] }, coverage: "plan" }),
  cls("b", "Power Yoga", today(18), { booked: true, going: { count: 9, initials: ["You", "HB", "OT", "SA"] } }),
  cls("c", "Boxing", today(20, 30)),
  cls("d", "Strength Club", tomorrow(19)),
];

async function signIn(page: Page, opts: MockOptions = {}) {
  await page.clock.install({ time: NINE_AM });
  await mockBackend(page, { classes: CLASSES, home: { groupPlan: BUNDLE_PLAN, package: null }, ...opts });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
}

test("home: the plan is the hero; today's classes are a swipeable row of photo cards", async ({ page }) => {
  await signIn(page);
  const hero = page.getByTestId("membership-hero");
  await expect(hero).toContainText("10-Class Pack");
  await expect(hero).toContainText("7");
  await expect(hero).toContainText("/ 10 classes left");
  await expect(page.getByRole("group", { name: "Quick actions" }).getByRole("button")).toHaveText(["Book a class", "My plan", "My bookings"]);

  const row = page.getByRole("list", { name: "Today's classes" });
  await expect(row.getByTestId("class-card")).toHaveCount(3); // not tomorrow's
  const hiit = row.getByRole("button", { name: /Sunrise HIIT/ });
  await expect(hiit).toContainText("On your plan");
  await expect(hiit).toContainText("In 9 hrs");
  await expect(hiit.getByTestId("going")).toHaveText(/AK\s*MS\s*LH\s*\+35/);
  await expect(row.getByRole("button", { name: /Power Yoga, .*booked/ })).toContainText("Booked");
  // No gym photo yet → Bizqwik's default class photo.
  await expect(hiit.locator("img")).toHaveAttribute("src", /app-assets\/classes\/\d\.jpg$/);
});

test("schedule: the day picker leads, and the day's classes are grouped by start time", async ({ page }) => {
  await signIn(page);
  await page.getByRole("button", { name: "Schedule" }).click();
  await expect(page.getByRole("tab", { selected: true })).toContainText("Today");
  await expect(page.getByRole("region", { name: "6:00 PM" }).getByTestId("class-card")).toHaveCount(2);
  await expect(page.getByRole("region", { name: "8:30 PM" }).getByTestId("class-card")).toHaveCount(1);
  await page.getByRole("tab").nth(1).click();
  await expect(page.getByRole("region", { name: "7:00 PM" })).toContainText("Strength Club");
});

test("notifications: the bell shows unread, the list opens and marks them read", async ({ page }) => {
  let readAll: Record<string, unknown> | null = null;
  await signIn(page, { notifications: NOTIFICATIONS, onReadAll: (b) => (readAll = b) });
  const bell = page.locator("button").filter({ has: page.locator("svg.lucide-bell") }).first();
  await expect(bell).toContainText("1");
  await bell.click();
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await expect(page.getByTestId("notification")).toHaveCount(2);
  await expect(page.getByTestId("notification").first()).toHaveAttribute("data-unread", "true");
  await expect(page.getByTestId("notification").first()).toContainText("Morning HIIT is cancelled");
  await expect.poll(() => readAll).toEqual({});
  await page.getByRole("button", { name: "Back" }).click();
  await expect(bell).not.toContainText("1");
});
