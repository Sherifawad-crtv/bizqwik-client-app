import { motion } from "motion/react";
import { Crown, TrendingUp } from "lucide-react";

interface MembershipCardProps {
  memberName: string;
  planName: string;
  planTier: "basic" | "premium" | "elite";
  sessionsRemaining: number;
  totalSessions: number;
}

export function MembershipCard({
  memberName,
  planName,
  planTier,
  sessionsRemaining,
  totalSessions,
}: MembershipCardProps) {
  const tierColors = {
    basic: "from-[var(--bq-text-secondary)] to-[var(--bq-text-tertiary)]",
    premium: "from-[var(--bq-primary)] to-[var(--bq-primary-dark)]",
    elite: "from-[var(--bq-accent)] to-[#FF8C47]",
  };

  const progress = (sessionsRemaining / totalSessions) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-[1.75rem] p-6 bg-gradient-to-br"
      style={{
        backgroundImage: `linear-gradient(135deg, var(--bq-primary) 0%, var(--bq-primary-dark) 100%)`,
        boxShadow: "var(--glow-primary)",
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-white/80 text-sm mb-1">Current Plan</div>
            <div className="flex items-center gap-2">
              <h3 className="text-white text-xl">{planName}</h3>
              {planTier !== "basic" && <Crown className="w-5 h-5 text-[var(--bq-accent)]" />}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Sessions Info */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-white/80 text-sm mb-1">Sessions Remaining</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-white text-3xl">{sessionsRemaining}</span>
                <span className="text-white/60 text-sm">/ {totalSessions}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-white rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
