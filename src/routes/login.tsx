import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard, authBtn, authField } from "@/components/AuthCard";
import { adminLogin } from "@/lib/admin.functions";
import { ADMIN_TOKEN_KEY } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => z.object({ redirect: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Sign In — ShopArena NG" },
      { name: "description", content: "Sign in to your ShopArena NG account to order and track deliveries." },
      { property: "og:title", content: "Sign In — ShopArena NG" },
      { property: "og:description", content: "Sign in to your ShopArena NG account to order and track deliveries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const admin = useServerFn(adminLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const safe = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { toast.error("Enter email and password"); return; }
    setBusy(true);
    try {
      const a = await admin({ data: { email, password } });
      if (a.ok) {
        localStorage.setItem(ADMIN_TOKEN_KEY, a.token);
        toast.success("Welcome back, Admin");
        navigate({ to: "/admin" });
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { toast.error("Wrong email or password"); return; }
      toast.success("Welcome back!");
      navigate({ to: safe });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Sign In">
      <form onSubmit={submit} className="space-y-3">
        <input className={authField} type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={authField} type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={busy} className={authBtn}>{busy ? "Signing in…" : "Login"}</button>
      </form>
      <div className="flex justify-between text-sm">
        <Link to="/forgot-password" className="text-primary underline">Forgot Password?</Link>
        <Link to="/signup" className="text-primary underline">Don't have account? Sign Up</Link>
      </div>
    </AuthCard>
  );
}
