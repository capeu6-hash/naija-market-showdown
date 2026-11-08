import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Eye, EyeOff, LockKeyhole, MailCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { requestPasswordReset, signInCustomer, signUpCustomer } from "@/lib/auth.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In or Create an Account — ShopArena NG" },
      { name: "description", content: "Sign in to your ShopArena NG customer account or create an account for faster checkout and order updates." },
      { property: "og:title", content: "Customer Sign In — ShopArena NG" },
      { property: "og:description", content: "Access your secure ShopArena NG customer account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

type Mode = "sign-in" | "sign-up" | "forgot";

const emptyForm = { fullName: "", email: "", phone: "", password: "", confirmPassword: "" };

function errorMessage(error: unknown) {
  if (!(error instanceof Error) || !error.message) return "Something went wrong. Please try again.";
  try {
    const parsed = JSON.parse(error.message) as { message?: string }[];
    if (Array.isArray(parsed) && parsed[0]?.message) return parsed[0].message;
  } catch {
    // Server errors that are not validation lists already have readable messages.
  }
  return error.message;
}

function LoginPage() {
  const navigate = useNavigate();
  const signIn = useServerFn(signInCustomer);
  const signUp = useServerFn(signUpCustomer);
  const resetPassword = useServerFn(requestPasswordReset);
  const [mode, setMode] = useState<Mode>("sign-in");
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState<"signup" | "reset" | null>(null);

  const update = (key: keyof typeof emptyForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const changeMode = (next: Mode) => {
    setMode(next);
    setError("");
    setEmailSent(null);
    setShowPassword(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "sign-in") {
        const result = await signIn({ data: { email: form.email, password: form.password } });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
        if (sessionError) throw sessionError;
        toast.success("Welcome back to ShopArena NG");
        await navigate({ to: "/" });
      } else if (mode === "sign-up") {
        const result = await signUp({ data: form });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setEmailSent("signup");
      } else {
        await resetPassword({ data: { email: form.email } });
        setEmailSent("reset");
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const shell = mode === "forgot"
    ? { eyebrow: "Account recovery", title: "Reset your password", description: "Enter your account email and we’ll send you a secure reset link." }
    : { eyebrow: "Customer account", title: mode === "sign-up" ? "Create your account" : "Welcome back", description: mode === "sign-up" ? "Join ShopArena NG for a smoother shopping experience." : "Sign in to continue shopping and manage your orders." };

  return (
    <AuthShell {...shell}>
      {emailSent ? (
        <div className="py-4 text-center" role="status">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft text-primary">
            <MailCheck className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-xl font-bold">Check your email</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            {emailSent === "signup"
              ? <>We sent a confirmation link to <strong className="text-foreground">{form.email}</strong>. Confirm your email, then return here to sign in.</>
              : <>If an account exists for <strong className="text-foreground">{form.email}</strong>, a password reset link is on its way.</>}
          </p>
          <Button type="button" variant="premium" size="lg" className="mt-6 w-full rounded-xl" onClick={() => changeMode("sign-in")}>
            Back to sign in
          </Button>
        </div>
      ) : (
        <>
          {mode !== "forgot" && (
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-secondary p-1" role="tablist" aria-label="Account options">
              <button type="button" role="tab" aria-selected={mode === "sign-in"} onClick={() => changeMode("sign-in")} className={`rounded-lg py-2.5 text-sm font-bold transition-all ${mode === "sign-in" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                Sign in
              </button>
              <button type="button" role="tab" aria-selected={mode === "sign-up"} onClick={() => changeMode("sign-up")} className={`rounded-lg py-2.5 text-sm font-bold transition-all ${mode === "sign-up" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                Create account
              </button>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === "sign-up" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" autoComplete="name" required minLength={2} maxLength={120} placeholder="Your full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="h-12 rounded-xl bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" type="tel" autoComplete="tel" required pattern="\+234[0-9]{10}" placeholder="+2348012345678" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-12 rounded-xl bg-background" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-12 rounded-xl bg-background" />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "sign-in" && <button type="button" onClick={() => changeMode("forgot")} className="text-xs font-semibold text-primary hover:underline">Forgot password?</button>}
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "sign-up" ? "new-password" : "current-password"} required minLength={mode === "sign-up" ? 8 : 1} maxLength={200} placeholder={mode === "sign-up" ? "At least 8 characters" : "Enter your password"} value={form.password} onChange={(e) => update("password", e.target.value)} className="h-12 rounded-xl bg-background pr-12" />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            {mode === "sign-up" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={200} placeholder="Enter your password again" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className="h-12 rounded-xl bg-background" />
              </div>
            )}

            {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}

            <Button type="submit" variant="premium" size="lg" disabled={busy} className="h-12 w-full rounded-xl text-sm font-extrabold">
              {busy ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Please wait…</span> : mode === "sign-in" ? "Sign in securely" : mode === "sign-up" ? "Create my account" : "Send reset link"}
            </Button>
            {mode === "sign-up" && <p className="text-center text-xs leading-5 text-muted-foreground">By creating an account, you agree to use ShopArena NG responsibly and keep your login details secure.</p>}
            {mode === "forgot" && <Button type="button" variant="ghost" className="w-full" onClick={() => changeMode("sign-in")}>Back to sign in</Button>}
          </form>

          {mode === "sign-in" && (
            <div className="mt-5 flex items-center justify-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
              <LockKeyhole className="h-3.5 w-3.5" /> Five failed attempts temporarily lock your login.
            </div>
          )}
        </>
      )}
    </AuthShell>
  );
}
