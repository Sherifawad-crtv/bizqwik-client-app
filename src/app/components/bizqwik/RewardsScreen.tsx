import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  Trophy,
  Star,
  Gift,
  TrendingUp,
  Zap,
  Target,
  Calendar,
  Users,
  Crown,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
  Flame,
  X,
  ArrowLeft,
} from "lucide-react";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { NotificationBell } from "./NotificationBell";
import { toast } from "sonner";

type Tier = "silver" | "gold" | "platinum";

interface EarnOpportunity {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: any;
  progress?: { current: number; target: number };
  completed?: boolean;
}

interface RedeemableReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: "discount" | "freepass" | "upgrade" | "cashback";
  value: string;
  icon: any;
  available: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress?: { current: number; target: number };
  unlockedDate?: string;
}

interface RewardHistory {
  id: string;
  title: string;
  points: number;
  date: string;
  type: "earned" | "redeemed";
}

const tierConfig = {
  silver: { name: "Silver", min: 0, max: 5000, color: "from-gray-300 to-gray-500" },
  gold: { name: "Gold", min: 5000, max: 15000, color: "from-yellow-300 to-yellow-600" },
  platinum: { name: "Platinum", min: 15000, max: 30000, color: "from-purple-300 to-purple-600" },
};

const earnOpportunities: EarnOpportunity[] = [
  {
    id: "1",
    title: "Complete 5 Sessions",
    description: "Attend any 5 fitness sessions this month",
    points: 250,
    icon: Target,
    progress: { current: 3, target: 5 },
  },
  {
    id: "2",
    title: "Maintain 7-Day Streak",
    description: "Book sessions 7 days in a row",
    points: 500,
    icon: Flame,
    progress: { current: 4, target: 7 },
  },
  {
    id: "3",
    title: "Try a New Class",
    description: "Book your first yoga, HIIT, or strength class",
    points: 100,
    icon: Sparkles,
  },
  {
    id: "4",
    title: "Refer a Friend",
    description: "Invite friends and earn when they join",
    points: 1000,
    icon: Users,
  },
  {
    id: "5",
    title: "Weekend Warrior",
    description: "Complete 2 sessions this weekend",
    points: 150,
    icon: Zap,
    completed: true,
  },
];

const redeemableRewards: RedeemableReward[] = [
  {
    id: "1",
    title: "20% Off Next Session",
    description: "Single-use discount on any class",
    pointsCost: 500,
    type: "discount",
    value: "20%",
    icon: Gift,
    available: true,
  },
  {
    id: "2",
    title: "Free Premium Class",
    description: "One complimentary premium session",
    pointsCost: 1500,
    type: "freepass",
    value: "1 Class",
    icon: Star,
    available: true,
  },
  {
    id: "3",
    title: "$25 Wallet Credit",
    description: "Instant credit to your wallet",
    pointsCost: 2500,
    type: "cashback",
    value: "$25",
    icon: Award,
    available: true,
  },
  {
    id: "4",
    title: "Tier Upgrade Boost",
    description: "Fast-track to next membership tier",
    pointsCost: 5000,
    type: "upgrade",
    value: "1 Tier",
    icon: Crown,
    available: false,
  },
];

const achievements: Achievement[] = [
  {
    id: "1",
    title: "First Steps",
    description: "Completed your first session",
    icon: Zap,
    unlocked: true,
    unlockedDate: "Oct 15, 2025",
  },
  {
    id: "2",
    title: "On Fire",
    description: "Achieved a 5-day streak",
    icon: Flame,
    unlocked: true,
    unlockedDate: "Oct 20, 2025",
  },
  {
    id: "3",
    title: "Early Bird",
    description: "Attended 5 morning sessions",
    icon: Calendar,
    unlocked: true,
    unlockedDate: "Oct 25, 2025",
  },
  {
    id: "4",
    title: "Century Club",
    description: "Earned 10,000 points total",
    icon: Trophy,
    unlocked: false,
    progress: { current: 7420, target: 10000 },
  },
  {
    id: "5",
    title: "Social Butterfly",
    description: "Referred 3 friends",
    icon: Users,
    unlocked: false,
    progress: { current: 1, target: 3 },
  },
  {
    id: "6",
    title: "Consistency King",
    description: "30-day workout streak",
    icon: Crown,
    unlocked: false,
    progress: { current: 12, target: 30 },
  },
];

