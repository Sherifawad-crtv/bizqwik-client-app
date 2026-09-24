# 0004 — Profile, membership & v1 cleanup (Phase 4, slice 4)

**Date:** 2026-09-24

- **Profile** → real identity from `/me` (name, email, initials) + gym name from
  branding; menu trimmed to the supported v1 items (Membership, Wallet, Points)
  and Log out.
- **Membership** → real plan from `/client/home` (active membership expiry, or
  package sessions left + expiry, or a "visit the front desk" empty state).
  Read-only — plans are sold at the desk.
- **App cleanup**: reduced to the v1 screen set (home, bookings, wallet,
  membership, rewards, profile). Removed the now-unreachable mock booking flow
  (session-details/confirm/success), notifications, and profile sub-screens
  (personal-info / linked-gyms / payment-methods / support) — out of v1 scope.
  Notification bell shows no badge (notifications not backed in v1).

## Phase 4 status: member app v1 complete
Branded + authed shell, home + booking (wallet / pay-at-desk), bookings +
cancel + check-in scanner, wallet, points, membership, profile — all wired to
the shared backend. Remaining: Phase 5 verification (pg_net + mocked Playwright).

## Verification
`npm run build` clean.
