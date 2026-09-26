import { AnimatePresence, motion } from "motion/react";
import { useBranding } from "../../../lib/branding";
import { SUPABASE_URL } from "../../../lib/config";

interface IntroSlide {
  title: string;
  description: string;
  image: string;
}

// Bizqwik's default onboarding photos, hosted in our own Storage so they never
// change or disappear. Every gym uses them until ops uploads its own
// onboarding images (those replace them slide by slide).
const DEFAULT_IMAGE = (n: number) => `${SUPABASE_URL}/storage/v1/object/public/app-assets/onboarding/${n}.jpg`;

// The first slide is branded per gym ("Welcome to Solid").
const slides: IntroSlide[] = [
  {
    title: "Welcome",
    description: "Your training, all in one place. Book classes, check in, and track every session.",
    image: DEFAULT_IMAGE(1),
  },
  {
    title: "Discover Classes",
    description: "See what's on this week and save your spot in a tap.",
    image: DEFAULT_IMAGE(2),
  },
  {
    title: "Earn & Redeem",
    description: "Earn points every time you show up, and turn them into credit.",
    image: DEFAULT_IMAGE(3),
  },
];

interface IntroScreenProps {
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onComplete: () => void;
}

export function IntroScreen({ currentSlide, onSlideChange, onComplete }: IntroScreenProps) {
  const { data } = useBranding();
  const gymName = data?.branding.appName ?? data?.org.name ?? null;
  const assets = data?.branding.onboardingAssets ?? [];
  const custom = !!assets[currentSlide];
  const base = slides[currentSlide];
  const slide = {
    ...base,
    title: currentSlide === 0 ? (gymName ? `Welcome to ${gymName}` : "Welcome") : base.title,
    image: assets[currentSlide] || base.image,
  };
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) onComplete();
    else onSlideChange(currentSlide + 1);
  };

  return (
    <div className="relative h-full min-h-full overflow-hidden bg-black text-white">
      {/* Full-bleed photo. Our defaults share one look (black & white, tinted
          with the gym's color); a gym's own images are shown as uploaded. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.image}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            aria-hidden
            className={`absolute inset-0 w-full h-full object-cover ${custom ? "" : "grayscale contrast-[1.05]"}`}
          />
          {!custom && <div className="absolute inset-0 bg-[var(--bq-primary)] mix-blend-multiply opacity-30" />}
        </motion.div>
      </AnimatePresence>

      {/* Legibility: dark at the top for Skip, and a deep fade under the text. */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black via-black/80 to-transparent" />

      <div className="absolute top-0 right-0 z-10 px-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <button onClick={onComplete} className="text-white/85 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm active:scale-95 transition-transform">
          Skip
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-6 space-y-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 28px)" }}>
        <motion.div
          key={`content-${currentSlide}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className="font-display text-[32px] leading-[1.1] tracking-tight text-white">{slide.title}</h1>
          <p className="text-white/75 text-[15px] leading-relaxed max-w-sm">{slide.description}</p>
        </motion.div>

        <div className="flex gap-2" role="tablist" aria-label="Onboarding slides">
          {slides.map((_, index) => (
            <button key={index} role="tab" aria-selected={index === currentSlide} aria-label={`Slide ${index + 1}`} onClick={() => onSlideChange(index)} className="py-2">
              <div className={`h-1.5 rounded-full transition-all duration-[var(--transition-base)] ${index === currentSlide ? "w-7 bg-white" : "w-3 bg-white/35"}`} />
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full h-14 bg-[var(--bq-primary)] text-[var(--bq-on-primary)] rounded-[1.25rem] transition-transform active:scale-[0.98] shadow-[var(--glow-primary)] flex items-center justify-center"
        >
          {isLastSlide ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
}
