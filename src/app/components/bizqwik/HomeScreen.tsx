import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Wallet, Star, Clock, ChevronRight, X, BadgeCheck } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { NotificationBell } from "./NotificationBell";
import { api, errorCode, type HomeData, type GymClass, type GroupPlan } from "../../../lib/api";
import { egp, planDetail, timeLabel, whenLabel } from "../../../lib/plans";

interface HomeScreenProps {
  userName: string;
  onWalletClick: () => void;
  onPointsClick: () => void;
  onPlanClick?: () => void;
  onNotificationsClick: () => void;
  notificationCount: number;
  onSessionClick?: (id: string) => void; // legacy; booking is handled inline now
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export function HomeScreen({ userName, onWalletClick, onPointsClick, onPlanClick, onNotificationsClick, notificationCount }: HomeScreenProps) {
  const [data, setData] = useState<HomeData | null>(null);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<GymClass | null>(null);
  const [day, setDay] = useState(() => dayKey(new Date()));

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.home(), api.classes()])
      .then(([h, c]) => {
        setData(h);
        setClasses(c.classes);
        setError(null);
        // Nothing on today? Open on the next day that has something.
        setDay((cur) => {
          if (cur !== dayKey(new Date()) || c.classes.some((x) => dayKey(new Date(x.startsAt)) === cur)) return cur;
          const next = c.classes[0];
          return next ? dayKey(new Date(next.startsAt)) : cur;
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your home."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The next 7 days as a strip; a day with nothing on it still shows so the
  // week reads as a calendar.
  const days = useMemo(() => {
    const out: { key: string; date: Date }[] = [];
    const t = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i);
      out.push({ key: dayKey(d), date: d });
    }
    return out;
  }, []);
  const byDay = useMemo(() => {
    const m = new Map<string, GymClass[]>();
    for (const c of classes) {
      const k = dayKey(new Date(c.startsAt));
      m.set(k, [...(m.get(k) ?? []), c]);
    }
    return m;
  }, [classes]);
  const todays = byDay.get(day) ?? [];

  const plan = data?.groupPlan ?? null;
  const pkg = data?.package && data.package.status === "active" ? data.package : null;

  return (
    <div className="min-h-full bg-white pb-28">
      <div className="px-6 pt-14 pb-4 flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[var(--bq-text-secondary)] text-sm">Welcome back</div>
          <h1 className="font-display text-[28px] leading-tight text-[var(--bq-text-primary)]">Hi, {userName} 👋</h1>
        </div>
        <NotificationBell count={notificationCount} onClick={onNotificationsClick} />
      </div>

      {/* Current plan */}
      {data && (
        <div className="px-6 mb-3">
          <button onClick={onPlanClick} className="w-full text-left p-4 rounded-[1.25rem] border border-[var(--bq-neutral-dark)] flex items-center gap-3 active:scale-[0.99] transition-transform">
            <div className="w-9 h-9 rounded-xl bg-[var(--bq-primary)]/10 text-[var(--bq-primary-readable)] flex items-center justify-center flex-none">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              {plan ? (
                <>
                  <div className="text-[var(--bq-text-primary)] font-display text-[16px] truncate">{plan.name}</div>
                  <div className="text-[var(--bq-text-secondary)] text-xs">
                    {planDetail(plan)}
                    {pkg ? " · + PT package" : ""}
                  </div>
                </>
              ) : pkg ? (
                <>
                  <div className="text-[var(--bq-text-primary)] font-display text-[16px]">PT package</div>
                  <div className="text-[var(--bq-text-secondary)] text-xs">
                    {pkg.sessionsRemaining} of {pkg.sessionsIncluded} sessions left · classes are pay-per-visit
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[var(--bq-text-primary)] font-display text-[16px]">No active plan</div>
                  <div className="text-[var(--bq-text-secondary)] text-xs">See memberships, monthlies and bundles</div>
                </>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--bq-text-tertiary)] flex-none" />
          </button>
        </div>
      )}

      {/* Wallet + points */}
      <div className="px-6 grid grid-cols-2 gap-3">
        <button onClick={onWalletClick} className="text-left p-4 rounded-[1.25rem] bg-[var(--bq-neutral)] active:scale-[0.98] transition-transform">
          <div className="w-9 h-9 rounded-xl bg-[var(--bq-primary)]/10 text-[var(--bq-primary-readable)] flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="text-[var(--bq-text-secondary)] text-xs">Wallet</div>
          <div className="text-[var(--bq-text-primary)] text-[20px] font-display">{data ? egp(data.wallet) : "—"}</div>
        </button>
        <button onClick={onPointsClick} className="text-left p-4 rounded-[1.25rem] bg-[var(--bq-neutral)] active:scale-[0.98] transition-transform">
          <div className="w-9 h-9 rounded-xl bg-[var(--bq-accent)]/15 text-[var(--bq-accent)] flex items-center justify-center mb-3">
            <Star className="w-5 h-5" />
          </div>
          <div className="text-[var(--bq-text-secondary)] text-xs">Points</div>
          <div className="text-[var(--bq-text-primary)] text-[20px] font-display">{data ? data.points.toLocaleString() : "—"}</div>
        </button>
      </div>

      {/* Schedule */}
      <div className="px-6 mt-7">
        <h2 className="font-display text-[20px] text-[var(--bq-text-primary)] mb-3">Classes</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Pick a day">
          {days.map(({ key, date }, i) => {
            const on = key === day;
            const count = byDay.get(key)?.length ?? 0;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={on}
                onClick={() => setDay(key)}
                className={`flex-none w-[54px] py-2 rounded-[1rem] flex flex-col items-center transition-colors ${
                  on ? "bg-[var(--bq-primary)] text-[var(--bq-on-primary)]" : "bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)]"
                }`}
              >
                <span className="text-[11px] uppercase tracking-wide">{i === 0 ? "Today" : date.toLocaleDateString(undefined, { weekday: "short" })}</span>
                <span className="font-display text-[18px] leading-tight">{date.getDate()}</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${count ? (on ? "bg-[var(--bq-on-primary)]" : "bg-[var(--bq-primary)]") : "bg-transparent"}`} />
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="py-10 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />
          </div>
        )}
        {error && (
          <div className="mt-3 text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>
            {error}
          </div>
        )}
        {!loading && !error && todays.length === 0 && <div className="py-10 text-center text-[var(--bq-text-secondary)] text-sm">No classes on this day.</div>}

        <div className="flex flex-col gap-3 mt-3">
          {todays.map((c) => (
            <div key={c.id} className="p-4 rounded-[1.25rem] border border-[var(--bq-neutral-dark)] bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[var(--bq-text-primary)] font-display text-[17px] truncate">{c.title}</div>
                  <div className="flex items-center gap-1.5 text-[var(--bq-text-secondary)] text-sm mt-1">
                    <Clock className="w-3.5 h-3.5" /> {timeLabel(new Date(c.startsAt))}
                  </div>
                  {c.description && <div className="text-[var(--bq-text-tertiary)] text-sm mt-1.5 line-clamp-2">{c.description}</div>}
                </div>
                <div className="text-right flex-none">
                  {c.coverage === "plan" ? (
                    <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-[var(--bq-primary)]/10 text-[var(--bq-primary-readable)]">On your plan</span>
                  ) : (
                    <div className="text-[var(--bq-text-primary)] font-display">{c.price > 0 ? egp(c.price) : "Free"}</div>
                  )}
                </div>
              </div>
              <div className="mt-3">
                {c.booked ? (
                  <div className="h-11 rounded-[1rem] bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)] flex items-center justify-center text-sm">Booked ✓</div>
                ) : (
                  <button
                    onClick={() => setBooking(c)}
                    className="w-full h-11 rounded-[1rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] active:scale-[0.98] transition-transform flex items-center justify-center gap-1"
                  >
                    Book <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {booking && (
        <BookingSheet
          cls={booking}
          plan={plan}
          walletBalance={data?.wallet ?? 0}
          onClose={() => setBooking(null)}
          onBooked={() => {
            setBooking(null);
            load();
          }}
        />
      )}
    </div>
  );
}

type PayChoice = { payMethod: "wallet" | "desk"; useDropIn: boolean };

/** Booking resolver, member side. A session the plan covers books straight
 * onto the plan (a bundle spends one credit). Anything else is a drop-in —
 * and if a plan is still running, the server asks first ("you still have X
 * going on") and we show that as a confirm dialog before charging. */
function BookingSheet({ cls, plan, walletBalance, onClose, onBooked }: { cls: GymClass; plan: GroupPlan | null; walletBalance: number; onClose: () => void; onBooked: () => void }) {
  const [busy, setBusy] = useState(false);
  const [showDropIn, setShowDropIn] = useState(cls.coverage !== "plan");
  const [confirm, setConfirm] = useState<{
    message: string;
    choice: PayChoice;
  } | null>(null);
  const free = cls.price <= 0;
  const canWallet = walletBalance >= cls.price;
  const covered = cls.coverage === "plan";

  const run = async (opts: { payMethod?: "wallet" | "desk"; useDropIn?: boolean; confirmActivePlan?: boolean }, successMsg: string) => {
    setBusy(true);
    try {
      await api.book(cls.id, opts);
      toast.success(successMsg);
      onBooked();
    } catch (e) {
      if (errorCode(e) === "active_plan_confirm" && opts.payMethod) {
        setConfirm({
          message: e instanceof Error ? e.message : "You still have a plan running.",
          choice: { payMethod: opts.payMethod, useDropIn: !!opts.useDropIn },
        });
      } else {
        toast.error(e instanceof Error ? e.message : "Couldn't book this class.");
      }
      setBusy(false);
    }
  };

  const bookOnPlan = () => run({}, plan?.kind === "bundle" ? "Booked — 1 class credit used" : "Booked on your plan");
  const bookDropIn = (payMethod: "wallet" | "desk", confirmActivePlan = false) =>
    run({ payMethod, useDropIn: covered, confirmActivePlan }, payMethod === "wallet" ? "Booked — paid from wallet" : "Booked — pay at the desk");

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,.4)" }} onClick={onClose}>
        <div className="w-full max-w-[430px] bg-white rounded-t-[1.75rem] p-6 pb-10" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-1">
            <div className="font-display text-[20px] text-[var(--bq-text-primary)]">{cls.title}</div>
            <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--bq-text-secondary)] text-sm mb-4">
            <Clock className="w-3.5 h-3.5" /> {whenLabel(cls.startsAt)}
          </div>

          {covered && plan && (
            <div className="mb-4">
              <div className="rounded-[1.1rem] bg-[var(--bq-primary)]/10 p-4 mb-3">
                <div className="text-[var(--bq-primary-readable)] text-sm font-medium">Included in {plan.name}</div>
                <div className="text-[var(--bq-text-secondary)] text-xs mt-0.5">{plan.kind === "bundle" ? `Uses 1 of your ${plan.creditsRemaining} class credits` : "No extra charge"}</div>
              </div>
              <button
                disabled={busy}
                onClick={bookOnPlan}
                className="w-full h-14 rounded-[1.25rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {busy ? "Booking…" : "Book with my plan"}
              </button>
              {!showDropIn && (
                <button onClick={() => setShowDropIn(true)} className="w-full mt-2 h-10 text-sm text-[var(--bq-text-secondary)]">
                  Pay as a drop-in instead
                </button>
              )}
            </div>
          )}

          {showDropIn && (
            <>
              <div className="text-[var(--bq-text-secondary)] text-xs uppercase tracking-wide mb-1">Drop-in</div>
              <div className="text-[var(--bq-text-primary)] font-display text-[22px] mb-4">{free ? "Free" : egp(cls.price)}</div>
              {plan && !covered && (
                <div className="text-xs rounded-[0.9rem] px-3 py-2 mb-3 bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)]">
                  Your {plan.name} doesn't include this class, so it's paid per visit.
                </div>
              )}
              {free ? (
                <button
                  disabled={busy}
                  onClick={() => bookDropIn("desk")}
                  className="w-full h-14 rounded-[1.25rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] disabled:opacity-50 active:scale-[0.98] transition-transform"
                >
                  {busy ? "Booking…" : "Book class"}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    disabled={busy || !canWallet}
                    onClick={() => bookDropIn("wallet")}
                    className={`w-full h-14 rounded-[1.25rem] disabled:opacity-40 active:scale-[0.98] transition-transform flex flex-col items-center justify-center ${
                      covered ? "bg-[var(--bq-neutral)] text-[var(--bq-text-primary)]" : "bg-[var(--bq-primary)] text-[var(--bq-on-primary)]"
                    }`}
                  >
                    <span>Pay from wallet</span>
                    <span className="text-xs opacity-80">
                      Balance {egp(walletBalance)}
                      {!canWallet ? " — not enough" : ""}
                    </span>
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => bookDropIn("desk")}
                    className="w-full h-14 rounded-[1.25rem] bg-[var(--bq-neutral)] text-[var(--bq-text-primary)] disabled:opacity-50 active:scale-[0.98] transition-transform"
                  >
                    Reserve &amp; pay at the desk
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You still have a plan running</AlertDialogTitle>
            <AlertDialogDescription>{confirm?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Not now</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={() => {
                const c = confirm;
                setConfirm(null);
                if (c) bookDropIn(c.choice.payMethod, true);
              }}
            >
              Pay the drop-in
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
