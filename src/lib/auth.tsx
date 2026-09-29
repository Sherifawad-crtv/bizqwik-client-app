import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "./supabase";
import { api, type ClientAccount } from "./api";
import { startHome, dropHome } from "./homeData";

interface AuthState {
  ready: boolean; // initial session check done
  client: ClientAccount | null;
  // True while the member is in a password-recovery flow (arrived via the
  // email reset link). The app shows a "set a new password" screen until it
  // clears, regardless of whether a client record has loaded.
  recovering: boolean;
  // Set when a login that isn't a member of any gym (e.g. staff) was turned
  // away; the sign-in screen shows it.
  notice: string | null;
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
  notice: null,
  signIn: async () => {},
  activate: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(Ctx);
}

const NOT_A_MEMBER = "This app is for gym members. Staff sign in to the Bizqwik business app.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [client, setClient] = useState<ClientAccount | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inflight = useRef<Promise<ClientAccount | null | "offline"> | null>(null);

  // Keep the same object while nothing changed, so screens don't reset.
  const keep = useCallback((next: ClientAccount | null) => {
    setClient((prev) => (prev && next && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, []);

  // Asks the server who this login is ("offline" when it couldn't be reached).
  // Concurrent callers share one request.
  const loadClient = useCallback((): Promise<ClientAccount | null | "offline"> => {
    if (inflight.current) return inflight.current;
    const run = (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        keep(null);
        return null;
      }
      try {
        // Home's data is asked for alongside "who is this", not after it.
        startHome();
        const me = await api.me();
        if (!me.client) {
          // A staff or ops login: this app has nothing for it.
          dropHome();
          await supabase.auth.signOut();
          setNotice(NOT_A_MEMBER);
          keep(null);
          return null;
        }
        keep(me.client);
        return me.client;
      } catch {
        // Offline: keep whoever we already have.
        return "offline" as const;
      }
    })();
    inflight.current = run.finally(() => {
      inflight.current = null;
    });
    return inflight.current;
  }, [keep]);

  useEffect(() => {
    let alive = true;
    (async () => {
      await loadClient();
      if (alive) setReady(true);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      // Arriving via the email reset link: hold the app on the new-password
      // screen instead of dropping the member straight into a session.
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      // The first session check and hourly token refreshes change nothing
      // about who is signed in — only real sign-ins/outs reload the account.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "PASSWORD_RECOVERY") loadClient();
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [loadClient, keep]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setNotice(null);
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw new Error(error.message);
      const c = await loadClient();
      if (c === "offline") throw new Error("Couldn't reach your gym. Check your connection and try again.");
      if (!c) throw new Error(NOT_A_MEMBER);
    },
    [loadClient],
  );

  // First-time activation: the front desk invited this member (created a
  // client_invitation for their email); signup creates the auth user with the
  // chosen password and links the client row, then we sign in.
  const activate = useCallback(
    async (name: string, email: string, password: string) => {
      setNotice(null);
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
    dropHome();
    await supabase.auth.signOut();
    setClient(null);
    setRecovering(false);
  }, []);

  return <Ctx.Provider value={{ ready, client, recovering, notice, signIn, activate, resetPassword, updatePassword, signOut }}>{children}</Ctx.Provider>;
}
