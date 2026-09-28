import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight, CalendarPlus, Dumbbell, Tag } from "lucide-react";
import { Sheet, Kicker, SheetTitle, Button, ConfirmSheet, useMountedSheet } from "./Sheet";
import { api, type Booking, type GymClass, type PlanOffer, type PlansData, type PtBundle } from "../../../lib/api";
import { defaultClassImage, egp, offerDetail, relativeWhen, timeLabel, whenLabel } from "../../../lib/plans";

// The Home quick actions each open right here, in a bottom sheet — the action
// itself, not the page it lives on.

export function QuickSheet({ kicker, title, onClose, children, footer }: { kicker: string; title: string; onClose: () => void; children: ReactNode; footer?: (close: () => void) => ReactNode }) {
  const [open, close] = useMountedSheet(onClose);
  return (
    <Sheet open={open} onClose={close} label={title}>
      <Kicker>{kicker}</Kicker>
      <SheetTitle>{title}</SheetTitle>
      <div className="mt-3">{children}</div>
      {footer && <div className="mt-4">{footer(close)}</div>}
    </Sheet>
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
      kicker="Quick book"
      title="Book a class"
      onClose={onClose}
      footer={() => (
        <Button variant="quiet" fullWidth onClick={onSeeAll}>
          See the full schedule
        </Button>
      )}
    >
      {next.length === 0 ? (
        <div className="py-4 text-sm text-[var(--bq-text-secondary)]">Nothing to book right now — check the full schedule.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {next.map((c) => (
            <button key={c.id} onClick={() => onPick(c)} className="flex items-center gap-3 rounded-[20px] border border-[var(--bq-neutral-dark)] p-2.5 pr-3 text-left">
              <Thumb src={c.imageUrl || defaultClassImage(c.seriesId || c.id)} own={!!c.imageUrl} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-[15px] text-[var(--bq-text-primary)]">{c.title}</div>
                <div className="font-mono text-[12px] text-[var(--bq-text-secondary)]">
                  {relativeWhen(c.startsAt)} · {timeLabel(new Date(c.startsAt))}
                </div>
              </div>
              <span className="flex-none text-xs font-semibold text-[var(--bq-primary-readable)]">{c.coverage === "plan" ? "On your plan" : c.price > 0 ? egp(c.price) : "Free"}</span>
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
    <QuickSheet kicker="PT code" title="Which session?" onClose={onClose}>
      <div className="flex flex-col gap-2">
        {bundles.map((b) => (
          <button key={b.id} onClick={() => onPick(b)} className="flex items-center gap-3 rounded-[20px] border border-[var(--bq-neutral-dark)] p-4 text-left">
            <span className="w-10 h-10 flex-none rounded-full flex items-center justify-center text-[var(--bq-primary-readable)]" style={{ background: "color-mix(in srgb, var(--bq-primary) 10%, #fff)" }}>
              <Dumbbell className="w-5 h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[15px] text-[var(--bq-text-primary)]">{b.coachName}</div>
              <div className="font-mono text-[12px] text-[var(--bq-text-secondary)]">
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
  const [data, setData] = useState<PlansData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<PlanOffer | null>(null);
  const bought = useRef(false);
  useEffect(() => {
    api.plans().then(setData).catch((e) => setError(e instanceof Error ? e.message : "Couldn't load plans."));
  }, []);

  return (
    <>
      <QuickSheet kicker="Plans" title="Get a plan" onClose={onClose}>
        {error ? (
          <div className="text-sm text-[#b23a3a]">{error}</div>
        ) : !data ? (
          <div className="py-8 flex justify-center">
            <div className="w-7 h-7 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />
          </div>
        ) : data.offers.length === 0 ? (
          <div className="py-4 flex items-center gap-2 text-sm text-[var(--bq-text-secondary)]">
            <Tag className="w-5 h-5 text-[var(--bq-primary-readable)]" /> No plans in the app yet — the front desk can sign you up.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {data.offers.map((o) => {
                const affordable = data.wallet >= o.price;
                return (
                  <div key={`${o.offerType}:${o.id}`} className="rounded-[20px] border border-[var(--bq-neutral-dark)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-[15px] text-[var(--bq-text-primary)]">{o.name}</div>
                        <div className="font-mono text-[12px] text-[var(--bq-text-secondary)]">{offerDetail(o)}</div>
                      </div>
                      <div className="flex-none font-display text-[var(--bq-text-primary)]">{egp(o.price)}</div>
                    </div>
                    {data.canBuy && (
                      <Button fullWidth disabled={!affordable} style={{ marginTop: 12 }} onClick={() => setBuying(o)}>
                        {affordable ? "Buy with wallet" : `Top up ${egp(o.price - data.wallet)} more at the desk`}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-center font-mono text-[12px] text-[var(--bq-text-tertiary)]">Wallet {egp(data.wallet)} · cash or card at the front desk</div>
          </>
        )}
      </QuickSheet>
      <ConfirmSheet
        open={buying !== null}
        onClose={() => (bought.current ? onBought() : setBuying(null))}
        kicker="Buy with wallet"
        title={`Buy ${buying?.name ?? ""}?`}
        sub={buying ? `${egp(buying.price)} from your wallet. ${offerDetail(buying)}, starting today.` : undefined}
        confirmLabel="Buy now"
        doneLabel={`${buying?.name ?? "Plan"} is active`}
        onConfirm={async () => {
          await api.buyPlan(buying!);
          bought.current = true; // Home refreshes once the check has shown
          return "Enjoy! Book your first class from the schedule.";
        }}
      />
    </>
  );
}

/** My bookings: what's coming up, cancellable right here. */
export function BookingsQuickSheet({ onClose, onChanged, onBook, onSeeAll }: { onClose: () => void; onChanged: () => void; onBook: () => void; onSeeAll: () => void }) {
  const [list, setList] = useState<Booking[] | null>(null);
  const [cancelling, setCancelling] = useState<Booking | null>(null);
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

  return (
    <>
      <QuickSheet
        kicker="Upcoming"
        title="My bookings"
        onClose={onClose}
        footer={() => (
          <Button variant="quiet" fullWidth onClick={onSeeAll}>
            All bookings &amp; history
          </Button>
        )}
      >
        {!list ? (
          <div className="py-8 flex justify-center">
            <div className="w-7 h-7 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <>
            <div className="py-2 mb-3 text-sm text-[var(--bq-text-secondary)]">No upcoming bookings.</div>
            <Button fullWidth onClick={onBook}>
              <CalendarPlus className="w-4 h-4" /> Book a class
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-[20px] border border-[var(--bq-neutral-dark)] p-2.5 pr-3">
                <Thumb src={b.classImageUrl || defaultClassImage(b.classId)} own={!!b.classImageUrl} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-[15px] text-[var(--bq-text-primary)]">{b.classTitle ?? "Class"}</div>
                  <div className="font-mono text-[12px] text-[var(--bq-text-secondary)]">{whenLabel(b.classStartsAt)}</div>
                </div>
                <Button variant="danger" style={{ height: 36, padding: "0 14px", fontSize: 13 }} onClick={() => setCancelling(b)}>
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        )}
      </QuickSheet>
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
          const r = await api.cancelBooking(cancelling!.id);
          load();
          onChanged();
          return r.refundedToWallet > 0 ? `${Math.round(r.refundedToWallet)} EGP is back in your wallet.` : r.planCreditReturned ? "The session is back on your bundle." : "Your spot is free for someone else.";
        }}
      />
    </>
  );
}
