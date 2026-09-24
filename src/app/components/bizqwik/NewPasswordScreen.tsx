import { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../../../lib/auth";
import { useBranding } from "../../../lib/branding";

// Shown after a member follows the password-reset link from their email
// (auth is in PASSWORD_RECOVERY). They set a new password, then land in the app.
export function NewPasswordScreen() {
  const { updatePassword, signOut } = useAuth();
  const { data } = useBranding();
  const appName = data?.branding.appName ?? "Bizqwik";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      // On success the auth provider clears recovery + loads the client, and
      // App swaps to the signed-in experience — nothing more to do here.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update your password.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-16 pb-10">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="font-display text-[32px] leading-tight tracking-tight text-[var(--bq-text-primary)] mb-2">Set a new password</h1>
        <p className="text-[var(--bq-text-secondary)]">Choose a new password for your {appName} account.</p>
      </motion.div>

      <form onSubmit={submit} className="mt-10 flex flex-col gap-4">
        <Field label="New password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="new-password" />
        <Field label="Confirm password" value={confirm} onChange={setConfirm} placeholder="••••••••" autoComplete="new-password" />

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
          {busy ? "Saving…" : "Save password"}
        </button>
      </form>

      <button onClick={signOut} className="mt-6 text-[var(--bq-text-secondary)] text-sm mx-auto">
        Back to sign in
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, autoComplete }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; autoComplete?: string }) {
  return (
    <label className="block">
      <span className="text-sm text-[var(--bq-text-secondary)] mb-1.5 block">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-14 px-4 rounded-[1.25rem] bg-[var(--bq-neutral)] border border-transparent focus:border-[var(--bq-primary)] outline-none text-[var(--bq-text-primary)] transition-colors"
      />
    </label>
  );
}
