import { test, expect } from "@playwright/test";
import { MEMBER, mockBackend } from "./mocks";

const LOCS = [
  { id: "L1", name: "Zamalek" },
  { id: "L2", name: "Maadi" },
];

test("multi-location gym: pick a location before sign-in, and it's saved to the account after", async ({ page }) => {
  const saved: Record<string, unknown>[] = [];
  await mockBackend(page, { locations: LOCS, onSetLocation: (b) => saved.push(b) });
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();

  // Before the sign-in screen: where do you train?
  await expect(page.getByRole("heading", { name: "Where do you train?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toHaveCount(0);
  await page.getByRole("radio", { name: /Maadi/ }).click();

  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
  await expect.poll(() => saved.length).toBe(1);
  expect(saved[0]).toEqual({ locationId: "L2" });
});

test("multi-location gym: a member with a location goes straight in, and can change it in Profile", async ({ page }) => {
  const saved: Record<string, unknown>[] = [];
  await mockBackend(page, { locations: LOCS, me: { client: { ...MEMBER, homeLocationId: "L1" } }, onSetLocation: (b) => saved.push(b) });
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  // The picker shows (nothing chosen on this phone yet); choosing then signing in.
  await page.getByRole("radio", { name: /Zamalek/ }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
  // Already on the account: nothing to save.
  await page.waitForTimeout(400);
  expect(saved).toEqual([]);

  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page.getByRole("button", { name: /Location · Zamalek/ }).click();
  await expect(page.getByRole("heading", { name: "Change location" })).toBeVisible();
  await page.getByRole("radio", { name: /Maadi/ }).click();
  await expect.poll(() => saved.length).toBe(1);
  expect(saved[0]).toEqual({ locationId: "L2" });
  await expect(page.getByRole("button", { name: /Location · Maadi/ })).toBeVisible();
});

test("single-location gym: no location step at all", async ({ page }) => {
  await mockBackend(page, { locations: [{ id: "L1", name: "Main" }] });
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Where do you train?" })).toHaveCount(0);
});
