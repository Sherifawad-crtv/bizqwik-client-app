import { test, expect } from "@playwright/test";
import { mockBackend } from "./mocks";

// The member app should feel native: no zoom, nothing to select, copy, drag or
// long-press on the page; fields still edit; and it asks to stay upright.
test("page content can't be selected, copied, dragged or long-pressed; fields still edit", async ({ page }) => {
  await mockBackend(page, {});
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?gym=revolt");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("textbox").first().waitFor();

  const css = await page.evaluate(() => ({
    select: getComputedStyle(document.body).userSelect,
    touch: getComputedStyle(document.querySelector("button, div")!).touchAction,
  }));
  expect(css.select).toBe("none");
  expect(css.touch).toBe("pan-x pan-y");

  const blocked = (type: string, ctor: "Mouse" | "Event", sel: string) =>
    page.evaluate(([t, c, s]) => {
      const el = document.querySelector(s as string)!;
      const e = c === "Mouse" ? new MouseEvent(t as string, { bubbles: true, cancelable: true }) : new Event(t as string, { bubbles: true, cancelable: true });
      el.dispatchEvent(e);
      return e.defaultPrevented;
    }, [type, ctor, sel]);
  expect(await blocked("contextmenu", "Mouse", "body")).toBe(true);
  expect(await blocked("copy", "Event", "body")).toBe(true);
  expect(await blocked("selectstart", "Event", "body")).toBe(true);
  expect(await blocked("dragstart", "Event", "body")).toBe(true);

  const field = page.getByRole("textbox").first();
  await field.fill("me@example.com");
  await expect(field).toHaveValue("me@example.com");
  expect(await field.evaluate((el) => getComputedStyle(el).userSelect)).toBe("text");
  expect(await blocked("contextmenu", "Mouse", "input")).toBe(false);

  const manifest = await page.evaluate(async () => {
    const href = (document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null)?.href;
    return href ? await (await fetch(href)).json() : null;
  });
  expect(manifest?.orientation).toBe("portrait");
});
