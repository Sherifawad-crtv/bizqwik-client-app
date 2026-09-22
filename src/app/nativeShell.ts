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
