import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Star, ArrowLeft, Plus } from "lucide-react";
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
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// Points (v1): balance, its EGP value, and how it was earned. Redemption is a
// desk discount on renewal (handled by the front desk), so there's no in-app
// "spend" here — this is the member's running loyalty view.
export function RewardsScreen({ onNotificationsClick, notificationCount, onBack }: RewardsScreenProps) {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.points().then(setData).catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your points.")).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white pb-28">
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
          {data && data.valueEgp > 0 && (
            <div className="text-[var(--bq-text-secondary)] text-sm mt-1">≈ {Math.round(data.valueEgp)} EGP toward your next renewal</div>
          )}
          <div className="text-[var(--bq-text-tertiary)] text-xs mt-3">Earn on every check-in and desk purchase. Redeem as a discount at the front desk.</div>
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
          {data?.ledger.map((l) => (
            <div key={l.id} className="flex items-center gap-3 p-3.5 rounded-[1.1rem] border border-[var(--bq-neutral-dark)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--bq-accent)]/15 text-[var(--bq-accent)] flex items-center justify-center"><Plus className="w-5 h-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-[var(--bq-text-primary)] text-sm">{REASON_LABEL[l.reason] ?? l.reason}</div>
                <div className="text-[var(--bq-text-tertiary)] text-xs">{fmtDate(l.createdAt)}</div>
              </div>
              <div className="font-display text-[var(--bq-accent)]">+{l.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
