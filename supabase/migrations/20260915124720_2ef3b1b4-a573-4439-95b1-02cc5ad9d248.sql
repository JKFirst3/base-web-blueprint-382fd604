CREATE POLICY "No public access to analytics events"
ON public.analytics_events
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);