import { motion } from "motion/react";
import { Award, Sparkles } from "lucide-react";

interface PointsBadgeProps {
  points: number;
  showAnimation?: boolean;
  variant?: "default" | "compact" | "large";
}

export function PointsBadge({ points, showAnimation = false, variant = "default" }: PointsBadgeProps) {
  const sizeClasses = {
    compact: "text-xs px-2 py-1",
    default: "text-sm px-3 py-1.5",
    large: "text-base px-4 py-2",
  };

  const iconSizes = {
    compact: "w-3 h-3",
    default: "w-4 h-4",
    large: "w-5 h-5",
  };

  return (
    <motion.div
      initial={showAnimation ? { scale: 0, rotate: -180 } : false}
      animate={showAnimation ? { scale: 1, rotate: 0 } : false}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-[var(--bq-accent)] to-amber-500 text-white rounded-full font-mono ${sizeClasses[variant]} shadow-sm`}
    >
      {showAnimation ? (
        <Sparkles className={iconSizes[variant]} />
      ) : (
        <Award className={iconSizes[variant]} />
      )}
      <span>+{points}</span>
    </motion.div>
  );
}
