import { useState } from "react";
import { motion } from "motion/react";
import { Check, MapPin, Dumbbell, Globe, ChevronRight } from "lucide-react";

interface PreferenceSetupProps {
  onComplete: (preferences: UserPreferences) => void;
}

export interface UserPreferences {
  branch: string;
  classTypes: string[];
  language: string;
}

const branches = [
  { id: "downtown", name: "Downtown Studio", address: "123 Main St" },
  { id: "uptown", name: "Uptown Fitness", address: "456 Park Ave" },
  { id: "westside", name: "Westside Wellness", address: "789 Beach Rd" },
];

const classTypes = [
  { id: "yoga", name: "Yoga", icon: "🧘" },
  { id: "hiit", name: "HIIT", icon: "🔥" },
  { id: "strength", name: "Strength", icon: "💪" },
  { id: "cycling", name: "Cycling", icon: "🚴" },
  { id: "boxing", name: "Boxing", icon: "🥊" },
  { id: "pilates", name: "Pilates", icon: "🤸" },
];

const languages = [
  { id: "en", name: "English", flag: "🇬🇧" },
  { id: "es", name: "Español", flag: "🇪🇸" },
  { id: "ar", name: "العربية", flag: "🇦🇪" },
];

export function PreferenceSetup({ onComplete }: PreferenceSetupProps) {
  const [step, setStep] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleNext = () => {
    if (step === 3) {
      onComplete({
        branch: selectedBranch,
        classTypes: selectedClasses,
        language: selectedLanguage,
      });
    } else {
      setStep(step + 1);
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedBranch !== "";
    if (step === 2) return selectedClasses.length > 0;
    if (step === 3) return selectedLanguage !== "";
    return false;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-[1rem] bg-[var(--bq-primary)]/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[var(--bq-primary)]" />
              </div>
              <h2 className="font-display text-2xl text-[var(--bq-text-primary)] mb-2">
                Choose your gym
              </h2>
              <p className="text-[var(--bq-text-secondary)]">
                Select your preferred branch location
              </p>
            </div>

            <div className="space-y-3">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch.id)}
                  className={`w-full p-4 rounded-[1.25rem] border-2 transition-all duration-[var(--transition-base)] text-left active:scale-[0.98] ${
                    selectedBranch === branch.id
                      ? "border-[var(--bq-primary)] bg-[var(--bq-primary)]/5"
                      : "border-[var(--bq-neutral-dark)] bg-white"
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[var(--bq-text-primary)] mb-1">
                        {branch.name}
                      </div>
                      <div className="text-sm text-[var(--bq-text-secondary)]">
                        {branch.address}
                      </div>
                    </div>
                    {selectedBranch === branch.id && (
                      <div className="w-6 h-6 rounded-full bg-[var(--bq-primary)] flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-[1rem] bg-[var(--bq-accent)]/10 flex items-center justify-center mb-4">
                <Dumbbell className="w-6 h-6 text-[var(--bq-accent)]" />
              </div>
              <h2 className="font-display text-2xl text-[var(--bq-text-primary)] mb-2">
                What interests you?
              </h2>
              <p className="text-[var(--bq-text-secondary)]">
                Select your favorite class types
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {classTypes.map((classType) => (
                <button
                  key={classType.id}
                  onClick={() => toggleClass(classType.id)}
                  className={`p-4 rounded-[1.25rem] border-2 transition-all duration-[var(--transition-base)] active:scale-[0.98] ${
                    selectedClasses.includes(classType.id)
                      ? "border-[var(--bq-primary)] bg-[var(--bq-primary)]/5"
                      : "border-[var(--bq-neutral-dark)] bg-white"
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  <div className="text-3xl mb-2">{classType.icon}</div>
                  <div className="text-[var(--bq-text-primary)]">
                    {classType.name}
                  </div>
                  {selectedClasses.includes(classType.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--bq-primary)] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-[1rem] bg-[var(--bq-primary)]/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-[var(--bq-primary)]" />
              </div>
              <h2 className="font-display text-2xl text-[var(--bq-text-primary)] mb-2">
                Choose language
              </h2>
              <p className="text-[var(--bq-text-secondary)]">
                Select your preferred language
              </p>
            </div>

            <div className="space-y-3">
              {languages.map((language) => (
                <button
                  key={language.id}
                  onClick={() => setSelectedLanguage(language.id)}
                  className={`w-full p-4 rounded-[1.25rem] border-2 transition-all duration-[var(--transition-base)] text-left active:scale-[0.98] ${
                    selectedLanguage === language.id
                      ? "border-[var(--bq-primary)] bg-[var(--bq-primary)]/5"
                      : "border-[var(--bq-neutral-dark)] bg-white"
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{language.flag}</span>
                      <span className="text-[var(--bq-text-primary)]">
                        {language.name}
                      </span>
                    </div>
                    {selectedLanguage === language.id && (
                      <div className="w-6 h-6 rounded-full bg-[var(--bq-primary)] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all duration-[var(--transition-base)] ${
                s <= step ? "bg-[var(--bq-primary)]" : "bg-[var(--bq-neutral-dark)]"
              }`}
            />
          ))}
        </div>
        <div className="mt-4 font-mono text-sm text-[var(--bq-text-secondary)]">
          Step {step} of 3
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {renderStep()}
      </div>

      {/* Bottom Actions */}
      <div className="px-6 pb-8 space-y-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full h-14 bg-[var(--bq-secondary)] text-[var(--bq-text-primary)] rounded-[1.25rem] transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-neutral-dark)] active:scale-[0.98] flex items-center justify-center"
            style={{ minHeight: '48px' }}
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full h-14 bg-[var(--bq-primary)] text-white rounded-[1.25rem] transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--glow-primary)] flex items-center justify-center gap-2"
          style={{ minHeight: '48px' }}
        >
          <span>{step === 3 ? "Complete Setup" : "Continue"}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
