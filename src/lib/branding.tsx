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
function mix([r, g, b]: [number, number, number], target: number, amt: number): string {
  const c = (v: number) => clamp(v + (target - v) * amt);
  return `#${[c(r), c(g), c(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function applyTheme(b: Branding) {
  const root = document.documentElement;
  const rgb = b.branding.primaryColor ? parseHex(b.branding.primaryColor) : null;
  if (rgb) {
    const hex = `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    root.style.setProperty("--bq-primary", hex);
    root.style.setProperty("--bq-primary-light", mix(rgb, 255, 0.28));
    root.style.setProperty("--bq-primary-dark", mix(rgb, 0, 0.22));
    root.style.setProperty("--glow-primary", `0 8px 24px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.15)`);
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
