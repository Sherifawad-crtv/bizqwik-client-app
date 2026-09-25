import { ChevronRight, Award, Wallet, Gift, LogOut } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "../../../lib/auth";
import { useBranding } from "../../../lib/branding";

interface ProfileScreenProps {
  onNotificationsClick?: () => void;
  notificationCount?: number;
  onLogout?: () => void;
  onMembershipClick?: () => void;
  onWalletClick?: () => void;
  onRewardsClick?: () => void;
  // legacy handlers (unsupported in v1) kept optional for call-site compatibility
  onPersonalInfoClick?: () => void;
  onLinkedGymsClick?: () => void;
  onPaymentMethodsClick?: () => void;
  onSupportClick?: () => void;
}

export function ProfileScreen({ onNotificationsClick, notificationCount = 0, onLogout, onMembershipClick, onWalletClick, onRewardsClick }: ProfileScreenProps) {
  const { client } = useAuth();
  const { data } = useBranding();
  const gym = data?.branding.appName ?? "Bizqwik";
  const name = client?.name ?? "Member";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

  return (
    <div className="min-h-full bg-white pb-28">
      <div className="px-6 pt-14 pb-4 flex items-center justify-between">
        <h1 className="font-display text-[24px] text-[var(--bq-text-primary)]">Profile</h1>
        <NotificationBell count={notificationCount} onClick={onNotificationsClick ?? (() => {})} />
      </div>

      <div className="px-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--bq-primary)] to-[var(--bq-accent)] text-[var(--bq-on-primary)] flex items-center justify-center font-display text-[22px]">{initials || "M"}</div>
        <div className="min-w-0">
          <div className="font-display text-[20px] text-[var(--bq-text-primary)] truncate">{name}</div>
          <div className="text-[var(--bq-text-secondary)] text-sm truncate">{client?.email ?? client?.phone ?? gym}</div>
          <div className="text-[var(--bq-text-tertiary)] text-xs mt-0.5">{gym} member</div>
        </div>
      </div>

      <div className="px-6 mt-8 flex flex-col gap-2">
        <MenuItem icon={<Award className="w-5 h-5" />} label="My plan" onClick={onMembershipClick} />
        <MenuItem icon={<Wallet className="w-5 h-5" />} label="Wallet" onClick={onWalletClick} />
        <MenuItem icon={<Gift className="w-5 h-5" />} label="Points" onClick={onRewardsClick} />
      </div>

      <div className="px-6 mt-8">
        <button onClick={onLogout} className="w-full h-13 py-3.5 rounded-[1.25rem] bg-[var(--bq-neutral)] text-[#b42318] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <LogOut className="w-5 h-5" /> Log out
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-4 rounded-[1.25rem] bg-[var(--bq-neutral)] active:scale-[0.98] transition-transform">
      <span className="w-10 h-10 rounded-xl bg-white text-[var(--bq-primary-readable)] flex items-center justify-center">{icon}</span>
      <span className="flex-1 text-left text-[var(--bq-text-primary)]">{label}</span>
      <ChevronRight className="w-5 h-5 text-[var(--bq-text-tertiary)]" />
    </button>
  );
}
