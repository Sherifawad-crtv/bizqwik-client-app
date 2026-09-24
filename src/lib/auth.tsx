import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "./supabase";
import { api, type ClientAccount } from "./api";

interface AuthState {
  ready: boolean; // initial session check done
  client: ClientAccount | null;
  signIn: (email: string, password: string) => Promise<void>;
  activate: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState>({
  ready: false,
  client: null,
  signIn: async () => {},
  activate: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(Ctx);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [client, setClient] = useState<ClientAccount | null>(null);

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
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
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

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setClient(null);
  }, []);

  return <Ctx.Provider value={{ ready, client, signIn, activate, signOut }}>{children}</Ctx.Provider>;
}
