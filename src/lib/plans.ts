import type { GroupPlan, PlanOffer } from "./api";

const pad = (n: number) => String(n).padStart(2, "0");

export function timeLabel(d: Date): string {
  const h = d.getHours();
  return `${((h + 11) % 12) + 1}:${pad(d.getMinutes())} ${h < 12 ? "AM" : "PM"}`;
}

export function whenLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · ${timeLabel(d)}`;
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const PLAN_KIND_LABEL: Record<GroupPlan["kind"], string> = {
  membership: "Membership · all classes",
  class_monthly: "Class monthly",
  bundle: "Class bundle",
};

/** "7 of 10 classes left · until Nov 20" / "Until Nov 20". */
export function planDetail(p: GroupPlan): string {
  const until = `until ${shortDate(p.expiresAt)}`;
  if (p.kind === "bundle") return `${p.creditsRemaining} of ${p.creditsTotal} classes left · ${until}`;
  return until.charAt(0).toUpperCase() + until.slice(1);
}

export function offerDetail(o: PlanOffer): string {
  const months = `${o.durationMonths} month${o.durationMonths === 1 ? "" : "s"}`;
  if (o.kind === "bundle") return `${o.credits} classes, any class · valid ${months}`;
  if (o.kind === "class_monthly") return `Every session of this class · ${months}`;
  return `Every class · ${months}`;
}

export const egp = (n: number) => `${Math.round(n).toLocaleString()} EGP`;
