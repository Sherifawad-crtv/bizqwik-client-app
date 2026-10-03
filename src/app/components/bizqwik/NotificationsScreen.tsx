import { EmptyState } from "./EmptyState";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CalendarCheck, CalendarX, CheckCircle2, Ticket, BadgeCheck, Dumbbell, Wallet, AlarmClock, Bell } from "lucide-react";
import { api, type AppNotification } from "../../../lib/api";
import { useFeedback } from "../../../lib/feedback";
import { enablePush, pushState, type PushState } from "../../../lib/push";
import { Button, Kicker, SheetSub } from "./Sheet";

const ICONS: Record<string, typeof Bell> = {
  booked: CalendarCheck,
  booking_cancelled: CalendarX,
  class_cancelled: CalendarX,
  class_soon: AlarmClock,
  checked_in: CheckCircle2,
  bundle_low: Ticket,
  bundle_finished: Ticket,
  plan_started: BadgeCheck,
  plan_ending: BadgeCheck,
  plan_ended: BadgeCheck,
  pt_logged: Dumbbell,
  wallet_refund: Wallet,
  wallet_credit: Wallet,
  points_redeemed: Wallet,
};

function ago(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return days === 1 ? "Yesterday" : `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// The bell: everything the gym has told this member (bookings, check-ins,
// sessions left, refunds, reminders), newest first. Opening it marks them
// read; what was new stays highlighted until you leave.
export function NotificationsScreen({ onBack, onRead }: { onBack: () => void; onRead: () => void }) {
  const feedback = useFeedback();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [push, setPush] = useState<PushState | null>(null);
  const [enabling, setEnabling] = useState(false);

  const load = useCallback(() => {
    api
      .notifications()
      .then((d) => {
        setItems(d.notifications);
        setError(null);
        if (d.unread > 0) api.markNotificationsRead().then(onRead).catch(() => {});
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your notifications."))
      .finally(() => setLoading(false));
  }, [onRead]);
  useEffect(() => {
    load();
    pushState().then(setPush);
  }, [load]);

  const turnOn = async () => {
    setEnabling(true);
    try {
      await enablePush();
      setPush("on");
      feedback.success("Notifications are on", "We'll let you know about your classes, sessions and plan.");
    } catch (e) {
      feedback.error("Couldn't turn on notifications", e instanceof Error ? e.message : "Please try again.");
      setPush(await pushState());
    } finally {
      setEnabling(false);
    }
  };

  const fresh = items.filter((n) => !n.read);
  const earlier = items.filter((n) => n.read);

  return (
    <div className="min-h-full bg-white pb-28">
      <div className="px-6 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 flex items-center gap-3">
        <button onClick={onBack} aria-label="Back" className="w-10 h-10 rounded-xl bg-[var(--bq-neutral)] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-[24px] text-[var(--bq-text-primary)]">Notifications</h1>
      </div>

      {push && push !== "on" && push !== "unsupported" && (
        <div className="mx-6 mb-5 rounded-[28px] border border-[var(--bq-neutral-dark)] p-5" data-testid="push-card">
          <Kicker>{push === "blocked" ? "Notifications blocked" : "Phone notifications"}</Kicker>
          <div className="font-display text-[18px] text-[var(--bq-text-primary)] mt-1 mb-1">{push === "blocked" ? "Allow them in your settings" : "Get notified on your phone"}</div>
          <SheetSub>
            {push === "install"
              ? `On iPhone, tap Share, then "Add to Home Screen", and open the app from there to turn notifications on (iOS 16.4+).`
              : push === "blocked"
                ? "Allow notifications for this app in your phone's settings to get class reminders."
                : "Class reminders, sessions left, refunds and plan renewals — as they happen."}
          </SheetSub>
          {push === "off" && (
            <Button fullWidth onClick={turnOn} disabled={enabling}>
              {enabling ? "Turning on…" : "Turn on notifications"}
            </Button>
          )}
        </div>
      )}

      {loading && (
        <div className="py-10 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />
        </div>
      )}
      {error && (
        <div className="mx-6 text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>
          {error}
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <EmptyState icon={<Bell />} title="No notifications yet" body="Bookings, check-ins, sessions left and reminders will show up here." />
      )}

      <div className="px-6">
        {fresh.length > 0 && <Section title="New" items={fresh} />}
        {earlier.length > 0 && <Section title={fresh.length ? "Earlier" : ""} items={earlier} />}
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: AppNotification[] }) {
  return (
    <div className="mb-5">
      {title && <div className="text-[var(--bq-text-tertiary)] text-xs uppercase tracking-wide mb-2">{title}</div>}
      <div className="flex flex-col gap-2">
        {items.map((n) => {
          const Glyph = ICONS[n.type] ?? Bell;
          return (
            <div
              key={n.id}
              data-testid="notification"
              data-unread={!n.read}
              className={`flex gap-3 rounded-[1.25rem] p-4 ${n.read ? "bg-white border border-[var(--bq-neutral-dark)]" : "bg-[var(--bq-primary)]/[0.07]"}`}
            >
              <span className={`w-10 h-10 flex-none rounded-full flex items-center justify-center ${n.read ? "bg-[var(--bq-neutral)] text-[var(--bq-text-secondary)]" : "bg-[var(--bq-primary)] text-[var(--bq-on-primary)]"}`}>
                <Glyph className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[var(--bq-text-primary)] font-semibold text-[15px] leading-snug">{n.title}</div>
                  {!n.read && <span className="mt-1.5 w-2 h-2 flex-none rounded-full bg-[var(--bq-primary)]" aria-label="New" />}
                </div>
                <div className="text-[var(--bq-text-secondary)] text-sm mt-0.5">{n.body}</div>
                <div className="text-[var(--bq-text-tertiary)] text-xs mt-1.5">{ago(n.createdAt)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
