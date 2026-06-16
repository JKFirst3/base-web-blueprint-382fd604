REVOKE SELECT ON public.leads FROM anon, authenticated;

CREATE POLICY "No public read access to leads"
  ON public.leads
  AS RESTRICTIVE
  FOR SELECT
  TO anon, authenticated
  USING (false);