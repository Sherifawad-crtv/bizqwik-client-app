import { test, expect } from "@playwright/test";
import { mockBackend } from "./mocks";

// A gym whose subdomain has no certificate yet is served from the shared
// secure address with ?gym=<slug>. A later reload (or the home-screen icon)
// without the param must stay on that gym, not fall back to the default.
test("the gym from ?gym= is remembered on the shared address", async ({ page }) => {
  await mockBackend(page);
  const asked: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.pathname.includes("/client/branding")) asked.push(u.search + u.pathname);
  });

  await page.goto("/?gym=solid");
  await expect.poll(() => asked.some((a) => a.includes("solid"))).toBe(true);

  asked.length = 0;
  await page.goto("/");
  await expect.poll(() => asked.length).toBeGreaterThan(0);
  expect(asked.every((a) => a.includes("solid"))).toBe(true);
});
