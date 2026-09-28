import { useState } from "react";
import { Clock, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { api, errorCode, type GymClass, type GroupPlan } from "../../../lib/api";
import { defaultClassImage, egp, whenLabel } from "../../../lib/plans";
import { useFeedback } from "../../../lib/feedback";
import { AvatarStack } from "./ClassCard";

type PayChoice = { payMethod: "wallet" | "desk"; useDropIn: boolean };

/** Booking resolver, member side. A session the plan covers books straight
 * onto the plan (a bundle's session is used at check-in). Anything else is a
 * drop-in — and if a plan is still running, the server asks first ("you still
 * have X going on") and we show that as a confirm dialog before charging. */
export function BookingSheet({ cls, plan, walletBalance, onClose, onBooked }: { cls: GymClass; plan: GroupPlan | null; walletBalance: number; onClose: () => void; onBooked: () => void }) {
  const feedback = useFeedback();
  const [busy, setBusy] = useState(false);
  const [showDropIn, setShowDropIn] = useState(cls.coverage !== "plan");
  const [confirm, setConfirm] = useState<{ message: string; choice: PayChoice } | null>(null);
  const free = cls.price <= 0;
  const canWallet = walletBalance >= cls.price;
  const covered = cls.coverage === "plan";
  const img = cls.imageUrl || defaultClassImage(cls.seriesId || cls.id);

  const run = async (opts: { payMethod?: "wallet" | "desk"; useDropIn?: boolean; confirmActivePlan?: boolean }, successMsg: string) => {
    setBusy(true);
    try {
      await api.book(cls.id, opts);
      feedback.success("You're booked!", `${cls.title} · ${whenLabel(cls.startsAt)}. ${successMsg}`);
      onBooked();
    } catch (e) {
      if (errorCode(e) === "active_plan_confirm" && opts.payMethod) {
        setConfirm({ message: e instanceof Error ? e.message : "You still have a plan running.", choice: { payMethod: opts.payMethod, useDropIn: !!opts.useDropIn } });
      } else {
        feedback.error("Couldn't book this class", e instanceof Error ? e.message : "Please try again.");
      }
      setBusy(false);
    }
  };

  const bookOnPlan = () => run({}, plan?.kind === "bundle" ? "Spot reserved — a session is used when you check in." : "Booked on your plan.");
  const bookDropIn = (payMethod: "wallet" | "desk", confirmActivePlan = false) =>
    run({ payMethod, useDropIn: covered, confirmActivePlan }, payMethod === "wallet" ? "Paid from your wallet." : "Pay at the desk when you arrive.");

  if (cls.booked) {
    return (
      <Shell onClose={onClose} img={img} own={!!cls.imageUrl} cls={cls}>
        <div className="rounded-[1.1rem] bg-[var(--bq-primary)]/10 p-4 text-sm text-[var(--bq-primary-readable)]">You're booked into this class. Manage it from Bookings.</div>
      </Shell>
    );
  }

  return (
    <>
      <Shell onClose={onClose} img={img} own={!!cls.imageUrl} cls={cls}>
        {covered && plan && (
          <div className="mb-4">
            <div className="rounded-[1.1rem] bg-[var(--bq-primary)]/10 p-4 mb-3">
              <div className="text-[var(--bq-primary-readable)] text-sm font-medium">Included in {plan.name}</div>
              <div className="text-[var(--bq-text-secondary)] text-xs mt-0.5">
                {plan.kind === "bundle" ? `Reserves your spot. 1 of your ${plan.creditsRemaining} sessions is used when you check in — cancel or miss it and nothing is used.` : "No extra charge"}
              </div>
            </div>
            <button
              disabled={busy}
              onClick={bookOnPlan}
              className="w-full h-14 rounded-[1.25rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
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
            <div className="flex items-baseline justify-between mb-3">
              <div className="text-[var(--bq-text-secondary)] text-xs uppercase tracking-wide">Drop-in</div>
              <div className="text-[var(--bq-text-primary)] font-display text-[22px]">{free ? "Free" : egp(cls.price)}</div>
            </div>
            {plan && !covered && (
              <div className="text-xs rounded-[0.9rem] px-3 py-2 mb-3 bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)]">
                Your {plan.name} doesn't include this class, so it's paid per visit.
              </div>
            )}
            {free ? (
              <button
                disabled={busy}
                onClick={() => bookDropIn("desk")}
                className="w-full h-14 rounded-[1.25rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
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
                  <span className="font-semibold">Pay from wallet</span>
                  <span className="text-xs opacity-80">
                    Balance {egp(walletBalance)}
                    {!canWallet ? " — not enough" : ""}
                  </span>
                </button>
                <button
                  disabled={busy}
                  onClick={() => bookDropIn("desk")}
                  className="w-full h-14 rounded-[1.25rem] bg-[var(--bq-neutral)] text-[var(--bq-text-primary)] font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
                >
                  Reserve &amp; pay at the desk
                </button>
              </div>
            )}
          </>
        )}
      </Shell>

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

// Bottom sheet with the class photo as its header.
function Shell({ cls, img, own, onClose, children }: { cls: GymClass; img: string; own: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,.45)" }} onClick={onClose}>
      <div role="dialog" aria-label={cls.title} className="w-full max-w-[430px] bg-white rounded-t-[1.75rem] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-40">
          <img src={img} alt="" className={`absolute inset-0 w-full h-full object-cover ${own ? "" : "grayscale contrast-[1.05]"}`} />
          {!own && <div className="absolute inset-0 bg-[var(--bq-primary)] mix-blend-multiply opacity-30" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/10" />
          <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/25 backdrop-blur-md text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
          <div className="absolute inset-x-5 bottom-4">
            <div className="font-display text-[24px] leading-tight text-white">{cls.title}</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
              <Clock className="w-3.5 h-3.5" /> {whenLabel(cls.startsAt)}
            </div>
          </div>
        </div>
        <div className="p-6 pb-10">
          {cls.description && <p className="text-sm text-[var(--bq-text-secondary)] mb-3">{cls.description}</p>}
          <div className="mb-4">
            <AvatarStack going={cls.going} dark={false} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
