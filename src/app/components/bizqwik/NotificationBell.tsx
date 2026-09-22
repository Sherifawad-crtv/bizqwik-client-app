import { motion, AnimatePresence } from "motion/react";
import { Bell } from "lucide-react";

interface NotificationBellProps {
  count?: number;
  onClick: () => void;
}

export function NotificationBell({ count = 0, onClick }: NotificationBellProps) {
  const hasNotifications = count > 0;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="relative w-10 h-10 rounded-xl bg-[var(--bq-secondary)] hover:bg-[var(--bq-neutral-dark)] flex items-center justify-center transition-colors duration-[var(--transition-base)]"
    >
      <Bell className={`w-5 h-5 ${hasNotifications ? "text-[var(--bq-primary)]" : "text-[var(--bq-text-primary)]"}`} />
      
      <AnimatePresence>
        {hasNotifications && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center px-1"
          >
            <span className="text-white text-xs font-mono leading-none">
              {count > 9 ? "9+" : count}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse animation for new notifications */}
      {hasNotifications && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-[var(--bq-primary)]"
          initial={{ opacity: 0.3, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      )}
    </motion.button>
  );
}
