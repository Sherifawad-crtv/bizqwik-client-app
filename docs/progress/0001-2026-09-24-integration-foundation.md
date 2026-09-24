# 0001 — Backend integration foundation (Phase 4, slice 1)

**Date:** 2026-09-24

Turns the Figma-export mock into a real, branded, authenticated app shell wired
to the shared Bizqwik backend (edge fn `make-server-980e1cbf`, same Supabase
project as the business app).

## Added (`src/lib/`)
- **`config.ts`** — Supabase URL/anon key (env-overridable) + `FN_SLUG`.
  `resolveSlug()` maps the hostname's subdomain (`revolt.bizqwik.co` → `revolt`);
  falls back to `?gym=` then `VITE_DEFAULT_SLUG` then `revolt` for local/preview.
- **`supabase.ts`** — session-persisting client (per-brand origin isolates gyms).
- **`api.ts`** — `callFn` (member token, else anon key) + typed methods:
  public `branding`/`signup`; authed `me`, `home`, `classes`, `book`, `bookings`,
  `cancelBooking`, `checkIn`, `wallet`, `points`.
- **`branding.tsx`** — `BrandingProvider` fetches `/client/branding?slug`, applies
  the brand color to `--bq-primary` (+ derived light/dark/glow), and sets the
  document title, `theme-color`, apple title, icon, and a **dynamic PWA manifest**
  so an installed shortcut carries each gym's identity.
- **`auth.tsx`** — `AuthProvider`: session + member identity (`/me` → `client`),
  `signIn`, `activate` (first-time password set against the front-desk invite),
  `signOut`.

## App shell (`src/app/`)
- `main.tsx` wraps in Branding + Auth providers.
- `App.tsx` gated: splash while loading → "Gym not found" on a bad slug →
  signed-out onboarding (intro carousel → `AuthScreen`) → signed-in app. Profile
  logout wired to `signOut`; home greets the real member name.
- **`AuthScreen.tsx`** (new) — branded email + password sign-in / activate,
  replacing the mock phone/QR login (not supported by our auth).

## Still mock (next slices)
Home classes, session details, booking, bookings, wallet, rewards, membership,
notifications, and the check-in scanner still render mock data — wired to the
`/client/*` endpoints in the following slices.

## Verification
`npm run build` clean (added `@supabase/supabase-js`).
