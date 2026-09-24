import { useEffect, useState } from "react";
import { IntroScreen } from "./components/bizqwik/IntroScreen";
import { AuthScreen } from "./components/bizqwik/AuthScreen";
import { HomeScreen } from "./components/bizqwik/HomeScreen";
import { SessionDetailsScreen } from "./components/bizqwik/SessionDetailsScreen";
import { BookingConfirmScreen } from "./components/bizqwik/BookingConfirmScreen";
import { BookingSuccessScreen } from "./components/bizqwik/BookingSuccessScreen";
import { MyBookings } from "./components/bizqwik/MyBookings";
import { WalletScreen } from "./components/bizqwik/WalletScreen";
import { MembershipScreen } from "./components/bizqwik/MembershipScreen";
import { RewardsScreen } from "./components/bizqwik/RewardsScreen";
import { NotificationsScreen } from "./components/bizqwik/NotificationsScreen";
import { ProfileScreen } from "./components/bizqwik/ProfileScreen";
import { PersonalInfoScreen } from "./components/bizqwik/PersonalInfoScreen";
import { LinkedGymsScreen } from "./components/bizqwik/LinkedGymsScreen";
import { PaymentMethodsScreen } from "./components/bizqwik/PaymentMethodsScreen";
import { SupportScreen } from "./components/bizqwik/SupportScreen";
import { BottomNav } from "./components/bizqwik/BottomNav";
import { Toaster } from "./components/ui/sonner";
import { useBranding } from "../lib/branding";
import { useAuth } from "../lib/auth";

type Step =
  | "home" | "bookings" | "wallet" | "membership" | "rewards" | "notifications" | "profile"
  | "personal-info" | "linked-gyms" | "payment-methods" | "support"
  | "session-details" | "booking-confirm" | "booking-success";
type NavItem = "home" | "bookings" | "profile";

// Full-screen mobile shell every state renders inside.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[430px] min-h-screen bg-white shadow-lg">{children}</div>
      <Toaster />
    </div>
  );
}

function Splash() {
  return (
    <Shell>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />
      </div>
    </Shell>
  );
}

