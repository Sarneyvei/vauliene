CREATE TABLE public.ship_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  planet_id uuid NOT NULL REFERENCES public.planets(id) ON DELETE CASCADE,
  ship_type text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  finishes_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ship_queue TO authenticated;
GRANT ALL ON public.ship_queue TO service_role;
ALTER TABLE public.ship_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ship queue" ON public.ship_queue FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);