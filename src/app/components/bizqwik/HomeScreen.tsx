import { useClassesReadOnly } from "../../../lib/branding";
import { EmptyState } from "./EmptyState";
import { lazy, Suspense, useMemo, useState } from "react";
import { CalendarPlus, QrCode, Ticket, BadgeCheck, ChevronRight, CalendarX, ScanLine } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { MembershipHero } from "./MembershipHero";
import { ClassCarousel } from "./ClassCard";
import { PtPickSheet } from "./QuickSheets";
import type { QuickKind } from "./QuickHost";
import { useFeedback } from "../../../lib/feedback";
import { api, type HomeData, type GymClass, type PtBundle } from "../../../lib/api";

// The PT code sheet carries the QR generator; only fetched when opened.
const PtCodeSheet = lazy(() => import("./PtCodes").then((m) => ({ default: m.PtCodeSheet })));
import { dayKey, egp, num } from "../../../lib/plans";

interface HomeScreenProps {
  /** Home's data — the app shows a loading screen until it has arrived. */
  data: HomeData;
  /** Ask the server again (after a booking or a purchase). */
  onReload: () => void;
  userName: string;
  onWalletClick: () => void;
  onPointsClick: () => void;
  onPlanClick?: () => void;
  onScheduleClick?: () => void;
  onBookingsClick?: () => void;
  /** Open a quick sheet (book / plan / bookings) — the app shows it over whatever screen is current. */
  onQuick: (kind: QuickKind) => void;
  /** Open one class's booking sheet. */
  onBookClass: (c: GymClass) => void;
  onCheckIn?: () => void;
  onNotificationsClick: () => void;
  notificationCount: number;
}

// Home: the member's plan up top (the hero), wallet and points as small
// chips, three quick actions, then today's classes as a swipeable row.
export function HomeScreen({ data, onReload, userName, onWalletClick, onPointsClick, onPlanClick, onScheduleClick, onBookingsClick, onQuick, onBookClass, onCheckIn, onNotificationsClick, notificationCount }: HomeScreenProps) {
  const feedback = useFeedback();
  const [ptPick, setPtPick] = useState<PtBundle[] | null>(null);
  const [ptCode, setPtCode] = useState<PtBundle | null>(null);
  const classes = data.upcomingClasses ?? [];

  const today = useMemo(() => classes.filter((c) => dayKey(new Date(c.startsAt)) === dayKey(new Date())), [classes]);
  const plan = data.groupPlan ?? null;
  const pkg = data.package && data.package.status === "active" ? data.package : null;
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
      : { label: "Get a plan", icon: <BadgeCheck className="w-5 h-5" />, onClick: () => onQuick("plan") };
  const readOnlyClasses = useClassesReadOnly();
  // A solo gym takes no bookings, so only the middle action (check in / PT code / plan) shows.
  const actions = readOnlyClasses
    ? [middle]
    : [
        { label: "Book a class", icon: <CalendarPlus className="w-5 h-5" />, onClick: () => onQuick("book") },
        middle,
        { label: "My bookings", icon: <Ticket className="w-5 h-5" />, onClick: () => onQuick("bookings") },
      ];

  return (
    <div className="min-h-full bg-white pb-28">
      <div className="px-6 pt-[calc(env(safe-area-inset-top)+16px)] pb-5 flex items-center justify-between gap-3">
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
        <MembershipHero plan={plan} pkg={pkg} onOpen={onPlanClick} />

        {/* Wallet + points, small */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button onClick={onWalletClick} className="flex items-center gap-2.5 rounded-[1.1rem] bg-[var(--bq-neutral)] px-3.5 py-3 text-left active:scale-[0.98] transition-transform">
            <img src="/3d/wallet.webp" alt="" aria-hidden draggable={false} className="w-9 h-9 flex-none object-contain" />
            <span className="min-w-0">
              <span className="block text-[11px] text-[var(--bq-text-secondary)]">Wallet</span>
              <span className="block truncate font-display text-[15px] text-[var(--bq-text-primary)]">{egp(data.wallet)}</span>
            </span>
          </button>
          <button onClick={onPointsClick} className="flex items-center gap-2.5 rounded-[1.1rem] bg-[var(--bq-neutral)] px-3.5 py-3 text-left active:scale-[0.98] transition-transform">
            <img src="/3d/points.webp" alt="" aria-hidden draggable={false} className="w-9 h-9 flex-none object-contain" />
            <span className="min-w-0">
              <span className="block text-[11px] text-[var(--bq-text-secondary)]">Points</span>
              <span className="block truncate font-display text-[15px] text-[var(--bq-text-primary)]">{num(data.points)}</span>
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

        {today.length === 0 && (
          <EmptyState
            icon={<CalendarX />}
            title="No classes today"
            body={classes.length === 0 ? "Your gym hasn't scheduled any classes yet. They'll show up here as soon as it does." : "Nothing else on today — see what's coming up this week."}
            action={classes.length > 0 && onScheduleClick ? { label: "See the schedule", onClick: onScheduleClick } : undefined}
          />
        )}
        {today.length > 0 && <ClassCarousel classes={today} onOpen={onBookClass} label="Today's classes" />}
      </div>

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
      {ptCode && (
        <Suspense fallback={null}>
          <PtCodeSheet bundle={ptCode} onClose={() => setPtCode(null)} />
        </Suspense>
      )}

    </div>
  );
}
