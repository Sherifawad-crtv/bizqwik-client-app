import { Bell } from "lucide-react";

interface NotificationBellProps {
  count?: number;
  onClick: () => void;
}

// Plain CSS animations (see globals.css) — the bell is on every screen, so it
// shouldn't pull the animation library into the first download.
export function NotificationBell({ count = 0, onClick }: NotificationBellProps) {
  const hasNotifications = count > 0;

  return (
    <button
      onClick={onClick}
      aria-label={hasNotifications ? `Notifications, ${count} unread` : "Notifications"}
      className="relative w-10 h-10 rounded-xl bg-[var(--bq-secondary)] hover:bg-[var(--bq-neutral-dark)] flex items-center justify-center transition-[background-color,transform] duration-[var(--transition-base)] active:scale-95"
    >
      <Bell className={`w-5 h-5 ${hasNotifications ? "text-[var(--bq-primary-readable)]" : "text-[var(--bq-text-primary)]"}`} />

      {hasNotifications && (
        <div className="bq-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center px-1">
          <span className="text-white text-xs font-mono leading-none">{count > 9 ? "9+" : count}</span>
        </div>
      )}

      {/* Pulse for new notifications */}
      {hasNotifications && <div aria-hidden className="bq-pulse pointer-events-none absolute inset-0 rounded-xl bg-[var(--bq-primary)]" />}
    </button>
  );
}
