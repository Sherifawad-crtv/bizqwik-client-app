import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Star,
  Clock,
  TrendingUp,
  MapPin,
  Share2,
  Calendar as CalendarIcon,
  Award,
  Users,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ReviewCard } from "./ReviewCard";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

interface Session {
  id: string;
  title: string;
  instructor: {
    name: string;
    photo: string;
    bio: string;
    rating: number;
    sessionsGiven: number;
  };
  rating: number;
  totalReviews: number;
  description: string;
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  location: {
    name: string;
    address: string;
    image: string;
  };
  timeSlots: Array<{
    id: string;
    time: string;
    date: string;
    spotsLeft: number;
  }>;
  tags: string[];
  pointsEarned: number;
  capacity: number;
}

interface SessionDetailsScreenProps {
  session: Session;
  onBack: () => void;
  onBook: (slot: { id: string; time: string; date: string }) => void;
}

const mockReviews = [
  {
    userName: "Alex Thompson",
    userAvatar: "https://images.unsplash.com/photo-1544972917-3529b113a469?w=100",
    rating: 5,
    date: "2 days ago",
    comment: "Amazing session! The instructor really knows how to push you while keeping it fun and engaging.",
  },
  {
    userName: "Maria Garcia",
    userAvatar: "https://images.unsplash.com/photo-1527062603922-c94afc167de5?w=100",
    rating: 5,
    date: "1 week ago",
    comment: "Best HIIT class I've taken. Great energy and perfect for all fitness levels!",
  },
  {
    userName: "Jordan Lee",
    userAvatar: "https://images.unsplash.com/photo-1628970899178-934735eff6b3?w=100",
    rating: 4,
    date: "2 weeks ago",
    comment: "Really enjoyed the session. Would love to see more variety in the exercises.",
  },
];

