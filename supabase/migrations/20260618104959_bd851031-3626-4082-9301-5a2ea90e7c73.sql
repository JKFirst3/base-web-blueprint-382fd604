CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND char_length(email) <= 255
    AND char_length(name) > 0
    AND char_length(name) <= 100
    AND char_length(message) > 0
    AND char_length(message) <= 2000
    AND char_length(COALESCE(subject, '')) <= 200
  );

CREATE POLICY "No public read access to contact messages"
  ON public.contact_messages
  AS RESTRICTIVE
  FOR SELECT
  TO anon, authenticated
  USING (false);
