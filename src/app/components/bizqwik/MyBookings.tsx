import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlertCircle,
  X,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import { QRScannerScreen } from "./QRScannerScreen";

interface Booking {
  id: string;
  session: {
    title: string;
    instructor: {
      name: string;
      photo: string;
    };
    duration: number;
    location: {
      name: string;
    };
  };
  slot: {
    time: string;
    date: string;
  };
  status: "upcoming" | "completed" | "cancelled";
  hoursUntil: number; // Hours until the session
  refundPolicy: {
    type: "full" | "partial" | "none";
    amount: number;
    message: string;
  };
}

const mockBookings: Booking[] = [
  {
    id: "1",
    session: {
      title: "Power Yoga Flow",
      instructor: {
        name: "Sarah Martinez",
        photo: "https://images.unsplash.com/photo-1527062603922-c94afc167de5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwdGVhY2hlciUyMHNtaWxpbmd8ZW58MXx8fHwxNzYxOTQ4Mjg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      duration: 60,
      location: {
        name: "Bizqwik Downtown Studio",
      },
    },
    slot: {
      time: "8:00 AM",
      date: "Tomorrow, Nov 1",
    },
    status: "upcoming",
    hoursUntil: 30,
    refundPolicy: {
      type: "full",
      amount: 15.0,
      message: "Cancel 24+ hours before for full refund",
    },
  },
  {
    id: "2",
    session: {
      title: "HIIT Cardio Blast",
      instructor: {
        name: "Marcus Johnson",
        photo: "https://images.unsplash.com/photo-1628970899178-934735eff6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRlJTIwcG9ydHJhaXQlMjBjb25maWRlbnR8ZW58MXx8fHwxNzYxOTQ4Mjg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      duration: 45,
      location: {
        name: "Bizqwik Downtown Studio",
      },
    },
    slot: {
      time: "7:00 AM",
      date: "Sat, Nov 2",
    },
    status: "upcoming",
    hoursUntil: 18,
    refundPolicy: {
      type: "partial",
      amount: 7.5,
      message: "Cancel 12-24 hours before for 50% credit",
    },
  },
];

export function MyBookings() {
  const [bookings, setBookings] = useState(mockBookings);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [checkInBooking, setCheckInBooking] = useState<Booking | null>(null);

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedBooking) return;

    // Update booking status
    setBookings(bookings.map(b => 
      b.id === selectedBooking.id 
        ? { ...b, status: "cancelled" as const }
        : b
    ));

    const { type, amount } = selectedBooking.refundPolicy;
    
    if (type === "full") {
      toast.success(`Booking cancelled. $${amount.toFixed(2)} refunded to wallet`);
    } else if (type === "partial") {
      toast.success(`Booking cancelled. $${amount.toFixed(2)} credited to wallet`);
    } else {
      toast.success("Booking cancelled");
    }

    setCancelDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleCheckInClick = (booking: Booking) => {
    setCheckInBooking(booking);
    setShowQRScanner(true);
  };

  const handleQRScanSuccess = (qrCode: string) => {
    setShowQRScanner(false);
    
    // Simulate QR code validation
    if (checkInBooking) {
      toast.success(`Checked in to ${checkInBooking.session.title}! 🎉`, {
        description: "+25 points earned",
      });
      
      // Update booking status
      setBookings(bookings.map(b => 
        b.id === checkInBooking.id 
          ? { ...b, status: "completed" as const }
          : b
      ));
    }
    
    setCheckInBooking(null);
  };

  const upcomingBookings = bookings.filter(b => b.status === "upcoming");
  const pastBookings = bookings.filter(b => b.status !== "upcoming");

  return (
    <div className="min-h-screen bg-[var(--bq-neutral)] pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-20 shadow-sm">
        <h1 className="font-display text-2xl text-[var(--bq-text-primary)]">My Bookings</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div>
            <h2 className="text-sm text-[var(--bq-text-secondary)] mb-3">Upcoming</h2>
            <div className="space-y-3">
              {upcomingBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden border border-[var(--bq-neutral-dark)] shadow-sm"
                >
                  <div className="p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-[var(--bq-primary)]/10 flex-shrink-0">
                        <ImageWithFallback
                          src={booking.session.instructor.photo}
                          alt={booking.session.instructor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[var(--bq-text-primary)] mb-1 truncate">
                          {booking.session.title}
                        </h3>
                        <p className="text-sm text-[var(--bq-text-secondary)] truncate">
                          {booking.session.instructor.name}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex items-center gap-2 text-[var(--bq-text-secondary)]">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{booking.slot.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--bq-text-secondary)]">
                        <Clock className="w-4 h-4" />
                        <span>{booking.slot.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--bq-text-secondary)]">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.session.location.name}</span>
                      </div>
                    </div>

                    {/* Refund info */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-3">
                      <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        {booking.refundPolicy.message}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCheckInClick(booking)}
                        className="flex-1 h-12 bg-[var(--bq-primary)] text-white rounded-2xl transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary)]/90 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(90,65,255,0.2)]"
                      >
                        <span>Check In</span>
                      </button>
                      <button
                        onClick={() => handleCancelClick(booking)}
                        className="h-12 px-4 bg-red-50 text-red-600 rounded-2xl transition-all duration-[var(--transition-base)] hover:bg-red-100 active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-sm text-[var(--bq-text-secondary)] mb-3">Past</h2>
            <div className="space-y-3">
              {pastBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white/50 rounded-2xl overflow-hidden border border-[var(--bq-neutral-dark)] opacity-60"
                >
                  <div className="p-4">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-[var(--bq-neutral-dark)] flex-shrink-0">
                        <ImageWithFallback
                          src={booking.session.instructor.photo}
                          alt={booking.session.instructor.name}
                          className="w-full h-full object-cover grayscale"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[var(--bq-text-primary)] mb-1 truncate">
                          {booking.session.title}
                        </h3>
                        <p className="text-sm text-[var(--bq-text-secondary)] truncate mb-2">
                          {booking.session.instructor.name}
                        </p>
                        <div className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {upcomingBookings.length === 0 && pastBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[var(--bq-neutral-dark)] flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-[var(--bq-text-tertiary)]" />
            </div>
            <h3 className="text-[var(--bq-text-primary)] mb-2">No bookings yet</h3>
            <p className="text-sm text-[var(--bq-text-secondary)]">
              Book your first session to get started
            </p>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your booking for{" "}
              <span className="font-medium text-[var(--bq-text-primary)]">
                {selectedBooking?.session.title}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedBooking && (
            <div className="px-6 pb-2">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="text-sm text-blue-900">
                  {selectedBooking.refundPolicy.type === "full" && (
                    <>
                      <strong>Full refund:</strong> ${selectedBooking.refundPolicy.amount.toFixed(2)} will be returned to your wallet
                    </>
                  )}
                  {selectedBooking.refundPolicy.type === "partial" && (
                    <>
                      <strong>50% credit:</strong> ${selectedBooking.refundPolicy.amount.toFixed(2)} will be credited to your wallet
                    </>
                  )}
                  {selectedBooking.refundPolicy.type === "none" && (
                    <>
                      <strong>No refund:</strong> Cancellation is too close to session time
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Scanner */}
      <AnimatePresence>
        {showQRScanner && (
          <QRScannerScreen
            onClose={() => {
              setShowQRScanner(false);
              setCheckInBooking(null);
            }}
            onScanSuccess={handleQRScanSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
