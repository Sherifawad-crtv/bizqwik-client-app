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

const HOME = {
  name: "Zara",
  membership: null,
  package: { id: "pkg-1", sessionsRemaining: 5, sessionsIncluded: 6, expiryDate: "Oct 8, 2026", status: "active" },
  eligible: true,
  wallet: 6800,
  points: 12,
  pointsValueEgp: 12,
  upcomingClasses: [
    { id: "cls-1", title: "Morning HIIT", description: "45 min conditioning", startsAt: "2026-09-25T08:00:00Z", price: 150, status: "active", booked: false },
  ],
};

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

// Intercept every Supabase call — GoTrue auth + the edge function — so the app
// runs fully offline. Returns nothing; call before page.goto.
export async function mockBackend(page: Page) {
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
    if (path.endsWith("/client/home")) return json(route, HOME);
    if (path.endsWith("/client/bookings")) return json(route, BOOKINGS);
    if (path.endsWith("/client/wallet")) return json(route, WALLET);
    if (path.endsWith("/client/points")) return json(route, POINTS);
    if (path.endsWith("/client/classes")) return json(route, { classes: HOME.upcomingClasses });
    if (path.includes("/book")) return json(route, { booking: { ...BOOKINGS.bookings[0], id: "bk-new" } });
    return json(route, {});
  });
}
