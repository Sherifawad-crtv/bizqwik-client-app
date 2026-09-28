import { test, expect, type Page } from "@playwright/test";
import { mockBackend, BUNDLE_PLAN } from "./mocks";

// Scrolling should feel native: nothing blocks the page scroll, the class
// rows only scroll sideways and land on a card, and loading doesn't make the
// page jump.

const NINE_AM = new Date(new Date().setHours(9, 0, 0, 0));
const at = (h: number, m = 0) => new Date(new Date(NINE_AM).setHours(h, m)).toISOString();
const cls = (id: string, title: string, startsAt: string) => ({
  id, seriesId: `s-${id}`, title, description: null, startsAt, price: 150, status: "active", booked: false, coverage: "drop_in", imageUrl: null, going: { count: 0, initials: [] },
});
const CLASSES = ["HIIT", "Yoga", "Boxing", "Spin", "Pilates"].map((t, i) => cls(`c${i}`, t, at(18)));

async function signIn(page: Page, classesDelayMs = 0) {
  // Record every touch/wheel listener that could hold up scrolling.
  await page.addInitScript(() => {
    (window as any).__blocking = [];
    const orig = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type: string, fn: any, opts?: any) {
      const passive = typeof opts === "object" && opts?.passive === true;
      if (["touchstart", "touchmove", "wheel", "mousewheel"].includes(type) && !passive) (window as any).__blocking.push(type);
      return orig.call(this, type, fn, opts);
    };
  });
  await page.clock.install({ time: NINE_AM });
  await mockBackend(page, { classes: CLASSES, home: { groupPlan: BUNDLE_PLAN, package: null } });
  if (classesDelayMs) {
    await page.route(/\/client\/classes$/, async (route) => {
      await new Promise((r) => setTimeout(r, classesDelayMs));
      await route.fallback();
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator('input[type="email"]').fill("zara@zztest.dev");
  await page.locator('input[type="password"]').fill("ZZpass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Hi, Zara/ })).toBeVisible();
}

test("nothing makes the page wait for JavaScript before it scrolls", async ({ page }) => {
  await signIn(page);
  // React's own root listeners are passive for touch; ours must be too.
  const blocking: string[] = await page.evaluate(() => (window as any).__blocking);
  expect(blocking.filter((t) => t === "touchmove" || t === "wheel")).toEqual([]);
});

test("a class row scrolls only sideways, doesn't spill into the page, and lands on a card", async ({ page }) => {
  await signIn(page);
  const row = page.getByRole("list", { name: "Today's classes" });
  await expect(row.getByTestId("class-card")).toHaveCount(5);

  const style = await row.evaluate((el) => {
    const s = getComputedStyle(el);
    return { x: s.overflowX, y: s.overflowY, over: s.overscrollBehaviorX, snap: s.scrollSnapType, touch: s.touchAction };
  });
  expect(style).toEqual({ x: "auto", y: "hidden", over: "contain", snap: "x mandatory", touch: "pan-x pan-y" });

  // Let go part-way between two cards: it settles exactly on a card's edge.
  await row.evaluate((el) => el.scrollBy({ left: 130 }));
  await page.waitForTimeout(400);
  const landed = await row.evaluate((el) => {
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft);
    const starts = [...el.querySelectorAll('[role="listitem"]')].map((c) => (c as HTMLElement).offsetLeft - el.offsetLeft - pad);
    return { left: el.scrollLeft, starts, max: el.scrollWidth - el.clientWidth };
  });
  const onCard = landed.starts.some((s) => Math.abs(s - landed.left) <= 1) || Math.abs(landed.left - landed.max) <= 1;
  expect(onCard, JSON.stringify(landed)).toBe(true);
  expect(landed.left).toBeGreaterThan(0);
});

test("pressing a card waits a beat before shrinking, so starting a scroll on it doesn't", async ({ page }) => {
  await signIn(page);
  const card = page.getByTestId("class-card").first();
  const delay = await card.evaluate((el) => {
    const sheet = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } });
    return sheet.some((r) => r instanceof CSSStyleRule && r.selectorText.includes('active:scale') && r.style.transitionDelay === "90ms");
  });
  expect(delay).toBe(true);
});

test("while classes load, a same-size placeholder holds their space", async ({ page }) => {
  await signIn(page, 1500);
  const skeleton = page.getByTestId("carousel-skeleton");
  await expect(skeleton).toBeVisible();
  const before = (await skeleton.boundingBox())!.height;
  const row = page.getByRole("list", { name: "Today's classes" });
  await expect(row).toBeVisible();
  const after = (await row.boundingBox())!.height;
  expect(Math.abs(after - before)).toBeLessThanOrEqual(2);
});
