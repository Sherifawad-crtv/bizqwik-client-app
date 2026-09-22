import { motion } from "motion/react";
import { Flame } from "lucide-react";

interface StreakIndicatorProps {
  days: number;
}

export function StreakIndicator({ days }: StreakIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-full px-4 py-2"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Flame className="w-5 h-5 text-orange-500" />
      </motion.div>
      <div>
        <span className="text-[var(--bq-text-primary)]">
          You're on a{" "}
          <span className="font-mono text-orange-500">{days}-day</span> streak!
        </span>
      </div>
    </motion.div>
  );
}
