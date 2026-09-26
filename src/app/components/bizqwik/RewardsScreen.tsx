import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Star, ArrowLeft, Plus, Wallet } from "lucide-react";
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
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// Points: balance, how it was earned, and redemption into wallet credit at the
// gym's rate (whole EGP; leftover points stay). Wallet credit then pays for
// plans, drop-ins and class bookings like any other store credit.
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

  const rate = data?.rate && data.rate > 0 ? data.rate : null;
  const redeemEgp = rate && data ? Math.floor(data.total / rate) : 0;
  const redeemPoints = rate ? redeemEgp * rate : 0;

  const redeem = async () => {
    setBusy(true);
    try {
      const r = await api.redeemPoints();
      toast.success(`${r.egpCredited.toLocaleString()} EGP added to your wallet 🎉`);
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
          <div className="font-display text-[38px] leading-tight text-[var(--bq-text-primary)]">{data ? data.total.toLocaleString() : "—"}</div>
          {rate && data && (
            <div className="text-[var(--bq-text-secondary)] text-sm mt-1">Worth {redeemEgp.toLocaleString()} EGP · {rate} points = 1 EGP</div>
          )}
          {rate && data && (
            <button
              onClick={() => setConfirming(true)}
              disabled={redeemEgp < 1}
              className="mt-4 w-full h-12 rounded-[1rem] flex items-center justify-center gap-2 font-semibold bg-[var(--bq-primary)] text-[var(--bq-on-primary)] disabled:opacity-40"
            >
              <Wallet className="w-5 h-5" />
              {redeemEgp < 1 ? `Collect ${rate} points to redeem` : `Redeem ${redeemEgp.toLocaleString()} EGP to wallet`}
            </button>
          )}
          <div className="text-[var(--bq-text-tertiary)] text-xs mt-3">
            {rate ? "Earn on every check-in and desk purchase. Redeemed credit lands in your wallet — spend it on plans and classes." : "Earn on every check-in and desk purchase."}
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
                <div className={`font-display ${spent ? "text-[var(--bq-text-secondary)]" : "text-[var(--bq-accent)]"}`}>{spent ? `−${Math.abs(l.points).toLocaleString()}` : `+${l.points.toLocaleString()}`}</div>
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={confirming} onOpenChange={(o) => !o && !busy && setConfirming(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redeem {redeemEgp.toLocaleString()} EGP?</AlertDialogTitle>
            <AlertDialogDescription>
              {`${redeemPoints.toLocaleString()} points become ${redeemEgp.toLocaleString()} EGP in your wallet.${data && data.total - redeemPoints > 0 ? ` The other ${(data.total - redeemPoints).toLocaleString()} point${data.total - redeemPoints === 1 ? "" : "s"} stay for next time.` : ""}`}
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
