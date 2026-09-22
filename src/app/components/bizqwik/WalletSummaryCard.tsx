import { motion } from "motion/react";
import { Wallet, Award, TrendingUp, ChevronRight } from "lucide-react";

interface WalletSummaryCardProps {
  balance: number;
  points: number;
  pointsChange: number; // percentage change
  onWalletClick?: () => void;
  onPointsClick?: () => void;
}

export function WalletSummaryCard({ balance, points, pointsChange, onWalletClick, onPointsClick }: WalletSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-gradient-to-br from-[var(--bq-neutral)] to-white rounded-[1.5rem] p-4 border border-[var(--bq-neutral-dark)]"
    >
      <div className="flex items-center gap-3">
        {/* Wallet */}
        <button
          onClick={onWalletClick}
          className="flex-1 text-left hover:bg-[var(--bq-primary)]/5 rounded-xl p-2 -m-2 transition-all duration-[var(--transition-base)] active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[var(--bq-primary)]/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[var(--bq-primary)]" />
            </div>
            <div>
              <div className="text-xs text-[var(--bq-text-secondary)]">Wallet</div>
              <div className="font-mono text-[var(--bq-text-primary)]">
                ${balance.toFixed(2)}
              </div>
            </div>
          </div>
        </button>

        {/* Divider */}
        <div className="w-px h-10 bg-[var(--bq-neutral-dark)]" />

        {/* Points */}
        <button
          onClick={onPointsClick}
          className="flex-1 text-left hover:bg-[var(--bq-accent)]/5 rounded-xl p-2 -m-2 transition-all duration-[var(--transition-base)] active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[var(--bq-accent)]/10 flex items-center justify-center">
              <Award className="w-4 h-4 text-[var(--bq-accent)]" />
            </div>
            <div>
              <div className="text-xs text-[var(--bq-text-secondary)]">Points</div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[var(--bq-text-primary)]">{points}</span>
                {pointsChange > 0 && (
                  <div className="flex items-center gap-0.5 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-mono">+{pointsChange}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>
      
      {/* View Details Arrows */}
      <div className="flex items-center justify-between mt-2 px-2">
        {onWalletClick && (
          <div className="flex items-center gap-1 text-xs text-[var(--bq-text-tertiary)]">
            <span>Wallet</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        )}
        {onPointsClick && (
          <div className="flex items-center gap-1 text-xs text-[var(--bq-text-tertiary)]">
            <span>Rewards</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
