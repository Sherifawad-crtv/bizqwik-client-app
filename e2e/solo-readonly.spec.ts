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

test("solo gym: no booking or payment, just \"I'm coming\"", async ({ page }) => {
  await mockBackend(page, { mode: "solo" });
  await signIn(page);
  await expect(page.getByRole("button", { name: "Book a class" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "My bookings" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Bookings", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Schedule", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Schedule" })).toBeVisible();
  const card = page.getByRole("button", { name: /Morning HIIT/ });
  await expect(card).toBeVisible();
  await expect(card).toBeEnabled();
});

test("team gym: booking is unchanged", async ({ page }) => {
  await mockBackend(page, { mode: "team" });
  await signIn(page);
  await expect(page.getByRole("button", { name: "Book a class" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Bookings", exact: true })).toBeVisible();
});

test("solo gym: tap a class, say you're coming, and take it back", async ({ page }) => {
  const calls: [string, unknown][] = [];
  await mockBackend(page, { mode: "solo", onRsvp: (id, b) => calls.push([id, b.going]) });
  await signIn(page);
  await page.getByRole("button", { name: "Schedule", exact: true }).click();
  await page.getByRole("button", { name: /Morning HIIT/ }).first().click();
  const sheet = page.getByRole("dialog", { name: "Morning HIIT" });
  await expect(sheet.getByText("Coming?")).toBeVisible();
  // No prices, wallets or payment choices anywhere in it.
  await expect(sheet.getByText(/EGP|wallet|desk/i)).toHaveCount(0);
  await sheet.getByRole("button", { name: "I'm coming" }).click();
  await expect(page.getByText("See you there!")).toBeVisible();
  expect(calls).toHaveLength(1);
  expect(calls[0][1]).toBe(true);
});

test("solo gym: a class you're going to says so and can be cancelled", async ({ page }) => {
  const calls: unknown[] = [];
  const going = { count: 3, initials: ["You", "AK", "MS"] };
  await mockBackend(page, {
    mode: "solo",
    classes: [{ id: "c1", title: "Morning HIIT", description: null, startsAt: new Date(Date.now() + 3 * 3600000).toISOString(), price: 0, status: "active", booked: true, going }],
    onRsvp: (_id, b) => calls.push(b.going),
  });
  await signIn(page);
  await page.getByRole("button", { name: "Schedule", exact: true }).click();
  const card = page.getByRole("button", { name: /Morning HIIT.*going/ }).first();
  await expect(card).toBeVisible();
  await expect(card.getByText("Going")).toBeVisible();
  await expect(card.getByTestId("going")).toContainText("coming");
  await card.click();
  await page.getByRole("button", { name: "Can't make it" }).click();
  await expect(page.getByText("Got it")).toBeVisible();
  expect(calls).toEqual([false]);
});
