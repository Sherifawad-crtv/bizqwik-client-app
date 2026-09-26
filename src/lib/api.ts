import { supabase } from "./supabase";
import { SUPABASE_URL, SUPABASE_ANON_KEY, FN_SLUG } from "./config";

type Method = "GET" | "POST";

/** Calls the shared edge function. Uses the member's session token when signed
 * in, else the anon key (enough for the public branding route + signup, which
 * the function gates itself). Throws Error(message) on a non-2xx. */
async function callFn<T>(path: string, opts?: { method?: Method; body?: Record<string, unknown> }): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? SUPABASE_ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${FN_SLUG}/${path}`, {
    method: opts?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  let json: any = {};
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const err = new Error(json?.error ?? `Request failed (${res.status})`) as ApiError;
    if (json?.code) err.code = json.code;
    err.data = json;
    throw err;
  }
  return json as T;
}

/** A refused call: `code` is the server's machine-readable reason, e.g.
 * "active_plan_confirm" (drop-in while a plan is running — ask first),
 * "active_plan" (already on a plan) or "insufficient_wallet". */
export type ApiError = Error & { code?: string; data?: Record<string, any> };
export const errorCode = (e: unknown): string | undefined => (e as ApiError)?.code;

// ---- shapes returned by the backend (subset we use) ----
export interface Branding {
  org: { id: string; name: string; slug: string; status: string };
  branding: { appName: string; logoUrl: string | null; iconUrl: string | null; primaryColor: string | null; onboardingAssets: string[] };
}
export interface ClientAccount { id: string; orgId: string; name: string; phone: string | null; email: string | null }
export interface MembershipInstance { id: string; expiryDate: string; status: string; invitationsRemaining: number }
export interface PackageInstance { id: string; sessionsRemaining: number; sessionsIncluded: number; expiryDate: string; status: string }
/** The member's one group plan: an all-access membership, one class's monthly,
 * or a bundle of class credits usable on any class. */
export interface GroupPlan {
  id: string;
  kind: "membership" | "class_monthly" | "bundle";
  name: string;
  priceAtSale: number;
  creditsTotal: number | null;
  creditsRemaining: number | null;
  invitationsRemaining: number;
  startsAt: string;
  expiresAt: string;
  status: "active" | "finished";
}
export interface PlanOffer {
  offerType: "plan_type" | "series";
  id: string;
  kind: GroupPlan["kind"];
  name: string;
  price: number;
  durationMonths: number;
  credits: number | null;
  weekdays?: number[];
  startTime?: string;
}
export interface PlansData { activePlan: GroupPlan | null; history: GroupPlan[]; wallet: number; canBuy: boolean; offers: PlanOffer[] }
export interface HomeData {
  name: string;
  membership: MembershipInstance | null;
  package: PackageInstance | null;
  groupPlan: GroupPlan | null;
  eligible: boolean;
  wallet: number;
  points: number;
  pointsValueEgp: number;
  upcomingClasses: GymClass[];
}
// `coverage`: "plan" when the member's active plan pays for this session,
// else "drop_in" at `price`.
export interface GymClass { id: string; seriesId?: string | null; title: string; description: string | null; startsAt: string; price: number; status: string; booked?: boolean; coverage?: "plan" | "drop_in" }
export interface Booking { id: string; classId: string; payMethod: "wallet" | "desk" | "plan"; payStatus: string; attendance: string; price: number; bookedAt: string; classTitle: string | null; classStartsAt: string | null; coverage?: "plan" | "drop_in" }
export interface WalletTx { id: string; type: string; amount: number; category: string; description: string | null; createdAt: string }
export interface WalletData { balance: number; transactions: WalletTx[] }
export interface PointsLedgerRow { id: string; points: number; reason: string; createdAt: string }
export interface PointsData { total: number; valueEgp: number; rate: number | null; ledger: PointsLedgerRow[] }

export const api = {
  // public (pre-auth)
  branding: (slug: string) => callFn<Branding>(`client/branding?slug=${encodeURIComponent(slug)}`),
  signup: (name: string, email: string, password: string) =>
    callFn<{ client?: ClientAccount }>("signup", { method: "POST", body: { name, email, password } }),

  // authed (member)
  me: () => callFn<{ client: ClientAccount | null }>("me"),
  home: () => callFn<HomeData>("client/home"),
  classes: () => callFn<{ activePlan: GroupPlan | null; classes: GymClass[] }>("client/classes"),
  // Plan-covered sessions book with no payment; otherwise pass payMethod.
  // `useDropIn` pays per class even when the plan would cover it;
  // `confirmActivePlan` acknowledges "you still have a plan running".
  book: (classId: string, opts: { payMethod?: "wallet" | "desk"; useDropIn?: boolean; confirmActivePlan?: boolean } = {}) =>
    callFn<{ booking: Booking }>(`client/classes/${classId}/book`, { method: "POST", body: { ...opts } }),
  bookings: () => callFn<{ bookings: Booking[] }>("client/bookings"),
  cancelBooking: (id: string) =>
    callFn<{ ok: true; refundedToWallet: number; planCreditReturned?: boolean }>(`client/bookings/${id}/cancel`, { method: "POST" }),
  plans: () => callFn<PlansData>("client/plans"),
  buyPlan: (offer: PlanOffer) =>
    callFn<{ plan: GroupPlan; wallet: number }>("client/plans/buy", {
      method: "POST",
      body: offer.offerType === "series" ? { seriesId: offer.id } : { planTypeId: offer.id },
    }),
  checkIn: (token: string) => callFn<{ ok: true }>("client/check-in", { method: "POST", body: { token } }),
  wallet: () => callFn<WalletData>("client/wallet"),
  points: () => callFn<PointsData>("client/points"),
  // Turns points into wallet credit at the gym's rate, in whole EGP. Omit
  // `points` to redeem everything redeemable.
  redeemPoints: (points?: number) =>
    callFn<{ pointsSpent: number; egpCredited: number; points: number; wallet: number }>("client/points/redeem", { method: "POST", body: points ? { points } : {} }),
};
