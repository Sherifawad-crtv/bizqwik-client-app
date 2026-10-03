import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, MapPin } from "./solar";
import { useBranding } from "../../../lib/branding";
import type { GymLocation } from "../../../lib/api";

/** "Where do you train?" — picked before sign-in (and changeable later in
 * Profile), so the app shows that location's classes and plans. */
export function LocationScreen({
  locations,
  current = null,
  onPick,
  onBack,
  busy = false,
}: {
  locations: GymLocation[];
  current?: string | null;
  onPick: (id: string) => void;
  onBack?: () => void;
  busy?: boolean;
}) {
  const { data } = useBranding();
  const appName = data?.branding.appName ?? "Bizqwik";
  const logo = data?.branding.logoUrl ?? null;

  return (
    <div className="min-h-full bg-white px-6 pt-[calc(env(safe-area-inset-top)+16px)] pb-10 flex flex-col">
      {onBack && (
        <button onClick={onBack} aria-label="Back" className="self-start -ml-2 mb-4 w-10 h-10 rounded-full flex items-center justify-center text-[var(--bq-text-primary)]">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {logo && !onBack && <img src={logo} alt={appName} className="h-10 w-auto self-start mb-8 object-contain" />}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-display text-[28px] leading-tight text-[var(--bq-text-primary)]">{onBack ? "Change location" : "Where do you train?"}</h1>
        <p className="text-[var(--bq-text-secondary)] mt-2 mb-8">
          {onBack ? "You'll see this location's classes and plans." : `Choose your ${appName} location. You'll see its classes and plans, and you can change it anytime in Profile.`}
        </p>
        <div role="radiogroup" aria-label="Location" className="flex flex-col gap-3">
          {locations.map((l) => {
            const on = current === l.id;
            return (
              <button
                key={l.id}
                role="radio"
                aria-checked={on}
                disabled={busy}
                onClick={() => onPick(l.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-[1.25rem] text-left active:scale-[0.98] transition-transform ${on ? "bg-[var(--bq-primary)] text-[var(--bq-on-primary)]" : "bg-[var(--bq-neutral)] text-[var(--bq-text-primary)]"}`}
              >
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${on ? "bg-white/20" : "bg-white text-[var(--bq-primary-readable)]"}`}>
                  <MapPin className="w-5 h-5" />
                </span>
                <span className="flex-1 font-display text-[18px]">{l.name}</span>
                <ChevronRight className="w-5 h-5 opacity-60" />
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
