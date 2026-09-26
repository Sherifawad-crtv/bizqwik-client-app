/**
 * Belt-and-braces JS backstop for the CSS-level native-feel rules in
 * globals.css. Covers cases CSS alone can't reach: Safari's legacy
 * gesture events for pinch-zoom, stray context menus on long-press,
 * and two-finger pinch on engines that ignore `touch-action`.
 */
export function installNativeShell() {
  const preventDefault = (e: Event) => e.preventDefault();

  // Safari-only pinch-zoom gesture events (no standard touch-action equivalent).
  document.addEventListener("gesturestart", preventDefault);
  document.addEventListener("gesturechange", preventDefault);
  document.addEventListener("gestureend", preventDefault);

  // Long-press / right-click context menu (e.g. "Copy", "Save Image").
  document.addEventListener("contextmenu", preventDefault);

  // Two-finger pinch fallback for engines that don't honor touch-action.
  document.addEventListener(
    "touchmove",
    (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false },
  );
}

/**
 * Native apps paint the status bar area (clock, Wi-Fi, battery) in the same
 * color as the top of the screen. The browser does that from <meta
 * name="theme-color">, so keep it in sync with whatever is actually at the
 * top of the page right now: black over the photo onboarding, the page color
 * elsewhere. Also paints the page background the same, so the safe area and
 * iOS overscroll bounce never show a different color.
 */
export function installStatusBarSync() {
  const meta = (() => {
    let el = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.name = "theme-color";
      document.head.appendChild(el);
    }
    return el;
  })();

  const solid = (css: string): string | null => {
    const m = css.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = "1"] = m[1].split(",").map((x) => x.trim());
    if (Number(a) < 0.9) return null; // see-through: keep looking underneath
    return `#${[r, g, b].map((v) => Number(v).toString(16).padStart(2, "0")).join("")}`;
  };

  const topColor = (): string => {
    let el = document.elementFromPoint(window.innerWidth / 2, 1) as HTMLElement | null;
    while (el) {
      const c = solid(getComputedStyle(el).backgroundColor);
      if (c) return c;
      el = el.parentElement;
    }
    return "#ffffff";
  };

  let last = "";
  let pending = 0;
  const sync = () => {
    pending = 0;
    const c = topColor();
    if (c === last) return;
    last = c;
    meta.content = c;
    document.documentElement.style.backgroundColor = c;
    document.body.style.backgroundColor = c;
  };
  const schedule = () => {
    if (!pending) pending = window.setTimeout(() => requestAnimationFrame(sync), 120);
  };

  new MutationObserver(schedule).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style"] });
  window.addEventListener("scroll", schedule, { capture: true, passive: true });
  window.addEventListener("resize", schedule);
  schedule();
}
