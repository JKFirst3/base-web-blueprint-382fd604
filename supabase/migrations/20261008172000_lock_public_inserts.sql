-- All frontend submissions flow through checked server endpoints.
-- Both endpoints use the service-role Supabase client and retain their public HTTP URLs.
REVOKE INSERT ON public.leads FROM anon, authenticated;
REVOKE INSERT ON public.preorders FROM anon, authenticated;
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
DROP POLICY IF EXISTS "Anyone can submit a preorder" ON public.preorders;
DROP POLICY IF EXISTS "Anyone can submit a valid preorder" ON public.preorders;
DROP POLICY IF EXISTS "Anyone can submit a catalog preorder" ON public.preorders;
