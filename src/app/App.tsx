import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IntroScreen } from "./components/bizqwik/IntroScreen";
import { AuthScreen } from "./components/bizqwik/AuthScreen";
import { NewPasswordScreen } from "./components/bizqwik/NewPasswordScreen";
import { HomeScreen } from "./components/bizqwik/HomeScreen";
import { MyBookings } from "./components/bizqwik/MyBookings";
import { WalletScreen } from "./components/bizqwik/WalletScreen";
import { MembershipScreen } from "./components/bizqwik/MembershipScreen";
import { RewardsScreen } from "./components/bizqwik/RewardsScreen";
import { ProfileScreen } from "./components/bizqwik/ProfileScreen";
import { BottomNav } from "./components/bizqwik/BottomNav";
import { Fab } from "./components/bizqwik/Fab";
import { QRScannerScreen } from "./components/bizqwik/QRScannerScreen";
import { Toaster } from "./components/ui/sonner";
import { useBranding } from "../lib/branding";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";

type Step = "home" | "bookings" | "wallet" | "membership" | "rewards" | "profile";
type NavItem = "home" | "bookings" | "profile";

// `100svh` (small viewport height), not `100vh`/`min-h-screen` — on iOS
// Safari, `100vh` is measured against the viewport with the address bar
// collapsed, which is taller than what's actually visible when it's shown.
// That extra sliver was making the whole page scrollable/rubber-band even
// when no screen had enough content to need it. Locking the outer shell to
// `100svh` + `overflow-hidden` and making ONE inner region the scroll
// container (only it scrolls, and only when content actually overflows)
// fixes that at the root instead of screen-by-screen.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100svh] overflow-hidden bg-white">
      <div className="mx-auto max-w-[430px] h-full overflow-y-auto overscroll-contain bg-white shadow-lg">{children}</div>
      <Toaster />
    </div>
  );
}

function Splash() {
  return (
    <Shell>
      <div className="min-h-full flex items-center justify-center">
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
  const [previousStep, setPreviousStep] = useState<Step | null>(null);
  // Global check-in scanner — reachable from the FAB on every tab, not just
  // from inside Bookings, so a member never has to navigate to check in.
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (auth.client) setStep("home");
  }, [auth.client]);

  if (branding.loading || !auth.ready) return <Splash />;

  // Password recovery (member followed the reset link) wins over everything
  // else — they must set a new password before continuing.
  if (auth.recovering) {
    return (
      <Shell>
        <NewPasswordScreen />
      </Shell>
    );
  }

  if (branding.error) {
    return (
      <Shell>
        <div className="min-h-full flex items-center justify-center px-8 text-center">
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

  const backToProfile = () => { setPreviousStep(null); setStep("profile"); };

  const onScan = async (code: string) => {
    setScanning(false);
    try {
      await api.checkIn(code.trim());
      toast.success("Checked in — enjoy your session! 💪");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Check-in failed.");
    }
  };

  return (
    <Shell>
      {step === "home" && (
        <HomeScreen
          userName={auth.client.name.split(" ")[0]}
          onWalletClick={() => setStep("wallet")}
          onPointsClick={() => setStep("rewards")}
          onPlanClick={() => setStep("membership")}
          onNotificationsClick={() => {}}
          notificationCount={0}
        />
      )}

      {step === "bookings" && <MyBookings />}

      {step === "wallet" && (
        <WalletScreen onNotificationsClick={() => {}} notificationCount={0} onBack={previousStep === "profile" ? backToProfile : undefined} />
      )}

      {step === "membership" && <MembershipScreen onNotificationsClick={() => {}} notificationCount={0} />}

      {step === "rewards" && (
        <RewardsScreen onNotificationsClick={() => {}} notificationCount={0} onBack={previousStep === "profile" ? backToProfile : undefined} />
      )}

      {step === "profile" && (
        <ProfileScreen
          notificationCount={0}
          onLogout={auth.signOut}
          onMembershipClick={() => setStep("membership")}
          onWalletClick={() => { setPreviousStep("profile"); setStep("wallet"); }}
          onRewardsClick={() => { setPreviousStep("profile"); setStep("rewards"); }}
        />
      )}

      <div
        className="fixed left-0 right-0 bottom-0 z-30 flex items-center justify-center gap-3 px-4"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <BottomNav
          active={(["home", "bookings", "profile"].includes(step) ? step : "profile") as NavItem}
          onNavigate={(item: NavItem) => setStep(item)}
        />
        <Fab onClick={() => setScanning(true)} />
      </div>

      {scanning && <QRScannerScreen onClose={() => setScanning(false)} onScanSuccess={onScan} />}
    </Shell>
  );
}

export default App;
