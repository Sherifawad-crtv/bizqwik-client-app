import { useEffect, useState, type ReactNode } from "react";
import { X, ChevronRight, CalendarPlus, Dumbbell, Tag } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { api, type Booking, type GymClass, type PlanOffer, type PlansData, type PtBundle } from "../../../lib/api";
import { defaultClassImage, egp, offerDetail, relativeWhen, timeLabel, whenLabel } from "../../../lib/plans";
import { useFeedback } from "../../../lib/feedback";

// The Home quick actions each open right here, in a bottom sheet — the action
// itself, not the page it lives on.

export function QuickSheet({ title, label, onClose, children, footer }: { title: string; label?: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,.45)" }} onClick={onClose}>
      <div role="dialog" aria-label={label ?? title} className="w-full max-w-[430px] max-h-[85svh] flex flex-col bg-white rounded-t-[1.75rem]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <div className="font-display text-[20px] text-[var(--bq-text-primary)]">{title}</div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 overflow-y-auto">{children}</div>
        <div className="px-6 pt-3 pb-8">{footer}</div>
      </div>
    </div>
  );
}

function Thumb({ src, own }: { src: string; own: boolean }) {
  return <img src={src} alt="" className={`w-12 h-[60px] flex-none rounded-xl object-cover ${own ? "" : "grayscale"}`} />;
}

/** Book a class: the next few classes; tap one to book it. */
export function BookQuickSheet({ classes, onPick, onClose, onSeeAll }: { classes: GymClass[]; onPick: (c: GymClass) => void; onClose: () => void; onSeeAll: () => void }) {
  const next = classes.filter((c) => !c.booked).slice(0, 6);
  return (
    <QuickSheet
      title="Book a class"
      onClose={onClose}
      footer={
        <button onClick={onSeeAll} className="w-full h-12 rounded-[1.1rem] bg-[var(--bq-neutral)] text-[var(--bq-text-primary)] font-medium">
          See the full schedule
        </button>
      }
    >
      {next.length === 0 ? (
        <div className="py-6 text-center text-sm text-[var(--bq-text-secondary)]">Nothing to book right now — check the full schedule.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {next.map((c) => (
            <button key={c.id} onClick={() => onPick(c)} className="flex items-center gap-3 rounded-[1.1rem] border border-[var(--bq-neutral-dark)] p-2.5 pr-3 text-left active:scale-[0.99] transition-transform">
              <Thumb src={c.imageUrl || defaultClassImage(c.seriesId || c.id)} own={!!c.imageUrl} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-[15px] text-[var(--bq-text-primary)]">{c.title}</div>
                <div className="text-[13px] text-[var(--bq-text-secondary)]">
                  {relativeWhen(c.startsAt)} · {timeLabel(new Date(c.startsAt))}
                </div>
              </div>
              <span className="flex-none text-xs font-medium text-[var(--bq-primary-readable)]">{c.coverage === "plan" ? "On your plan" : c.price > 0 ? egp(c.price) : "Free"}</span>
              <ChevronRight className="w-4 h-4 flex-none text-[var(--bq-text-tertiary)]" />
            </button>
          ))}
        </div>
      )}
    </QuickSheet>
  );
}

/** More than one PT bundle: pick whose code to show. */
export function PtPickSheet({ bundles, onPick, onClose }: { bundles: PtBundle[]; onPick: (b: PtBundle) => void; onClose: () => void }) {
  return (
    <QuickSheet title="Which session?" label="Choose a PT code" onClose={onClose}>
      <div className="flex flex-col gap-2">
        {bundles.map((b) => (
          <button key={b.id} onClick={() => onPick(b)} className="flex items-center gap-3 rounded-[1.1rem] border border-[var(--bq-neutral-dark)] p-4 text-left">
            <span className="w-10 h-10 flex-none rounded-full bg-[var(--bq-primary)] text-[var(--bq-on-primary)] flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[15px] text-[var(--bq-text-primary)]">{b.coachName}</div>
              <div className="text-[13px] text-[var(--bq-text-secondary)]">
                {b.name} · {b.sessionsRemaining} of {b.sessionsIncluded} left
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--bq-text-tertiary)]" />
          </button>
        ))}
      </div>
    </QuickSheet>
  );
}

