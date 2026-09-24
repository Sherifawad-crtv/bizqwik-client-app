import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "./supabase";
import { api, type ClientAccount } from "./api";

interface AuthState {
  ready: boolean; // initial session check done
  client: ClientAccount | null;
  // True while the member is in a password-recovery flow (arrived via the
  // email reset link). The app shows a "set a new password" screen until it
  // clears, regardless of whether a client record has loaded.
  recovering: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  activate: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState>({
  ready: false,
  client: null,
  recovering: false,
  signIn: async () => {},
  activate: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(Ctx);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [client, setClient] = useState<ClientAccount | null>(null);
  const [recovering, setRecovering] = useState(false);

  const loadClient = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setClient(null);
      return;
    }
    try {
      const me = await api.me();
      setClient(me.client ?? null);
    } catch {
      setClient(null);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    loadClient().finally(() => {
      if (alive) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      // Arriving via the email reset link: hold the app on the new-password
      // screen instead of dropping the member straight into a session.
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      loadClient();
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [loadClient]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw new Error(error.message);
      await loadClient();
    },
    [loadClient],
  );

  // First-time activation: the front desk invited this member (created a
  // client_invitation for their email); signup creates the auth user with the
  // chosen password and links the client row, then we sign in.
  const activate = useCallback(
    async (name: string, email: string, password: string) => {
      await api.signup(name, email, password);
      await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      await loadClient();
    },
    [loadClient],
  );

  // Send the reset email. The link returns to this same origin (the gym's
  // subdomain), where detectSessionInUrl fires PASSWORD_RECOVERY on load.
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: window.location.origin });
    if (error) throw new Error(error.message);
  }, []);

  const updatePassword = useCallback(
    async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      setRecovering(false);
      await loadClient();
    },
    [loadClient],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setClient(null);
    setRecovering(false);
  }, []);

  return <Ctx.Provider value={{ ready, client, recovering, signIn, activate, resetPassword, updatePassword, signOut }}>{children}</Ctx.Provider>;
}
