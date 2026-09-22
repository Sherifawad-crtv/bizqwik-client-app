import { Camera, ChevronRight, Globe, CreditCard, MapPin, HelpCircle, LogOut, User, Award, Wallet, Gift } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { useState } from "react";

interface ProfileScreenProps {
  onNotificationsClick?: () => void;
  notificationCount?: number;
  onLogout?: () => void;
  onPersonalInfoClick?: () => void;
  onLinkedGymsClick?: () => void;
  onPaymentMethodsClick?: () => void;
  onMembershipClick?: () => void;
  onWalletClick?: () => void;
  onRewardsClick?: () => void;
  onSupportClick?: () => void;
}

export function ProfileScreen({ 
  onNotificationsClick, 
  notificationCount = 0,
  onLogout,
  onPersonalInfoClick,
  onLinkedGymsClick,
  onPaymentMethodsClick,
  onMembershipClick,
  onWalletClick,
  onRewardsClick,
  onSupportClick
}: ProfileScreenProps) {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const handleLanguageToggle = () => {
    setLanguage(prev => prev === "en" ? "ar" : "en");
  };

  const menuSections = [
    {
      items: [
        {
          icon: User,
          label: "Personal Information",
          description: "Update your profile details",
          onClick: onPersonalInfoClick || (() => console.log("Personal Info")),
          isToggle: false,
        },
        {
          icon: Award,
          label: "My Membership",
          description: "Premium Plan • Unlimited",
          onClick: onMembershipClick || (() => console.log("Membership")),
          isToggle: false,
        },
        {
          icon: MapPin,
          label: "Linked Gyms",
          description: "3 gyms connected",
          onClick: onLinkedGymsClick || (() => console.log("Linked Gyms")),
          isToggle: false,
        },
      ],
    },
    {
      items: [
        {
          icon: Wallet,
          label: "My Wallet",
          description: "AED 2,450.00 balance",
          onClick: onWalletClick || (() => console.log("Wallet")),
          isToggle: false,
        },
        {
          icon: Gift,
          label: "Rewards & Points",
          description: "3,450 points available",
          onClick: onRewardsClick || (() => console.log("Rewards")),
          isToggle: false,
        },
        {
          icon: CreditCard,
          label: "Payment Methods",
          description: "Manage cards and wallet",
          onClick: onPaymentMethodsClick || (() => console.log("Payment Methods")),
          isToggle: false,
        },
      ],
    },
    {
      items: [
        {
          icon: Globe,
          label: "Language",
          description: language === "en" ? "English" : "العربية",
          onClick: handleLanguageToggle,
          isToggle: true,
        },
      ],
    },
    {
      items: [
        {
          icon: HelpCircle,
          label: "Support & FAQs",
          description: "Get help and answers",
          onClick: onSupportClick || (() => console.log("Support")),
          isToggle: false,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bq-neutral)] pb-24">
      {/* Header */}
      <div className="bg-white pt-16 pb-6 px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-[28px] text-[var(--bq-text-primary)]">
            Profile
          </h1>
          {onNotificationsClick && (
            <NotificationBell
              count={notificationCount}
              onClick={onNotificationsClick}
            />
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-[var(--bq-primary)] to-[#7C6AFF] rounded-[1.5rem] p-6 relative overflow-hidden">
          {/* Decorative Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--bq-accent)]/20 rounded-full blur-2xl"></div>

          <div className="relative flex items-center gap-4">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden ring-2 ring-white/30">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                <Camera className="w-4 h-4 text-[var(--bq-primary)]" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-white text-[20px] mb-1">Karim Ahmed</h2>
              <p className="text-white/80 text-[14px]">karim.ahmed@email.com</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-white text-[12px] font-mono">Premium Member</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-6 pt-6 space-y-4">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-[1.5rem] overflow-hidden">
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={item.onClick}
                className="w-full flex items-center gap-4 p-4 active:bg-[var(--bq-neutral)] transition-colors border-b border-[var(--bq-secondary)] last:border-0"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[var(--bq-primary)]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[var(--bq-text-primary)] mb-0.5">{item.label}</div>
                  <div className="text-[var(--bq-text-secondary)] text-[13px]">
                    {item.description}
                  </div>
                </div>
                {item.isToggle ? (
                  <div className={`w-12 h-7 rounded-full transition-colors relative ${
                    language === "ar" ? "bg-[var(--bq-primary)]" : "bg-gray-300"
                  }`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                      language === "ar" ? "right-1" : "left-1"
                    }`}></div>
                  </div>
                ) : (
                  <ChevronRight className="w-5 h-5 text-[var(--bq-text-tertiary)]" />
                )}
              </button>
            ))}
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 p-4 bg-white rounded-[1.5rem] text-red-500 active:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>

        {/* App Version */}
        <div className="text-center text-[var(--bq-text-tertiary)] text-[12px] pt-2 pb-4">
          Bizqwik v1.0.0
        </div>
      </div>
    </div>
  );
}
