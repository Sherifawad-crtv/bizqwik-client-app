import { useClassesReadOnly } from "../../../lib/branding";
import { Icon, type IconName } from "./Icon";

export type NavItem = "home" | "schedule" | "bookings" | "profile";

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
}

const allNavItems: { id: NavItem; label: string; icon: IconName }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "schedule", label: "Schedule", icon: "calendar" },
  { id: "bookings", label: "Bookings", icon: "ticket" },
  { id: "profile", label: "Profile", icon: "account" },
];

const ITEM = 50;

// Floating frosted-glass pill, matching the business app's BottomNav
// language (blur + translucency, a sliding pill behind the active tab,
// solid-vs-linear icon swap) — but themed by the org's brand color via the
// --bq-* CSS vars branding.tsx sets per gym, not a fixed brand.
const GAP = 6;

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  // A solo gym takes no bookings: no Bookings tab.
  const readOnly = useClassesReadOnly();
  const navItems = allNavItems.filter((i) => !(readOnly && i.id === "bookings"));
  const index = Math.max(0, navItems.findIndex((i) => i.id === active));
  return (
    <div
      className="relative flex items-center h-16 px-1.5 rounded-full backdrop-blur-xl backdrop-saturate-150"
      style={{
        gap: GAP,
        background: "rgba(255,255,255,.55)",
        border: "1px solid rgba(255,255,255,.6)",
        boxShadow: "0 12px 30px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.7)",
      }}
    >
      {/* One pill behind the active tab that slides between tabs, with a
          slight springy overshoot. */}
      <span
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          left: GAP,
          width: ITEM,
          height: ITEM,
          background: "var(--bq-primary)",
          opacity: 0.12,
          transform: `translateX(${index * (ITEM + GAP)}px)`,
          transition: "transform 380ms cubic-bezier(.34,1.3,.64,1)",
        }}
      />
      {navItems.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            title={item.label}
            className="relative flex-none flex items-center justify-center active:scale-95 transition-transform"
            style={{ width: ITEM, height: ITEM }}
          >
            <span className="relative" style={{ color: isActive ? "var(--bq-primary-readable)" : "#000" }}>
              <Icon name={item.icon} size={22} solid={isActive} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
