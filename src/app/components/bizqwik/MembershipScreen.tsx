import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, CalendarClock, Dumbbell } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { useBranding } from "../../../lib/branding";
import { api, type HomeData } from "../../../lib/api";

interface MembershipScreenProps {
  onNotificationsClick: () => void;
  notificationCount: number;
}

// v1 membership view: the member's current plan (membership or package) as the
// backend knows it. Plans are sold/renewed at the front desk, so this is
// read-only — no in-app purchase.
export function MembershipScreen({ onNotificationsClick, notificationCount }: MembershipScreenProps) {
  const { data: brand } = useBranding();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.home().then(setData).catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your membership.")).finally(() => setLoading(false));
  }, []);

  const membership = data?.membership && data.membership.status === "active" ? data.membership : null;
  const pkg = data?.package && data.package.status === "active" ? data.package : null;

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="px-6 pt-14 pb-4 flex items-center justify-between">
        <h1 className="font-display text-[24px] text-[var(--bq-text-primary)]">Membership</h1>
        <NotificationBell count={notificationCount} onClick={onNotificationsClick} />
      </div>

      {loading && <div className="py-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" /></div>}
      {error && <div className="mx-6 text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>{error}</div>}

      {!loading && !error && (
        <div className="px-6">
          {membership || pkg ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.5rem] p-6 text-white bg-gradient-to-br from-[var(--bq-primary)] to-[var(--bq-primary-dark)] shadow-[var(--glow-primary)]">
              <div className="flex items-center gap-2 text-white/85 text-sm"><ShieldCheck className="w-4 h-4" /> Active</div>
              <div className="font-display text-[26px] mt-2">{membership ? "Membership" : "Session package"}</div>
              {membership && (
                <div className="flex items-center gap-2 text-white/80 text-sm mt-3"><CalendarClock className="w-4 h-4" /> Valid until {membership.expiryDate}</div>
              )}
              {pkg && (
                <>
                  <div className="flex items-center gap-2 text-white/80 text-sm mt-3"><Dumbbell className="w-4 h-4" /> {pkg.sessionsRemaining} of {pkg.sessionsIncluded} sessions left</div>
                  <div className="flex items-center gap-2 text-white/80 text-sm mt-1.5"><CalendarClock className="w-4 h-4" /> Expires {pkg.expiryDate}</div>
                </>
              )}
            </motion.div>
          ) : (
            <div className="rounded-[1.5rem] p-6 bg-[var(--bq-neutral)] text-center">
              <div className="font-display text-[18px] text-[var(--bq-text-primary)] mb-1">No active plan</div>
              <p className="text-[var(--bq-text-secondary)] text-sm">Visit the {brand?.branding.appName ?? "gym"} front desk to start a membership or buy a package.</p>
            </div>
          )}

          <p className="text-[var(--bq-text-tertiary)] text-xs text-center mt-6">Memberships and packages are managed at the front desk.</p>
        </div>
      )}
    </div>
  );
}
