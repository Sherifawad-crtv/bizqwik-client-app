import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface IntroSlide {
  title: string;
  description: string;
  image: string;
}

const slides: IntroSlide[] = [
  {
    title: "Welcome to Bizqwik",
    description: "Your premium fitness journey starts here. Book classes, track progress, and earn rewards.",
    image: "https://images.unsplash.com/photo-1744551472726-24a3eb12e82a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwZ3ltJTIwbW9kZXJufGVufDF8fHx8MTc2MTg3NDM0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Discover Classes",
    description: "Explore yoga, HIIT, strength training and more. Find what moves you.",
    image: "https://images.unsplash.com/photo-1645652367526-a0ecb717650a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWVkaXRhdGlvbiUyMHdlbGxuZXNzfGVufDF8fHx8MTc2MTkwMjQ1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Earn & Redeem",
    description: "Get loyalty points with every session. Unlock exclusive perks and rewards.",
    image: "https://images.unsplash.com/photo-1758691737138-7b9b1884b1db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBjZWxlYnJhdGluZyUyMHN1Y2Nlc3N8ZW58MXx8fHwxNzYxODkzMzI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

interface IntroScreenProps {
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onComplete: () => void;
}

export function IntroScreen({ currentSlide, onSlideChange, onComplete }: IntroScreenProps) {
  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      onSlideChange(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bq-neutral)] to-white flex flex-col">
      {/* Skip Button */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-12 flex justify-end">
        <button
          onClick={handleSkip}
          className="text-[var(--bq-text-secondary)] px-4 py-2 rounded-full transition-all duration-[var(--transition-fast)] hover:bg-white/50 active:scale-95"
        >
          Skip
        </button>
      </div>

      {/* Image Section */}
      <div className="flex-1 flex items-center justify-center pt-20 pb-8 px-4">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-[280px] aspect-square"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--bq-primary)]/20 to-[var(--bq-accent)]/20 rounded-[2rem] blur-2xl" />
          <ImageWithFallback
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover rounded-[2rem] relative z-10"
          />
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-12 space-y-6">
        <motion.div
          key={`content-${currentSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center space-y-3"
        >
          <h1 className="font-display text-[28px] leading-tight tracking-tight text-[var(--bq-text-primary)]">
            {slide.title}
          </h1>
          <p className="text-[var(--bq-text-secondary)] max-w-sm mx-auto leading-relaxed">
            {slide.description}
          </p>
        </motion.div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => onSlideChange(index)}
              className="transition-all duration-[var(--transition-base)]"
            >
              <div
                className={`h-2 rounded-full transition-all duration-[var(--transition-base)] ${
                  index === currentSlide
                    ? "w-6 bg-[var(--bq-primary)]"
                    : "w-2 bg-[var(--bq-neutral-dark)]"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Next/Get Started Button */}
        <button
          onClick={handleNext}
          className="w-full h-14 bg-[var(--bq-primary)] text-white rounded-[1.25rem] transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] shadow-[var(--glow-primary)] flex items-center justify-center"
          style={{ minHeight: '48px' }}
        >
          {isLastSlide ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
}
