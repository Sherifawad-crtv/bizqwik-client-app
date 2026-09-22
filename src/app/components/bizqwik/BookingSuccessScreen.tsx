import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Calendar as CalendarIcon,
  Download,
  Share2,
  Award,
  Sparkles,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";

interface BookingSuccessScreenProps {
  session: {
    id: string;
    title: string;
    instructor: {
      name: string;
      photo: string;
    };
    duration: number;
    location: {
      name: string;
      address: string;
    };
    pointsEarned: number;
  };
  selectedSlot: {
    time: string;
    date: string;
  };
  paymentMethod: "wallet" | "card";
  onDone: () => void;
}

// Confetti particle component
function ConfettiParticle({ delay }: { delay: number }) {
  const colors = ["#5A41FF", "#FFB547", "#FF6B9D", "#4ECDC4", "#95E1D3"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() - 0.5) * 40;
  const rotation = Math.random() * 720 - 360;

  return (
    <motion.div
      initial={{ 
        top: "-5%", 
        left: `${startX}%`,
        opacity: 1,
        scale: 1,
        rotate: 0 
      }}
      animate={{ 
        top: "110%", 
        left: `${endX}%`,
        opacity: 0,
        scale: 0.5,
        rotate: rotation
      }}
      transition={{ 
        duration: 3, 
        delay,
        ease: "easeIn"
      }}
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: color }}
    />
  );
}

export function BookingSuccessScreen({
  session,
  selectedSlot,
  paymentMethod,
  onDone,
}: BookingSuccessScreenProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [pointsAnimated, setPointsAnimated] = useState(false);

  useEffect(() => {
    // Stop confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    
    // Trigger haptic feedback (only works on mobile)
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }
    
    // Animate points
    setTimeout(() => setPointsAnimated(true), 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAddToCalendar = () => {
    // Create calendar event data
    const eventTitle = `${session.title} with ${session.instructor.name}`;
    const eventDetails = `Location: ${session.location.name}\n${session.location.address}`;
    
    // For iOS devices
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      toast.success("Calendar event details copied! Open your Calendar app to add.");
    } else {
      // For other devices, show success message
      toast.success("Added to your calendar!");
    }
  };

  const handleDownloadReceipt = () => {
    toast.success("Receipt downloaded!");
  };

  const handleShare = () => {
    toast.success("Share link copied!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bq-neutral)] to-white relative overflow-hidden">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiParticle key={i} delay={i * 0.05} />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="text-center max-w-md w-full"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_8px_24px_rgba(16,185,129,0.3)]"
          >
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="font-display text-3xl text-[var(--bq-text-primary)] mb-2">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-[var(--bq-text-secondary)] mb-6">
              You're all set for your session
            </p>
          </motion.div>

          {/* Session Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-[var(--shadow-md)] mb-6 border border-[var(--bq-neutral-dark)]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-[var(--bq-primary)]/20 flex-shrink-0">
                <ImageWithFallback
                  src={session.instructor.photo}
                  alt={session.instructor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="text-[var(--bq-text-primary)] truncate mb-1">
                  {session.title}
                </h3>
                <p className="text-sm text-[var(--bq-text-secondary)] truncate">
                  {session.instructor.name}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-[var(--bq-text-secondary)]">Date & Time</span>
                <span className="text-[var(--bq-text-primary)] font-mono">
                  {selectedSlot.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--bq-text-secondary)]">Time</span>
                <span className="text-[var(--bq-text-primary)] font-mono">
                  {selectedSlot.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--bq-text-secondary)]">Location</span>
                <span className="text-[var(--bq-text-primary)] text-right truncate ml-4">
                  {session.location.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--bq-text-secondary)]">Payment</span>
                <span className="text-[var(--bq-text-primary)] capitalize">
                  {paymentMethod === "wallet" ? "Wallet" : "Card"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Points Earned */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: pointsAnimated ? 1 : 0, 
              scale: pointsAnimated ? 1 : 0.9 
            }}
            transition={{ duration: 0.5, type: "spring" }}
            className="bg-gradient-to-r from-[var(--bq-accent)]/10 to-yellow-500/10 border border-[var(--bq-accent)]/20 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[var(--bq-accent)]" />
              <span className="text-[var(--bq-text-secondary)] text-sm">
                Points Reserved
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Award className="w-6 h-6 text-[var(--bq-accent)]" />
              <motion.span
                initial={{ scale: 1 }}
                animate={{ scale: pointsAnimated ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="font-mono text-2xl text-[var(--bq-text-primary)]"
              >
                +{session.pointsEarned}
              </motion.span>
            </div>
            <p className="text-xs text-[var(--bq-text-tertiary)] mt-1">
              Earned after attending session
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-6"
          >
            <button
              onClick={handleAddToCalendar}
              className="w-full h-12 bg-[var(--bq-primary)] text-white rounded-xl transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Add to Calendar</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadReceipt}
                className="h-11 bg-[var(--bq-secondary)] text-[var(--bq-text-primary)] rounded-xl transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-neutral-dark)] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Receipt</span>
              </button>
              <button
                onClick={handleShare}
                className="h-11 bg-[var(--bq-secondary)] text-[var(--bq-text-primary)] rounded-xl transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-neutral-dark)] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </motion.div>

          {/* Done Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onDone}
            className="text-[var(--bq-text-secondary)] hover:text-[var(--bq-text-primary)] transition-colors duration-[var(--transition-fast)]"
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
