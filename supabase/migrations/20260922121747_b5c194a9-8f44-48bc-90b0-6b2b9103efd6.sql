ALTER TABLE public.preorders
  ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_at timestamptz;

ALTER TABLE public.preorders
  DROP CONSTRAINT IF EXISTS preorders_marketing_consent_timestamp_consistent;

ALTER TABLE public.preorders
  ADD CONSTRAINT preorders_marketing_consent_timestamp_consistent
  CHECK (
    (marketing_consent = true AND marketing_consent_at IS NOT NULL)
    OR (marketing_consent = false AND marketing_consent_at IS NULL)
  );