import type { GymClass, HomeData } from "../../../lib/api";
import { BookingSheet } from "./BookingSheet";
import { BookQuickSheet, BookingsQuickSheet, PlanQuickSheet } from "./QuickSheets";

export type QuickKind = "book" | "plan" | "bookings";

/** The member's "do it right here" sheets — book a class, get a plan, see and
 * cancel bookings, book one class. They live at the app level so any screen
 * (Home, an empty Bookings list, a "no sessions left" message) can open them
 * over itself instead of sending the member to another tab first. */
export function QuickHost({
  home,
  quick,
  booking,
  onQuick,
  onBooking,
  onReload,
  onSeeSchedule,
  onSeeBookings,
}: {
  home: HomeData;
  quick: QuickKind | null;
  booking: GymClass | null;
  onQuick: (k: QuickKind | null) => void;
  onBooking: (c: GymClass | null) => void;
  onReload: () => void;
  onSeeSchedule: () => void;
  onSeeBookings: () => void;
}) {
  return (
    <>
      {quick === "book" && (
        <BookQuickSheet
          classes={home.upcomingClasses ?? []}
          onClose={() => onQuick(null)}
          onPick={(c) => {
            onQuick(null);
            onBooking(c);
          }}
          onSeeAll={() => {
            onQuick(null);
            onSeeSchedule();
          }}
        />
      )}
      {quick === "plan" && (
        <PlanQuickSheet
          onClose={() => onQuick(null)}
          onBought={() => {
            onQuick(null);
            onReload();
          }}
        />
      )}
      {quick === "bookings" && (
        <BookingsQuickSheet
          onClose={() => onQuick(null)}
          onChanged={onReload}
          onBook={() => onQuick("book")}
          onSeeAll={() => {
            onQuick(null);
            onSeeBookings();
          }}
        />
      )}
      {booking && (
        <BookingSheet
          cls={booking}
          plan={home.groupPlan ?? null}
          walletBalance={home.wallet}
          onClose={() => onBooking(null)}
          onBooked={() => {
            onBooking(null);
            onReload();
          }}
        />
      )}
    </>
  );
}
