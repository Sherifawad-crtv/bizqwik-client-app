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

test("solo gym: classes are shown but can't be booked", async ({ page }) => {
  await mockBackend(page, { mode: "solo" });
  await signIn(page);
  await expect(page.getByRole("button", { name: "Book a class" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "My bookings" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Bookings", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Schedule", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Schedule" })).toBeVisible();
  const card = page.getByRole("button", { name: /Morning HIIT/ });
  await expect(card).toBeVisible();
  await expect(card).toBeDisabled();
});

test("team gym: booking is unchanged", async ({ page }) => {
  await mockBackend(page, { mode: "team" });
  await signIn(page);
  await expect(page.getByRole("button", { name: "Book a class" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Bookings", exact: true })).toBeVisible();
});
