ALTER POLICY "Anyone can submit a catalog preorder" ON public.preorders
TO anon, authenticated
WITH CHECK (
  (consent = true)
  AND ((char_length(btrim(name)) >= 1) AND (char_length(btrim(name)) <= 100))
  AND ((char_length(email) >= 3) AND (char_length(email) <= 255))
  AND (POSITION(('@'::text) IN (email)) > 1)
  AND (size = 'Standard'::text)
  AND (source = ANY (ARRAY['configurator'::text, 'smoke_google_v1'::text]))
  AND (
    ((solution_id = 'mobile'::text) AND (solution_name = 'Lavidro Mobile'::text) AND (((tier = 'basic'::text) AND (price_eur = 9000)) OR ((tier = 'premium'::text) AND (price_eur = 14000))))
    OR ((solution_id = 'cabinet'::text) AND (solution_name = 'Lavidro Cabinet'::text) AND (((tier = 'basic'::text) AND (price_eur = 12500)) OR ((tier = 'premium'::text) AND (price_eur = 21500))))
    OR ((solution_id = 'one'::text) AND (solution_name = 'Lavidro One'::text) AND (tier = 'standard'::text) AND (price_eur = 10000))
  )
  AND (
    ((payment_type = 'upfront'::text) AND (monthly_eur IS NULL))
    OR ((payment_type = 'monthly'::text) AND (monthly_eur =
      CASE price_eur
        WHEN 9000 THEN 270
        WHEN 14000 THEN 420
        WHEN 12500 THEN 375
        WHEN 21500 THEN 645
        WHEN 10000 THEN 300
        ELSE NULL::integer
      END))
  )
);