// Shared Supabase project with the business + ops app (bizqwik). Overridable
// per Vercel environment via VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://aylhnxniqrihpvrllpgz.supabase.co";
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bGhueG5pcXJpaHB2cmxscGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODA3MTUsImV4cCI6MjEwNDM1NjcxNX0.Ww390hrJMxZIr1fLgxCpIWjbJAzCEaSut4gEFa_YvZ4";

// Every edge route lives under this prefix (same deployed function as the
// business app).
export const FN_SLUG = "make-server-980e1cbf";

// One deployment serves every gym; the brand is decided by the hostname's
// subdomain (revolt.bizqwik.co -> "revolt"). For local dev and Vercel preview
// URLs (no brand subdomain) fall back to a ?gym= query param, then
// VITE_DEFAULT_SLUG, then "revolt" so the app is always testable.
export function resolveSlug(): string {
  try {
    const q = new URLSearchParams(window.location.search).get("gym");
    if (q) {
      const slug = q.trim().toLowerCase();
      rememberGym(slug);
      return slug;
    }
    const sub = subdomainSlug(window.location.hostname);
    if (sub) return sub;
    // On the shared secure address, a reload without ?gym= keeps the gym the
    // member arrived with.
    const saved = savedGym();
    if (saved) return saved;
  } catch {
    // window unavailable (SSR/build) — fall through to the default.
  }
  return (import.meta.env.VITE_DEFAULT_SLUG as string | undefined) ?? "revolt";
}

export function subdomainSlug(host: string): string | null {
  const m = host.match(/^([a-z0-9-]+)\.bizqwik\.co$/i);
  return m && m[1].toLowerCase() !== "www" ? m[1].toLowerCase() : null;
}

// A shared https address that always has a valid certificate. A gym subdomain
// whose own certificate isn't issued yet sends members here (with ?gym=) so
// the camera still works — no per-gym domain setup needed.
export const SECURE_FALLBACK_ORIGIN = "https://bizqwik-client-app.vercel.app";

const GYM_KEY = "bq_gym";
function rememberGym(slug: string) {
  try {
    localStorage.setItem(GYM_KEY, slug);
  } catch {
    // storage blocked — the ?gym= param still carries it for this visit.
  }
}
function savedGym(): string | null {
  try {
    return localStorage.getItem(GYM_KEY);
  } catch {
    return null;
  }
}
