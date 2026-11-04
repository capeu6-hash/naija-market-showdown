import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard, authBtn, authField } from "@/components/AuthCard";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set New Password — ShopArena NG" },
      { name: "description", content: "Choose a new password for your ShopArena NG account." },
      { property: "og:title", content: "Set New Password — ShopArena NG" },
      { property: "og:description", content: "Choose a new password for your ShopArena NG account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <AuthCard title="Set New Password">
      <form className="space-y-3" onSubmit={async (e) => {
        e.preventDefault();
        if (pw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
        if (pw !== pw2) { toast.error("Passwords do not match"); return; }
        setBusy(true);
        const { error } = await supabase.auth.updateUser({ password: pw });
        setBusy(false);
        if (error) { toast.error(error.message); return; }
        toast.success("Password updated");
        navigate({ to: "/" });
      }}>
        <input className={authField} type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <input className={authField} type="password" placeholder="Confirm new password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        <button disabled={busy} className={authBtn}>{busy ? "Saving…" : "Save password"}</button>
      </form>
    </AuthCard>
  );
}
