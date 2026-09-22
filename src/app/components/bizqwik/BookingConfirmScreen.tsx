import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  Wallet,
  CreditCard,
  Award,
  Info,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Separator } from "../ui/separator";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { toast } from "sonner";

interface BookingConfirmScreenProps {
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
    id: string;
    time: string;
    date: string;
  };
  onBack: () => void;
  onConfirm: (paymentMethod: "wallet" | "card") => void;
}

export function BookingConfirmScreen({
  session,
  selectedSlot,
  onBack,
  onConfirm,
}: BookingConfirmScreenProps) {
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card">("wallet");
  const [isProcessing, setIsProcessing] = useState(false);

  const sessionPrice = 15.0; // Base price
  const walletBalance = 145.5;
  const hasEnoughBalance = walletBalance >= sessionPrice;

  const handleConfirmBooking = async () => {
    if (paymentMethod === "wallet" && !hasEnoughBalance) {
      toast.error("Insufficient wallet balance");
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onConfirm(paymentMethod);
  };

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
        <h1 className="flex-1 font-display text-xl text-[var(--bq-text-primary)]">
          Confirm Booking
        </h1>
      </div>

      <div className="pb-32">
        {/* Session Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white px-6 py-6 mt-2"
        >
          <h2 className="text-sm text-[var(--bq-text-secondary)] mb-3">Session Details</h2>
          <div className="flex gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-[var(--bq-primary)]/10 flex-shrink-0">
              <ImageWithFallback
                src={session.instructor.photo}
                alt={session.instructor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[var(--bq-text-primary)] mb-1">{session.title}</h3>
              <p className="text-sm text-[var(--bq-text-secondary)] mb-2">
                with {session.instructor.name}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CalendarIcon className="w-4 h-4 text-[var(--bq-text-secondary)]" />
              <span className="text-[var(--bq-text-primary)]">{selectedSlot.date}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-[var(--bq-text-secondary)]" />
              <span className="text-[var(--bq-text-primary)]">
                {selectedSlot.time} ({session.duration} minutes)
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-[var(--bq-text-secondary)]" />
              <span className="text-[var(--bq-text-primary)]">{session.location.name}</span>
            </div>
          </div>
        </motion.div>

        <Separator className="bg-[var(--bq-neutral-dark)]" />

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white px-6 py-6"
        >
          <h2 className="text-sm text-[var(--bq-text-secondary)] mb-4">Payment Method</h2>

          <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
            <div className="space-y-3">
              {/* Wallet Option */}
              <div
                className={`relative rounded-xl border-2 transition-all duration-[var(--transition-base)] ${
                  paymentMethod === "wallet"
                    ? "border-[var(--bq-primary)] bg-[var(--bq-primary)]/5"
                    : "border-[var(--bq-neutral-dark)] bg-white"
                }`}
              >
                <Label
                  htmlFor="wallet"
                  className="flex items-center gap-4 p-4 cursor-pointer"
                >
                  <RadioGroupItem value="wallet" id="wallet" />
                  <div className="w-10 h-10 rounded-lg bg-[var(--bq-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-[var(--bq-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[var(--bq-text-primary)] mb-1">Bizqwik Wallet</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-[var(--bq-text-secondary)]">
                        ${walletBalance.toFixed(2)}
                      </span>
                      {!hasEnoughBalance && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          Insufficient
                        </span>
                      )}
                    </div>
                  </div>
                </Label>
              </div>

              {/* Card Option */}
              <div
                className={`relative rounded-xl border-2 transition-all duration-[var(--transition-base)] ${
                  paymentMethod === "card"
                    ? "border-[var(--bq-primary)] bg-[var(--bq-primary)]/5"
                    : "border-[var(--bq-neutral-dark)] bg-white"
                }`}
              >
                <Label
                  htmlFor="card"
                  className="flex items-center gap-4 p-4 cursor-pointer"
                >
                  <RadioGroupItem value="card" id="card" />
                  <div className="w-10 h-10 rounded-lg bg-[var(--bq-accent)]/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-[var(--bq-accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[var(--bq-text-primary)] mb-1">Credit/Debit Card</div>
                    <div className="text-sm text-[var(--bq-text-secondary)]">Pay with card</div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </motion.div>

        <Separator className="bg-[var(--bq-neutral-dark)]" />

        {/* Price Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white px-6 py-6"
        >
          <h2 className="text-sm text-[var(--bq-text-secondary)] mb-4">Price Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--bq-text-secondary)]">Session Price</span>
              <span className="font-mono text-[var(--bq-text-primary)]">
                ${sessionPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-green-600">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Points to Earn</span>
              </span>
              <span className="font-mono">+{session.pointsEarned} pts</span>
            </div>
            <Separator className="bg-[var(--bq-neutral-dark)]" />
            <div className="flex items-center justify-between">
              <span className="text-[var(--bq-text-primary)]">Total</span>
              <span className="font-mono text-[var(--bq-text-primary)] text-lg">
                ${sessionPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>

        <Separator className="bg-[var(--bq-neutral-dark)]" />

        {/* Cancellation Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white px-6 py-6"
        >
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <h3 className="text-blue-900 mb-1">Cancellation Policy</h3>
              <ul className="text-blue-700 space-y-1 list-disc list-inside">
                <li>Cancel 24+ hours before: Full refund to wallet</li>
                <li>Cancel 12-24 hours before: 50% credit</li>
                <li>Cancel less than 12 hours: No refund</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--bq-neutral-dark)] px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-[430px]">
          <button
            onClick={handleConfirmBooking}
            disabled={isProcessing || (paymentMethod === "wallet" && !hasEnoughBalance)}
            className="w-full h-14 bg-[var(--bq-primary)] text-white rounded-[1.25rem] transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--glow-primary)] flex items-center justify-center gap-2"
            style={{ minHeight: "48px" }}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Confirm & Pay ${sessionPrice.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
