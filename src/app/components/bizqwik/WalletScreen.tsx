import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { api, type WalletData } from "../../../lib/api";

interface WalletScreenProps {
  onNotificationsClick: () => void;
  notificationCount: number;
  onBack?: () => void;
}

const CAT_LABEL: Record<string, string> = {
  refund: "Refund",
  compensation: "Compensation",
  purchase: "Purchase",
  class_booking: "Class booking",
  expiry: "Expired credit",
  topup: "Top-up",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// Store-credit wallet (v1): balance + history. No online top-up — credit comes
// from refunds/compensation at the desk and is spent on classes / desk sales.
export function WalletScreen({ onNotificationsClick, notificationCount, onBack }: WalletScreenProps) {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.wallet().then(setData).catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your wallet.")).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="px-6 pt-14 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-[var(--bq-neutral)] flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
          )}
          <h1 className="font-display text-[24px] text-[var(--bq-text-primary)]">Wallet</h1>
        </div>
        <NotificationBell count={notificationCount} onClick={onNotificationsClick} />
      </div>

      <div className="px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.5rem] p-6 text-white bg-gradient-to-br from-[var(--bq-primary)] to-[var(--bq-primary-dark)] shadow-[var(--glow-primary)]">
          <div className="text-white/80 text-sm">Store credit</div>
          <div className="font-display text-[38px] leading-tight mt-1">{data ? Math.round(data.balance) : "—"} <span className="text-[20px]">EGP</span></div>
          <div className="text-white/70 text-xs mt-2">Earned from refunds & compensation · spend it on classes or at the desk</div>
        </motion.div>
      </div>

      <div className="px-6 mt-7">
        <h2 className="font-display text-[18px] text-[var(--bq-text-primary)] mb-3">History</h2>
        {loading && <div className="py-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" /></div>}
        {error && <div className="text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>{error}</div>}
        {!loading && !error && (data?.transactions.length ?? 0) === 0 && (
          <div className="py-10 text-center text-[var(--bq-text-secondary)] text-sm">No transactions yet.</div>
        )}
        <div className="flex flex-col gap-2">
          {data?.transactions.map((t) => {
            const credit = t.type === "credit";
            return (
              <div key={t.id} className="flex items-center gap-3 p-3.5 rounded-[1.1rem] border border-[var(--bq-neutral-dark)]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${credit ? "bg-emerald-50 text-emerald-600" : "bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)]"}`}>
                  {credit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[var(--bq-text-primary)] text-sm truncate">{t.description || CAT_LABEL[t.category] || t.category}</div>
                  <div className="text-[var(--bq-text-tertiary)] text-xs">{fmtDate(t.createdAt)}</div>
                </div>
                <div className={`font-display ${credit ? "text-emerald-600" : "text-[var(--bq-text-primary)]"}`}>
                  {credit ? "+" : "−"}{Math.round(t.amount)} EGP
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
