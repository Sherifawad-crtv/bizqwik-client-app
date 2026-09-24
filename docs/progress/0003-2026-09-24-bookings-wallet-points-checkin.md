# 0003 — Bookings, wallet, points & check-in wired (Phase 4, slice 3)

**Date:** 2026-09-24

- **My Bookings** → `/client/bookings`: upcoming vs past, class title + time,
  pay status, attendance chip. Cancel (upcoming) → `/client/bookings/:id/cancel`
  with a confirm and a toast showing any wallet refund; refetches.
- **Check-in scanner**: a "Check in" button opens `QRScannerScreen`
  (html5-qrcode); the scanned value (the gym's lifetime QR = its slug) is sent
  to `/client/check-in` → point earned, toast, refetch.
- **Wallet** → `/client/wallet`: store-credit balance hero + transaction history
  (credit/debit, category, date). No online top-up (v1 store-credit only).
- **Rewards/Points** → `/client/points`: balance, EGP value toward renewal, and
  the earn ledger. Redemption stays a front-desk discount (no in-app spend).

All simplified to the v1 model; mock tiers/challenges/streaks/top-up/cards
removed.

## Verification
`npm run build` clean.
