import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  X,
  Calendar,
  Award,
  AlertCircle,
  Gift,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  Flame,
  CreditCard,
  Zap,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";

type NotificationType = "session" | "reward" | "renewal" | "offer" | "achievement";
type NotificationPriority = "high" | "medium" | "low";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  read: boolean;
  priority: NotificationPriority;
  actionLabel?: string;
  actionData?: any;
}

const notificationsData: Notification[] = [
  {
    id: "1",
    type: "session",
    title: "Session Starting Soon",
    message: "Your HIIT Cardio Blast session starts in 2 hours at Downtown Studio",
    timestamp: "2025-10-31T14:00:00",
    timeAgo: "2 hours",
    read: false,
    priority: "high",
    actionLabel: "View Session",
  },
  {
    id: "2",
    type: "offer",
    title: "Morning Motivation 🌅",
    message: "Get 20% off all morning sessions this week! Book before slots fill up.",
    timestamp: "2025-10-31T09:00:00",
    timeAgo: "5 hours ago",
    read: false,
    priority: "high",
    actionLabel: "Browse Classes",
  },
  {
    id: "3",
    type: "reward",
    title: "Points Milestone Unlocked!",
    message: "You've earned 500 bonus points for completing 5 sessions this month 🎉",
    timestamp: "2025-10-31T08:30:00",
    timeAgo: "6 hours ago",
    read: false,
    priority: "medium",
    actionLabel: "View Rewards",
  },
  {
    id: "4",
    type: "achievement",
    title: "New Achievement: On Fire 🔥",
    message: "You've achieved a 5-day workout streak! Keep it going!",
    timestamp: "2025-10-30T18:00:00",
    timeAgo: "Yesterday",
    read: true,
    priority: "medium",
    actionLabel: "View Badges",
  },
  {
    id: "5",
    type: "renewal",
    title: "Membership Renewal Due",
    message: "Your Gold membership renews in 7 days. Review your plan or update payment.",
    timestamp: "2025-10-30T10:00:00",
    timeAgo: "Yesterday",
    read: false,
    priority: "high",
    actionLabel: "Manage Plan",
  },
  {
    id: "6",
    type: "session",
    title: "Session Completed ✓",
    message: "Great work on Power Yoga Flow! You earned 150 points.",
    timestamp: "2025-10-29T19:00:00",
    timeAgo: "2 days ago",
    read: true,
    priority: "low",
  },
  {
    id: "7",
    type: "offer",
    title: "Weekend Flash Sale",
    message: "Premium classes at regular prices this Saturday & Sunday only!",
    timestamp: "2025-10-29T12:00:00",
    timeAgo: "2 days ago",
    read: true,
    priority: "medium",
    actionLabel: "View Classes",
  },
  {
    id: "8",
    type: "reward",
    title: "Reward Redeemed",
    message: "Your 20% discount has been applied to your wallet.",
    timestamp: "2025-10-28T15:00:00",
    timeAgo: "3 days ago",
    read: true,
    priority: "low",
  },
  {
    id: "9",
    type: "session",
    title: "Booking Confirmed",
    message: "You're all set for HIIT Cardio Blast on Nov 2 at 4:00 PM",
    timestamp: "2025-10-28T10:00:00",
    timeAgo: "3 days ago",
    read: true,
    priority: "low",
  },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "session":
      return Calendar;
    case "reward":
      return Award;
    case "renewal":
      return CreditCard;
    case "offer":
      return Gift;
    case "achievement":
      return Sparkles;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "session":
      return "bg-blue-500/10 text-blue-600";
    case "reward":
      return "bg-[var(--bq-accent)]/10 text-[var(--bq-accent)]";
    case "renewal":
      return "bg-red-500/10 text-red-600";
    case "offer":
      return "bg-[var(--bq-primary)]/10 text-[var(--bq-primary)]";
    case "achievement":
      return "bg-purple-500/10 text-purple-600";
    default:
      return "bg-gray-500/10 text-gray-600";
  }
};

interface NotificationsScreenProps {
  onClose: () => void;
  onNotificationAction?: (notification: Notification) => void;
}

