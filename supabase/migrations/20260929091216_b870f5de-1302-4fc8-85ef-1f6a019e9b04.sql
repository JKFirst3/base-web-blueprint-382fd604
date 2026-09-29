ALTER TABLE public.preorders
  ADD COLUMN doi_status text,
  ADD COLUMN doi_token_hash text,
  ADD COLUMN doi_expires_at timestamptz,
  ADD COLUMN doi_sent_at timestamptz,
  ADD COLUMN doi_confirmed_at timestamptz,
  ADD COLUMN marketing_consent_active boolean NOT NULL DEFAULT false,
  ADD COLUMN transfer_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN transfer_consent_at timestamptz;

ALTER TABLE public.preorders
  ADD CONSTRAINT preorders_doi_status_check CHECK (doi_status IS NULL OR doi_status IN ('pending','confirmed','expired','send_failed')),
  ADD CONSTRAINT preorders_transfer_consent_at_check CHECK ((transfer_consent AND transfer_consent_at IS NOT NULL) OR (NOT transfer_consent AND transfer_consent_at IS NULL));

CREATE UNIQUE INDEX preorders_doi_token_hash_key ON public.preorders (doi_token_hash) WHERE doi_token_hash IS NOT NULL;

-- Direct (non-service) inserts can never set confirmation / activation state.
CREATE OR REPLACE FUNCTION public.preorders_guard_doi()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role' THEN
    NEW.doi_status := NULL;
    NEW.doi_token_hash := NULL;
    NEW.doi_expires_at := NULL;
    NEW.doi_sent_at := NULL;
    NEW.doi_confirmed_at := NULL;
    NEW.marketing_consent_active := false;
    NEW.marketing_consent_at := NULL;
    NEW.transfer_consent_at := CASE WHEN NEW.transfer_consent THEN now() ELSE NULL END;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER preorders_guard_doi BEFORE INSERT ON public.preorders
FOR EACH ROW EXECUTE FUNCTION public.preorders_guard_doi();

-- Atomic, single-use, idempotent confirmation. Returns only a status word.
CREATE OR REPLACE FUNCTION public.confirm_preorder_doi(_token_hash text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  IF _token_hash IS NULL OR _token_hash !~ '^[0-9a-f]{64}$' THEN RETURN 'invalid'; END IF;
  SELECT id, doi_status, doi_expires_at INTO r FROM public.preorders
    WHERE doi_token_hash = _token_hash FOR UPDATE;
  IF NOT FOUND THEN RETURN 'invalid'; END IF;
  IF r.doi_status = 'confirmed' THEN RETURN 'already_confirmed'; END IF;
  IF r.doi_status = 'expired' THEN RETURN 'expired'; END IF;
  IF r.doi_status IS DISTINCT FROM 'pending' THEN RETURN 'invalid'; END IF;
  IF r.doi_expires_at IS NULL OR r.doi_expires_at <= now() THEN
    UPDATE public.preorders SET doi_status = 'expired' WHERE id = r.id;
    RETURN 'expired';
  END IF;
  UPDATE public.preorders SET
    doi_status = 'confirmed',
    doi_confirmed_at = now(),
    marketing_consent_active = marketing_consent,
    marketing_consent_at = CASE WHEN marketing_consent THEN now() ELSE NULL END
  WHERE id = r.id;
  RETURN 'confirmed';
END $$;

-- Marks never-confirmed links as expired for reporting.
CREATE OR REPLACE FUNCTION public.expire_preorder_doi()
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH u AS (UPDATE public.preorders SET doi_status = 'expired'
    WHERE doi_status = 'pending' AND doi_expires_at <= now() RETURNING 1)
  SELECT count(*)::int FROM u;
$$;

REVOKE ALL ON FUNCTION public.confirm_preorder_doi(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.expire_preorder_doi() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_preorder_doi(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_preorder_doi() TO service_role;
GRANT ALL ON public.preorders TO service_role;