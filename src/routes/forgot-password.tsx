import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard, authBtn, authField } from "@/components/AuthCard";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — ShopArena NG" },
      { name: "description", content: "Reset your ShopArena NG account password." },
      { property: "og:title", content: "Forgot Password — ShopArena NG" },
      { property: "og:description", content: "Reset your ShopArena NG account password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <AuthCard title="Forgot Password">
      {sent ? <p className="text-sm">If that email has an account, a reset link is on its way. Check your inbox.</p> : (
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("Enter a valid email"); return; }
          setBusy(true);
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
          setBusy(false);
          if (error) toast.error(error.message); else setSent(true);
        }}>
          <input className={authField} type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button disabled={busy} className={authBtn}>{busy ? "Sending…" : "Send reset link"}</button>
        </form>
      )}
      <p className="text-center text-sm"><Link to="/login" className="text-primary underline">Back to Sign In</Link></p>
    </AuthCard>
  );
}
