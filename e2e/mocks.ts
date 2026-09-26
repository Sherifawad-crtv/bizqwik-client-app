import type { Page, Route } from "@playwright/test";

// A structurally-valid (unsigned) JWT so supabase-js accepts the mocked session.
function fakeJwt(sub: string, email: string): string {
  const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return [
    enc({ alg: "HS256", typ: "JWT" }),
    enc({ sub, email, role: "authenticated", aud: "authenticated", exp, iat: Math.floor(Date.now() / 1000) }),
    "sig",
  ].join(".");
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "authorization,apikey,content-type,x-client-info,x-supabase-api-version",
};

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, headers: { "content-type": "application/json", ...CORS }, body: JSON.stringify(body) });
}

// Mock data mirroring the /client/* backend shapes (see src/lib/api.ts).
export const MEMBER = { id: "client-zz", orgId: "org-revolt", name: "Zara Halim", phone: null, email: "zara@zztest.dev" };

// Class times relative to now so they always land in the Home day strip.
const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

export const CLASSES = [
  { id: "cls-1", seriesId: "s-hiit", title: "Morning HIIT", description: "45 min conditioning", startsAt: inHours(3), price: 150, status: "active", booked: false, coverage: "drop_in" },
];

const HOME = {
  name: "Zara",
  membership: null,
  package: { id: "pkg-1", sessionsRemaining: 5, sessionsIncluded: 6, expiryDate: "2026-10-08", status: "active" },
  groupPlan: null,
  eligible: true,
  wallet: 6800,
  points: 12,
  pointsValueEgp: 12,
  upcomingClasses: CLASSES,
};

export const BUNDLE_PLAN = {
  id: "gp-1", kind: "bundle", name: "10-Class Pack", priceAtSale: 1800, creditsTotal: 10, creditsRemaining: 7, invitationsRemaining: 0,
  startsAt: inHours(-120), expiresAt: inHours(24 * 50), status: "active",
};

export const OFFERS = [
  { offerType: "plan_type", id: "pt-all", kind: "membership", name: "All-Access · 1 Month", price: 4000, durationMonths: 1, credits: null },
  { offerType: "plan_type", id: "pt-10", kind: "bundle", name: "10-Class Pack", price: 1800, durationMonths: 2, credits: 10 },
  { offerType: "series", id: "s-hiit", kind: "class_monthly", name: "Morning HIIT · Monthly", price: 1200, durationMonths: 1, credits: null },
];

const BOOKINGS = {
  bookings: [
    { id: "bk-1", classId: "cls-1", payMethod: "wallet", payStatus: "paid", attendance: "booked", price: 150, bookedAt: "2026-09-24T10:00:00Z", classTitle: "Morning HIIT", classStartsAt: "2026-09-25T08:00:00Z" },
  ],
};

const WALLET = {
  balance: 6800,
  transactions: [
    { id: "wt-1", type: "credit", amount: 10000, category: "compensation", description: "Welcome credit", createdAt: "2026-09-24T09:00:00Z" },
    { id: "wt-2", type: "debit", amount: 3200, category: "desk_sale", description: "Package purchase", createdAt: "2026-09-24T09:30:00Z" },
  ],
};

const POINTS = { total: 12, valueEgp: 12, rate: 1, ledger: [{ id: "pl-1", points: 12, reason: "checkin", createdAt: "2026-09-24T09:00:00Z" }] };

const BRANDING = {
  org: { id: "org-revolt", name: "Revolt", slug: "revolt", status: "trial" },
  branding: { appName: "Revolt", logoUrl: null, iconUrl: null, primaryColor: "#5A41FF", onboardingAssets: [] },
};

export interface MockOptions {
  home?: Partial<typeof HOME> & Record<string, unknown>;
  classes?: unknown[];
  plans?: Record<string, unknown>;
  // Return { status, body } to answer a booking or plan purchase yourself.
  onBook?: (body: Record<string, unknown>) => { status?: number; body: unknown };
  onBuy?: (body: Record<string, unknown>) => { status?: number; body: unknown };
  // Points screen data; a function is re-read on every load (e.g. after redeeming).
  points?: Record<string, unknown> | (() => Record<string, unknown>);
  onRedeem?: (body: Record<string, unknown>) => { status?: number; body: unknown };
}

// Intercept every Supabase call — GoTrue auth + the edge function — so the app
// runs fully offline. Returns nothing; call before page.goto.
export async function mockBackend(page: Page, opts: MockOptions = {}) {
  // Kill remote images (Unsplash intro art) so nothing hits the network.
  await page.route(/images\.unsplash\.com|unsplash\.com/, (r) => r.abort());

  // GoTrue auth
  await page.route(/\/auth\/v1\//, (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const url = route.request().url();
    const user = { id: "auth-zz", aud: "authenticated", role: "authenticated", email: MEMBER.email, app_metadata: { provider: "email" }, user_metadata: {}, created_at: "2026-09-24T00:00:00Z" };
    if (url.includes("/token")) {
      const access_token = fakeJwt("auth-zz", MEMBER.email!);
      return json(route, { access_token, token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "refresh-zz", user });
    }
    if (url.includes("/logout")) return route.fulfill({ status: 204, headers: CORS });
    // /user, /session, anything else
    return json(route, user);
  });

  // Edge function
  await page.route(/\/functions\/v1\/make-server-980e1cbf\//, (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const path = new URL(route.request().url()).pathname;
    if (path.includes("/client/branding")) return json(route, BRANDING);
    if (path.endsWith("/me")) return json(route, { client: MEMBER });
    const body = () => {
      try {
        return (route.request().postDataJSON() ?? {}) as Record<string, unknown>;
      } catch {
        return {};
      }
    };
    if (path.endsWith("/client/home")) return json(route, { ...HOME, ...(opts.home ?? {}) });
    if (path.endsWith("/client/plans")) return json(route, { activePlan: null, history: [], wallet: 6800, canBuy: true, offers: OFFERS, ...(opts.plans ?? {}) });
    if (path.endsWith("/client/plans/buy")) {
      if (opts.onBuy) {
        const r = opts.onBuy(body());
        return json(route, r.body, r.status ?? 200);
      }
      return json(route, { plan: BUNDLE_PLAN, wallet: 5000 });
    }
    if (path.endsWith("/client/bookings")) return json(route, BOOKINGS);
    if (path.endsWith("/client/wallet")) return json(route, WALLET);
    if (path.endsWith("/client/points/redeem")) {
      if (opts.onRedeem) {
        const r = opts.onRedeem(body());
        return json(route, r.body, r.status ?? 200);
      }
      return json(route, { pointsSpent: 0, egpCredited: 0, points: 0, wallet: 0 });
    }
    if (path.endsWith("/client/points")) return json(route, typeof opts.points === "function" ? opts.points() : (opts.points ?? POINTS));
    if (path.endsWith("/client/classes")) return json(route, { activePlan: (opts.home?.groupPlan as unknown) ?? null, classes: opts.classes ?? CLASSES });
    if (path.includes("/book")) {
      if (opts.onBook) {
        const r = opts.onBook(body());
        return json(route, r.body, r.status ?? 200);
      }
      return json(route, { booking: { ...BOOKINGS.bookings[0], id: "bk-new" } });
    }
    return json(route, {});
  });
}
