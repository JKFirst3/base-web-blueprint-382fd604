ALTER TABLE public.preorders
  ADD COLUMN IF NOT EXISTS consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'configurator';

DROP POLICY IF EXISTS "Anyone can submit a preorder" ON public.preorders;

CREATE POLICY "Anyone can submit a valid preorder"
  ON public.preorders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    consent = true
    AND email IS NOT NULL
    AND char_length(email) <= 255
    AND char_length(name) > 0
    AND char_length(name) <= 100
    AND solution_id IN ('arm', 'cabinet', 'humanoid')
    AND tier IN ('core', 'plus', 'pro', 'ultimate')
    AND payment_type IN ('upfront', 'monthly')
    AND price_eur BETWEEN 1 AND 100000
    AND (monthly_eur IS NULL OR monthly_eur BETWEEN 1 AND 10000)
    AND char_length(source) <= 50
  );
