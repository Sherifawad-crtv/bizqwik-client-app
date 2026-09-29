import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { HomeScreen } from "./components/bizqwik/HomeScreen";
import { BottomNav, type NavItem } from "./components/bizqwik/BottomNav";
import { Fab } from "./components/bizqwik/Fab";
import { Button } from "./components/bizqwik/Sheet";
import { useBranding } from "../lib/branding";
import { useAuth } from "../lib/auth";
import { useFeedback } from "../lib/feedback";
import { syncPushOnSignIn } from "../lib/push";
import { api, errorCode, type ApiError, type HomeData } from "../lib/api";
import { takeHome } from "../lib/homeData";

// Home is in the first download; every other screen is fetched when first
// needed (and fetched early once Home is up, so tabs still open instantly).
// The camera scanner and its QR decoder are the heaviest part of the app.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function screen<M, K extends keyof M>(load: () => Promise<M>, name: K) {
  return { load, Component: lazy(() => load().then((m) => ({ default: m[name] as unknown as ComponentType<any> }))) };
}
const screens = {
  intro: screen(() => import("./components/bizqwik/IntroScreen"), "IntroScreen"),
  auth: screen(() => import("./components/bizqwik/AuthScreen"), "AuthScreen"),
  newPassword: screen(() => import("./components/bizqwik/NewPasswordScreen"), "NewPasswordScreen"),
  schedule: screen(() => import("./components/bizqwik/ScheduleScreen"), "ScheduleScreen"),
  bookings: screen(() => import("./components/bizqwik/MyBookings"), "MyBookings"),
  wallet: screen(() => import("./components/bizqwik/WalletScreen"), "WalletScreen"),
  membership: screen(() => import("./components/bizqwik/MembershipScreen"), "MembershipScreen"),
  rewards: screen(() => import("./components/bizqwik/RewardsScreen"), "RewardsScreen"),
  profile: screen(() => import("./components/bizqwik/ProfileScreen"), "ProfileScreen"),
  notifications: screen(() => import("./components/bizqwik/NotificationsScreen"), "NotificationsScreen"),
  scanner: screen(() => import("./components/bizqwik/QRScannerScreen"), "QRScannerScreen"),
};
const IntroScreen = screens.intro.Component;
const AuthScreen = screens.auth.Component;
const NewPasswordScreen = screens.newPassword.Component;
const ScheduleScreen = screens.schedule.Component;
const MyBookings = screens.bookings.Component;
const WalletScreen = screens.wallet.Component;
const MembershipScreen = screens.membership.Component;
const RewardsScreen = screens.rewards.Component;
const ProfileScreen = screens.profile.Component;
const NotificationsScreen = screens.notifications.Component;
const QRScannerScreen = screens.scanner.Component;

function whenIdle(fn: () => void, timeout = 2500) {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (ric) ric(fn, { timeout });
  else window.setTimeout(fn, 800);
}

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
      <div data-scroll-root className="mx-auto max-w-[430px] h-full overflow-y-auto overscroll-contain bg-white shadow-lg">
        <Suspense fallback={<div className="min-h-full bg-white" />}>{children}</Suspense>
      </div>
    </div>
  );
}

function Splash() {
  return (
    <Shell>
      <div className="min-h-full flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#e5e7eb] border-t-[#1f2937] animate-spin" />
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
  // Home's data. The app shows only a loading screen until it has arrived, so
  // nothing appears and then changes.
  const [home, setHome] = useState<HomeData | null>(null);
  const [homeError, setHomeError] = useState<string | null>(null);

  const applyHome = useCallback((h: HomeData) => {
    setHome(h);
    setHomeError(null);
    setUnread(h.unreadNotifications ?? 0);
  }, []);
  const failHome = (e: unknown) => setHomeError(e instanceof Error ? e.message : "Couldn't load your home.");
  // A quiet refresh (after a booking, or coming back to Home): on failure the
  // screen keeps what it has.
  const refreshHome = useCallback(() => {
    api.home().then(applyHome).catch(() => {});
  }, [applyHome]);
  const retryHome = () => {
    setHomeError(null);
    api.home().then(applyHome).catch(failHome);
  };

  const refreshUnread = useCallback(() => {
    api.notifications().then((r) => setUnread(r.unread)).catch(() => {});
  }, []);

  // Once per signed-in member (not on every refresh of their details). Home
  // brings the unread count itself; push setup and the other screens' code
  // wait until the page has settled.
  const clientId = auth.client?.id;
  useEffect(() => {
    setHome(null);
    setHomeError(null);
    if (!clientId) return;
    let alive = true;
    takeHome()
      .then((h) => alive && applyHome(h))
      .catch((e) => alive && failHome(e));
    const fromPush = openedFromPush();
    setStep(fromPush ? "notifications" : "home");
    if (fromPush) refreshUnread();
    whenIdle(() => {
      syncPushOnSignIn();
      for (const s of Object.values(screens)) if (s !== screens.intro && s !== screens.auth && s !== screens.newPassword) void s.load();
    });
    const onVisible = () => document.visibilityState === "visible" && refreshUnread();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, refreshUnread]);

  // Coming back to Home from another tab shows fresh numbers.
  const lastStep = useRef<Step>("home");
  useEffect(() => {
    if (step === "home" && lastStep.current !== "home" && clientId) refreshHome();
    lastStep.current = step;
  }, [step, clientId, refreshHome]);

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
        {!introDone && !auth.notice ? (
          <IntroScreen currentSlide={currentSlide} onSlideChange={setCurrentSlide} onComplete={() => setIntroDone(true)} />
        ) : (
          <AuthScreen />
        )}
      </Shell>
    );
  }

  // Each gym has its own app address. A member of another gym who signs in
  // here would see their own data under this gym's name — send them home.
  if (branding.data && auth.client.orgId !== branding.data.org.id) {
    return (
      <Shell>
        <div className="min-h-full flex items-center justify-center px-8 text-center">
          <div>
            <div className="font-display text-[22px] text-[var(--bq-text-primary)] mb-2">This isn't your gym's app</div>
            <p className="text-[var(--bq-text-secondary)] text-sm mb-6">Your membership is with another gym. Open the app link your gym gave you, or sign out to use a different account here.</p>
            <Button fullWidth onClick={() => void auth.signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  if (homeError) {
    return (
      <Shell>
        <div className="min-h-full flex items-center justify-center px-8 text-center">
          <div className="w-full">
            <div className="font-display text-[22px] text-[var(--bq-text-primary)] mb-2">Couldn't load your home</div>
            <p className="text-[var(--bq-text-secondary)] text-sm mb-6">{homeError}</p>
            <Button fullWidth onClick={retryHome}>
              Try again
            </Button>
          </div>
        </div>
      </Shell>
    );
  }
  // Nothing of the app shows until Home's data is here.
  if (!home) return <Splash />;

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
          data={home}
          onReload={refreshHome}
          userName={auth.client.name.split(" ")[0]}
          onWalletClick={() => go("wallet")}
          onPointsClick={() => go("rewards")}
          onPlanClick={() => go("membership")}
          onScheduleClick={() => go("schedule")}
          onBookingsClick={() => go("bookings")}
          onCheckIn={() => setScanning(true)}
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
