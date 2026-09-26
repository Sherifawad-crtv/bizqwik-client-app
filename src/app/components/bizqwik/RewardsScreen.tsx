import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Star, ArrowLeft, Plus, Wallet, Clock } from "lucide-react";
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
import { api, type PointsData } from "../../../lib/api";

interface RewardsScreenProps {
  onNotificationsClick: () => void;
  notificationCount: number;
  onBack?: () => void;
}

const REASON_LABEL: Record<string, string> = {
  checkin: "Checked in",
  purchase: "Purchase",
  redeem: "Redeemed to wallet",
  refund: "Refund — points returned",
  expired: "Points expired",
};

const n = (v: number) => v.toLocaleString();

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Points: a big balance with its (small) EGP value, progress to the gym's
// redemption minimum, the next expiry, and redemption into wallet credit in
// whole EGP (leftover points stay).
export function RewardsScreen({ onNotificationsClick, notificationCount, onBack }: RewardsScreenProps) {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.points().then((d) => { setData(d); setError(null); }).catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your points.")).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const on = !!data?.enabled;
  const redeemEgp = data && on ? Math.floor(data.total / data.rate) : 0;
  const redeemPoints = data ? redeemEgp * data.rate : 0;
  const canRedeem = !!data && on && data.total >= data.minRedeem && redeemEgp >= 1;
  const progress = data && data.minRedeem > 0 ? Math.min(1, data.total / data.minRedeem) : 1;

  const redeem = async () => {
    setBusy(true);
    try {
      const r = await api.redeemPoints();
      toast.success(`${n(r.egpCredited)} EGP added to your wallet 🎉`);
      setConfirming(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't redeem your points.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full bg-white pb-28">
      <div className="px-6 pt-14 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-[var(--bq-neutral)] flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
          )}
          <h1 className="font-display text-[24px] text-[var(--bq-text-primary)]">Points</h1>
        </div>
        <NotificationBell count={notificationCount} onClick={onNotificationsClick} />
      </div>

      <div className="px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.5rem] p-6 bg-[var(--bq-neutral)]">
          <div className="w-11 h-11 rounded-2xl bg-[var(--bq-accent)]/15 text-[var(--bq-accent)] flex items-center justify-center mb-3"><Star className="w-6 h-6" /></div>
          <div className="text-[var(--bq-text-secondary)] text-sm">Your points</div>
          <div className="font-display text-[42px] leading-tight text-[var(--bq-text-primary)]">{data ? n(data.total) : "—"}</div>
          {data && on && <div className="text-[var(--bq-text-secondary)] text-sm mt-1">worth {n(redeemEgp)} EGP</div>}

          {data && on && data.minRedeem > 0 && data.total < data.minRedeem && (
            <div className="mt-4">
              <div className="h-2 rounded-full bg-[var(--bq-neutral-dark)] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={data.minRedeem} aria-valuenow={data.total}>
                <div className="h-full rounded-full bg-[var(--bq-accent)]" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <div className="text-[var(--bq-text-secondary)] text-xs mt-2">
                {n(data.total)} / {n(data.minRedeem)} points until you can redeem {n(Math.floor(data.minRedeem / data.rate))} EGP
              </div>
            </div>
          )}

          {data && on && (
            <button
              onClick={() => setConfirming(true)}
              disabled={!canRedeem}
              className="mt-4 w-full h-12 rounded-[1rem] flex items-center justify-center gap-2 font-semibold bg-[var(--bq-primary)] text-[var(--bq-on-primary)] disabled:opacity-40"
            >
              <Wallet className="w-5 h-5" />
              {canRedeem ? `Redeem ${n(redeemEgp)} EGP to wallet` : `Redeem from ${n(data.minRedeem)} points`}
            </button>
          )}

          {data && on && data.nextExpiry && (
            <div className="flex items-center gap-1.5 text-[var(--bq-text-tertiary)] text-xs mt-3">
              <Clock className="w-3.5 h-3.5" /> {n(data.nextExpiry.points)} points expire on {fmtDay(data.nextExpiry.at)}
            </div>
          )}
          <div className="text-[var(--bq-text-tertiary)] text-xs mt-3">
            {data && on
              ? `Earn ${n(data.earnRate ?? 0)} points per EGP you spend and ${n(data.checkinPoints)} per check-in. ${n(data.rate)} points = 1 EGP of wallet credit.`
              : "Points aren't running at your gym yet."}
          </div>
        </motion.div>
      </div>

      <div className="px-6 mt-7">
        <h2 className="font-display text-[18px] text-[var(--bq-text-primary)] mb-3">Activity</h2>
        {loading && <div className="py-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" /></div>}
        {error && <div className="text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>{error}</div>}
        {!loading && !error && (data?.ledger.length ?? 0) === 0 && (
          <div className="py-10 text-center text-[var(--bq-text-secondary)] text-sm">No points yet — check in to start earning.</div>
        )}
        <div className="flex flex-col gap-2">
          {data?.ledger.map((l) => {
            const spent = l.points < 0;
            return (
              <div key={l.id} className="flex items-center gap-3 p-3.5 rounded-[1.1rem] border border-[var(--bq-neutral-dark)]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${spent ? "bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)]" : "bg-[var(--bq-accent)]/15 text-[var(--bq-accent)]"}`}>
                  {spent ? <Wallet className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[var(--bq-text-primary)] text-sm">{REASON_LABEL[l.reason] ?? l.reason}</div>
                  <div className="text-[var(--bq-text-tertiary)] text-xs">{fmtDate(l.createdAt)}</div>
                </div>
                <div className={`font-display ${spent ? "text-[var(--bq-text-secondary)]" : "text-[var(--bq-accent)]"}`}>{spent ? `−${n(Math.abs(l.points))}` : `+${n(l.points)}`}</div>
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={confirming} onOpenChange={(o) => !o && !busy && setConfirming(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redeem {n(redeemEgp)} EGP?</AlertDialogTitle>
            <AlertDialogDescription>
              {`${n(redeemPoints)} points become ${n(redeemEgp)} EGP in your wallet.${data && data.total - redeemPoints > 0 ? ` The other ${n(data.total - redeemPoints)} point${data.total - redeemPoints === 1 ? "" : "s"} stay for next time.` : ""}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                redeem();
              }}
            >
              {busy ? "Redeeming…" : "Redeem"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
