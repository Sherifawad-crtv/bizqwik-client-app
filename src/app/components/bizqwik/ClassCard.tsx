import { useClassesReadOnly } from "../../../lib/branding";
import { Clock, Check } from "./solar";
import type { Going, GymClass } from "../../../lib/api";
import { defaultClassImage, egp, relativeWhen, timeLabel } from "../../../lib/plans";

// Up to 4 overlapping initials (the member first, as "You") and a head count
// — who's going, without ever showing anyone's name.
const SHADES = ["0%", "22%", "40%", "55%"];
// `compact` (on a card) drops the word "going" next to the avatars.
export function AvatarStack({ going, dark = true, max = 4, compact = false, label = "going" }: { going?: Going; dark?: boolean; max?: number; compact?: boolean; label?: string }) {
  const count = going?.count ?? 0;
  const initials = (going?.initials ?? []).slice(0, max);
  const more = count - initials.length;
  const text = count === 0 ? (compact ? "Be the first" : label === "going" ? "Be the first to book" : "Be the first") : more <= 0 ? `${count} ${label}` : compact ? `+${more}` : `+${more} ${label}`;
  return (
    <div className="flex items-center gap-2 min-w-0" data-testid="going">
      {initials.length > 0 && (
        <div className="flex -space-x-1.5 flex-none">
          {initials.map((ini, i) => {
            const you = ini === "You";
            return (
              <span
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold tracking-tight ring-2 ${dark ? "ring-black/40" : "ring-white"} ${you ? "text-[9px]" : "text-[11px]"}`}
                style={
                  you
                    ? { background: "#fff", color: "var(--bq-primary-readable)" }
                    : { background: `color-mix(in srgb, var(--bq-primary-on-dark), #fff ${SHADES[i % SHADES.length]})`, color: "var(--bq-on-primary-on-dark)" }
                }
              >
                {ini}
              </span>
            );
          })}
        </div>
      )}
      <span className={`text-xs truncate ${dark ? "text-white/85" : "text-[var(--bq-text-secondary)]"}`}>{text}</span>
    </div>
  );
}

/** A class as a tall photo card with everything laid over the picture. The
 * whole card is the button — tapping it opens booking. */
export function ClassCard({ cls, onOpen, className = "" }: { cls: GymClass; onOpen: (c: GymClass) => void; className?: string }) {
  // A solo gym takes no bookings or payments: the card is an RSVP ("I'm coming").
  const readOnly = useClassesReadOnly();
  const own = !!cls.imageUrl;
  const img = cls.imageUrl || defaultClassImage(cls.seriesId || cls.id);
  const start = new Date(cls.startsAt);
  const chip = cls.coverage === "plan" ? "On your plan" : cls.price > 0 ? egp(cls.price) : "Free";
  return (
    <button
      onClick={() => onOpen(cls)}
      aria-label={`${cls.title}, ${timeLabel(start)}${cls.booked ? (readOnly ? ", going" : ", booked") : ""}`}
      data-testid="class-card"
      className={`relative flex-none aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-neutral-900 text-left active:scale-[0.98] transition-transform ${className}`}
    >
      <img src={img} alt="" loading="lazy" decoding="async" draggable={false} className={`absolute inset-0 h-full w-full object-cover ${own ? "" : "grayscale contrast-[1.05]"}`} />
      {!own && <div className="absolute inset-0 bg-[var(--bq-primary)] mix-blend-multiply opacity-30" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

      <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
        {readOnly ? <span /> : <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">{chip}</span>}
        {cls.booked && (
          <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--bq-primary-readable)]">
            <Check className="h-3 w-3" strokeWidth={3} /> {readOnly ? "Going" : "Booked"}
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="font-display text-[21px] leading-[1.1] text-white line-clamp-2">{cls.title}</div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-white/80">
          <Clock className="h-3.5 w-3.5" /> {timeLabel(start)}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <AvatarStack going={cls.going} max={3} compact label={readOnly ? "coming" : undefined} />
          <span className="flex-none rounded-full bg-[var(--bq-primary-on-dark)] px-3 py-1.5 text-[11px] font-semibold text-[var(--bq-on-primary-on-dark)]">
            {relativeWhen(cls.startsAt)}
          </span>
        </div>
      </div>
    </button>
  );
}

const ROW = "bq-hscroll -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 px-6";
const SLIDE = "snap-start flex-none w-[70%] max-w-[260px]";

/** A side-scrolling row of class cards; the next card peeks in. The row
 * bleeds to the screen edges while scrolling, but cards snap to the page's
 * 24px grid line (scroll padding), first and last alike. A fling can pass
 * several cards and still lands on one. */
export function ClassCarousel({ classes, onOpen, label }: { classes: GymClass[]; onOpen: (c: GymClass) => void; label?: string }) {
  return (
    <div role="list" aria-label={label} className={ROW}>
      {classes.map((c) => (
        <div role="listitem" key={c.id} className={SLIDE}>
          <ClassCard cls={c} onOpen={onOpen} className="block w-full" />
        </div>
      ))}
      {/* Flex rows drop their end padding when scrolled; this keeps the gutter. */}
      <div aria-hidden className="w-3 flex-none" />
    </div>
  );
}

/** Placeholder row the same size as the real one, so nothing jumps when the
 * classes arrive. */
export function ClassCarouselSkeleton() {
  return (
    <div aria-hidden className={ROW} data-testid="carousel-skeleton">
      {[0, 1].map((i) => (
        <div key={i} className={SLIDE}>
          <div className="aspect-[4/5] w-full rounded-[1.75rem] bg-[var(--bq-neutral)] animate-pulse" />
        </div>
      ))}
    </div>
  );
}
