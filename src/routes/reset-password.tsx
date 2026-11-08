import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password — ShopArena NG" },
      { name: "description", content: "Choose a new password for your ShopArena NG customer account." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Reset Password — ShopArena NG" },
      { property: "og:description", content: "Securely choose a new customer account password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [recovery, setRecovery] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    setRecovery(hash.get("type") === "recovery");
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      toast.success("Password updated. You can now sign in.");
      await navigate({ to: "/login", replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update your password. Please request a new link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell eyebrow="Account recovery" title="Choose a new password" description="Use at least eight characters and choose something you don’t use on another website.">
      {recovery === null ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Checking your reset link…</p>
      ) : recovery ? (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <div className="relative">
              <Input id="newPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={200} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl bg-background pr-12" />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirm new password</Label>
            <Input id="confirmNewPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={200} placeholder="Enter your new password again" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-12 rounded-xl bg-background" />
          </div>
          {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
          <Button type="submit" variant="premium" size="lg" disabled={busy} className="h-12 w-full rounded-xl font-extrabold">
            <KeyRound className="h-4 w-4" /> {busy ? "Updating password…" : "Update password"}
          </Button>
        </form>
      ) : (
        <div className="py-4 text-center">
          <h2 className="text-lg font-bold">This reset link isn’t available</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Open the link from your password reset email, or request a fresh link from the sign-in page.</p>
          <Button asChild variant="premium" size="lg" className="mt-6 w-full rounded-xl"><Link to="/login">Return to sign in</Link></Button>
        </div>
      )}
    </AuthShell>
  );
}
