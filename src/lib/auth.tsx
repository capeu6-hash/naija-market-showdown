import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = { id: string; full_name: string; email: string | null; phone: string | null; address: string | null };
type AuthState = { user: User | null; profile: Profile | null; ready: boolean; refresh: () => Promise<void>; signOut: () => Promise<void> };

const Ctx = createContext<AuthState>({ user: null, profile: null, ready: false, refresh: async () => {}, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) { setProfile(null); return; }
    const { data } = await supabase.from("profiles").select("id, full_name, email, phone, address").eq("id", u.id).maybeSingle();
    setProfile(data ?? { id: u.id, full_name: (u.user_metadata?.["full_name"] as string) ?? "", email: u.email ?? null, phone: null, address: null });
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      const u = session?.user ?? null;
      setUser(u);
      setTimeout(() => { void loadProfile(u).finally(() => setReady(true)); }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      void loadProfile(data.session?.user ?? null).finally(() => setReady(true));
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const refresh = useCallback(() => loadProfile(user), [loadProfile, user]);
  const signOut = useCallback(async () => { await supabase.auth.signOut(); setUser(null); setProfile(null); }, []);

  return <Ctx.Provider value={{ user, profile, ready, refresh, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
export const ADMIN_TOKEN_KEY = "shoparena_admin";
export const firstName = (p: Profile | null, u: User | null) => (p?.full_name || u?.email || "").split(/[\s@]/)[0];
