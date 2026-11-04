import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Signed-in customer's own orders (no profit/cost fields).
export const getMyOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_ref, status, total, delivery_fee, created_at, order_items(product_name, qty, selling_price)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
