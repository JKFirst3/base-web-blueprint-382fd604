
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id uuid,
  session_id uuid,
  event_name text NOT NULL,
  path text,
  product_id text,
  tier text,
  payment_type text,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX analytics_events_created_at_idx ON public.analytics_events (created_at DESC);
CREATE INDEX analytics_events_event_name_idx ON public.analytics_events (event_name);
CREATE INDEX analytics_events_visitor_id_idx ON public.analytics_events (visitor_id);

-- Only service_role may write/read. No anon, no authenticated grants.
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated => table is completely locked to them.
-- service_role bypasses RLS.
