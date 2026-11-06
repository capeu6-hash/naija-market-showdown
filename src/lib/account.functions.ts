import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const accountInfo = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('user_access').select('blocked').eq('user_id', context.userId).maybeSingle();
  if (error || data?.blocked) throw new Error('Your account is blocked. Contact customer care.');
  return { id: context.userId, email: String(context.claims.email ?? '') };
});

export const myOrders = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: access, error: accessError } = await context.supabase.from('user_access').select('blocked').eq('user_id', context.userId).maybeSingle();
  if (accessError || access?.blocked) throw new Error('Your account is blocked.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.from('orders').select('id, order_ref, customer_name, address, town, region, state, country, subtotal, delivery_fee, total, status, fulfillment_status, estimated_delivery, created_at, order_items(id, product_name, qty, selling_price, image_url)').eq('user_id', context.userId).order('created_at', { ascending: false });
  if (error) throw new Error('Unable to load your orders.');
  return data ?? [];
});