/** Get a plan: the gym's plans, bought with wallet credit right here. */
export function PlanQuickSheet({ onClose, onBought }: { onClose: () => void; onBought: () => void }) {
  const feedback = useFeedback();
  const [data, setData] = useState<PlansData | null>(null);
  const [buying, setBuying] = useState<PlanOffer | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.plans().then(setData).catch((e) => feedback.error("Couldn't load plans", e instanceof Error ? e.message : "Please try again."));
  }, [feedback]);

  const buy = async () => {
    if (!buying) return;
    setBusy(true);
    try {
      const r = await api.buyPlan(buying);
      setBuying(null);
      onBought();
      feedback.success(`${r.plan.name} is active`, "Enjoy! Book your first class from the schedule. 💪");
    } catch (e) {
      feedback.error("Couldn't buy this plan", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <QuickSheet title="Get a plan" onClose={onClose} footer={data && <div className="text-center text-xs text-[var(--bq-text-tertiary)]">Wallet {egp(data.wallet)} · cash or card at the front desk</div>}>
        {!data ? (
          <div className="py-8 flex justify-center">
            <div className="w-7 h-7 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />
          </div>
        ) : data.offers.length === 0 ? (
          <div className="py-6 flex flex-col items-center text-center text-sm text-[var(--bq-text-secondary)]">
            <Tag className="w-6 h-6 mb-2 text-[var(--bq-primary)]" />
            No plans in the app yet — the front desk can sign you up.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.offers.map((o) => {
              const affordable = data.wallet >= o.price;
              return (
                <div key={`${o.offerType}:${o.id}`} className="rounded-[1.1rem] border border-[var(--bq-neutral-dark)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-[15px] text-[var(--bq-text-primary)]">{o.name}</div>
                      <div className="text-[13px] text-[var(--bq-text-secondary)]">{offerDetail(o)}</div>
                    </div>
                    <div className="flex-none font-display text-[var(--bq-text-primary)]">{egp(o.price)}</div>
                  </div>
                  {data.canBuy && (
                    <button
                      disabled={!affordable}
                      onClick={() => setBuying(o)}
                      className="mt-3 w-full h-10 rounded-[0.9rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] text-sm font-semibold disabled:opacity-40"
                    >
                      {affordable ? "Buy with wallet" : `Top up ${egp(o.price - data.wallet)} more at the desk`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </QuickSheet>
      <AlertDialog open={buying !== null} onOpenChange={(o) => !o && !busy && setBuying(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buy {buying?.name}?</AlertDialogTitle>
            <AlertDialogDescription>{buying ? `${egp(buying.price)} from your wallet. ${offerDetail(buying)}, starting today.` : ""}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                buy();
              }}
            >
              {busy ? "Buying…" : "Buy now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** My bookings: what's coming up, cancellable right here. */
export function BookingsQuickSheet({ onClose, onChanged, onBook, onSeeAll }: { onClose: () => void; onChanged: () => void; onBook: () => void; onSeeAll: () => void }) {
  const feedback = useFeedback();
  const [list, setList] = useState<Booking[] | null>(null);
  const [cancelling, setCancelling] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const load = () =>
    api
      .bookings()
      .then((d) =>
        setList(
          d.bookings
            .filter((b) => b.attendance === "booked" && (!b.classStartsAt || Date.parse(b.classStartsAt) > Date.now()))
            .sort((a, b) => Date.parse(a.classStartsAt ?? "") - Date.parse(b.classStartsAt ?? "")),
        ),
      )
      .catch(() => setList([]));
  useEffect(() => {
    load();
  }, []);

  const cancel = async () => {
    if (!cancelling) return;
    setBusy(true);
    try {
      const r = await api.cancelBooking(cancelling.id);
      feedback.success(
        "Booking cancelled",
        r.refundedToWallet > 0 ? `${Math.round(r.refundedToWallet)} EGP is back in your wallet.` : r.planCreditReturned ? "The session is back on your bundle." : "Your spot is free for someone else.",
      );
      setCancelling(null);
      load();
      onChanged();
    } catch (e) {
      feedback.error("Couldn't cancel", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <QuickSheet
        title="My bookings"
        onClose={onClose}
        footer={
          <button onClick={onSeeAll} className="w-full h-12 rounded-[1.1rem] bg-[var(--bq-neutral)] text-[var(--bq-text-primary)] font-medium">
            All bookings &amp; history
          </button>
        }
      >
        {!list ? (
          <div className="py-8 flex justify-center">
            <div className="w-7 h-7 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="text-sm text-[var(--bq-text-secondary)] mb-3">No upcoming bookings.</div>
            <button onClick={onBook} className="h-11 px-5 rounded-[0.9rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] font-semibold flex items-center gap-2">
              <CalendarPlus className="w-4 h-4" /> Book a class
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-[1.1rem] border border-[var(--bq-neutral-dark)] p-2.5 pr-3">
                <Thumb src={b.classImageUrl || defaultClassImage(b.classId)} own={!!b.classImageUrl} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-[15px] text-[var(--bq-text-primary)]">{b.classTitle ?? "Class"}</div>
                  <div className="text-[13px] text-[var(--bq-text-secondary)]">{whenLabel(b.classStartsAt)}</div>
                </div>
                <button onClick={() => setCancelling(b)} className="flex-none h-9 px-3 rounded-[0.8rem] bg-[var(--bq-neutral)] text-[13px] text-[var(--bq-text-secondary)]">
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </QuickSheet>
      <AlertDialog open={cancelling !== null} onOpenChange={(o) => !o && !busy && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {cancelling?.classTitle ?? "this booking"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelling?.coverage === "plan"
                ? "This class is on your plan. Cancelling frees your spot — nothing is used from your plan."
                : cancelling?.payStatus === "paid" && cancelling?.payMethod === "wallet"
                  ? "Your payment will be refunded to your wallet."
                  : "This will free up your spot."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Keep it</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                cancel();
              }}
            >
              {busy ? "Cancelling…" : "Cancel booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