export function SessionDetailsScreen({ session, onBack, onBook }: SessionDetailsScreenProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const handleShare = () => {
    toast.success("Share link copied to clipboard!");
  };

  const handleAddToCalendar = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot first");
      return;
    }
    toast.success("Added to your calendar!");
  };

  const handleBookSession = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    const slot = session.timeSlots.find(s => s.id === selectedSlot);
    if (slot) {
      onBook(slot);
    }
  };

  const displayedReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--bq-neutral)]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white px-6 py-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[var(--bq-secondary)] flex items-center justify-center hover:bg-[var(--bq-neutral-dark)] transition-colors duration-[var(--transition-fast)]"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--bq-text-primary)]" />
        </button>
        <h1 className="flex-1 font-display text-xl text-[var(--bq-text-primary)] truncate">
          Session Details
        </h1>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-[var(--bq-secondary)] flex items-center justify-center hover:bg-[var(--bq-neutral-dark)] transition-colors duration-[var(--transition-fast)]"
        >
          <Share2 className="w-5 h-5 text-[var(--bq-text-primary)]" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="pb-24">
        {/* Instructor Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white px-6 py-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-[var(--bq-primary)]/20 flex-shrink-0">
              <ImageWithFallback
                src={session.instructor.photo}
                alt={session.instructor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl text-[var(--bq-text-primary)] mb-1">
                {session.title}
              </h2>
              <p className="text-[var(--bq-text-secondary)] mb-2">
                with {session.instructor.name}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[var(--bq-accent)] fill-[var(--bq-accent)]" />
                  <span className="font-mono text-sm text-[var(--bq-text-primary)]">
                    {session.rating}
                  </span>
                  <span className="text-sm text-[var(--bq-text-tertiary)]">
                    ({session.totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {session.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-[var(--bq-primary)]/10 text-[var(--bq-primary)] border-0 rounded-full"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--bq-neutral)] rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-[var(--bq-primary)] mx-auto mb-1" />
              <div className="font-mono text-sm text-[var(--bq-text-primary)]">
                {session.duration} min
              </div>
              <div className="text-xs text-[var(--bq-text-tertiary)]">Duration</div>
            </div>
            <div className="bg-[var(--bq-neutral)] rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-[var(--bq-accent)] mx-auto mb-1" />
              <div className="text-sm text-[var(--bq-text-primary)]">{session.difficulty}</div>
              <div className="text-xs text-[var(--bq-text-tertiary)]">Level</div>
            </div>
            <div className="bg-[var(--bq-neutral)] rounded-xl p-3 text-center">
              <Award className="w-5 h-5 text-[var(--bq-accent)] mx-auto mb-1" />
              <div className="font-mono text-sm text-[var(--bq-text-primary)]">
                +{session.pointsEarned}
              </div>
              <div className="text-xs text-[var(--bq-text-tertiary)]">Points</div>
            </div>
          </div>
        </motion.div>

        <Separator className="bg-[var(--bq-neutral-dark)]" />

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white px-6 py-6"
        >
          <h3 className="font-display text-lg text-[var(--bq-text-primary)] mb-3">
            About This Session
          </h3>
          <p className="text-[var(--bq-text-secondary)] leading-relaxed mb-4">
            {session.description}
          </p>

          <h4 className="text-sm text-[var(--bq-text-primary)] mb-2">About the Instructor</h4>
          <p className="text-sm text-[var(--bq-text-secondary)] leading-relaxed mb-3">
            {session.instructor.bio}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[var(--bq-accent)] fill-[var(--bq-accent)]" />
              <span className="font-mono text-[var(--bq-text-primary)]">
                {session.instructor.rating}
              </span>
              <span className="text-[var(--bq-text-tertiary)]">rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[var(--bq-primary)]" />
              <span className="font-mono text-[var(--bq-text-primary)]">
                {session.instructor.sessionsGiven}
              </span>
              <span className="text-[var(--bq-text-tertiary)]">sessions</span>
            </div>
          </div>
        </motion.div>

        <Separator className="bg-[var(--bq-neutral-dark)]" />

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white px-6 py-6"
        >
          <h3 className="font-display text-lg text-[var(--bq-text-primary)] mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[var(--bq-primary)]" />
            Location
          </h3>
          
          <div className="rounded-2xl overflow-hidden mb-3 border border-[var(--bq-neutral-dark)]">
            <ImageWithFallback
              src={session.location.image}
              alt={session.location.name}
              className="w-full h-40 object-cover"
            />
          </div>
          
          <div>
            <h4 className="text-[var(--bq-text-primary)] mb-1">{session.location.name}</h4>
            <p className="text-sm text-[var(--bq-text-secondary)]">{session.location.address}</p>
          </div>
        </motion.div>

        <Separator className="bg-[var(--bq-neutral-dark)]" />

        {/* Time Slots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white px-6 py-6"
        >
          <h3 className="font-display text-lg text-[var(--bq-text-primary)] mb-4">
            Available Time Slots
          </h3>
          <div className="space-y-3">
            {session.timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-[var(--transition-base)] text-left ${
                  selectedSlot === slot.id
                    ? "border-[var(--bq-primary)] bg-[var(--bq-primary)]/5 shadow-[var(--glow-primary)]"
                    : "border-[var(--bq-neutral-dark)] bg-white hover:border-[var(--bq-primary)]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-[var(--bq-text-primary)] mb-1">{slot.date}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[var(--bq-text-secondary)]" />
                        <span className="font-mono text-sm text-[var(--bq-text-secondary)]">
                          {slot.time}
                        </span>
                      </div>
                      <div
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          slot.spotsLeft < 3
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {slot.spotsLeft} spots left
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-[var(--transition-fast)] flex items-center justify-center ${
                      selectedSlot === slot.id
                        ? "border-[var(--bq-primary)] bg-[var(--bq-primary)]"
                        : "border-[var(--bq-neutral-dark)]"
                    }`}
                  >
                    {selectedSlot === slot.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Add to Calendar */}
          <button
            onClick={handleAddToCalendar}
            disabled={!selectedSlot}
            className="w-full mt-4 h-12 bg-[var(--bq-secondary)] text-[var(--bq-text-primary)] rounded-xl transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-neutral-dark)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Add to Calendar</span>
          </button>
        </motion.div>

        <Separator className="bg-[var(--bq-neutral-dark)]" />

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white px-6 py-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-[var(--bq-text-primary)]">
              Reviews ({session.totalReviews})
            </h3>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-[var(--bq-accent)] fill-[var(--bq-accent)]" />
              <span className="font-mono text-[var(--bq-text-primary)]">{session.rating}</span>
            </div>
          </div>

          <div className="space-y-3">
            {displayedReviews.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </div>

          {mockReviews.length > 2 && !showAllReviews && (
            <button
              onClick={() => setShowAllReviews(true)}
              className="w-full mt-4 h-11 bg-[var(--bq-secondary)] text-[var(--bq-text-primary)] rounded-xl transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-neutral-dark)] active:scale-[0.98] flex items-center justify-center"
            >
              Show All Reviews
            </button>
          )}
        </motion.div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--bq-neutral-dark)] px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-[430px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="text-xs text-[var(--bq-text-secondary)] mb-0.5">
                Earn on attendance
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[var(--bq-accent)]" />
                <span className="font-mono text-[var(--bq-text-primary)]">
                  +{session.pointsEarned} points
                </span>
              </div>
            </div>
            {selectedSlot && (
              <div className="text-right">
                <div className="text-xs text-[var(--bq-text-secondary)] mb-0.5">Selected</div>
                <div className="text-sm text-[var(--bq-text-primary)]">
                  {session.timeSlots.find((s) => s.id === selectedSlot)?.time}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleBookSession}
            disabled={!selectedSlot}
            className="w-full h-14 bg-[var(--bq-primary)] text-white rounded-[1.25rem] transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--glow-primary)] flex items-center justify-center gap-2"
            style={{ minHeight: "48px" }}
          >
            <span>Book Session</span>
            {selectedSlot && <span>→</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
