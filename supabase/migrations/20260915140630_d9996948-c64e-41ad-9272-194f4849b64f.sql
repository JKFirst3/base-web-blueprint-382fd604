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
        solution_id = 'mobile'
        AND solution_name = 'Lavidro Mobile'
        AND (
          (tier = 'basic' AND price_eur = 9000)
          OR (tier = 'premium' AND price_eur = 14000)
        )
      )
      OR (
        solution_id = 'cabinet'
        AND solution_name = 'Lavidro Cabinet'
        AND (
          (tier = 'basic' AND price_eur = 12500)
          OR (tier = 'premium' AND price_eur = 21500)
        )
      )
      OR (
        solution_id = 'one'
        AND solution_name = 'Lavidro One'
        AND tier = 'standard'
        AND price_eur = 10000
      )
    )
    AND (
      (payment_type = 'upfront' AND monthly_eur IS NULL)
      OR (
        payment_type = 'monthly'
        AND monthly_eur = CASE price_eur
          WHEN 9000 THEN 270
          WHEN 14000 THEN 420
          WHEN 12500 THEN 375
          WHEN 21500 THEN 645
          WHEN 10000 THEN 300
          ELSE NULL
        END
      )
    )
  );