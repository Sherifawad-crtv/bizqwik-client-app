import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  QrCode,
  Check,
  Clock,
  TrendingUp,
  Calendar as CalendarIcon,
  Sparkles,
  Award,
  ChevronRight,
  Zap,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { NotificationBell } from "./NotificationBell";
import { toast } from "sonner";

interface MembershipPlan {
  id: string;
  name: string;
  tier: "basic" | "premium" | "elite";
  sessionsTotal: number;
  sessionsRemaining: number;
  validUntil: string;
  benefits: string[];
  monthlyPrice: number;
}

interface AttendedSession {
  id: string;
  title: string;
  instructor: {
    name: string;
    photo: string;
  };
  date: string;
  duration: number;
  pointsEarned: number;
  location: string;
}

const mockPlan: MembershipPlan = {
  id: "1",
  name: "Premium Membership",
  tier: "premium",
  sessionsTotal: 20,
  sessionsRemaining: 14,
  validUntil: "Dec 31, 2025",
  benefits: [
    "20 sessions per month",
    "Access to all studios",
    "Priority booking",
    "Bring a friend once/month",
    "Premium workshops",
  ],
  monthlyPrice: 99,
};

const mockAttendedSessions: AttendedSession[] = [
  {
    id: "1",
    title: "Power Yoga Flow",
    instructor: {
      name: "Sarah Martinez",
      photo: "https://images.unsplash.com/photo-1527062603922-c94afc167de5?w=100",
    },
    date: "Oct 28, 2025",
    duration: 60,
    pointsEarned: 150,
    location: "Downtown Studio",
  },
  {
    id: "2",
    title: "HIIT Cardio Blast",
    instructor: {
      name: "Marcus Johnson",
      photo: "https://images.unsplash.com/photo-1628970899178-934735eff6b3?w=100",
    },
    date: "Oct 25, 2025",
    duration: 45,
    pointsEarned: 200,
    location: "Downtown Studio",
  },
  {
    id: "3",
    title: "Strength Foundations",
    instructor: {
      name: "Emily Chen",
      photo: "https://images.unsplash.com/photo-1544972917-3529b113a469?w=100",
    },
    date: "Oct 22, 2025",
    duration: 50,
    pointsEarned: 120,
    location: "Westside Studio",
  },
  {
    id: "4",
    title: "Meditation & Mindfulness",
    instructor: {
      name: "David Park",
      photo: "https://images.unsplash.com/photo-1758875568932-0eefd3e60090?w=100",
    },
    date: "Oct 20, 2025",
    duration: 30,
    pointsEarned: 100,
    location: "Wellness Center",
  },
];

const availablePlans = [
  {
    id: "basic",
    name: "Basic",
    tier: "basic" as const,
    price: 49,
    sessions: 8,
    color: "from-gray-500 to-gray-600",
    benefits: ["8 sessions/month", "Access to 2 studios", "Standard booking"],
  },
  {
    id: "premium",
    name: "Premium",
    tier: "premium" as const,
    price: 99,
    sessions: 20,
    color: "from-[var(--bq-primary)] to-purple-600",
    benefits: [
      "20 sessions/month",
      "All studios",
      "Priority booking",
      "Bring a friend",
    ],
    popular: true,
  },
  {
    id: "elite",
    name: "Elite",
    tier: "elite" as const,
    price: 149,
    sessions: 999,
    color: "from-[var(--bq-accent)] to-amber-600",
    benefits: [
      "Unlimited sessions",
      "All studios",
      "VIP booking",
      "Free workshops",
      "Personal trainer",
    ],
  },
];

interface MembershipScreenProps {
  onNotificationsClick?: () => void;
  notificationCount?: number;
}

