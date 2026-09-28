import type { GroupPlan, PackageInstance } from "../../../lib/api";
import { PLAN_KIND_LABEL, daysLeft, shortDate } from "../../../lib/plans";

const DAY = 86_400_000;

// The member's plan as the hero of Home: what they're on and, big, what's
// left — sessions on a bundle, days (or months) on a time-based plan.
export function MembershipHero({ plan, pkg, onOpen }: { plan: GroupPlan | null; pkg: PackageInstance | null; onOpen?: () => void }) {
  let label = "Your plan";
  let title: string;
  let big: string | null = null;
  let of: string | null = null;
  let unit = "";
  let detail: string;
  let progress: number | null = null;
  let cta = "Details";

  if (plan) {
    label = PLAN_KIND_LABEL[plan.kind];
    title = plan.name;
    detail = `Until ${shortDate(plan.expiresAt)}`;
    if (plan.kind === "bundle") {
      big = String(plan.creditsRemaining ?? 0);
      of = `/ ${plan.creditsTotal}`;
      unit = plan.creditsRemaining === 1 ? "class left" : "classes left";
      progress = plan.creditsTotal ? (plan.creditsRemaining ?? 0) / plan.creditsTotal : null;
      if ((plan.creditsRemaining ?? 0) <= 2) cta = "Renew";
    } else {
      const days = daysLeft(plan.expiresAt);
      if (days > 62) {
        big = String(Math.floor(days / 30));
        unit = "months left";
      } else {
        big = String(days);
        unit = days === 1 ? "day left" : "days left";
      }
      const total = Math.max(1, (new Date(plan.expiresAt).getTime() - new Date(plan.startsAt).getTime()) / DAY);
      progress = Math.min(1, days / total);
      if (days <= 7) cta = "Renew";
    }
  } else if (pkg) {
    label = "Private training";
    title = "PT package";
    big = String(pkg.sessionsRemaining);
    of = `/ ${pkg.sessionsIncluded}`;
    unit = pkg.sessionsRemaining === 1 ? "session left" : "sessions left";
    detail = `${pkg.sessionsRemaining} of ${pkg.sessionsIncluded} sessions left · classes are pay-per-visit`;
    progress = pkg.sessionsIncluded ? pkg.sessionsRemaining / pkg.sessionsIncluded : null;
    cta = "Get a plan";
  } else {
    title = "No active plan";
    detail = "Memberships, class monthlies and bundles";
    cta = "Get a plan";
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen?.()}
      data-testid="membership-hero"
      className="relative isolate overflow-hidden rounded-[28px] px-5 pt-5 pb-[18px] text-[var(--bq-on-primary)] cursor-pointer"
      style={{ background: "var(--bq-primary)" }}
    >
      {/* The membership card sits behind everything, off the right edge; the
          gym colour fades over its left side so the text stays readable. */}
      <img
        src="/3d/membership-card.webp"
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className="pointer-events-none absolute -z-10 w-[78%] max-w-[330px] right-[-22%] top-1/2 -translate-y-1/2 select-none"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "linear-gradient(90deg, var(--bq-primary) 38%, color-mix(in srgb, var(--bq-primary) 55%, transparent) 72%, transparent)" }} />
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-mono text-[11px] font-bold uppercase tracking-[.08em] opacity-75">{label}</span>
        {(plan || pkg) && <span className="flex-none rounded-full bg-white/20 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[.06em]">Active</span>}
      </div>
      <div className="mt-1 font-display text-[18px] font-bold leading-tight truncate">{title}</div>

      {big !== null ? (
        <div className="mt-2 flex items-end gap-2">
          <span className="font-display text-[56px] font-extrabold leading-none tracking-[-.03em] tabular-nums">{big}</span>
          <span className="pb-1.5 font-mono text-[13px] opacity-85">
            {of ? `${of} ` : ""}
            {unit}
          </span>
        </div>
      ) : (
        <div className="mt-2 font-mono text-[13px] opacity-85">Book on a plan and save on every class.</div>
      )}

      {progress !== null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate font-mono text-[12px] opacity-80">
          {detail}
          {plan && pkg && pkg.status === "active" ? ` · + PT ${pkg.sessionsRemaining} left` : ""}
        </span>
        <span className="flex-none rounded-full bg-white px-4 py-2 text-[14px] font-bold text-[var(--bq-primary-readable)]">{cta}</span>
      </div>
      {plan && <span className="sr-only">Valid until {shortDate(plan.expiresAt)}</span>}
    </div>
  );
}
