ALTER TABLE public.preorders
  ADD COLUMN household_size text,
  ADD COLUMN job_title text,
  ADD COLUMN greatest_value text,
  ADD COLUMN greatest_value_other text;

ALTER TABLE public.preorders
  ADD CONSTRAINT preorders_household_size_valid CHECK (household_size IS NULL OR household_size IN ('1', '2', '3-4', '5+')),
  ADD CONSTRAINT preorders_job_title_valid CHECK (job_title IS NULL OR (char_length(btrim(job_title)) BETWEEN 1 AND 100)),
  ADD CONSTRAINT preorders_greatest_value_valid CHECK (greatest_value IS NULL OR greatest_value IN ('Weniger Zeit für Wäsche aufwenden', 'Wiederkehrende Hausarbeit reduzieren', 'Möglichst lange selbständig im eigenen Zuhause leben', 'Weniger Abhängigkeit von Haushaltshilfen', 'Schonender und zuverlässigere Textilpflege', 'Sonstige')),
  ADD CONSTRAINT preorders_greatest_value_other_valid CHECK ((greatest_value = 'Sonstige' AND greatest_value_other IS NOT NULL AND char_length(btrim(greatest_value_other)) BETWEEN 1 AND 300) OR (greatest_value IS DISTINCT FROM 'Sonstige' AND greatest_value_other IS NULL));