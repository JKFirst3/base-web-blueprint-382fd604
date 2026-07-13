CREATE TABLE public.preorders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  solution_id text NOT NULL,
  solution_name text NOT NULL,
  tier text NOT NULL,
  size text NOT NULL,
  payment_type text NOT NULL,
  price_eur integer NOT NULL,
  monthly_eur integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.preorders TO anon, authenticated;
GRANT ALL ON public.preorders TO service_role;
ALTER TABLE public.preorders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a preorder" ON public.preorders FOR INSERT TO anon, authenticated WITH CHECK (
  email IS NOT NULL AND char_length(email) <= 255
  AND char_length(name) > 0 AND char_length(name) <= 100
  AND payment_type IN ('upfront','monthly')
);
CREATE POLICY "No public read of preorders" ON public.preorders AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (false);