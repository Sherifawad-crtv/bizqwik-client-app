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
    const err = new Error(json?.error ?? `Request failed (${res.status})`) as Error & { code?: string };
    if (json?.code) err.code = json.code;
    throw err;
  }
  return json as T;
}

// ---- shapes returned by the backend (subset we use) ----
export interface Branding {
  org: { id: string; name: string; slug: string; status: string };
  branding: { appName: string; logoUrl: string | null; iconUrl: string | null; primaryColor: string | null; onboardingAssets: string[] };
}
export interface ClientAccount { id: string; orgId: string; name: string; phone: string | null; email: string | null }
export interface MembershipInstance { id: string; expiryDate: string; status: string; invitationsRemaining: number }
export interface PackageInstance { id: string; sessionsRemaining: number; sessionsIncluded: number; expiryDate: string; status: string }
export interface HomeData {
  name: string;
  membership: MembershipInstance | null;
  package: PackageInstance | null;
  eligible: boolean;
  wallet: number;
  points: number;
  pointsValueEgp: number;
  upcomingClasses: GymClass[];
}
export interface GymClass { id: string; title: string; description: string | null; startsAt: string; price: number; status: string; booked?: boolean }
export interface Booking { id: string; classId: string; payMethod: "wallet" | "desk"; payStatus: string; attendance: string; price: number; bookedAt: string; classTitle: string | null; classStartsAt: string | null }
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
  classes: () => callFn<{ classes: GymClass[] }>("client/classes"),
  book: (classId: string, payMethod: "wallet" | "desk") =>
    callFn<{ booking: Booking }>(`client/classes/${classId}/book`, { method: "POST", body: { payMethod } }),
  bookings: () => callFn<{ bookings: Booking[] }>("client/bookings"),
  cancelBooking: (id: string) => callFn<{ ok: true; refundedToWallet: number }>(`client/bookings/${id}/cancel`, { method: "POST" }),
  checkIn: (token: string) => callFn<{ ok: true }>("client/check-in", { method: "POST", body: { token } }),
  wallet: () => callFn<WalletData>("client/wallet"),
  points: () => callFn<PointsData>("client/points"),
};
