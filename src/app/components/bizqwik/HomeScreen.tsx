import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, Star, Calendar, Clock, ChevronRight, X } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { api, type HomeData, type GymClass } from "../../../lib/api";

interface HomeScreenProps {
  userName: string;
  onWalletClick: () => void;
  onPointsClick: () => void;
  onNotificationsClick: () => void;
  notificationCount: number;
  onSessionClick?: (id: string) => void; // legacy; booking is handled inline now
}

const pad = (n: number) => String(n).padStart(2, "0");
function whenLabel(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const h = d.getHours();
  const am = h < 12;
  const h12 = ((h + 11) % 12) + 1;
  return `${date} · ${h12}:${pad(d.getMinutes())} ${am ? "AM" : "PM"}`;
}

export function HomeScreen({ userName, onWalletClick, onPointsClick, onNotificationsClick, notificationCount }: HomeScreenProps) {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<GymClass | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .home()
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your home."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const planLine = () => {
    if (!data) return "";
    if (data.membership && data.membership.status === "active") return `Membership · until ${data.membership.expiryDate}`;
    if (data.package && data.package.status === "active") return `Package · ${data.package.sessionsRemaining}/${data.package.sessionsIncluded} sessions left`;
    return "No active plan";
  };

  return (
    <div className="min-h-full bg-white pb-28">
      <div className="px-6 pt-14 pb-4 flex items-start justify-between">
        <div>
          <div className="text-[var(--bq-text-secondary)] text-sm">Welcome back</div>
          <h1 className="font-display text-[28px] leading-tight text-[var(--bq-text-primary)]">Hi, {userName} 👋</h1>
          <div className={`mt-1 text-sm ${data?.eligible ? "text-[var(--bq-text-secondary)]" : "text-[#b42318]"}`}>{planLine()}</div>
        </div>
        <NotificationBell count={notificationCount} onClick={onNotificationsClick} />
      </div>

      {/* Wallet + points */}
      <div className="px-6 grid grid-cols-2 gap-3">
        <button onClick={onWalletClick} className="text-left p-4 rounded-[1.25rem] bg-[var(--bq-neutral)] active:scale-[0.98] transition-transform">
          <div className="w-9 h-9 rounded-xl bg-[var(--bq-primary)]/10 text-[var(--bq-primary-readable)] flex items-center justify-center mb-3"><Wallet className="w-5 h-5" /></div>
          <div className="text-[var(--bq-text-secondary)] text-xs">Wallet</div>
          <div className="text-[var(--bq-text-primary)] text-[20px] font-display">{data ? `${Math.round(data.wallet)} EGP` : "—"}</div>
        </button>
        <button onClick={onPointsClick} className="text-left p-4 rounded-[1.25rem] bg-[var(--bq-neutral)] active:scale-[0.98] transition-transform">
          <div className="w-9 h-9 rounded-xl bg-[var(--bq-accent)]/15 text-[var(--bq-accent)] flex items-center justify-center mb-3"><Star className="w-5 h-5" /></div>
          <div className="text-[var(--bq-text-secondary)] text-xs">Points</div>
          <div className="text-[var(--bq-text-primary)] text-[20px] font-display">{data ? data.points.toLocaleString() : "—"}</div>
        </button>
      </div>

      {/* Upcoming classes */}
      <div className="px-6 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-[20px] text-[var(--bq-text-primary)]">Upcoming classes</h2>
        </div>

        {loading && <div className="py-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" /></div>}
        {error && <div className="text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>{error}</div>}
        {!loading && !error && (data?.upcomingClasses.length ?? 0) === 0 && (
          <div className="py-10 text-center text-[var(--bq-text-secondary)] text-sm">No classes scheduled yet.</div>
        )}

        <div className="flex flex-col gap-3">
          {data?.upcomingClasses.map((c) => (
            <div key={c.id} className="p-4 rounded-[1.25rem] border border-[var(--bq-neutral-dark)] bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[var(--bq-text-primary)] font-display text-[17px] truncate">{c.title}</div>
                  <div className="flex items-center gap-1.5 text-[var(--bq-text-secondary)] text-sm mt-1"><Calendar className="w-3.5 h-3.5" /> {whenLabel(c.startsAt)}</div>
                  {c.description && <div className="text-[var(--bq-text-tertiary)] text-sm mt-1.5 line-clamp-2">{c.description}</div>}
                </div>
                <div className="text-right flex-none">
                  <div className="text-[var(--bq-text-primary)] font-display">{c.price > 0 ? `${Math.round(c.price)} EGP` : "Free"}</div>
                </div>
              </div>
              <div className="mt-3">
                {c.booked ? (
                  <div className="h-11 rounded-[1rem] bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)] flex items-center justify-center text-sm">Booked ✓</div>
                ) : (
                  <button onClick={() => setBooking(c)} className="w-full h-11 rounded-[1rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] active:scale-[0.98] transition-transform flex items-center justify-center gap-1">
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
          walletBalance={data?.wallet ?? 0}
          onClose={() => setBooking(null)}
          onBooked={() => { setBooking(null); load(); }}
        />
      )}
    </div>
  );
}

function BookingSheet({ cls, walletBalance, onClose, onBooked }: { cls: GymClass; walletBalance: number; onClose: () => void; onBooked: () => void }) {
  const [busy, setBusy] = useState(false);
  const free = cls.price <= 0;
  const canWallet = walletBalance >= cls.price;

  const book = async (method: "wallet" | "desk") => {
    setBusy(true);
    try {
      await api.book(cls.id, method);
      toast.success(method === "wallet" ? "Booked — paid from wallet" : "Booked — pay at the desk");
      onBooked();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't book this class.";
      toast.error(msg);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,.4)" }} onClick={onClose}>
      <div className="w-full max-w-[430px] bg-white rounded-t-[1.75rem] p-6 pb-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <div className="font-display text-[20px] text-[var(--bq-text-primary)]">{cls.title}</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--bq-text-secondary)] text-sm mb-1"><Clock className="w-3.5 h-3.5" /> {whenLabel(cls.startsAt)}</div>
        <div className="text-[var(--bq-text-primary)] font-display text-[22px] mb-5">{free ? "Free" : `${Math.round(cls.price)} EGP`}</div>

        {free ? (
          <button disabled={busy} onClick={() => book("desk")} className="w-full h-14 rounded-[1.25rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] disabled:opacity-50 active:scale-[0.98] transition-transform">
            {busy ? "Booking…" : "Book class"}
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <button disabled={busy || !canWallet} onClick={() => book("wallet")} className="w-full h-14 rounded-[1.25rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] disabled:opacity-40 active:scale-[0.98] transition-transform flex flex-col items-center justify-center">
              <span>Pay from wallet</span>
              <span className="text-xs opacity-80">Balance {Math.round(walletBalance)} EGP{!canWallet ? " — not enough" : ""}</span>
            </button>
            <button disabled={busy} onClick={() => book("desk")} className="w-full h-14 rounded-[1.25rem] bg-[var(--bq-neutral)] text-[var(--bq-text-primary)] disabled:opacity-50 active:scale-[0.98] transition-transform">
              Reserve &amp; pay at the desk
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
