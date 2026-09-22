import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, QrCode, ChevronRight } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface LoginScreenProps {
  onLogin: (method: "phone" | "email" | "qr", value?: string) => void;
}

type LoginMethod = "phone" | "email" | "qr";

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [method, setMethod] = useState<LoginMethod>("phone");
  const [phoneValue, setPhoneValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const value = method === "phone" ? phoneValue : emailValue;
    onLogin(method, value);
    setIsLoading(false);
  };

  const handleQRLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin("qr");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-[var(--bq-primary)] to-[var(--bq-accent)] flex items-center justify-center mb-6 shadow-[var(--glow-primary)]">
            <span className="text-white text-2xl">B</span>
          </div>
          <h1 className="font-display text-[32px] leading-tight tracking-tight text-[var(--bq-text-primary)] mb-2">
            Welcome back
          </h1>
          <p className="text-[var(--bq-text-secondary)]">
            Sign in to continue your fitness journey
          </p>
        </motion.div>
      </div>

      {/* Login Methods Tabs */}
      <div className="px-6 mb-6">
        <div className="bg-[var(--bq-secondary)] p-1 rounded-[1rem] flex gap-1">
          <button
            onClick={() => setMethod("phone")}
            className={`flex-1 h-11 rounded-[0.75rem] transition-all duration-[var(--transition-base)] flex items-center justify-center gap-2 ${
              method === "phone"
                ? "bg-white text-[var(--bq-primary)] shadow-sm"
                : "text-[var(--bq-text-secondary)]"
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Phone</span>
          </button>
          <button
            onClick={() => setMethod("email")}
            className={`flex-1 h-11 rounded-[0.75rem] transition-all duration-[var(--transition-base)] flex items-center justify-center gap-2 ${
              method === "email"
                ? "bg-white text-[var(--bq-primary)] shadow-sm"
                : "text-[var(--bq-text-secondary)]"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <motion.form
        key={method}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit}
        className="flex-1 px-6 space-y-6"
      >
        {method === "phone" ? (
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[var(--bq-text-primary)]">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phoneValue}
              onChange={(e) => setPhoneValue(e.target.value)}
              className="h-14 rounded-[1rem] bg-[var(--bq-neutral)] border-0 text-[var(--bq-text-primary)] placeholder:text-[var(--bq-text-tertiary)]"
              required
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[var(--bq-text-primary)]">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              className="h-14 rounded-[1rem] bg-[var(--bq-neutral)] border-0 text-[var(--bq-text-primary)] placeholder:text-[var(--bq-text-tertiary)]"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-[var(--bq-primary)] text-white rounded-[1.25rem] transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--glow-primary)] flex items-center justify-center gap-2"
          style={{ minHeight: '48px' }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Continue</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--bq-neutral-dark)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-[var(--bq-text-tertiary)] text-sm">or</span>
          </div>
        </div>

        {/* QR Code Login */}
        <button
          type="button"
          onClick={handleQRLogin}
          disabled={isLoading}
          className="w-full h-14 bg-[var(--bq-secondary)] text-[var(--bq-text-primary)] rounded-[1.25rem] transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-neutral-dark)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ minHeight: '48px' }}
        >
          <QrCode className="w-5 h-5" />
          <span>Scan Membership QR</span>
        </button>
      </motion.form>

      {/* Footer */}
      <div className="px-6 pb-8 pt-4">
        <p className="text-center text-sm text-[var(--bq-text-tertiary)]">
          By continuing, you agree to our{" "}
          <button className="text-[var(--bq-primary)] underline">Terms</button> and{" "}
          <button className="text-[var(--bq-primary)] underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}
