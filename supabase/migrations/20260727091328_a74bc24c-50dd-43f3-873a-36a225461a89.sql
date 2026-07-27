ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS request_type text NOT NULL DEFAULT 'termin',
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS availability text;

DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND consent = true
  AND char_length(email) <= 255
  AND char_length(COALESCE(name, '')) <= 100
  AND char_length(COALESCE(pain_point, '')) <= 100
  AND request_type IN ('termin', 'interview')
  AND char_length(COALESCE(phone, '')) <= 40
  AND char_length(COALESCE(availability, '')) <= 500
);