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
    if (q) return q.trim().toLowerCase();
    const host = window.location.hostname;
    const m = host.match(/^([a-z0-9-]+)\.bizqwik\.co$/i);
    if (m && m[1].toLowerCase() !== "www") return m[1].toLowerCase();
  } catch {
    // window unavailable (SSR/build) — fall through to the default.
  }
  return (import.meta.env.VITE_DEFAULT_SLUG as string | undefined) ?? "revolt";
}
