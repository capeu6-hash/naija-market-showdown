CREATE TABLE public.bank_settings (
 id text PRIMARY KEY DEFAULT 'store' CHECK (id = 'store'),
 bank_name text NOT NULL,
 account_name text NOT NULL,
 account_number text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bank_settings TO anon, authenticated;
GRANT ALL ON public.bank_settings TO service_role;
ALTER TABLE public.bank_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public bank transfer details" ON public.bank_settings FOR SELECT TO anon, authenticated USING (true);
ALTER TABLE public.product_private ADD COLUMN cost_confirmed boolean NOT NULL DEFAULT true;