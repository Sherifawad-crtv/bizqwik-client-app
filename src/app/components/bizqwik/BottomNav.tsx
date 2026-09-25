import { motion } from "motion/react";
import { Icon, type IconName } from "./Icon";

type NavItem = "home" | "bookings" | "profile";

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
}

const navItems: { id: NavItem; label: string; icon: IconName }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "bookings", label: "Bookings", icon: "calendar" },
  { id: "profile", label: "Profile", icon: "account" },
];

const ITEM = 52;

// Floating frosted-glass pill, matching the business app's BottomNav
// language (blur + translucency, a sliding pill behind the active tab,
// solid-vs-linear icon swap) — but themed by the org's brand color via the
// --bq-* CSS vars branding.tsx sets per gym, not a fixed brand.
export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <div
      className="flex items-center gap-1.5 h-16 px-1.5 rounded-full backdrop-blur-2xl backdrop-saturate-150"
      style={{
        background: "rgba(255,255,255,.55)",
        border: "1px solid rgba(255,255,255,.6)",
        boxShadow: "0 12px 30px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.7)",
      }}
    >
      {navItems.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-label={item.label}
            title={item.label}
            className="relative flex-none flex items-center justify-center active:scale-95 transition-transform"
            style={{ width: ITEM, height: ITEM }}
          >
            {isActive && (
              <motion.span
                layoutId="bq-bottom-nav-active"
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--bq-primary)", opacity: 0.12 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            )}
            <span className="relative" style={{ color: isActive ? "var(--bq-primary-readable)" : "var(--bq-text-tertiary)" }}>
              <Icon name={item.icon} size={22} solid={isActive} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
