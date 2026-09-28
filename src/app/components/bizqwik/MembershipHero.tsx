import type { GroupPlan, PackageInstance } from "../../../lib/api";
import { PLAN_KIND_LABEL, daysLeft, planDetail, shortDate } from "../../../lib/plans";

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
    detail = planDetail(plan);
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
      className="relative overflow-hidden rounded-[1.75rem] p-5 text-[var(--bq-on-primary)] active:scale-[0.99] transition-transform cursor-pointer"
      style={{
        background:
          "radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--bq-primary-light), transparent 20%) 0%, transparent 55%), linear-gradient(135deg, var(--bq-primary) 0%, var(--bq-primary-dark) 100%)",
      }}
    >
      <div className="relative flex items-center justify-between gap-3">
        <span className="text-[13px] opacity-85 truncate">{label}</span>
        {(plan || pkg) && <span className="flex-none rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">Active</span>}
      </div>

      <div className="relative mt-1 font-display text-[19px] leading-tight truncate pr-16">{title}</div>

      {big !== null ? (
        <div className="relative mt-3 flex items-end gap-2">
          <span className="font-display text-[46px] leading-none tracking-tight">{big}</span>
          <span className="pb-1.5 text-[15px] opacity-85">
            {of ? `${of} ` : ""}
            {unit}
          </span>
        </div>
      ) : (
        <div className="relative mt-3 text-[15px] opacity-90 max-w-[70%]">Book on a plan and save on every class.</div>
      )}

      {progress !== null && (
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}

      <div className="relative mt-3 flex items-center justify-between gap-3">
        <span className="min-w-0 text-[12px] opacity-80 truncate">
          {detail}
          {plan && pkg && pkg.status === "active" ? ` · + PT ${pkg.sessionsRemaining} left` : ""}
        </span>
        <span className="flex-none rounded-full bg-black/80 px-4 py-2 text-[13px] font-semibold text-white">{cta}</span>
      </div>
      {plan && <span className="sr-only">Valid until {shortDate(plan.expiresAt)}</span>}
    </div>
  );
}
