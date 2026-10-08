-- Bounded, PII-free reporting by source and product, cohort anchored at preorder creation.
-- Execute only using the existing service-role Supabase server client.
CREATE OR REPLACE FUNCTION public.admin_funnel_source_stats(
  from_ts timestamptz,
  to_ts timestamptz
)
RETURNS TABLE (
  source text,
  product text,
  requests bigint,
  confirmed bigint,
  qualified bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    p.source::text,
    p.solution_id::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE p.doi_confirmed_at IS NOT NULL)::bigint,
    COUNT(*) FILTER (WHERE COALESCE(q.qualified,false))::bigint
  FROM public.preorders AS p
  LEFT JOIN public.lead_qualifications AS q ON q.preorder_id = p.id
  WHERE p.created_at >= from_ts AND p.created_at < to_ts
  GROUP BY p.source,p.solution_id
$$;
REVOKE ALL ON FUNCTION public.admin_funnel_source_stats(timestamptz,timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_funnel_source_stats(timestamptz,timestamptz) TO service_role;
