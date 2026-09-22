import { useState } from "react";
import { IntroScreen } from "./components/bizqwik/IntroScreen";
import { LoginScreen } from "./components/bizqwik/LoginScreen";
import { PreferenceSetup, UserPreferences } from "./components/bizqwik/PreferenceSetup";
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

type OnboardingStep = "intro" | "login" | "preferences" | "complete" | "home" | "bookings" | "wallet" | "membership" | "rewards" | "notifications" | "profile" | "personal-info" | "linked-gyms" | "payment-methods" | "support" | "session-details" | "booking-confirm" | "booking-success";
type NavItem = "home" | "bookings" | "profile";

function App() {
  // Change to "home" to skip onboarding for testing
  const [step, setStep] = useState<OnboardingStep>("home");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string; time: string; date: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card">("wallet");
  const [notificationCount, setNotificationCount] = useState(5);
  const [previousStep, setPreviousStep] = useState<OnboardingStep | null>(null);
  const [userData, setUserData] = useState<{
    loginMethod?: string;
    loginValue?: string;
    preferences?: UserPreferences;
  }>({});

  const handleIntroComplete = () => {
    setStep("login");
  };

  const handleLogin = (method: string, value?: string) => {
    setUserData(prev => ({ ...prev, loginMethod: method, loginValue: value }));
    setStep("preferences");
  };

  const handlePreferencesComplete = (preferences: UserPreferences) => {
    setUserData(prev => ({ ...prev, preferences }));
    setStep("complete");
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setStep("session-details");
  };

  const handleBackToHome = () => {
    setStep("home");
    setSelectedSessionId(null);
    setSelectedSlot(null);
  };

  const handleBackToDetails = () => {
    setStep("session-details");
  };

  const handleBookSession = (slot: { id: string; time: string; date: string }) => {
    setSelectedSlot(slot);
    setStep("booking-confirm");
  };

  const handleConfirmBooking = (method: "wallet" | "card") => {
    setPaymentMethod(method);
    setStep("booking-success");
  };

  const handleBookingComplete = () => {
    setStep("home");
    setSelectedSessionId(null);
    setSelectedSlot(null);
  };

  const handleNavigation = (item: NavItem) => {
    setStep(item);
  };

  const handleNotificationsClick = () => {
    setStep("notifications");
  };

  const handleNotificationAction = (notification: any) => {
    // Handle different notification actions
    if (notification.type === "session") {
      setStep("bookings");
    } else if (notification.type === "reward") {
      setStep("rewards");
    } else if (notification.type === "renewal") {
      setStep("membership");
    } else if (notification.type === "offer") {
      setStep("home");
    }
  };

  const handleLogout = () => {
    // Reset to intro screen
    setStep("intro");
    setUserData({});
  };

  const showBottomNav = ["home", "bookings", "wallet", "membership", "rewards", "profile"].includes(step);

  // Session data for details screen
  const sessionData = {
    "1": {
      id: "1",
      title: "Power Yoga Flow",
      instructor: {
        name: "Sarah Martinez",
        photo: "https://images.unsplash.com/photo-1527062603922-c94afc167de5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwdGVhY2hlciUyMHNtaWxpbmd8ZW58MXx8fHwxNzYxOTQ4Mjg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        bio: "Sarah has been teaching yoga for over 10 years, specializing in vinyasa and power yoga. She believes in making yoga accessible and fun for everyone.",
        rating: 4.9,
        sessionsGiven: 342,
      },
      rating: 4.9,
      totalReviews: 156,
      description: "Build strength and flexibility with this dynamic vinyasa flow session. Perfect for those looking to challenge themselves while maintaining mindful breathing and proper alignment. Each class incorporates a mix of standing poses, balances, and core work.",
      duration: 60,
      difficulty: "Intermediate" as const,
      location: {
        name: "Bizqwik Downtown Studio",
        address: "123 Fitness Ave, Suite 200, Downtown",
        image: "https://images.unsplash.com/photo-1671970922029-0430d2ae122c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwc3R1ZGlvJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxOTQ4NjI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      timeSlots: [
        { id: "1a", time: "8:00 AM", date: "Tomorrow, Nov 1", spotsLeft: 8 },
        { id: "1b", time: "10:30 AM", date: "Tomorrow, Nov 1", spotsLeft: 5 },
        { id: "1c", time: "6:00 PM", date: "Tomorrow, Nov 1", spotsLeft: 2 },
        { id: "1d", time: "8:00 AM", date: "Sat, Nov 2", spotsLeft: 12 },
      ],
      tags: ["Morning", "Yoga", "Intermediate"],
      pointsEarned: 150,
      capacity: 15,
    },
    "2": {
      id: "2",
      title: "HIIT Cardio Blast",
      instructor: {
        name: "Marcus Johnson",
        photo: "https://images.unsplash.com/photo-1628970899178-934735eff6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRlJTIwcG9ydHJhaXQlMjBjb25maWRlbnR8ZW58MXx8fHwxNzYxOTQ4Mjg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        bio: "Marcus is a certified personal trainer with a passion for high-intensity training. His energetic classes push you to your limits while keeping motivation high.",
        rating: 4.8,
        sessionsGiven: 428,
      },
      rating: 4.8,
      totalReviews: 203,
      description: "High-intensity intervals to maximize calorie burn and boost metabolism. This 45-minute session combines bodyweight exercises, cardio bursts, and active recovery periods. Get ready to sweat and feel the burn!",
      duration: 45,
      difficulty: "Advanced" as const,
      location: {
        name: "Bizqwik Downtown Studio",
        address: "123 Fitness Ave, Suite 200, Downtown",
        image: "https://images.unsplash.com/photo-1671970922029-0430d2ae122c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwc3R1ZGlvJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxOTQ4NjI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      timeSlots: [
        { id: "2a", time: "7:00 AM", date: "Tomorrow, Nov 1", spotsLeft: 6 },
        { id: "2b", time: "12:00 PM", date: "Tomorrow, Nov 1", spotsLeft: 4 },
        { id: "2c", time: "5:30 PM", date: "Tomorrow, Nov 1", spotsLeft: 1 },
        { id: "2d", time: "7:00 PM", date: "Tomorrow, Nov 1", spotsLeft: 3 },
      ],
      tags: ["HIIT", "Cardio", "Advanced"],
      pointsEarned: 200,
      capacity: 12,
    },
    "3": {
      id: "3",
      title: "Strength Foundations",
      instructor: {
        name: "Emily Chen",
        photo: "https://images.unsplash.com/photo-1544972917-3529b113a469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwaW5zdHJ1Y3RvciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTk0ODI4NXww&ixlib=rb-4.1.0&q=80&w=1080",
        bio: "Emily specializes in strength training and functional fitness. She focuses on proper form and progressive overload to help you build lasting strength safely.",
        rating: 4.7,
        sessionsGiven: 267,
      },
      rating: 4.7,
      totalReviews: 98,
      description: "Master the fundamentals of strength training with proper form and technique. Learn essential compound movements like squats, deadlifts, and presses in a supportive environment perfect for beginners.",
      duration: 50,
      difficulty: "Beginner" as const,
      location: {
        name: "Bizqwik Westside",
        address: "456 Health Blvd, Westside District",
        image: "https://images.unsplash.com/photo-1728486145245-d4cb0c9c3470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBsb2NhdGlvbiUyMGJ1aWxkaW5nfGVufDF8fHx8MTc2MTk0ODYyN3ww&ixlib=rb-4.1.0&q=80&w=1080",
      },
      timeSlots: [
        { id: "3a", time: "9:00 AM", date: "Tomorrow, Nov 1", spotsLeft: 10 },
        { id: "3b", time: "4:00 PM", date: "Tomorrow, Nov 1", spotsLeft: 7 },
        { id: "3c", time: "9:00 AM", date: "Sat, Nov 2", spotsLeft: 9 },
      ],
      tags: ["Strength", "Beginner"],
      pointsEarned: 120,
      capacity: 10,
    },
    "4": {
      id: "4",
      title: "Meditation & Mindfulness",
      instructor: {
        name: "David Park",
        photo: "https://images.unsplash.com/photo-1758875568932-0eefd3e60090?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYxODk3Nzc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        bio: "David is a certified meditation teacher and mindfulness coach. His calming presence and guided practices help you find inner peace and mental clarity.",
        rating: 4.9,
        sessionsGiven: 512,
      },
      rating: 4.9,
      totalReviews: 187,
      description: "Find inner peace and reduce stress through guided meditation practices. This session includes breathing exercises, body scans, and visualization techniques suitable for all levels.",
      duration: 30,
      difficulty: "Beginner" as const,
      location: {
        name: "Bizqwik Wellness Center",
        address: "789 Zen Plaza, Uptown",
        image: "https://images.unsplash.com/photo-1671970922029-0430d2ae122c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwc3R1ZGlvJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxOTQ4NjI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      timeSlots: [
        { id: "4a", time: "6:30 AM", date: "Tomorrow, Nov 1", spotsLeft: 15 },
        { id: "4b", time: "8:00 PM", date: "Tomorrow, Nov 1", spotsLeft: 12 },
        { id: "4c", time: "6:30 AM", date: "Sat, Nov 2", spotsLeft: 14 },
      ],
      tags: ["Morning", "Wellness", "All Levels"],
      pointsEarned: 100,
      capacity: 20,
    },
  };

  const selectedSession = selectedSessionId ? sessionData[selectedSessionId as keyof typeof sessionData] : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Container - max width for mobile devices */}
      <div className="mx-auto max-w-[430px] min-h-screen bg-white shadow-lg">
        {step === "intro" && (
          <IntroScreen
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
            onComplete={handleIntroComplete}
          />
        )}

        {step === "login" && (
          <LoginScreen onLogin={handleLogin} />
        )}

        {step === "preferences" && (
          <PreferenceSetup onComplete={handlePreferencesComplete} />
        )}

        {step === "complete" && (
          <div className="min-h-screen flex items-center justify-center px-6">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--bq-primary)] to-[var(--bq-accent)] flex items-center justify-center mx-auto shadow-[var(--glow-primary)]">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="font-display text-[28px] text-[var(--bq-text-primary)] mb-2">
                  You're all set! 🎉
                </h1>
                <p className="text-[var(--bq-text-secondary)] max-w-sm mx-auto">
                  Welcome to Bizqwik. Let's start your fitness journey.
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <div className="p-4 bg-[var(--bq-neutral)] rounded-[1.25rem] text-left">
                  <div className="text-sm text-[var(--bq-text-secondary)] mb-1">Branch</div>
                  <div className="text-[var(--bq-text-primary)]">{userData.preferences?.branch}</div>
                </div>
                <div className="p-4 bg-[var(--bq-neutral)] rounded-[1.25rem] text-left">
                  <div className="text-sm text-[var(--bq-text-secondary)] mb-1">Classes</div>
                  <div className="text-[var(--bq-text-primary)]">
                    {userData.preferences?.classTypes.join(", ")}
                  </div>
                </div>
                <div className="p-4 bg-[var(--bq-neutral)] rounded-[1.25rem] text-left">
                  <div className="text-sm text-[var(--bq-text-secondary)] mb-1">Language</div>
                  <div className="text-[var(--bq-text-primary)]">{userData.preferences?.language}</div>
                </div>
              </div>
              <button
                onClick={() => setStep("home")}
                className="w-full h-14 bg-[var(--bq-primary)] text-white rounded-[1.25rem] transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] shadow-[var(--glow-primary)] mt-6 flex items-center justify-center"
              >
                Explore Classes
              </button>
            </div>
          </div>
        )}

        {step === "home" && (
          <HomeScreen 
            userName="Karim" 
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
            onBack={previousStep === "profile" ? () => {
              setPreviousStep(null);
              setStep("profile");
            } : undefined}
          />
        )}

        {step === "membership" && (
          <MembershipScreen 
            onNotificationsClick={handleNotificationsClick}
            notificationCount={notificationCount}
          />
        )}

        {step === "rewards" && (
          <RewardsScreen 
            onNotificationsClick={handleNotificationsClick}
            notificationCount={notificationCount}
            onBack={previousStep === "profile" ? () => {
              setPreviousStep(null);
              setStep("profile");
            } : undefined}
          />
        )}

        {step === "notifications" && (
          <NotificationsScreen 
            onClose={() => setStep("home")}
            onNotificationAction={handleNotificationAction}
          />
        )}

        {step === "profile" && (
          <ProfileScreen 
            onNotificationsClick={handleNotificationsClick}
            notificationCount={notificationCount}
            onLogout={handleLogout}
            onPersonalInfoClick={() => setStep("personal-info")}
            onLinkedGymsClick={() => setStep("linked-gyms")}
            onPaymentMethodsClick={() => setStep("payment-methods")}
            onMembershipClick={() => setStep("membership")}
            onWalletClick={() => {
              setPreviousStep("profile");
              setStep("wallet");
            }}
            onRewardsClick={() => {
              setPreviousStep("profile");
              setStep("rewards");
            }}
            onSupportClick={() => setStep("support")}
          />
        )}

        {step === "personal-info" && (
          <PersonalInfoScreen 
            onBack={() => setStep("profile")}
            onSave={(data) => {
              console.log("Personal info saved:", data);
              setStep("profile");
            }}
          />
        )}

        {step === "linked-gyms" && (
          <LinkedGymsScreen 
            onBack={() => setStep("profile")}
          />
        )}

        {step === "payment-methods" && (
          <PaymentMethodsScreen 
            onBack={() => setStep("profile")}
          />
        )}

        {step === "support" && (
          <SupportScreen 
            onBack={() => setStep("profile")}
          />
        )}

        {step === "session-details" && selectedSession && (
          <SessionDetailsScreen
            session={selectedSession}
            onBack={handleBackToHome}
            onBook={handleBookSession}
          />
        )}

        {step === "booking-confirm" && selectedSession && selectedSlot && (
          <BookingConfirmScreen
            session={{
              id: selectedSession.id,
              title: selectedSession.title,
              instructor: selectedSession.instructor,
              duration: selectedSession.duration,
              location: selectedSession.location,
              pointsEarned: selectedSession.pointsEarned,
            }}
            selectedSlot={selectedSlot}
            onBack={handleBackToDetails}
            onConfirm={handleConfirmBooking}
          />
        )}

        {step === "booking-success" && selectedSession && selectedSlot && (
          <BookingSuccessScreen
            session={{
              id: selectedSession.id,
              title: selectedSession.title,
              instructor: selectedSession.instructor,
              duration: selectedSession.duration,
              location: selectedSession.location,
              pointsEarned: selectedSession.pointsEarned,
            }}
            selectedSlot={selectedSlot}
            paymentMethod={paymentMethod}
            onDone={handleBookingComplete}
          />
        )}
        
        {/* Bottom Navigation */}
        {showBottomNav && (
          <BottomNav 
            active={(["home", "bookings", "profile"].includes(step) ? step : "profile") as NavItem} 
            onNavigate={handleNavigation}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
}

export default App;
