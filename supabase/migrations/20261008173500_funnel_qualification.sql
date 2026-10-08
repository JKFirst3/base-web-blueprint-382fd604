-- Admin-only, non-PII qualification state. Source of truth for qualified inquiry outcomes.
CREATE TABLE IF NOT EXISTS public.lead_qualifications (
  preorder_id uuid PRIMARY KEY REFERENCES public.preorders(id) ON DELETE CASCADE,
  qualified boolean NOT NULL DEFAULT false,
  qualified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lead_qualifications_consistent CHECK ((qualified AND qualified_at IS NOT NULL) OR (NOT qualified AND qualified_at IS NULL))
);
ALTER TABLE public.lead_qualifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lead_qualifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_qualifications TO service_role;
CREATE INDEX IF NOT EXISTS lead_qualifications_qualified_at_idx ON public.lead_qualifications(qualified_at) WHERE qualified;
