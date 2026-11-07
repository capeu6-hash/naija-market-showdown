import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const credentials = z.object({ email: z.string().trim().email().max(200), password: z.string().min(1).max(200) });
const signup = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+234\d{10}$/, "Use the format +2348012345678"),
  confirmPassword: z.string().min(1).max(200),
}).refine((v) => v.password === v.confirmPassword, { message: "Passwords do not match" });

export const signUpCustomer = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof signup>) => signup.parse(d))
  .handler(async ({ data }) => {
    const { createServerAuthClient } = await import("./public-auth.server");
    const client = createServerAuthClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!);
    const origin = new URL(getRequest().url).origin;
    const { error } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName, phone: data.phone }, emailRedirectTo: `${origin}/login` },
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const signInCustomer = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof credentials>) => credentials.parse(d))
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    const { assertLoginAllowed, recordLoginFailure, clearLoginFailures } = await import("./auth-rate.server");
    await assertLoginAllowed("customer", email);
    const { createServerAuthClient } = await import("./public-auth.server");
    const client = createServerAuthClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!);
    const { data: auth, error } = await client.auth.signInWithPassword({ email, password: data.password });
    if (error || !auth.session) {
      await recordLoginFailure("customer", email);
      return { ok: false as const, error: "Invalid email or password" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: access } = await supabaseAdmin.from("user_access").select("blocked").eq("user_id", auth.user.id).maybeSingle();
    if (access?.blocked) {
      await client.auth.signOut();
      return { ok: false as const, error: "This account is blocked. Contact customer care." };
    }
    await clearLoginFailures("customer", email);
    return { ok: true as const, session: auth.session };
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) => z.object({ email: z.string().trim().email() }).parse(d))
  .handler(async ({ data }) => {
    const { createServerAuthClient } = await import("./public-auth.server");
    const client = createServerAuthClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!);
    const origin = new URL(getRequest().url).origin;
    await client.auth.resetPasswordForEmail(data.email, { redirectTo: `${origin}/reset-password` });
    return { ok: true };
  });

export const sendSupportMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; orderRef: string; message: string }) => z.object({
    name: z.string().trim().min(2).max(120), orderRef: z.string().trim().max(40), message: z.string().trim().min(5).max(2000),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("support_messages").insert({
      user_id: context.userId, customer_name: data.name, order_ref: data.orderRef || null, message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
