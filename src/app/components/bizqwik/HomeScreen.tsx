import { EmptyState } from "./EmptyState";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Wallet, Star, CalendarPlus, QrCode, Ticket, BadgeCheck, ChevronRight, CalendarX, ScanLine } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { MembershipHero } from "./MembershipHero";
import { ClassCarousel, ClassCarouselSkeleton } from "./ClassCard";
import { BookingSheet } from "./BookingSheet";
import { BookQuickSheet, BookingsQuickSheet, PlanQuickSheet, PtPickSheet } from "./QuickSheets";
import { PtCodeSheet } from "./PtCodes";
import { useFeedback } from "../../../lib/feedback";
import { api, type HomeData, type GymClass, type PtBundle } from "../../../lib/api";
import { dayKey, egp } from "../../../lib/plans";

interface HomeScreenProps {
  userName: string;
  onWalletClick: () => void;
  onPointsClick: () => void;
  onPlanClick?: () => void;
  onScheduleClick?: () => void;
  onBookingsClick?: () => void;
  onCheckIn?: () => void;
  onNotificationsClick: () => void;
  notificationCount: number;
}

// Home: the member's plan up top (the hero), wallet and points as small
// chips, three quick actions, then today's classes as a swipeable row.
export function HomeScreen({ userName, onWalletClick, onPointsClick, onPlanClick, onScheduleClick, onBookingsClick, onCheckIn, onNotificationsClick, notificationCount }: HomeScreenProps) {
  const feedback = useFeedback();
  const [quick, setQuick] = useState<"book" | "plan" | "bookings" | null>(null);
  const [ptPick, setPtPick] = useState<PtBundle[] | null>(null);
  const [ptCode, setPtCode] = useState<PtBundle | null>(null);
  const [data, setData] = useState<HomeData | null>(null);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<GymClass | null>(null);

  const load = useCallback(() => {
    Promise.all([api.home(), api.classes()])
      .then(([h, c]) => {
        setData(h);
        setClasses(c.classes);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your home."))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const today = useMemo(() => classes.filter((c) => dayKey(new Date(c.startsAt)) === dayKey(new Date())), [classes]);
  const plan = data?.groupPlan ?? null;
  const pkg = data?.package && data.package.status === "active" ? data.package : null;
  const initials = userName.slice(0, 1).toUpperCase();

  // Quick actions do the thing right here: the PT code opens at once, plans
  // and bookings open in a sheet. With a plan (and no PT) the middle one is
  // check-in; the plan itself is a tap on the card above.
  const showPtCode = async () => {
    try {
      const { bundles } = await api.ptBundles();
      if (bundles.length === 1) setPtCode(bundles[0]);
      else if (bundles.length > 1) setPtPick(bundles);
      else feedback.info("No PT code right now", "Your PT bundle has no sessions left to log. Ask the front desk about renewing.");
    } catch (e) {
      feedback.error("Couldn't open your PT code", e instanceof Error ? e.message : "Please try again.");
    }
  };
  const middle = pkg
    ? { label: "My PT code", icon: <QrCode className="w-5 h-5" />, onClick: showPtCode }
    : plan
      ? { label: "Check in", icon: <ScanLine className="w-5 h-5" />, onClick: onCheckIn }
      : { label: "Get a plan", icon: <BadgeCheck className="w-5 h-5" />, onClick: () => setQuick("plan") };
  const actions = [
    { label: "Book a class", icon: <CalendarPlus className="w-5 h-5" />, onClick: () => setQuick("book") },
    middle,
    { label: "My bookings", icon: <Ticket className="w-5 h-5" />, onClick: () => setQuick("bookings") },
  ];

  return (
    <div className="min-h-full bg-white pb-28">
      <div className="px-6 pt-14 pb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 flex-none rounded-full bg-[var(--bq-primary)] text-[var(--bq-on-primary)] flex items-center justify-center font-display text-[18px]">{initials}</div>
          <div className="min-w-0">
            <div className="text-[var(--bq-text-secondary)] text-[13px] leading-tight">Welcome back</div>
            <h1 className="font-display text-[22px] leading-tight text-[var(--bq-text-primary)] truncate">Hi, {userName} 👋</h1>
          </div>
        </div>
        <NotificationBell count={notificationCount} onClick={onNotificationsClick} />
      </div>

      <div className="px-6">
        {data ? <MembershipHero plan={plan} pkg={pkg} onOpen={onPlanClick} /> : <div className="h-[196px] rounded-[1.75rem] bg-[var(--bq-neutral)] animate-pulse" />}

        {/* Wallet + points, small */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button onClick={onWalletClick} className="flex items-center gap-2.5 rounded-[1.1rem] bg-[var(--bq-neutral)] px-3.5 py-3 text-left active:scale-[0.98] transition-transform">
            <span className="w-8 h-8 flex-none rounded-full bg-white text-[var(--bq-primary-readable)] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] text-[var(--bq-text-secondary)]">Wallet</span>
              <span className="block truncate font-display text-[15px] text-[var(--bq-text-primary)]">{data ? egp(data.wallet) : "—"}</span>
            </span>
          </button>
          <button onClick={onPointsClick} className="flex items-center gap-2.5 rounded-[1.1rem] bg-[var(--bq-neutral)] px-3.5 py-3 text-left active:scale-[0.98] transition-transform">
            <span className="w-8 h-8 flex-none rounded-full bg-white text-[var(--bq-accent)] flex items-center justify-center">
              <Star className="w-4 h-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] text-[var(--bq-text-secondary)]">Points</span>
              <span className="block truncate font-display text-[15px] text-[var(--bq-text-primary)]">{data ? data.points.toLocaleString() : "—"}</span>
            </span>
          </button>
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-3" role="group" aria-label="Quick actions">
          {actions.map((a) => (
            <button key={a.label} onClick={a.onClick} className="flex flex-col items-center gap-2 active:scale-[0.96] transition-transform">
              <span className="w-14 h-14 rounded-full bg-[var(--bq-primary)] text-[var(--bq-on-primary)] flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6">{a.icon}</span>
              <span className="text-[13px] font-medium text-[var(--bq-text-primary)] leading-tight text-center">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today */}
      <div className="px-6 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-[20px] text-[var(--bq-text-primary)]">Today</h2>
          <button onClick={onScheduleClick} className="flex items-center gap-0.5 text-sm font-medium text-[var(--bq-primary-readable)]">
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading && <ClassCarouselSkeleton />}
        {error && (
          <div className="text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>
            {error}
          </div>
        )}
        {!loading && !error && today.length === 0 && (
          <EmptyState
            icon={<CalendarX />}
            title="No classes today"
            body={classes.length === 0 ? "Your gym hasn't scheduled any classes yet. They'll show up here as soon as it does." : "Nothing else on today — see what's coming up this week."}
            action={classes.length > 0 && onScheduleClick ? { label: "See the schedule", onClick: onScheduleClick } : undefined}
          />
        )}
        {today.length > 0 && <ClassCarousel classes={today} onOpen={setBooking} label="Today's classes" />}
      </div>

      {quick === "book" && (
        <BookQuickSheet
          classes={classes}
          onClose={() => setQuick(null)}
          onPick={(c) => {
            setQuick(null);
            setBooking(c);
          }}
          onSeeAll={() => {
            setQuick(null);
            onScheduleClick?.();
          }}
        />
      )}
      {quick === "plan" && (
        <PlanQuickSheet
          onClose={() => setQuick(null)}
          onBought={() => {
            setQuick(null);
            load();
          }}
        />
      )}
      {quick === "bookings" && (
        <BookingsQuickSheet
          onClose={() => setQuick(null)}
          onChanged={load}
          onBook={() => setQuick("book")}
          onSeeAll={() => {
            setQuick(null);
            onBookingsClick?.();
          }}
        />
      )}
      {ptPick && (
        <PtPickSheet
          bundles={ptPick}
          onClose={() => setPtPick(null)}
          onPick={(b) => {
            setPtPick(null);
            setPtCode(b);
          }}
        />
      )}
      {ptCode && <PtCodeSheet bundle={ptCode} onClose={() => setPtCode(null)} />}

      {booking && (
        <BookingSheet
          cls={booking}
          plan={plan}
          walletBalance={data?.wallet ?? 0}
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
