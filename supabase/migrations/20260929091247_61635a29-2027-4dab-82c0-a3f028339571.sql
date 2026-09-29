ALTER TABLE public.preorders ADD COLUMN marketing_activated_at timestamptz;
ALTER TABLE public.preorders ADD CONSTRAINT preorders_marketing_active_consistent CHECK (
  (marketing_consent_active AND marketing_consent AND marketing_activated_at IS NOT NULL AND doi_status = 'confirmed')
  OR (NOT marketing_consent_active AND marketing_activated_at IS NULL));

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
    NEW.marketing_activated_at := NULL;
    NEW.transfer_consent_at := CASE WHEN NEW.transfer_consent THEN now() ELSE NULL END;
  END IF;
  RETURN NEW;
END $$;

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
    marketing_activated_at = CASE WHEN marketing_consent THEN now() ELSE NULL END
  WHERE id = r.id;
  RETURN 'confirmed';
END $$;
REVOKE ALL ON FUNCTION public.confirm_preorder_doi(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_preorder_doi(text) TO service_role;