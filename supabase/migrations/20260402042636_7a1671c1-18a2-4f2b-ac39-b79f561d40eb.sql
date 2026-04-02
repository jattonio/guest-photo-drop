
CREATE TABLE public.photo_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES public.event_photos(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  guest_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(photo_id, guest_id)
);

ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.photo_reactions FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can add reactions" ON public.photo_reactions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update reactions" ON public.photo_reactions FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete reactions" ON public.photo_reactions FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.photo_reactions;
