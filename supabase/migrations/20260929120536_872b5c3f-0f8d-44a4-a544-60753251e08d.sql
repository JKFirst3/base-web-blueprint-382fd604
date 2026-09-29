ALTER TABLE public.preorders
  ADD COLUMN client_submission_id uuid,
  ADD COLUMN occupation_group text;

ALTER TABLE public.preorders
  ADD CONSTRAINT preorders_occupation_group_check CHECK (
    occupation_group IS NULL OR occupation_group IN (
      'Büro/Verwaltung/Management',
      'Technik/Handwerk/Produktion',
      'Gesundheit/Pflege/Soziales',
      'Bildung/Forschung',
      'Handel/Dienstleistungen',
      'Ruhestand',
      'Anderer Bereich'
    )
  );

CREATE UNIQUE INDEX preorders_client_submission_id_key
  ON public.preorders (client_submission_id)
  WHERE client_submission_id IS NOT NULL;

GRANT ALL ON public.preorders TO service_role;