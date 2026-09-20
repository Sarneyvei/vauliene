
CREATE TYPE public.app_role AS ENUM ('player','admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'player',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  commander_name text NOT NULL,
  level int NOT NULL DEFAULT 1,
  xp int NOT NULL DEFAULT 0,
  graphics_quality text NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.planets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Nova Terra',
  biome text NOT NULL DEFAULT 'temperate',
  metal numeric NOT NULL DEFAULT 1500,
  crystal numeric NOT NULL DEFAULT 800,
  gas numeric NOT NULL DEFAULT 300,
  energy numeric NOT NULL DEFAULT 200,
  last_tick timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planets TO authenticated;
GRANT ALL ON public.planets TO service_role;
ALTER TABLE public.planets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own planets" ON public.planets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  planet_id uuid NOT NULL REFERENCES public.planets(id) ON DELETE CASCADE,
  type text NOT NULL,
  level int NOT NULL DEFAULT 0,
  upgrade_finishes_at timestamptz,
  UNIQUE (planet_id, type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buildings TO authenticated;
GRANT ALL ON public.buildings TO service_role;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own buildings" ON public.buildings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.commanders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  level int NOT NULL DEFAULT 1,
  xp int NOT NULL DEFAULT 0,
  attack int NOT NULL DEFAULT 10,
  defense int NOT NULL DEFAULT 10,
  command int NOT NULL DEFAULT 10,
  engineering int NOT NULL DEFAULT 10,
  exploration int NOT NULL DEFAULT 10,
  skill_name text NOT NULL DEFAULT '',
  skill_description text NOT NULL DEFAULT '',
  UNIQUE (user_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commanders TO authenticated;
GRANT ALL ON public.commanders TO service_role;
ALTER TABLE public.commanders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own commanders" ON public.commanders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.hangar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  planet_id uuid NOT NULL REFERENCES public.planets(id) ON DELETE CASCADE,
  ship_type text NOT NULL,
  quantity int NOT NULL DEFAULT 0,
  UNIQUE (planet_id, ship_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hangar TO authenticated;
GRANT ALL ON public.hangar TO service_role;
ALTER TABLE public.hangar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own hangar" ON public.hangar FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.fleets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  commander_id uuid REFERENCES public.commanders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'idle',
  target_body_id uuid,
  arrives_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleets TO authenticated;
GRANT ALL ON public.fleets TO service_role;
ALTER TABLE public.fleets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fleets" ON public.fleets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.fleet_ships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fleet_id uuid NOT NULL REFERENCES public.fleets(id) ON DELETE CASCADE,
  ship_type text NOT NULL,
  quantity int NOT NULL DEFAULT 0,
  UNIQUE (fleet_id, ship_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleet_ships TO authenticated;
GRANT ALL ON public.fleet_ships TO service_role;
ALTER TABLE public.fleet_ships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fleet ships" ON public.fleet_ships FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.map_bodies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'planet',
  owner_type text NOT NULL DEFAULT 'neutral',
  distance int NOT NULL DEFAULT 100,
  pos_x numeric NOT NULL DEFAULT 0,
  pos_y numeric NOT NULL DEFAULT 0,
  pos_z numeric NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#4ea8ff',
  defense jsonb NOT NULL DEFAULT '{}'::jsonb,
  loot jsonb NOT NULL DEFAULT '{}'::jsonb,
  cleared boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.map_bodies TO authenticated;
GRANT ALL ON public.map_bodies TO service_role;
ALTER TABLE public.map_bodies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own map" ON public.map_bodies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.player_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_key text NOT NULL,
  progress int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  claimed boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, mission_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_missions TO authenticated;
GRANT ALL ON public.player_missions TO service_role;
ALTER TABLE public.player_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own missions" ON public.player_missions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_name text NOT NULL,
  victory boolean NOT NULL,
  ships_sent jsonb NOT NULL DEFAULT '{}'::jsonb,
  ships_lost jsonb NOT NULL DEFAULT '{}'::jsonb,
  enemy_ships jsonb NOT NULL DEFAULT '{}'::jsonb,
  xp_gained int NOT NULL DEFAULT 0,
  loot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.battles TO authenticated;
GRANT ALL ON public.battles TO service_role;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own battles" ON public.battles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'update',
  published_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news public read" ON public.news FOR SELECT USING (true);
CREATE POLICY "admins manage news" ON public.news FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.news (version, title, body, category) VALUES
('0.1.0','Galaxy Online IV — Primeiro teste publico','Base jogavel: planeta 3D, recursos em tempo real, construcoes, estaleiro, frotas, mapa galactico, batalha espacial e missoes.','update'),
('0.0.9','Preparando a galaxia','Arquitetura modular pronta para novos planetas, comandantes, naves e tecnologias.','news');
