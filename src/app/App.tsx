import { useCallback, useEffect, useState } from "react";
import { IntroScreen } from "./components/bizqwik/IntroScreen";
import { AuthScreen } from "./components/bizqwik/AuthScreen";
import { NewPasswordScreen } from "./components/bizqwik/NewPasswordScreen";
import { HomeScreen } from "./components/bizqwik/HomeScreen";
import { ScheduleScreen } from "./components/bizqwik/ScheduleScreen";
import { MyBookings } from "./components/bizqwik/MyBookings";
import { WalletScreen } from "./components/bizqwik/WalletScreen";
import { MembershipScreen } from "./components/bizqwik/MembershipScreen";
import { RewardsScreen } from "./components/bizqwik/RewardsScreen";
import { ProfileScreen } from "./components/bizqwik/ProfileScreen";
import { NotificationsScreen } from "./components/bizqwik/NotificationsScreen";
import { BottomNav, type NavItem } from "./components/bizqwik/BottomNav";
import { Fab } from "./components/bizqwik/Fab";
import { QRScannerScreen } from "./components/bizqwik/QRScannerScreen";
import { useBranding } from "../lib/branding";
import { useAuth } from "../lib/auth";
import { useFeedback } from "../lib/feedback";
import { syncPushOnSignIn } from "../lib/push";
import { api, errorCode, type ApiError } from "../lib/api";

type Step = NavItem | "wallet" | "membership" | "rewards" | "notifications";
const NAV: NavItem[] = ["home", "schedule", "bookings", "profile"];

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
      <div data-scroll-root className="mx-auto max-w-[430px] h-full overflow-y-auto overscroll-contain bg-white shadow-lg">{children}</div>
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

// A tap on a push opens the app at ?open=notifications.
function openedFromPush(): boolean {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("open") !== "notifications") return false;
    url.searchParams.delete("open");
    window.history.replaceState(null, "", url.toString());
    return true;
  } catch {
    return false;
  }
}

function App() {
  const branding = useBranding();
  const auth = useAuth();
  const feedback = useFeedback();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const [step, setStep] = useState<Step>("home");
  const [previousStep, setPreviousStep] = useState<Step | null>(null);
  // Global check-in scanner — reachable from the FAB on every tab, not just
  // from inside Bookings, so a member never has to navigate to check in.
  const [scanning, setScanning] = useState(false);
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(() => {
    api.notifications().then((r) => setUnread(r.unread)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!auth.client) return;
    setStep(openedFromPush() ? "notifications" : "home");
    refreshUnread();
    syncPushOnSignIn();
    const onVisible = () => document.visibilityState === "visible" && refreshUnread();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [auth.client, refreshUnread]);

  // Every screen change starts at the top.
  useEffect(() => {
    document.querySelector("[data-scroll-root]")?.scrollTo(0, 0);
  }, [step]);

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

  const go = (next: Step) => {
    setPreviousStep(step);
    setStep(next);
  };
  const back = () => setStep(previousStep && previousStep !== step ? previousStep : "home");
  const openNotifications = () => go("notifications");
  const bell = { onNotificationsClick: openNotifications, notificationCount: unread };

  const onScan = async (code: string) => {
    setScanning(false);
    try {
      const res = await api.checkIn(code.trim());
      const p = res.plan;
      if (res.deducted && p) {
        feedback.success("Checked in 💪", `1 session used · ${p.creditsRemaining} of ${p.creditsTotal} left on ${p.name}`);
      } else {
        feedback.success("Checked in 💪", "Checked in — enjoy your session!");
      }
      refreshUnread();
    } catch (e) {
      if (errorCode(e) === "no_sessions") {
        const plan = (e as ApiError).data?.plan as { name?: string } | null | undefined;
        feedback.error(
          "No sessions left",
          <>
            {plan?.name && <span className="block text-sm text-[var(--bq-text-tertiary)] mb-1">{plan.name} · 0 sessions remaining</span>}
            {e instanceof Error ? e.message : "No sessions left."}
          </>,
          { action: { label: "See plans", onClick: () => go("membership") }, dismissLabel: "Got it" },
        );
      } else {
        feedback.error("Couldn't check you in", e instanceof Error ? e.message : "Check-in failed.");
      }
    }
  };

  const tab: NavItem = (NAV as string[]).includes(step) ? (step as NavItem) : step === "notifications" && previousStep && (NAV as string[]).includes(previousStep) ? (previousStep as NavItem) : "profile";

  return (
    <Shell>
      {step === "home" && (
        <HomeScreen
          userName={auth.client.name.split(" ")[0]}
          onWalletClick={() => go("wallet")}
          onPointsClick={() => go("rewards")}
          onPlanClick={() => go("membership")}
          onScheduleClick={() => go("schedule")}
          onBookingsClick={() => go("bookings")}
          {...bell}
        />
      )}

      {step === "schedule" && <ScheduleScreen {...bell} />}

      {step === "bookings" && <MyBookings onBrowse={() => go("schedule")} />}

      {step === "wallet" && <WalletScreen {...bell} onBack={previousStep === "profile" || previousStep === "home" ? back : undefined} />}

      {step === "membership" && <MembershipScreen {...bell} />}

      {step === "rewards" && <RewardsScreen {...bell} onBack={previousStep === "profile" || previousStep === "home" ? back : undefined} />}

      {step === "notifications" && <NotificationsScreen onBack={back} onRead={() => setUnread(0)} />}

      {step === "profile" && (
        <ProfileScreen
          {...bell}
          onLogout={auth.signOut}
          onMembershipClick={() => go("membership")}
          onWalletClick={() => go("wallet")}
          onRewardsClick={() => go("rewards")}
        />
      )}

      <div
        className="fixed left-0 right-0 bottom-0 z-30 flex items-center justify-center gap-3 px-4"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <BottomNav active={tab} onNavigate={(item: NavItem) => go(item)} />
        <Fab onClick={() => setScanning(true)} />
      </div>

      {scanning && <QRScannerScreen onClose={() => setScanning(false)} onScanSuccess={onScan} />}
    </Shell>
  );
}

export default App;
