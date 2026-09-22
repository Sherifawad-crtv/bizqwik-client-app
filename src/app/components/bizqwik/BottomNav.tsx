import { motion } from "motion/react";
import { Home, Calendar, User } from "lucide-react";

type NavItem = "home" | "bookings" | "profile";

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
}

const navItems = [
  {
    id: "home" as NavItem,
    label: "Home",
    icon: Home,
  },
  {
    id: "bookings" as NavItem,
    label: "Bookings",
    icon: Calendar,
  },
  {
    id: "profile" as NavItem,
    label: "Profile",
    icon: User,
  },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[var(--bq-neutral-dark)] px-2 pb-safe">
      <div className="mx-auto max-w-[430px]">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all duration-[var(--transition-base)] active:scale-95"
                style={{ minHeight: "48px", minWidth: "48px" }}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors duration-[var(--transition-fast)] ${
                      isActive
                        ? "text-[var(--bq-primary)]"
                        : "text-[var(--bq-text-tertiary)]"
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--bq-primary)] rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </div>
                <span
                  className={`text-xs transition-colors duration-[var(--transition-fast)] ${
                    isActive
                      ? "text-[var(--bq-primary)]"
                      : "text-[var(--bq-text-tertiary)]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
