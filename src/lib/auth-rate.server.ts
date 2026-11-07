import { getRequestIP } from "@tanstack/react-start/server";
import { loginLockAfterFailure } from "./auth-shared";

async function key(scope: string, email: string) {
  const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
  const data = new TextEncoder().encode(`${scope}:${email.trim().toLowerCase()}:${ip}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function assertLoginAllowed(scope: string, email: string): Promise<void> {
  const attemptKey = await key(scope, email);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("login_attempts").select("locked_until").eq("attempt_key", attemptKey).maybeSingle();
  if (data?.locked_until && new Date(data.locked_until).getTime() > Date.now()) {
    const minutes = Math.max(1, Math.ceil((new Date(data.locked_until).getTime() - Date.now()) / 60_000));
    throw new Error(`Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }
}

export async function recordLoginFailure(scope: string, email: string): Promise<void> {
  const attemptKey = await key(scope, email);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("login_attempts").select("failures").eq("attempt_key", attemptKey).maybeSingle();
  const next = loginLockAfterFailure(data?.failures ?? 0);
  await supabaseAdmin.from("login_attempts").upsert({
    attempt_key: attemptKey,
    failures: next.failures,
    locked_until: next.lockedUntil?.toISOString() ?? null,
    updated_at: new Date().toISOString(),
  });
}

export async function clearLoginFailures(scope: string, email: string): Promise<void> {
  const attemptKey = await key(scope, email);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("login_attempts").delete().eq("attempt_key", attemptKey);
}
