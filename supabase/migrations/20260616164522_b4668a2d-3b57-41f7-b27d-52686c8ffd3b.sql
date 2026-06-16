DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND consent = TRUE
    AND char_length(email) <= 255
    AND char_length(coalesce(name, '')) <= 100
    AND char_length(coalesce(pain_point, '')) <= 100
  );