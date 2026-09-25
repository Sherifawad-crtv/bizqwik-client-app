# Brand-color contrast — WCAG-safe text/icon colors, computed per org

## The problem
Every gym picks its own arbitrary brand hex in the ops branding form (no
constraints). The app hardcoded `text-white` on every CTA button/badge that
sits on a `--bq-primary`-colored background, and used the raw brand color
directly as text/icon color on white backgrounds (nav labels, links,
badges). A bright/pale brand color (reported: a very bright yellow) made
white CTA text essentially invisible — and the inverse case (a pale color as
*text* on white) has the same problem in reverse.

## The fix
Two new CSS custom properties, computed once per org in
`lib/branding.tsx`'s `applyTheme()` from the org's brand hex, using real
WCAG relative-luminance/contrast math (not eyeballed):

- **`--bq-on-primary`** — the text/icon color for anything sitting ON a
  solid/gradient `--bq-primary` background (buttons, FAB, avatar initials,
  badges). Picks white or the app's dark ink color, whichever contrasts
  better — falls back to true black in the narrow band where the softer ink
  alone wouldn't clear AA.
- **`--bq-primary-readable`** — the brand color itself, darkened in HSL
  (hue/saturation untouched) just enough to hit 4.5:1 against white, for
  when the brand color is used AS text/icon color on a light background
  (nav active-tab label, links, soft badges). Left unchanged if it already
  passes.

Applied across every live screen (Auth, NewPassword, Intro, Home, Bookings,
Wallet, Membership, Profile, BottomNav, Fab, NotificationBell) wherever
`text-white`/`#fff` sat on a primary background, or `var(--bq-primary)` was
used directly as text/icon color on white.

## Two real bugs found and fixed via testing, not just derived on paper
1. **Guarantee gap**: the "pick white or dark, whichever wins" approach is
   mathematically guaranteed to clear 4.5:1 for ANY background — but only
   when compared against *true* black/white (luminance exactly 0/1). Using
   the app's softer dark-ink color (`#1F2937`, luminance ≈0.019) instead of
   true black breaks that guarantee. Caught by testing `#7A7A7A`: white text
   only hit 4.29:1. Fixed by deciding white-vs-dark using true black/white,
   then substituting the softer ink only where it *independently* still
   clears AA, else falling back to true black.
2. **Rounding gap**: `ensureReadableOnWhite`'s darkening loop validated
   contrast on the unrounded float RGB from HSL→RGB conversion, but
   returned a hex string rounded to the nearest byte per channel — rounding
   could nudge a passing candidate to just under 4.5. Caught by an
   exhaustive sweep of all 256 grays: `#8b8b8b`/`#bebebe`/`#f1f1f1` all
   converged on `#777777` at 4.478:1. Fixed by validating the actual
   rounded hex, not the pre-rounding float.

## Verification
Standalone script (not just the app compiling) re-implementing the exact
algorithm and checking every candidate against the real 4.5:1 threshold:
15 named cases (the reported bright-yellow case, pale pink, neon green,
near-black, near-white, Revolt's real orange, the default purple, plus
deliberately adversarial crossover-zone grays) + an exhaustive sweep of all
256 pure grays + 1080 HSL points (hue 0–360°/5, saturation 0.3/0.6/1.0,
lightness 0.15/0.3/0.5/0.7/0.85). All ≥1350 cases pass after both fixes.

Also visually confirmed against a deliberately bright-yellow brand color
(`#FFEB3B`, close to the reported case): sign-in button, "Forgot password?"
link, Book/Pay-from-wallet CTAs, the FAB, and the active nav tab all render
with dark, clearly legible text/icons instead of invisible white-on-yellow.

`tsc -b` + build clean; existing e2e suite green (6/6) — no visual
regression for the default purple brand, since white still wins there
(5.78:1, well above AA) exactly as before.

## Known residual, not fixed here
The avatar/logo-fallback gradient (`from-[var(--bq-primary)] to-[var(--bq-accent)]`)
mixes the org's brand color with a fixed, non-brand-configurable accent
(`--bq-accent: #FFB547`). `--bq-on-primary` is computed from the primary end
only; the accent end's own contrast isn't independently validated. Low risk
in practice (accent is a fixed, known mid-luminance orange, not an
arbitrary org input) but worth revisiting if `--bq-accent` ever becomes
per-org configurable too.
