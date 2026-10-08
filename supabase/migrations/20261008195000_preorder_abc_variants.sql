-- Preserve the actual per-product A/B/C landing copy variant with each qualified lead.
-- Historical records stay NULL; do not invent variant A for past submissions.
BEGIN;
ALTER TABLE public.preorders
  ADD COLUMN IF NOT EXISTS variant_id text
    CONSTRAINT preorders_variant_id_valid CHECK (variant_id IS NULL OR variant_id IN ('a','b','c'));
CREATE INDEX IF NOT EXISTS preorders_variant_source_created_idx
  ON public.preorders (source, solution_id, variant_id, created_at);

DROP FUNCTION IF EXISTS public.admin_funnel_source_stats(timestamptz,timestamptz);
CREATE FUNCTION public.admin_funnel_source_stats(from_ts timestamptz,to_ts timestamptz)
RETURNS TABLE (
  source text,
  product text,
  variant_id text,
  requests bigint,
  confirmed bigint,
  qualified bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT p.source::text, p.solution_id::text, p.variant_id::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE p.doi_confirmed_at IS NOT NULL)::bigint,
    COUNT(*) FILTER (WHERE COALESCE(q.qualified,false))::bigint
  FROM public.preorders AS p
  LEFT JOIN public.lead_qualifications AS q ON q.preorder_id = p.id
  WHERE p.created_at >= from_ts AND p.created_at < to_ts
  GROUP BY p.source,p.solution_id,p.variant_id
$$;
REVOKE ALL ON FUNCTION public.admin_funnel_source_stats(timestamptz,timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_funnel_source_stats(timestamptz,timestamptz)
  TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