export function MembershipScreen({ onNotificationsClick, notificationCount = 0 }: MembershipScreenProps = {}) {
  const [showQR, setShowQR] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const sessionsUsed = mockPlan.sessionsTotal - mockPlan.sessionsRemaining;
  const usagePercentage = (sessionsUsed / mockPlan.sessionsTotal) * 100;

  const handleRenew = () => {
    toast.success("Membership renewed successfully!");
  };

  const handleUpgrade = (planId: string) => {
    toast.success(`Upgraded to ${planId} plan!`);
    setShowUpgrade(false);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "basic":
        return "from-gray-500 to-gray-600";
      case "premium":
        return "from-[var(--bq-primary)] to-purple-600";
      case "elite":
        return "from-[var(--bq-accent)] to-amber-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bq-neutral)] pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-20 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-[var(--bq-text-primary)] mb-1">
              Membership
            </h1>
            <p className="text-sm text-[var(--bq-text-secondary)]">
              Active until {mockPlan.validUntil}
            </p>
          </div>
          {onNotificationsClick && (
            <NotificationBell 
              count={notificationCount} 
              onClick={onNotificationsClick}
            />
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Digital Membership Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div
            className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${getTierColor(
              mockPlan.tier
            )} p-6 shadow-[var(--shadow-lg)]`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20px 20px, white 2px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-display text-2xl text-white">
                      {mockPlan.name}
                    </h2>
                    <Sparkles className="w-5 h-5 text-white/80" />
                  </div>
                  <p className="text-white/80 text-sm">Karim Ahmed</p>
                  <p className="text-white/60 text-xs font-mono mt-1">ID: #BQ2025-KA-001</p>
                </div>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-[var(--transition-base)] active:scale-95"
                >
                  <QrCode className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-white/70 text-xs mb-1">Sessions Left</div>
                  <div className="font-mono text-2xl text-white">
                    {mockPlan.sessionsRemaining}
                  </div>
                </div>
                <div>
                  <div className="text-white/70 text-xs mb-1">Valid Until</div>
                  <div className="text-white">{mockPlan.validUntil}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-white/90 text-xs">
                <Zap className="w-3 h-3" />
                <span>Premium Access • All Studios</span>
              </div>
            </div>
          </div>

          {/* QR Code Modal */}
          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-0 left-0 right-0 bg-white rounded-3xl p-6 shadow-[var(--shadow-xl)] border-2 border-[var(--bq-primary)]"
              >
                <div className="text-center">
                  <h3 className="font-display text-lg text-[var(--bq-text-primary)] mb-2">
                    Check-In QR Code
                  </h3>
                  <p className="text-sm text-[var(--bq-text-secondary)] mb-4">
                    Show this at the studio entrance
                  </p>
                  <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-4 border-2 border-[var(--bq-neutral-dark)]">
                    {/* QR Code placeholder - in real app would use a QR library */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-[var(--bq-text-tertiary)] mt-4 font-mono">
                    BQ2025-KA-001
                  </p>
                  <button
                    onClick={() => setShowQR(false)}
                    className="mt-4 h-10 px-6 bg-[var(--bq-secondary)] text-[var(--bq-text-primary)] rounded-xl hover:bg-[var(--bq-neutral-dark)] transition-colors duration-[var(--transition-base)]"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-[var(--bq-neutral-dark)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--bq-text-primary)]">Session Usage</h3>
            <span className="text-sm text-[var(--bq-text-secondary)]">
              {sessionsUsed} of {mockPlan.sessionsTotal} used
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2 mb-2" />
          <p className="text-xs text-[var(--bq-text-tertiary)]">
            {mockPlan.sessionsRemaining} sessions remaining this month
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-[var(--bq-neutral-dark)]"
        >
          <h3 className="text-[var(--bq-text-primary)] mb-4">Your Benefits</h3>
          <div className="space-y-3">
            {mockPlan.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-[var(--bq-text-secondary)]">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={handleRenew}
            className="h-12 bg-[var(--bq-primary)] text-white rounded-xl transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Renew</span>
          </button>
          <button
            onClick={() => setShowUpgrade(true)}
            className="h-12 bg-[var(--bq-secondary)] text-[var(--bq-text-primary)] rounded-xl transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-neutral-dark)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Upgrade</span>
          </button>
        </motion.div>

        <Separator className="bg-[var(--bq-neutral-dark)]" />

        {/* Attendance History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--bq-text-primary)]">Recent Sessions</h3>
            <span className="text-xs text-[var(--bq-text-secondary)]">
              {mockAttendedSessions.length} this month
            </span>
          </div>

          <div className="space-y-3">
            {mockAttendedSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-xl p-4 border border-[var(--bq-neutral-dark)]"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden ring-2 ring-[var(--bq-primary)]/10 flex-shrink-0">
                    <ImageWithFallback
                      src={session.instructor.photo}
                      alt={session.instructor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm text-[var(--bq-text-primary)] truncate">
                        {session.title}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Award className="w-3 h-3 text-[var(--bq-accent)]" />
                        <span className="text-xs font-mono text-[var(--bq-text-secondary)]">
                          +{session.pointsEarned}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--bq-text-secondary)] mb-2 truncate">
                      {session.instructor.name} • {session.location}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--bq-text-tertiary)]">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{session.duration} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgrade && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowUpgrade(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-[var(--bq-neutral-dark)]">
                <div className="w-12 h-1 bg-[var(--bq-neutral-dark)] rounded-full mx-auto mb-4" />
                <h2 className="font-display text-xl text-[var(--bq-text-primary)]">
                  Upgrade Your Plan
                </h2>
              </div>

              <div className="px-6 py-6 space-y-4 pb-8">
                {availablePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border-2 p-5 transition-all duration-[var(--transition-base)] ${
                      plan.tier === mockPlan.tier
                        ? "border-[var(--bq-primary)] bg-[var(--bq-primary)]/5"
                        : "border-[var(--bq-neutral-dark)] bg-white hover:border-[var(--bq-primary)]/40"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-4">
                        <Badge className="bg-[var(--bq-accent)] text-white border-0">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    {plan.tier === mockPlan.tier && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-green-600 text-white border-0">
                          Current Plan
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display text-xl text-[var(--bq-text-primary)] mb-1">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-[var(--bq-text-secondary)]">
                          {plan.sessions === 999 ? "Unlimited" : plan.sessions} sessions/month
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-2xl text-[var(--bq-text-primary)]">
                          ${plan.price}
                        </div>
                        <div className="text-xs text-[var(--bq-text-tertiary)]">/month</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {plan.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-[var(--bq-text-secondary)]">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>

                    {plan.tier !== mockPlan.tier && (
                      <button
                        onClick={() => handleUpgrade(plan.name)}
                        className="w-full h-11 bg-[var(--bq-primary)] text-white rounded-xl transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <span>Upgrade to {plan.name}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
