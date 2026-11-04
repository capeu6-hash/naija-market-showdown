import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard, authBtn, authField } from "@/components/AuthCard";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — ShopArena NG" },
      { name: "description", content: "Create your ShopArena NG account to shop phones, fashion, shoes, bags and gadgets." },
      { property: "og:title", content: "Create Account — ShopArena NG" },
      { property: "og:description", content: "Create your ShopArena NG account to shop phones, fashion, shoes, bags and gadgets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().regex(/^\+?\d{10,15}$/, "Enter a valid phone / WhatsApp number"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

function SignupPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) { toast.error(r.error.issues[0]!.message); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: r.data.email, password: r.data.password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: r.data.name, phone: r.data.phone } },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (!data.session) { toast.success("Account created — check your email to confirm"); return; }
    toast.success(`Welcome, ${r.data.name.split(" ")[0]}!`);
    navigate({ to: "/" });
  };

  return (
    <AuthCard title="Create Account">
      <form onSubmit={submit} className="space-y-3">
        <input className={authField} placeholder="Full Name" autoComplete="name" value={f.name} onChange={set("name")} />
        <input className={authField} type="email" placeholder="Email" autoComplete="email" value={f.email} onChange={set("email")} />
        <input className={authField} inputMode="tel" placeholder="Phone / WhatsApp (08012345678)" value={f.phone} onChange={(e) => setF((p) => ({ ...p, phone: e.target.value.replace(/[^\d+]/g, "") }))} />
        <input className={authField} type="password" placeholder="Password (min 8 characters)" autoComplete="new-password" value={f.password} onChange={set("password")} />
        <input className={authField} type="password" placeholder="Confirm Password" autoComplete="new-password" value={f.confirm} onChange={set("confirm")} />
        <button disabled={busy} className={authBtn}>{busy ? "Creating…" : "Create Account"}</button>
      </form>
      <p className="text-center text-sm"><Link to="/login" className="text-primary underline">Already have account? Sign In</Link></p>
    </AuthCard>
  );
}
