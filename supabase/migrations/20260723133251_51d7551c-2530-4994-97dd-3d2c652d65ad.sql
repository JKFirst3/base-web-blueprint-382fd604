
ALTER TABLE public.preorders
  ADD COLUMN IF NOT EXISTS consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'configurator';

DROP POLICY IF EXISTS "Anyone can submit a preorder" ON public.preorders;
DROP POLICY IF EXISTS "Anyone can submit a valid preorder" ON public.preorders;
DROP POLICY IF EXISTS "Anyone can submit a catalog preorder" ON public.preorders;

CREATE POLICY "Anyone can submit a catalog preorder"
  ON public.preorders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    consent = true
    AND char_length(btrim(name)) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND position('@' IN email) > 1
    AND size = 'Standard'
    AND source = 'configurator'
    AND (
      (
        solution_id = 'arm'
        AND solution_name = 'Lavidro Arm'
        AND (
          (tier = 'core' AND price_eur = 6000)
          OR (tier = 'plus' AND price_eur = 9000)
          OR (tier = 'pro' AND price_eur = 12000)
        )
      )
      OR (
        solution_id = 'cabinet'
        AND solution_name = 'Lavidro Cabinet'
        AND (
          (tier = 'core' AND price_eur = 7500)
          OR (tier = 'plus' AND price_eur = 10500)
          OR (tier = 'pro' AND price_eur = 13500)
        )
      )
      OR (
        solution_id = 'humanoid'
        AND solution_name = 'Lavidro One'
        AND (
          (tier = 'pro' AND price_eur = 22500)
          OR (tier = 'ultimate' AND price_eur = 30000)
        )
      )
    )
    AND (
      (payment_type = 'upfront' AND monthly_eur IS NULL)
      OR (
        payment_type = 'monthly'
        AND monthly_eur = CASE price_eur
          WHEN 6000 THEN 167
          WHEN 7500 THEN 208
          WHEN 9000 THEN 250
          WHEN 10500 THEN 292
          WHEN 12000 THEN 333
          WHEN 13500 THEN 375
          WHEN 22500 THEN 625
          WHEN 30000 THEN 833
          ELSE NULL
        END
      )
    )
  );
