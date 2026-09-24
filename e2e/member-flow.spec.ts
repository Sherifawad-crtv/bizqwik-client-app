import { test, expect } from "@playwright/test";
import { mockBackend } from "./mocks";

// Fully-mocked click-through of the member app's core loop:
// branded intro -> sign in -> home -> book a class -> bookings -> wallet.
test("member: intro -> sign in -> home -> book -> bookings -> wallet", async ({ page }) => {
  await mockBackend(page);
  await page.goto("/?gym=revolt");

  // Branding resolved -> intro carousel. Skip to auth.
  await page.getByRole("button", { name: "Skip" }).click();

  // Branded sign-in screen.
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByText("Sign in to Revolt")).toBeVisible();

  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Home renders with the member's first name + live wallet/points tiles.
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
  await expect(page.getByText("6800 EGP")).toBeVisible();
  await expect(page.getByText("Package · 5/6 sessions left")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Upcoming classes" })).toBeVisible();
  await expect(page.getByText("Morning HIIT")).toBeVisible();

  // Open the booking sheet and pay from wallet.
  await page.getByRole("button", { name: "Book", exact: true }).click();
  await expect(page.getByText("Pay from wallet")).toBeVisible();
  await page.getByRole("button", { name: /Pay from wallet/ }).click();
  await expect(page.getByText(/paid from wallet/i)).toBeVisible(); // sonner toast
  await expect(page.getByText(/paid from wallet/i)).toBeHidden({ timeout: 8000 }); // let it auto-dismiss so it can't intercept nav taps

  // Bottom nav -> Bookings.
  await page.getByRole("button", { name: "Bookings" }).click();
  await expect(page.getByRole("heading", { name: "My bookings" })).toBeVisible();
  await expect(page.getByText("Morning HIIT")).toBeVisible();

  // Bottom nav -> Profile -> Wallet.
  await page.getByRole("button", { name: "Profile" }).click();
  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  await expect(page.getByText("Zara Halim")).toBeVisible();
  await page.getByRole("button", { name: "Wallet" }).click();

  await expect(page.getByRole("heading", { name: "Wallet" })).toBeVisible();
  await expect(page.getByText("Store credit")).toBeVisible();
  await expect(page.getByText("Compensation")).toBeVisible();
});

// A gym slug that the backend rejects should show the friendly "Gym not found".
test("member: unknown gym shows a friendly error", async ({ page }) => {
  await page.route(/\/functions\/v1\/make-server-980e1cbf\//, (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } });
    return route.fulfill({ status: 404, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }, body: JSON.stringify({ error: "Gym not found" }) });
  });
  await page.goto("/?gym=nope");
  await expect(page.getByText("Gym not found").first()).toBeVisible();
});
