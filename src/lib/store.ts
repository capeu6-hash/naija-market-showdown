import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LAGOS_FEES } from './delivery';
export const storeQuery = queryOptions({ queryKey: ['store-settings'], queryFn: async () => {
  const { data, error } = await supabase.from('store_settings').select('*').eq('id', 'store').maybeSingle();
  if (error) throw new Error('Unable to load store settings');
  return { shop_name: data?.shop_name ?? 'ShopArena NG', whatsapp: data?.whatsapp ?? '2348089778840', delivery_fees: (data?.delivery_fees ?? LAGOS_FEES) as Record<string, number> };
}});