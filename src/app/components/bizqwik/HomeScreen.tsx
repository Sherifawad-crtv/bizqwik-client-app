import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { MembershipCard } from "./MembershipCard";
import { SessionCard } from "./SessionCard";
import { WalletSummaryCard } from "./WalletSummaryCard";
import { StreakIndicator } from "./StreakIndicator";
import { NotificationBell } from "./NotificationBell";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Session {
  id: string;
  title: string;
  instructor: {
    name: string;
    photo: string;
  };
  rating: number;
  description: string;
  duration: number;
  timeSlots: string[];
  tags: string[];
}

const openSessions: Session[] = [
  {
    id: "1",
    title: "Power Yoga Flow",
    instructor: {
      name: "Sarah Martinez",
      photo: "https://images.unsplash.com/photo-1527062603922-c94afc167de5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwdGVhY2hlciUyMHNtaWxpbmd8ZW58MXx8fHwxNzYxOTQ4Mjg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    rating: 4.9,
    description: "Build strength and flexibility with this dynamic vinyasa flow session.",
    duration: 60,
    timeSlots: ["8:00 AM", "10:30 AM", "6:00 PM"],
    tags: ["Morning", "Yoga", "Intermediate"],
  },
  {
    id: "2",
    title: "HIIT Cardio Blast",
    instructor: {
      name: "Marcus Johnson",
      photo: "https://images.unsplash.com/photo-1628970899178-934735eff6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRlJTIwcG9ydHJhaXQlMjBjb25maWRlbnR8ZW58MXx8fHwxNzYxOTQ4Mjg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    rating: 4.8,
    description: "High-intensity intervals to maximize calorie burn and boost metabolism.",
    duration: 45,
    timeSlots: ["7:00 AM", "12:00 PM", "5:30 PM", "7:00 PM"],
    tags: ["HIIT", "Cardio", "Advanced"],
  },
  {
    id: "3",
    title: "Strength Foundations",
    instructor: {
      name: "Emily Chen",
      photo: "https://images.unsplash.com/photo-1544972917-3529b113a469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwaW5zdHJ1Y3RvciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTk0ODI4NXww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    rating: 4.7,
    description: "Master the fundamentals of strength training with proper form and technique.",
    duration: 50,
    timeSlots: ["9:00 AM", "4:00 PM"],
    tags: ["Strength", "Beginner"],
  },
  {
    id: "4",
    title: "Meditation & Mindfulness",
    instructor: {
      name: "David Park",
      photo: "https://images.unsplash.com/photo-1758875568932-0eefd3e60090?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYxODk3Nzc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    rating: 4.9,
    description: "Find inner peace and reduce stress through guided meditation practices.",
    duration: 30,
    timeSlots: ["6:30 AM", "8:00 PM"],
    tags: ["Morning", "Wellness", "All Levels"],
  },
];

const recommendedSessions = openSessions.slice(0, 2);
const popularSessions = [openSessions[1], openSessions[2]];

interface HomeScreenProps {
  userName: string;
  onSessionClick: (sessionId: string) => void;
  onWalletClick?: () => void;
  onPointsClick?: () => void;
  onNotificationsClick?: () => void;
  notificationCount?: number;
}

export function HomeScreen({ userName, onSessionClick, onWalletClick, onPointsClick, onNotificationsClick, notificationCount = 0 }: HomeScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleBookSession = (sessionId: string) => {
    onSessionClick(sessionId);
  };

  const scrollToSlide = (direction: 'prev' | 'next') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / openSessions.length;
    
    if (direction === 'next' && currentSlide < openSessions.length - 1) {
      container.scrollTo({
        left: cardWidth * (currentSlide + 1),
        behavior: 'smooth'
      });
      setCurrentSlide(currentSlide + 1);
    } else if (direction === 'prev' && currentSlide > 0) {
      container.scrollTo({
        left: cardWidth * (currentSlide - 1),
        behavior: 'smooth'
      });
      setCurrentSlide(currentSlide - 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cardWidth = container.scrollWidth / openSessions.length;
      const newSlide = Math.round(container.scrollLeft / cardWidth);
      setCurrentSlide(newSlide);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bq-neutral)] pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-20 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <h1 className="font-display text-2xl text-[var(--bq-text-primary)] mb-1">
              Welcome back, {userName} 👋
            </h1>
            <p className="text-[var(--bq-text-secondary)] text-sm">
              Ready to crush your fitness goals?
            </p>
          </motion.div>
          {onNotificationsClick && (
            <NotificationBell 
              count={notificationCount} 
              onClick={onNotificationsClick}
            />
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto">
        {/* Pull to Refresh Indicator */}
        {refreshing && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[var(--bq-primary)]/30 border-t-[var(--bq-primary)] rounded-full animate-spin" />
          </div>
        )}

        <div className="space-y-6 px-6 pt-6">
          {/* Streak Indicator */}
          <StreakIndicator days={3} />

          {/* Membership Card */}
          <MembershipCard
            memberName={userName}
            planName="Premium Plan"
            planTier="premium"
            sessionsRemaining={12}
            totalSessions={20}
          />

          {/* Points & Wallet Summary */}
          <WalletSummaryCard 
            balance={145.50} 
            points={2450} 
            pointsChange={15}
            onWalletClick={onWalletClick}
            onPointsClick={onPointsClick}
          />
        </div>

        {/* Open Sessions Carousel */}
        <div className="mt-8">
          <div className="px-6 mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-[var(--bq-text-primary)]">
              Open Sessions
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => scrollToSlide('prev')}
                disabled={currentSlide === 0}
                className="w-8 h-8 rounded-full bg-white border border-[var(--bq-neutral-dark)] flex items-center justify-center hover:bg-[var(--bq-neutral)] transition-colors duration-[var(--transition-fast)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--bq-text-secondary)]" />
              </button>
              <button
                onClick={() => scrollToSlide('next')}
                disabled={currentSlide === openSessions.length - 1}
                className="w-8 h-8 rounded-full bg-white border border-[var(--bq-neutral-dark)] flex items-center justify-center hover:bg-[var(--bq-neutral)] transition-colors duration-[var(--transition-fast)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-[var(--bq-text-secondary)]" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-6 pb-8"
              style={{ scrollPaddingLeft: '1.5rem' }}
            >
              {openSessions.map((session) => (
                <div key={session.id} className="flex-shrink-0 w-[calc(100%-3rem)] snap-start">
                  <SessionCard
                    {...session}
                    onBook={() => handleBookSession(session.id)}
                  />
                </div>
              ))}
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-2">
              {openSessions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      const cardWidth = scrollContainerRef.current.scrollWidth / openSessions.length;
                      scrollContainerRef.current.scrollTo({
                        left: cardWidth * index,
                        behavior: 'smooth'
                      });
                      setCurrentSlide(index);
                    }
                  }}
                  className="transition-all duration-[var(--transition-base)]"
                >
                  <div
                    className={`h-2 rounded-full transition-all duration-[var(--transition-base)] ${
                      index === currentSlide
                        ? "w-6 bg-[var(--bq-primary)]"
                        : "w-2 bg-[var(--bq-neutral-dark)]"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended for You */}
        <div className="mt-8 px-6">
          <h2 className="font-display text-xl text-[var(--bq-text-primary)] mb-4">
            Recommended for You
          </h2>
          <div className="grid gap-4">
            {recommendedSessions.map((session) => (
              <SessionCard
                key={session.id}
                {...session}
                onBook={() => handleBookSession(session.id)}
              />
            ))}
          </div>
        </div>

        {/* Popular this Week */}
        <div className="mt-8 px-6 pb-6">
          <h2 className="font-display text-xl text-[var(--bq-text-primary)] mb-4">
            Popular this Week
          </h2>
          <div className="grid gap-4">
            {popularSessions.map((session) => (
              <SessionCard
                key={session.id}
                {...session}
                onBook={() => handleBookSession(session.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scrollbar Hide Styling */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
