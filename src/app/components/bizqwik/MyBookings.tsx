import { EmptyState } from "./EmptyState";
import { useCallback, useEffect, useState } from "react";
import { Calendar as CalendarIcon, X, CalendarPlus } from "./solar";
import { ConfirmSheet } from "./Sheet";
import { defaultClassImage } from "../../../lib/plans";
import { api, type Booking } from "../../../lib/api";

const ATT_LABEL: Record<string, { label: string; cls: string }> = {
  booked: { label: "Booked", cls: "bg-[var(--bq-primary)]/10 text-[var(--bq-primary-readable)]" },
  arrived: { label: "Attended", cls: "bg-emerald-50 text-emerald-600" },
  no_show: { label: "Missed", cls: "bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)]" },
  cancelled: { label: "Cancelled", cls: "bg-[var(--bq-neutral)] text-[var(--bq-text-tertiary)]" },
};

function whenLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const h = d.getHours();
  const am = h < 12;
  return `${date} · ${((h + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, "0")} ${am ? "AM" : "PM"}`;
}

export function MyBookings({ onBrowse }: { onBrowse?: () => void } = {}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<Booking | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.bookings().then((d) => { setBookings(d.bookings); setError(null); })
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your bookings."))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const upcoming = bookings.filter((b) => b.attendance === "booked");
  const past = bookings.filter((b) => b.attendance !== "booked");

  return (
    <div className="min-h-full bg-white pb-28">
      <div className="px-6 pt-[calc(env(safe-area-inset-top)+16px)] pb-4">
        <h1 className="font-display text-[24px] text-[var(--bq-text-primary)]">My bookings</h1>
      </div>

      {loading && <div className="py-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" /></div>}
      {error && <div className="mx-6 text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>{error}</div>}
      {!loading && !error && bookings.length === 0 && (
        <EmptyState
          icon={<CalendarPlus />}
          title="No bookings yet"
          body="Book a class from the schedule and it shows up here, with the option to cancel before it starts."
          action={onBrowse ? { label: "Browse classes", onClick: onBrowse } : undefined}
        />
      )}

      <div className="px-6 flex flex-col gap-3">
        {upcoming.map((b) => <Row key={b.id} b={b} onCancel={() => setCancelling(b)} />)}
        {past.length > 0 && <div className="text-[var(--bq-text-tertiary)] text-xs mt-4 mb-1 uppercase tracking-wide">Past</div>}
        {past.map((b) => <Row key={b.id} b={b} />)}
      </div>

      <ConfirmSheet
        open={cancelling !== null}
        onClose={() => setCancelling(null)}
        kicker="Cancel booking"
        title={`Cancel ${cancelling?.classTitle ?? "this booking"}?`}
        sub={
          cancelling?.coverage === "plan"
            ? "This class is on your plan. Cancelling frees your spot — nothing is used from your plan."
            : cancelling?.payStatus === "paid" && cancelling?.payMethod === "wallet"
              ? "Your payment will be refunded to your wallet."
              : "This will free up your spot."
        }
        confirmLabel="Cancel booking"
        doneLabel="Booking cancelled"
        cancelLabel="Keep it"
        danger
        onConfirm={async () => {
          const res = await api.cancelBooking(cancelling!.id);
          load();
          return res.refundedToWallet > 0
            ? `${Math.round(res.refundedToWallet)} EGP is back in your wallet.`
            : res.planCreditReturned
              ? "The session is back on your bundle."
              : cancelling!.coverage === "plan"
                ? "Nothing was used from your plan."
                : "Your spot is free for someone else.";
        }}
      />
    </div>
  );
}

function Row({ b, onCancel }: { b: Booking; onCancel?: () => void }) {
  const att = ATT_LABEL[b.attendance] ?? ATT_LABEL.booked;
  return (
    <div className="p-4 rounded-[1.25rem] border border-[var(--bq-neutral-dark)]">
      <div className="flex items-start justify-between gap-3">
        <img src={b.classImageUrl || defaultClassImage(b.classId)} alt="" className={`w-12 h-15 flex-none rounded-xl object-cover ${b.classImageUrl ? "" : "grayscale"}`} style={{ height: 60 }} />
        <div className="min-w-0 flex-1">
          <div className="text-[var(--bq-text-primary)] font-display text-[17px] truncate">{b.classTitle ?? "Class"}</div>
          <div className="flex items-center gap-1.5 text-[var(--bq-text-secondary)] text-sm mt-1"><CalendarIcon className="w-3.5 h-3.5" /> {whenLabel(b.classStartsAt)}</div>
          <div className="text-[var(--bq-text-tertiary)] text-xs mt-1">
            {b.coverage === "plan"
              ? "On your plan"
              : b.price > 0
                ? `Drop-in · ${Math.round(b.price)} EGP · ${b.payStatus === "paid" ? "Paid" : b.payStatus === "refunded" ? "Refunded" : "Pay at desk"}`
                : "Free"}
          </div>
        </div>
        <span className={`flex-none text-xs px-2.5 py-1 rounded-full ${att.cls}`}>{att.label}</span>
      </div>
      {onCancel && (
        <button onClick={onCancel} className="mt-3 w-full h-10 rounded-[1rem] bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)] text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform">
          <X className="w-4 h-4" /> Cancel booking
        </button>
      )}
    </div>
  );
}
