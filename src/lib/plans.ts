import { SUPABASE_URL } from "./config";
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

/** A whole-number amount. Up to a billion it's written in full; anything bigger
 * is shortened (12.3B) so it can never outgrow the space it sits in, and
 * past a trillion it just says so. */
export function num(n: number): string {
  const abs = Math.abs(n);
  if (abs < 1e9) return Math.round(n).toLocaleString();
  if (abs >= 1e15) return `${n < 0 ? "−" : ""}999T+`;
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
export const egp = (n: number) => `${num(n)} EGP`;

// Bizqwik's default class photos (8, in our own Storage). A class without a
// photo from the gym always gets the same one, picked from its series (or
// its own id for a one-off), so it looks the same everywhere.
const DEFAULT_CLASS_PHOTOS = 8;
export function defaultClassImage(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return `${SUPABASE_URL}/storage/v1/object/public/app-assets/classes/${(h % DEFAULT_CLASS_PHOTOS) + 1}.jpg`;
}

const DAY_MS = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Now", "In 40 min", "In 3 hrs", "Tomorrow", "Fri", "Oct 3". */
export function relativeWhen(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const mins = Math.round((d.getTime() - now.getTime()) / 60_000);
  if (mins <= 0) return "Now";
  const days = Math.round((startOfDay(d) - startOfDay(now)) / DAY_MS);
  if (days === 0) return mins < 60 ? `In ${mins} min` : `In ${Math.round(mins / 60)} hr${Math.round(mins / 60) === 1 ? "" : "s"}`;
  if (days === 1) return "Tomorrow";
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Whole days until `iso` (0 on the last day). */
export function daysLeft(iso: string, now = new Date()): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / DAY_MS));
}

export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
