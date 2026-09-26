import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, ArrowLeft, Receipt, RotateCcw } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { api, type MoneyEvent, type WalletData } from "../../../lib/api";

interface WalletScreenProps {
  onNotificationsClick: () => void;
  notificationCount: number;
  onBack?: () => void;
}

const METHOD_LABEL: Record<MoneyEvent["method"], string> = {
  cash: "Cash",
  card: "Card",
  wallet: "Wallet",
  desk: "Paid at desk",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
const egp = (n: number) => `${Math.round(n).toLocaleString()} EGP`;

// Wallet: store-credit balance on top, then every transaction the member has
// had with the gym however it was paid — purchases (cash, card, wallet or at
// the desk), wallet credits (refunds, compensation, redeemed points),
// expiries and refunds paid out at the desk. Only rows that moved the wallet
// balance show a +/−.
export function WalletScreen({ onNotificationsClick, notificationCount, onBack }: WalletScreenProps) {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.wallet().then(setData).catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your wallet.")).finally(() => setLoading(false));
  }, []);

  const events = data?.activity ?? [];

  return (
    <div className="min-h-full bg-white pb-28">
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
          className="rounded-[1.5rem] p-6 text-[var(--bq-on-primary)] bg-gradient-to-br from-[var(--bq-primary)] to-[var(--bq-primary-dark)] shadow-[var(--glow-primary)]">
          <div className="text-[var(--bq-on-primary)]/80 text-sm">Store credit</div>
          <div className="font-display text-[38px] leading-tight mt-1">{data ? Math.round(data.balance).toLocaleString() : "—"} <span className="text-[20px]">EGP</span></div>
          <div className="text-[var(--bq-on-primary)]/70 text-xs mt-2">From refunds, compensation & redeemed points · spend it on plans and classes</div>
        </motion.div>
      </div>

      <div className="px-6 mt-7">
        <h2 className="font-display text-[18px] text-[var(--bq-text-primary)] mb-3">Transactions</h2>
        {loading && <div className="py-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" /></div>}
        {error && <div className="text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>{error}</div>}
        {!loading && !error && events.length === 0 && (
          <div className="py-10 text-center text-[var(--bq-text-secondary)] text-sm">No transactions yet.</div>
        )}
        <div className="flex flex-col gap-2">
          {events.map((t) => {
            const up = t.walletDelta > 0;
            const down = t.walletDelta < 0;
            const Icon = t.kind === "purchase" ? Receipt : t.kind === "refund" ? RotateCcw : up ? TrendingUp : TrendingDown;
            return (
              <div key={t.id} data-testid="money-row" className="flex items-center gap-3 p-3.5 rounded-[1.1rem] border border-[var(--bq-neutral-dark)]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${up ? "bg-emerald-50 text-emerald-600" : "bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)]"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[var(--bq-text-primary)] text-sm truncate">{t.title}</div>
                  <div className="text-[var(--bq-text-tertiary)] text-xs truncate">
                    {fmtDate(t.at)} · {t.kind === "purchase" || t.kind === "refund" ? METHOD_LABEL[t.method] : t.detail || "Wallet"}
                  </div>
                </div>
                <div className={`font-display whitespace-nowrap ${up ? "text-emerald-600" : "text-[var(--bq-text-primary)]"}`}>
                  {up ? "+" : down ? "−" : ""}{egp(t.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
