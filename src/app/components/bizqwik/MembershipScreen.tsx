import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ShieldCheck, CalendarClock, Ticket, Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { NotificationBell } from "./NotificationBell";
import { useBranding } from "../../../lib/branding";
import { api, type PlanOffer, type PlansData, type PtBundle } from "../../../lib/api";
import { PtCodes } from "./PtCodes";
import { PLAN_KIND_LABEL, egp, offerDetail, planDetail, shortDate } from "../../../lib/plans";

interface MembershipScreenProps {
  onNotificationsClick: () => void;
  notificationCount: number;
}

// "My plan": the member's one group plan (membership / class monthly / class
// bundle) and PT package, plus the shop. One group plan at a time — a new one
// can be bought once the current one is finished. In-app purchases are paid
// from wallet credit; cash and card go through the front desk.
export function MembershipScreen({ onNotificationsClick, notificationCount }: MembershipScreenProps) {
  const { data: brand } = useBranding();
  const [plans, setPlans] = useState<PlansData | null>(null);
  const [pt, setPt] = useState<PtBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<PlanOffer | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    Promise.all([api.plans(), api.ptBundles()])
      .then(([p, t]) => {
        setPlans(p);
        setPt(t.bundles);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your plan."))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const buy = async () => {
    if (!buying) return;
    setBusy(true);
    try {
      const r = await api.buyPlan(buying);
      toast.success(`${r.plan.name} is active — enjoy! 💪`);
      setBuying(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't buy this plan.");
    } finally {
      setBusy(false);
    }
  };

  const plan = plans?.activePlan ?? null;
  const gym = brand?.branding.appName ?? "the gym";

  return (
    <div className="min-h-full bg-white pb-28">
      <div className="px-6 pt-14 pb-4 flex items-center justify-between">
        <h1 className="font-display text-[24px] text-[var(--bq-text-primary)]">My plan</h1>
        <NotificationBell count={notificationCount} onClick={onNotificationsClick} />
      </div>

      {loading && (
        <div className="py-10 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />
        </div>
      )}
      {error && (
        <div className="mx-6 text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>
          {error}
        </div>
      )}

      {!loading && !error && plans && (
        <div className="px-6">
          {plan ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.5rem] p-6 text-[var(--bq-on-primary)] bg-gradient-to-br from-[var(--bq-primary)] to-[var(--bq-primary-dark)] shadow-[var(--glow-primary)]"
            >
              <div className="flex items-center gap-2 text-[var(--bq-on-primary)]/85 text-sm">
                <ShieldCheck className="w-4 h-4" /> Active · {PLAN_KIND_LABEL[plan.kind]}
              </div>
              <div className="font-display text-[26px] mt-2">{plan.name}</div>
              {plan.kind === "bundle" && (
                <div className="flex items-center gap-2 text-[var(--bq-on-primary)]/80 text-sm mt-3">
                  <Ticket className="w-4 h-4" /> {plan.creditsRemaining} of {plan.creditsTotal} classes left
                </div>
              )}
              <div className="flex items-center gap-2 text-[var(--bq-on-primary)]/80 text-sm mt-1.5">
                <CalendarClock className="w-4 h-4" /> Valid until {shortDate(plan.expiresAt)}
              </div>
              {plan.invitationsRemaining > 0 && (
                <div className="text-[var(--bq-on-primary)]/80 text-sm mt-1.5">
                  {plan.invitationsRemaining} guest pass{plan.invitationsRemaining === 1 ? "" : "es"} left — ask the front desk
                </div>
              )}
            </motion.div>
          ) : (
            <div className="rounded-[1.5rem] p-6 bg-[var(--bq-neutral)] text-center">
              <div className="font-display text-[18px] text-[var(--bq-text-primary)] mb-1">No active plan</div>
              <p className="text-[var(--bq-text-secondary)] text-sm">Pick one below, or drop in and pay per class.</p>
            </div>
          )}

          <PtCodes bundles={pt} />

          {/* Shop */}
          <div className="flex items-baseline justify-between mt-8 mb-3">
            <h2 className="font-display text-[20px] text-[var(--bq-text-primary)]">Plans</h2>
            <span className="text-[var(--bq-text-secondary)] text-xs">Wallet {egp(plans.wallet)}</span>
          </div>

          {!plans.canBuy && plan && (
            <div className="flex items-start gap-2 text-sm rounded-[1rem] px-4 py-3 mb-3 bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)]">
              <Lock className="w-4 h-4 mt-0.5 flex-none" />
              <span>
                You can have one plan at a time. You can buy a new one once {plan.name} is finished ({planDetail(plan).replace(/^U/, "u")}).
              </span>
            </div>
          )}

          {plans.offers.length === 0 && <div className="py-8 text-center text-[var(--bq-text-secondary)] text-sm">Nothing on sale yet — check with the front desk.</div>}

          <div className="flex flex-col gap-3">
            {plans.offers.map((o) => {
              const affordable = plans.wallet >= o.price;
              return (
                <div key={`${o.offerType}:${o.id}`} className="p-4 rounded-[1.25rem] border border-[var(--bq-neutral-dark)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[var(--bq-text-primary)] font-display text-[17px]">{o.name}</div>
                      <div className="text-[var(--bq-text-secondary)] text-sm mt-0.5">{offerDetail(o)}</div>
                    </div>
                    <div className="text-[var(--bq-text-primary)] font-display flex-none">{egp(o.price)}</div>
                  </div>
                  {plans.canBuy && (
                    <button
                      disabled={!affordable}
                      onClick={() => setBuying(o)}
                      className="mt-3 w-full h-11 rounded-[1rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] disabled:opacity-40 active:scale-[0.98] transition-transform text-sm"
                    >
                      {affordable ? "Buy with wallet" : `Top up ${egp(o.price - plans.wallet)} more at the desk`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[var(--bq-text-tertiary)] text-xs text-center mt-6">Paying cash or card? The {gym} front desk can sell you any plan.</p>
        </div>
      )}

      <AlertDialog open={buying !== null} onOpenChange={(o) => !o && !busy && setBuying(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buy {buying?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {buying ? `${egp(buying.price)} from your wallet. ${offerDetail(buying)}, starting today.` : ""}
            </AlertDialogDescription>
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
    </div>
  );
}
