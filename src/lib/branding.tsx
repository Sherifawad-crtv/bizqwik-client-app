import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Branding } from "./api";
import { resolveSlug } from "./config";

interface BrandingState {
  loading: boolean;
  error: string | null;
  slug: string;
  data: Branding | null;
}

const Ctx = createContext<BrandingState>({ loading: true, error: null, slug: "", data: null });

export function useBranding() {
  return useContext(Ctx);
}

// --- tiny hex helpers to derive light/dark/glow from the one brand color ---
function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;
}
function mix(rgb: [number, number, number], target: number, amt: number): string {
  const c = (v: number) => v + (target - v) * amt;
  return toHex([c(rgb[0]), c(rgb[1]), c(rgb[2])]);
}

// --- WCAG contrast, so an org's arbitrary brand color can never make text
// unreadable, whether it's used as a button background or as text/icon color
// on a light one. Any bright/pale color an ops user picks passes through
// this before it's ever paired with text. ---
function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function relLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrast(l1: number, l2: number): number {
  const [a, b] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (a + 0.05) / (b + 0.05);
}

const WHITE: [number, number, number] = [255, 255, 255];
// The app's own "dark ink" text color (globals.css --bq-text-primary) — used
// as the "dark" candidate so on-primary text matches the rest of the UI
// instead of falling back to flat black.
const DARK_INK: [number, number, number] = [0x1f, 0x29, 0x37];

/** Best of white/black against this background is mathematically guaranteed
 * to clear WCAG AA (4.5:1) for ANY background color — the two contrast
 * curves cross at ~4.58:1, the worst case, using *true* black/white
 * (luminance exactly 0/1). DARK_INK (the app's softer near-black) is close
 * to that but not exactly 0, so it does NOT carry the same guarantee on its
 * own — confirmed by a mid-gray brand color (#7A7A7A) failing at 4.29:1 in
 * testing. So: decide white-vs-dark using true black/white, then substitute
 * the softer ink only where it independently still clears AA, falling back
 * to true black in the narrow band where it wouldn't. */
function pickOnColor(bg: [number, number, number]): string {
  const lb = relLuminance(bg);
  const needsWhite = contrast(1, lb) >= contrast(0, lb);
  if (needsWhite) return "#ffffff";
  return contrast(relLuminance(DARK_INK), lb) >= 4.5 ? toHex(DARK_INK) : "#000000";
}

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}
function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [hue2rgb(h + 1 / 3) * 255, hue2rgb(h) * 255, hue2rgb(h - 1 / 3) * 255];
}

/** The brand color, darkened just enough (in HSL, hue/saturation untouched)
 * to hit 4.5:1 against a white/near-white background — for when the brand
 * color itself is the text or icon color (nav labels, links, badge text),
 * not a button fill. Returns the color unchanged if it already passes. */
function ensureReadableOnWhite(rgb: [number, number, number]): string {
  if (contrast(relLuminance(rgb), relLuminance(WHITE)) >= 4.5) return toHex(rgb);
  const hsl = rgbToHsl(rgb);
  for (let l = hsl[2]; l >= 0; l -= 0.02) {
    // Validate the ROUNDED hex we'd actually return, not the raw float RGB —
    // rounding to the nearest byte per channel can nudge a candidate that
    // passed pre-rounding to just under 4.5 after. Found by exhaustively
    // sweeping all 256 grays: #8b8b8b/#bebebe/#f1f1f1 all converged on a
    // rounded output that landed at 4.478:1, just short of AA.
    const candidateHex = toHex(hslToRgb([hsl[0], hsl[1], l]));
    const candidateRgb = parseHex(candidateHex)!;
    if (contrast(relLuminance(candidateRgb), relLuminance(WHITE)) >= 4.5) return candidateHex;
  }
  return "#000000"; // unreachable in practice — contrast(black, white) = 21:1
}

function applyTheme(b: Branding) {
  const root = document.documentElement;
  const rgb = b.branding.primaryColor ? parseHex(b.branding.primaryColor) : null;
  if (rgb) {
    const hex = toHex(rgb);
    root.style.setProperty("--bq-primary", hex);
    root.style.setProperty("--bq-primary-light", mix(rgb, 255, 0.28));
    root.style.setProperty("--bq-primary-dark", mix(rgb, 0, 0.22));
    root.style.setProperty("--glow-primary", `0 8px 24px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.15)`);
    // Every org picks its own brand color, which can be anywhere from near-
    // black to near-white — these two guarantee it never makes text
    // unreadable: one for text/icons ON a primary-filled background (CTAs,
    // badges), one for the brand color used AS text/icon color on a
    // white/light background (nav labels, links). See ensureReadableOnWhite
    // and pickOnColor above for the actual WCAG math.
    root.style.setProperty("--bq-on-primary", pickOnColor(rgb));
    root.style.setProperty("--bq-primary-readable", ensureReadableOnWhite(rgb));
    setMeta("theme-color", hex);
  }

  const name = b.branding.appName || b.org.name;
  document.title = name;
  setMeta("apple-mobile-web-app-title", name, "name");

  const icon = b.branding.iconUrl;
  if (icon) {
    setLink("apple-touch-icon", icon);
    setLink("icon", icon);
  }

  // Dynamic PWA manifest so an installed shortcut carries the gym's identity.
  const manifest = {
    name,
    short_name: name,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: rgb ? b.branding.primaryColor : "#5A41FF",
    icons: icon ? [{ src: icon, sizes: "512x512", type: "image/png", purpose: "any maskable" }] : [],
  };
  const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
  setLink("manifest", URL.createObjectURL(blob));
}

function setMeta(key: string, value: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}
function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BrandingState>({ loading: true, error: null, slug: resolveSlug(), data: null });

  useEffect(() => {
    let alive = true;
    api
      .branding(state.slug)
      .then((data) => {
        if (!alive) return;
        applyTheme(data);
        setState((s) => ({ ...s, loading: false, data }));
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setState((s) => ({ ...s, loading: false, error: err instanceof Error ? err.message : "Couldn't load this gym." }));
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}