const rewardHistory: RewardHistory[] = [
  {
    id: "1",
    title: "Power Yoga Flow completed",
    points: 150,
    date: "Oct 28, 2025",
    type: "earned",
  },
  {
    id: "2",
    title: "Weekend Warrior challenge",
    points: 150,
    date: "Oct 27, 2025",
    type: "earned",
  },
  {
    id: "3",
    title: "20% Off Next Session",
    points: -500,
    date: "Oct 26, 2025",
    type: "redeemed",
  },
  {
    id: "4",
    title: "HIIT Cardio Blast completed",
    points: 200,
    date: "Oct 25, 2025",
    type: "earned",
  },
];

interface RewardsScreenProps {
  onNotificationsClick?: () => void;
  notificationCount?: number;
  onBack?: () => void;
}

export function RewardsScreen({ onNotificationsClick, notificationCount = 0, onBack }: RewardsScreenProps = {}) {
  const [currentPoints, setCurrentPoints] = useState(7420);
  const [currentTier, setCurrentTier] = useState<Tier>("gold");
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RedeemableReward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const nextTier = currentTier === "silver" ? "gold" : currentTier === "gold" ? "platinum" : null;
  const tierInfo = tierConfig[currentTier];
  const nextTierInfo = nextTier ? tierConfig[nextTier] : null;
  const tierProgress = nextTierInfo
    ? ((currentPoints - tierInfo.min) / (nextTierInfo.min - tierInfo.min)) * 100
    : 100;
  const pointsToNextTier = nextTierInfo ? nextTierInfo.min - currentPoints : 0;

  const handleRedeemClick = (reward: RedeemableReward) => {
    if (currentPoints < reward.pointsCost) {
      toast.error("Not enough points for this reward");
      return;
    }
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward) return;

    setCurrentPoints((prev) => prev - selectedReward.pointsCost);
    setShowRedeemModal(false);
    setShowConfetti(true);
    toast.success(`${selectedReward.title} redeemed!`);

    setTimeout(() => {
      setShowConfetti(false);
      setSelectedReward(null);
    }, 3000);
  };

  const Confetti = () => {
    const confettiPieces = Array.from({ length: 50 });
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {confettiPieces.map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: typeof window !== "undefined" ? window.innerWidth / 2 : 200,
              y: -20,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x:
                (typeof window !== "undefined" ? window.innerWidth / 2 : 200) +
                (Math.random() - 0.5) * 600,
              y: typeof window !== "undefined" ? window.innerHeight + 100 : 800,
              opacity: 0,
              rotate: Math.random() * 720,
              scale: 0,
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              ease: "easeOut",
            }}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              backgroundColor: [
                "var(--bq-primary)",
                "var(--bq-accent)",
                "#FFD700",
                "#FF69B4",
                "#00CED1",
              ][Math.floor(Math.random() * 5)],
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bq-neutral)] pb-24">
      {/* Confetti Animation */}
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>

      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-20 shadow-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center active:scale-95 transition-transform mb-4"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--bq-text-primary)]" />
          </button>
        )}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-[var(--bq-text-primary)] mb-1">
              Rewards
            </h1>
            <p className="text-sm text-[var(--bq-text-secondary)]">
              Earn points, unlock rewards & level up
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
        {/* Tier Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${tierInfo.color} p-6 shadow-[var(--shadow-lg)]`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
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
                  <Trophy className="w-6 h-6 text-white" />
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {tierInfo.name} Member
                  </Badge>
                </div>
                <motion.h2
                  key={currentPoints}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="font-mono text-4xl text-white"
                >
                  {currentPoints.toLocaleString()}
                </motion.h2>
                <p className="text-white/80 text-sm mt-1">Total Points</p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>

            {nextTierInfo && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-white/90 text-sm">
                  <span>Progress to {nextTierInfo.name}</span>
                  <span className="font-mono">{pointsToNextTier} pts to go</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tierProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="earn" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-white border border-[var(--bq-neutral-dark)]">
            <TabsTrigger value="earn" className="data-[state=active]:bg-[var(--bq-primary)] data-[state=active]:text-white">
              Earn
            </TabsTrigger>
            <TabsTrigger value="redeem" className="data-[state=active]:bg-[var(--bq-primary)] data-[state=active]:text-white">
              Redeem
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-[var(--bq-primary)] data-[state=active]:text-white">
              Badges
            </TabsTrigger>
          </TabsList>

          {/* Earn Points Tab */}
          <TabsContent value="earn" className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[var(--bq-text-primary)]">Ways to Earn</h3>
              <span className="text-xs text-[var(--bq-text-secondary)]">
                {earnOpportunities.filter((o) => o.completed).length} completed
              </span>
            </div>

            {earnOpportunities.map((opportunity, index) => {
              const Icon = opportunity.icon;
              const isCompleted = opportunity.completed;

              return (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`bg-white rounded-2xl p-5 border ${
                    isCompleted
                      ? "border-green-200 bg-green-50/50"
                      : "border-[var(--bq-neutral-dark)]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? "bg-green-100 text-green-600"
                          : "bg-[var(--bq-primary)]/10 text-[var(--bq-primary)]"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <h4 className="text-[var(--bq-text-primary)] mb-1">
                            {opportunity.title}
                          </h4>
                          <p className="text-sm text-[var(--bq-text-secondary)]">
                            {opportunity.description}
                          </p>
                        </div>
                        <div className="ml-3 flex-shrink-0">
                          <Badge
                            className={`${
                              isCompleted
                                ? "bg-green-600 text-white"
                                : "bg-[var(--bq-accent)] text-white"
                            } border-0`}
                          >
                            +{opportunity.points}
                          </Badge>
                        </div>
                      </div>

                      {opportunity.progress && !isCompleted && (
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-xs text-[var(--bq-text-tertiary)]">
                            <span>Progress</span>
                            <span className="font-mono">
                              {opportunity.progress.current}/{opportunity.progress.target}
                            </span>
                          </div>
                          <Progress
                            value={
                              (opportunity.progress.current / opportunity.progress.target) * 100
                            }
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Redeem Points Tab */}
          <TabsContent value="redeem" className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[var(--bq-text-primary)]">Available Rewards</h3>
              <div className="flex items-center gap-2 text-xs text-[var(--bq-text-secondary)]">
                <Award className="w-4 h-4" />
                <span className="font-mono">{currentPoints} pts</span>
              </div>
            </div>

            {redeemableRewards.map((reward, index) => {
              const Icon = reward.icon;
              const canAfford = currentPoints >= reward.pointsCost;

              return (
                <motion.button
                  key={reward.id}
                  onClick={() => handleRedeemClick(reward)}
                  disabled={!canAfford || !reward.available}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`w-full bg-white rounded-2xl p-5 border text-left transition-all duration-[var(--transition-base)] ${
                    canAfford && reward.available
                      ? "border-[var(--bq-neutral-dark)] hover:border-[var(--bq-primary)] active:scale-[0.98]"
                      : "border-[var(--bq-neutral-dark)] opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        canAfford && reward.available
                          ? "bg-[var(--bq-primary)]/10 text-[var(--bq-primary)]"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {!reward.available ? <Lock className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <h4 className="text-[var(--bq-text-primary)] mb-1">
                            {reward.title}
                          </h4>
                          <p className="text-sm text-[var(--bq-text-secondary)]">
                            {reward.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge
                          className={`${
                            canAfford && reward.available
                              ? "bg-[var(--bq-primary)] text-white"
                              : "bg-gray-200 text-gray-500"
                          } border-0 font-mono`}
                        >
                          {reward.pointsCost} pts
                        </Badge>
                        {canAfford && reward.available && (
                          <div className="flex items-center gap-1 text-sm text-[var(--bq-primary)]">
                            <span>Redeem</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[var(--bq-text-primary)]">Your Achievements</h3>
              <span className="text-xs text-[var(--bq-text-secondary)]">
                {achievements.filter((a) => a.unlocked).length}/{achievements.length} unlocked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`rounded-2xl p-4 border ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-[var(--bq-primary)]/10 to-purple-50 border-[var(--bq-primary)]/30"
                        : "bg-white border-[var(--bq-neutral-dark)]"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                        achievement.unlocked
                          ? "bg-[var(--bq-primary)] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4
                      className={`text-sm mb-1 ${
                        achievement.unlocked
                          ? "text-[var(--bq-text-primary)]"
                          : "text-[var(--bq-text-secondary)]"
                      }`}
                    >
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-[var(--bq-text-tertiary)] mb-2">
                      {achievement.description}
                    </p>
                    {achievement.unlocked && achievement.unlockedDate && (
                      <Badge className="bg-[var(--bq-primary)]/20 text-[var(--bq-primary)] border-0 text-xs">
                        {achievement.unlockedDate}
                      </Badge>
                    )}
                    {!achievement.unlocked && achievement.progress && (
                      <div className="space-y-1">
                        <Progress
                          value={(achievement.progress.current / achievement.progress.target) * 100}
                          className="h-1.5"
                        />
                        <div className="text-xs text-[var(--bq-text-tertiary)] font-mono">
                          {achievement.progress.current}/{achievement.progress.target}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="bg-[var(--bq-neutral-dark)]" />

        {/* Reward History */}
        <div>
          <h3 className="text-[var(--bq-text-primary)] mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {rewardHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="bg-white rounded-xl p-4 border border-[var(--bq-neutral-dark)] flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm text-[var(--bq-text-primary)] truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--bq-text-tertiary)]">{item.date}</p>
                </div>
                <div
                  className={`font-mono ml-3 flex-shrink-0 ${
                    item.type === "earned" ? "text-green-600" : "text-[var(--bq-text-primary)]"
                  }`}
                >
                  {item.type === "earned" ? "+" : ""}
                  {item.points}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Redeem Confirmation Modal */}
      <AnimatePresence>
        {showRedeemModal && selectedReward && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowRedeemModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl p-6 w-[calc(100%-3rem)] max-w-sm"
            >
              <button
                onClick={() => setShowRedeemModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[var(--bq-secondary)] flex items-center justify-center hover:bg-[var(--bq-neutral-dark)] transition-colors duration-[var(--transition-base)]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bq-primary)]/10 flex items-center justify-center mx-auto mb-4">
                  {(() => {
                    const Icon = selectedReward.icon;
                    return <Icon className="w-8 h-8 text-[var(--bq-primary)]" />;
                  })()}
                </div>

                <h2 className="font-display text-xl text-[var(--bq-text-primary)] mb-2">
                  Redeem Reward?
                </h2>
                <p className="text-[var(--bq-text-secondary)] mb-1">{selectedReward.title}</p>
                <p className="text-sm text-[var(--bq-text-tertiary)] mb-6">
                  {selectedReward.description}
                </p>

                <div className="bg-[var(--bq-neutral)] rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--bq-text-secondary)]">Current Points</span>
                    <span className="font-mono text-[var(--bq-text-primary)]">
                      {currentPoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--bq-text-secondary)]">Cost</span>
                    <span className="font-mono text-[var(--bq-text-primary)]">
                      -{selectedReward.pointsCost.toLocaleString()}
                    </span>
                  </div>
                  <Separator className="my-2 bg-[var(--bq-neutral-dark)]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--bq-text-secondary)]">Remaining</span>
                    <span className="font-mono text-[var(--bq-primary)]">
                      {(currentPoints - selectedReward.pointsCost).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowRedeemModal(false)}
                    className="h-12 rounded-xl border-2 border-[var(--bq-neutral-dark)] text-[var(--bq-text-primary)] transition-all duration-[var(--transition-base)] hover:border-[var(--bq-primary)]/40 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRedeem}
                    className="h-12 rounded-xl bg-[var(--bq-primary)] text-white transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-95"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
