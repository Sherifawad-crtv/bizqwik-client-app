import { EmptyState } from "./EmptyState";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarX } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { ClassCarousel } from "./ClassCard";
import { BookingSheet } from "./BookingSheet";
import { api, type GroupPlan, type GymClass } from "../../../lib/api";
import { dayKey, timeLabel } from "../../../lib/plans";

const DAYS = 14;

// Schedule: pick a day at the top, then every class that day grouped by start
// time ("9:00 PM"), each time a swipeable row of class cards.
export function ScheduleScreen({ onNotificationsClick, notificationCount }: { onNotificationsClick: () => void; notificationCount: number }) {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [plan, setPlan] = useState<GroupPlan | null>(null);
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<GymClass | null>(null);
  const [day, setDay] = useState(() => dayKey(new Date()));

  const load = useCallback((first = false) => {
    Promise.all([api.classes(), api.home()])
      .then(([c, h]) => {
        setClasses(c.classes);
        setPlan(c.activePlan);
        setWallet(h.wallet);
        setError(null);
        // Nothing on today? Open on the next day that has something.
        if (first) {
          const todayKey = dayKey(new Date());
          if (!c.classes.some((x) => dayKey(new Date(x.startsAt)) === todayKey) && c.classes[0]) setDay(dayKey(new Date(c.classes[0].startsAt)));
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load the schedule."))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    load(true);
  }, [load]);

  const days = useMemo(() => {
    const t = new Date();
    return Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i);
      return { key: dayKey(d), date: d };
    });
  }, []);
  const byDay = useMemo(() => {
    const m = new Map<string, GymClass[]>();
    for (const c of classes) {
      const k = dayKey(new Date(c.startsAt));
      m.set(k, [...(m.get(k) ?? []), c]);
    }
    return m;
  }, [classes]);
  const slots = useMemo(() => {
    const m = new Map<string, GymClass[]>();
    for (const c of byDay.get(day) ?? []) {
      const k = timeLabel(new Date(c.startsAt));
      m.set(k, [...(m.get(k) ?? []), c]);
    }
    return [...m.entries()];
  }, [byDay, day]);
  const selected = days.find((d) => d.key === day)?.date ?? new Date();

  return (
    <div className="min-h-full bg-white pb-28">
      {/* Hero: the date picker */}
      <div className="px-6 pt-14 pb-5 bg-[var(--bq-neutral)] rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[var(--bq-text-secondary)] text-[13px]">{selected.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>
            <h1 className="font-display text-[28px] leading-tight text-[var(--bq-text-primary)]">Schedule</h1>
          </div>
          <NotificationBell count={notificationCount} onClick={onNotificationsClick} />
        </div>
        <div className="-mx-6 mt-4 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Pick a day">
          {days.map(({ key, date }, i) => {
            const on = key === day;
            const count = byDay.get(key)?.length ?? 0;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={on}
                aria-label={date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                onClick={() => setDay(key)}
                className={`flex-none w-[58px] py-3 rounded-[1.25rem] flex flex-col items-center gap-0.5 transition-colors ${
                  on ? "bg-[var(--bq-primary)] text-[var(--bq-on-primary)] shadow-[0_10px_22px_color-mix(in_srgb,var(--bq-primary)_35%,transparent)]" : "bg-white text-[var(--bq-text-secondary)]"
                }`}
              >
                <span className="text-[11px] uppercase tracking-wide">{i === 0 ? "Today" : date.toLocaleDateString(undefined, { weekday: "short" })}</span>
                <span className={`font-display text-[22px] leading-tight ${on ? "" : "text-[var(--bq-text-primary)]"}`}>{date.getDate()}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${count ? (on ? "bg-[var(--bq-on-primary)]" : "bg-[var(--bq-primary)]") : "bg-transparent"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 mt-6">
        {loading && (
          <div className="py-10 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />
          </div>
        )}
        {error && (
          <div className="text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>
            {error}
          </div>
        )}
        {!loading && !error && slots.length === 0 && (
          <EmptyState
            icon={<CalendarX />}
            title="No classes on this day"
            body={classes.length === 0 ? "Your gym hasn't scheduled any classes yet. They'll show up here as soon as it does." : "Pick another day above to see what's on."}
          />
        )}
        <div className="flex flex-col gap-7">
          {slots.map(([time, list]) => (
            <section key={time} aria-label={time}>
              <div className="flex items-baseline gap-2 mb-3">
                <h2 className="font-display text-[20px] text-[var(--bq-text-primary)]">{time}</h2>
                <span className="text-xs text-[var(--bq-text-tertiary)]">
                  {list.length} class{list.length === 1 ? "" : "es"}
                </span>
              </div>
              <ClassCarousel classes={list} onOpen={setBooking} label={`Classes at ${time}`} />
            </section>
          ))}
        </div>
      </div>

      {booking && (
        <BookingSheet
          cls={booking}
          plan={plan}
          walletBalance={wallet}
          onClose={() => setBooking(null)}
          onBooked={() => {
            setBooking(null);
            load();
          }}
        />
      )}
    </div>
  );
}
