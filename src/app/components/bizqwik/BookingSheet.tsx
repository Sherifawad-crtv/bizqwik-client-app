import { useRef, useState } from "react";
import { api, errorCode, type GymClass, type GroupPlan } from "../../../lib/api";
import { egp, whenLabel } from "../../../lib/plans";
import { AvatarStack } from "./ClassCard";
import { Sheet, Kicker, SheetTitle, SheetSub, ErrorNote, Button, SheetSuccessIcon, ConfirmSheet, useMountedSheet, useSheetSuccess } from "./Sheet";

type PayChoice = { payMethod: "wallet" | "desk"; useDropIn: boolean };

/** Booking resolver, member side. A session the plan covers books straight
 * onto the plan (a bundle's session is used at check-in). Anything else is a
 * drop-in — and if a plan is still running, the server asks first ("you still
 * have X going on") and we confirm before charging. */
export function BookingSheet({ cls, plan, walletBalance, onClose, onBooked }: { cls: GymClass; plan: GroupPlan | null; walletBalance: number; onClose: () => void; onBooked: () => void }) {
  const [open, close] = useMountedSheet(onClose);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropIn, setShowDropIn] = useState(cls.coverage !== "plan");
  const [confirm, setConfirm] = useState<{ message: string; choice: PayChoice } | null>(null);
  const [doneSub, setDoneSub] = useState("");
  const bookedViaConfirm = useRef(false);
  const { confirmed, iconIn, showSuccess } = useSheetSuccess(open, () => {
    close();
    onBooked();
  }, 1600);
  const free = cls.price <= 0;
  const canWallet = walletBalance >= cls.price;
  const covered = cls.coverage === "plan";

  const run = async (opts: { payMethod?: "wallet" | "desk"; useDropIn?: boolean; confirmActivePlan?: boolean }, successMsg: string) => {
    setBusy(true);
    setError(null);
    try {
      await api.book(cls.id, opts);
      setDoneSub(successMsg);
      showSuccess();
    } catch (e) {
      if (errorCode(e) === "active_plan_confirm" && opts.payMethod) {
        setConfirm({ message: e instanceof Error ? e.message : "You still have a plan running.", choice: { payMethod: opts.payMethod, useDropIn: !!opts.useDropIn } });
      } else {
        setError(e instanceof Error ? e.message : "Couldn't book this class.");
      }
    } finally {
      setBusy(false);
    }
  };
  const bookOnPlan = () => run({}, plan?.kind === "bundle" ? "Spot reserved — a session is used when you check in." : "Booked on your plan.");
  const dropIn = (payMethod: "wallet" | "desk", confirmActivePlan = false) =>
    run({ payMethod, useDropIn: covered, confirmActivePlan }, payMethod === "wallet" ? "Paid from your wallet." : "Pay at the desk when you arrive.");

  return (
    <>
      <Sheet open={open && !confirm} onClose={busy ? () => {} : close} label={cls.title}>
        {confirmed ? (
          <SheetSuccessIcon label="You're booked!" sub={doneSub} iconIn={iconIn} />
        ) : (
          <>
            <Kicker>{cls.booked ? "Booked" : "Book a class"}</Kicker>
            <SheetTitle>{cls.title}</SheetTitle>
            <SheetSub>{whenLabel(cls.startsAt)}</SheetSub>
            {cls.description && <p className="text-sm text-[var(--bq-text-secondary)] -mt-2 mb-4">{cls.description}</p>}
            <div className="mb-4">
              <AvatarStack going={cls.going} dark={false} />
            </div>
            {error && <ErrorNote>{error}</ErrorNote>}

            {cls.booked ? (
              <Button variant="quiet" fullWidth onClick={close}>
                You're booked in — manage it from Bookings
              </Button>
            ) : (
              <>
                {covered && plan && (
                  <>
                    <div className="rounded-[16px] p-4 mb-3" style={{ background: "color-mix(in srgb, var(--bq-primary) 10%, #fff)" }}>
                      <div className="text-sm font-semibold text-[var(--bq-primary-readable)]">Included in {plan.name}</div>
                      <div className="text-xs text-[var(--bq-text-secondary)] mt-0.5">
                        {plan.kind === "bundle" ? `Reserves your spot. 1 of your ${plan.creditsRemaining} sessions is used when you check in — cancel or miss it and nothing is used.` : "No extra charge"}
                      </div>
                    </div>
                    <Button fullWidth size="lg" disabled={busy} onClick={bookOnPlan}>
                      {busy ? "Booking…" : "Book with my plan"}
                    </Button>
                    {!showDropIn && (
                      <Button variant="quiet" fullWidth style={{ marginTop: 8 }} onClick={() => setShowDropIn(true)}>
                        Pay as a drop-in instead
                      </Button>
                    )}
                  </>
                )}

                {showDropIn && (
                  <div className={covered && plan ? "mt-4" : ""}>
                    <div className="flex items-baseline justify-between mb-3">
                      <Kicker>Drop-in</Kicker>
                      <div className="font-display text-[20px] text-[var(--bq-text-primary)]">{free ? "Free" : egp(cls.price)}</div>
                    </div>
                    {plan && !covered && <SheetSub>Your {plan.name} doesn't include this class, so it's paid per visit.</SheetSub>}
                    {free ? (
                      <Button fullWidth size="lg" disabled={busy} onClick={() => dropIn("desk")}>
                        {busy ? "Booking…" : "Book class"}
                      </Button>
                    ) : (
                      <>
                        <Button variant={covered ? "secondary" : "primary"} fullWidth size="lg" disabled={busy || !canWallet} onClick={() => dropIn("wallet")}>
                          Pay from wallet · {canWallet ? egp(walletBalance) : "not enough"}
                        </Button>
                        <Button variant="quiet" fullWidth style={{ marginTop: 8 }} disabled={busy} onClick={() => dropIn("desk")}>
                          Reserve &amp; pay at the desk
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Sheet>

      <ConfirmSheet
        open={confirm !== null}
        onClose={() => {
          if (!bookedViaConfirm.current) return setConfirm(null);
          close();
          onBooked();
        }}
        kicker="Plan still running"
        title="You still have a plan running"
        sub={confirm?.message}
        confirmLabel="Pay the drop-in"
        doneLabel="You're booked!"
        cancelLabel="Not now"
        onConfirm={async () => {
          const c = confirm!;
          await api.book(cls.id, { payMethod: c.choice.payMethod, useDropIn: covered, confirmActivePlan: true });
          bookedViaConfirm.current = true;
          return c.choice.payMethod === "wallet" ? "Paid from your wallet." : "Pay at the desk when you arrive.";
        }}
      />
    </>
  );
}