export function NotificationsScreen({ onClose, onNotificationAction }: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
  const [filter, setFilter] = useState<"all" | NotificationType>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification removed");
  };

  const handleAction = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (onNotificationAction) {
      onNotificationAction(notification);
    }
    onClose();
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  // Group notifications by time
  const today = filteredNotifications.filter((n) => n.timeAgo.includes("hour"));
  const yesterday = filteredNotifications.filter((n) => n.timeAgo.includes("Yesterday"));
  const earlier = filteredNotifications.filter(
    (n) => !n.timeAgo.includes("hour") && !n.timeAgo.includes("Yesterday")
  );

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const Icon = getNotificationIcon(notification.type);
    const colorClass = getNotificationColor(notification.type);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`bg-white rounded-2xl p-4 border transition-all duration-[var(--transition-base)] ${
          notification.read
            ? "border-[var(--bq-neutral-dark)]"
            : "border-[var(--bq-primary)]/30 bg-[var(--bq-primary)]/5"
        }`}
      >
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4
                className={`${
                  notification.read ? "text-[var(--bq-text-primary)]" : "text-[var(--bq-text-primary)]"
                }`}
              >
                {notification.title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-[var(--bq-primary)]" />
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="w-6 h-6 rounded-lg hover:bg-[var(--bq-neutral-dark)] flex items-center justify-center transition-colors duration-[var(--transition-base)]"
                >
                  <X className="w-3.5 h-3.5 text-[var(--bq-text-tertiary)]" />
                </button>
              </div>
            </div>

            <p className="text-sm text-[var(--bq-text-secondary)] mb-2">
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--bq-text-tertiary)]">
                {notification.timeAgo}
              </span>

              <div className="flex items-center gap-2">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-xs text-[var(--bq-primary)] hover:underline"
                  >
                    Mark as read
                  </button>
                )}
                {notification.actionLabel && (
                  <button
                    onClick={() => handleAction(notification)}
                    className="text-xs text-[var(--bq-primary)] hover:underline flex items-center gap-1"
                  >
                    <span>{notification.actionLabel}</span>
                    <Zap className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bq-neutral)] pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl text-[var(--bq-text-primary)] mb-1">
              Notifications
            </h1>
            <p className="text-sm text-[var(--bq-text-secondary)]">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[var(--bq-secondary)] flex items-center justify-center hover:bg-[var(--bq-neutral-dark)] transition-colors duration-[var(--transition-base)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-[var(--bq-primary)] hover:underline flex items-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="px-6 py-6">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl transition-all duration-[var(--transition-base)] whitespace-nowrap ${
                filter === "all"
                  ? "bg-[var(--bq-primary)] text-white"
                  : "bg-white border border-[var(--bq-neutral-dark)] text-[var(--bq-text-secondary)]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("session")}
              className={`px-4 py-2 rounded-xl transition-all duration-[var(--transition-base)] whitespace-nowrap flex items-center gap-2 ${
                filter === "session"
                  ? "bg-[var(--bq-primary)] text-white"
                  : "bg-white border border-[var(--bq-neutral-dark)] text-[var(--bq-text-secondary)]"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Sessions</span>
            </button>
            <button
              onClick={() => setFilter("reward")}
              className={`px-4 py-2 rounded-xl transition-all duration-[var(--transition-base)] whitespace-nowrap flex items-center gap-2 ${
                filter === "reward"
                  ? "bg-[var(--bq-primary)] text-white"
                  : "bg-white border border-[var(--bq-neutral-dark)] text-[var(--bq-text-secondary)]"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Rewards</span>
            </button>
            <button
              onClick={() => setFilter("offer")}
              className={`px-4 py-2 rounded-xl transition-all duration-[var(--transition-base)} whitespace-nowrap flex items-center gap-2 ${
                filter === "offer"
                  ? "bg-[var(--bq-primary)] text-white"
                  : "bg-white border border-[var(--bq-neutral-dark)] text-[var(--bq-text-secondary)]"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Offers</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--bq-secondary)] flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-[var(--bq-text-tertiary)]" />
              </div>
              <h3 className="font-display text-xl text-[var(--bq-text-primary)] mb-2">
                No notifications
              </h3>
              <p className="text-sm text-[var(--bq-text-secondary)]">
                You're all caught up!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Today */}
              {today.length > 0 && (
                <div>
                  <h3 className="text-sm text-[var(--bq-text-tertiary)] mb-3 px-2">
                    Today
                  </h3>
                  <div className="space-y-3">
                    {today.map((notification) => (
                      <NotificationCard key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}

              {/* Yesterday */}
              {yesterday.length > 0 && (
                <div>
                  <h3 className="text-sm text-[var(--bq-text-tertiary)] mb-3 px-2">
                    Yesterday
                  </h3>
                  <div className="space-y-3">
                    {yesterday.map((notification) => (
                      <NotificationCard key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}

              {/* Earlier */}
              {earlier.length > 0 && (
                <div>
                  <h3 className="text-sm text-[var(--bq-text-tertiary)] mb-3 px-2">
                    Earlier
                  </h3>
                  <div className="space-y-3">
                    {earlier.map((notification) => (
                      <NotificationCard key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
