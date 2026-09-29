DROP POLICY "Anyone can submit a catalog preorder" ON public.preorders;
CREATE POLICY "Anyone can submit a catalog preorder" ON public.preorders
TO anon, authenticated
WITH CHECK (
  (consent = true)
  AND ((char_length(btrim(name)) >= 1) AND (char_length(btrim(name)) <= 100))
  AND ((char_length(email) >= 3) AND (char_length(email) <= 255))
  AND (POSITION(('@'::text) IN (email)) > 1)
  AND (size = 'Standard'::text)
  AND (source = ANY (ARRAY['configurator'::text, 'smoke_google_v1'::text]))
  AND (
    ((solution_id = 'mobile'::text) AND (solution_name = 'Lavidro Mobile'::text) AND (tier = 'premium'::text) AND (price_eur = 22990))
    OR ((solution_id = 'cabinet'::text) AND (solution_name = 'Lavidro Cabinet'::text) AND (tier = 'premium'::text) AND (price_eur = 20449))
    OR ((solution_id = 'one'::text) AND (solution_name = 'Lavidro One'::text) AND (tier = 'standard'::text) AND (price_eur = 8990))
  )
  AND (
    ((payment_type = 'upfront'::text) AND (monthly_eur IS NULL))
    OR ((payment_type = 'monthly'::text) AND (monthly_eur =
      CASE price_eur
        WHEN 22990 THEN 469
        WHEN 20449 THEN 390
        WHEN 8990 THEN 199
        ELSE NULL::integer
      END))
  )
);