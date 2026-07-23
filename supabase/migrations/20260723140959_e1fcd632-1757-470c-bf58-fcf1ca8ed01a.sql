GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;

GRANT INSERT ON public.preorders TO anon, authenticated;
GRANT ALL ON public.preorders TO service_role;

GRANT ALL ON public.analytics_events TO service_role;