function App() {
  const branding = useBranding();
  const auth = useAuth();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [introDone, setIntroDone] = useState(false);

  const [step, setStep] = useState<Step>("home");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string; time: string; date: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card">("wallet");
  const [notificationCount] = useState(5);
  const [previousStep, setPreviousStep] = useState<Step | null>(null);

  // Land on home each time a member signs in.
  useEffect(() => {
    if (auth.client) setStep("home");
  }, [auth.client]);

  // ---- gating ----
  if (branding.loading || !auth.ready) return <Splash />;
  if (branding.error) {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center px-8 text-center">
          <div>
            <div className="font-display text-[22px] text-[var(--bq-text-primary)] mb-2">Gym not found</div>
            <p className="text-[var(--bq-text-secondary)] text-sm">{branding.error}</p>
          </div>
        </div>
      </Shell>
    );
  }
  if (!auth.client) {
    return (
      <Shell>
        {!introDone ? (
          <IntroScreen currentSlide={currentSlide} onSlideChange={setCurrentSlide} onComplete={() => setIntroDone(true)} />
        ) : (
          <AuthScreen />
        )}
      </Shell>
    );
  }

  // ---- signed-in app ----
  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setStep("session-details");
  };
  const handleBackToHome = () => {
    setStep("home");
    setSelectedSessionId(null);
    setSelectedSlot(null);
  };
  const handleBookSession = (slot: { id: string; time: string; date: string }) => {
    setSelectedSlot(slot);
    setStep("booking-confirm");
  };
  const handleConfirmBooking = (method: "wallet" | "card") => {
    setPaymentMethod(method);
    setStep("booking-success");
  };
  const handleBookingComplete = () => handleBackToHome();
  const handleNavigation = (item: NavItem) => setStep(item);
  const handleNotificationsClick = () => setStep("notifications");
  const handleNotificationAction = (notification: any) => {
    if (notification.type === "session") setStep("bookings");
    else if (notification.type === "reward") setStep("rewards");
    else if (notification.type === "renewal") setStep("membership");
    else setStep("home");
  };

  const showBottomNav = ["home", "bookings", "wallet", "membership", "rewards", "profile"].includes(step);
  const selectedSession = selectedSessionId ? SESSION_DATA[selectedSessionId as keyof typeof SESSION_DATA] : null;

  return (
    <Shell>
      {step === "home" && (
        <HomeScreen
          userName={auth.client.name.split(" ")[0]}
          onSessionClick={handleSessionClick}
          onWalletClick={() => setStep("wallet")}
          onPointsClick={() => setStep("rewards")}
          onNotificationsClick={handleNotificationsClick}
          notificationCount={notificationCount}
        />
      )}

      {step === "bookings" && <MyBookings />}

      {step === "wallet" && (
        <WalletScreen
          onNotificationsClick={handleNotificationsClick}
          notificationCount={notificationCount}
          onBack={previousStep === "profile" ? () => { setPreviousStep(null); setStep("profile"); } : undefined}
        />
      )}

      {step === "membership" && <MembershipScreen onNotificationsClick={handleNotificationsClick} notificationCount={notificationCount} />}

      {step === "rewards" && (
        <RewardsScreen
          onNotificationsClick={handleNotificationsClick}
          notificationCount={notificationCount}
          onBack={previousStep === "profile" ? () => { setPreviousStep(null); setStep("profile"); } : undefined}
        />
      )}

      {step === "notifications" && <NotificationsScreen onClose={() => setStep("home")} onNotificationAction={handleNotificationAction} />}

      {step === "profile" && (
        <ProfileScreen
          onNotificationsClick={handleNotificationsClick}
          notificationCount={notificationCount}
          onLogout={auth.signOut}
          onPersonalInfoClick={() => setStep("personal-info")}
          onLinkedGymsClick={() => setStep("linked-gyms")}
          onPaymentMethodsClick={() => setStep("payment-methods")}
          onMembershipClick={() => setStep("membership")}
          onWalletClick={() => { setPreviousStep("profile"); setStep("wallet"); }}
          onRewardsClick={() => { setPreviousStep("profile"); setStep("rewards"); }}
          onSupportClick={() => setStep("support")}
        />
      )}

      {step === "personal-info" && <PersonalInfoScreen onBack={() => setStep("profile")} onSave={() => setStep("profile")} />}
      {step === "linked-gyms" && <LinkedGymsScreen onBack={() => setStep("profile")} />}
      {step === "payment-methods" && <PaymentMethodsScreen onBack={() => setStep("profile")} />}
      {step === "support" && <SupportScreen onBack={() => setStep("profile")} />}

      {step === "session-details" && selectedSession && (
        <SessionDetailsScreen session={selectedSession} onBack={handleBackToHome} onBook={handleBookSession} />
      )}

      {step === "booking-confirm" && selectedSession && selectedSlot && (
        <BookingConfirmScreen
          session={{ id: selectedSession.id, title: selectedSession.title, instructor: selectedSession.instructor, duration: selectedSession.duration, location: selectedSession.location, pointsEarned: selectedSession.pointsEarned }}
          selectedSlot={selectedSlot}
          onBack={() => setStep("session-details")}
          onConfirm={handleConfirmBooking}
        />
      )}

      {step === "booking-success" && selectedSession && selectedSlot && (
        <BookingSuccessScreen
          session={{ id: selectedSession.id, title: selectedSession.title, instructor: selectedSession.instructor, duration: selectedSession.duration, location: selectedSession.location, pointsEarned: selectedSession.pointsEarned }}
          selectedSlot={selectedSlot}
          paymentMethod={paymentMethod}
          onDone={handleBookingComplete}
        />
      )}

      {showBottomNav && (
        <BottomNav active={(["home", "bookings", "profile"].includes(step) ? step : "profile") as NavItem} onNavigate={handleNavigation} />
      )}
    </Shell>
  );
}

// Mock class catalog still backing the session-detail / booking screens — wired
// to real /client/classes data in a follow-up slice.
const SESSION_DATA = {
  "1": { id: "1", title: "Power Yoga Flow", instructor: { name: "Sarah Martinez", photo: "", bio: "", rating: 4.9, sessionsGiven: 342 }, rating: 4.9, totalReviews: 156, description: "Build strength and flexibility with this dynamic vinyasa flow session.", duration: 60, difficulty: "Intermediate" as const, location: { name: "Studio", address: "", image: "" }, timeSlots: [{ id: "1a", time: "8:00 AM", date: "Tomorrow", spotsLeft: 8 }], tags: ["Yoga"], pointsEarned: 150, capacity: 15 },
} as const;

export default App;
