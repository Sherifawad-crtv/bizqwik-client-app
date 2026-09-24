import { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../../../lib/auth";
import { useBranding } from "../../../lib/branding";

// Branded sign-in / first-time activation. Members are invited by the gym's
// front desk (which sets their email); here they either sign in or, the first
// time, set their password. Email + password only — matches the backend's
// invite-driven auth (no phone/QR auth in v1).
export function AuthScreen() {
  const { signIn, activate } = useAuth();
  const { data } = useBranding();
  const appName = data?.branding.appName ?? "Bizqwik";
  const logo = data?.branding.logoUrl ?? null;

  const [mode, setMode] = useState<"signin" | "activate">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (mode === "activate" && !name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "activate") await activate(name.trim(), email, password);
      else await signIn(email, password);
      // On success the auth provider flips to a client session and App renders
      // the app — nothing more to do here.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-16 pb-10">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {logo ? (
          <img src={logo} alt={appName} className="w-16 h-16 rounded-[1.25rem] object-cover mb-6 shadow-[var(--glow-primary)]" />
        ) : (
          <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-[var(--bq-primary)] to-[var(--bq-accent)] flex items-center justify-center mb-6 shadow-[var(--glow-primary)]">
            <span className="text-white text-2xl">{appName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <h1 className="font-display text-[32px] leading-tight tracking-tight text-[var(--bq-text-primary)] mb-2">
          {mode === "signin" ? "Welcome back" : "Set up your account"}
        </h1>
        <p className="text-[var(--bq-text-secondary)]">
          {mode === "signin" ? `Sign in to ${appName}` : "First time? Create your password to get started."}
        </p>
      </motion.div>

      <form onSubmit={submit} className="mt-10 flex flex-col gap-4">
        {mode === "activate" && (
          <Field label="Full name" value={name} onChange={setName} placeholder="Your name" autoComplete="name" />
        )}
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete={mode === "signin" ? "current-password" : "new-password"} />

        {error && (
          <div className="text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="h-14 bg-[var(--bq-primary)] text-white rounded-[1.25rem] transition-all duration-200 hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] shadow-[var(--glow-primary)] disabled:opacity-50 flex items-center justify-center"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode((m) => (m === "signin" ? "activate" : "signin"));
          setError(null);
        }}
        className="mt-6 text-[var(--bq-text-secondary)] text-sm mx-auto"
      >
        {mode === "signin" ? "First time here? Set up your account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-[var(--bq-text-secondary)] mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-14 px-4 rounded-[1.25rem] bg-[var(--bq-neutral)] border border-transparent focus:border-[var(--bq-primary)] outline-none text-[var(--bq-text-primary)] transition-colors"
      />
    </label>
  );
}
