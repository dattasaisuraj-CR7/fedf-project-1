DO $$ BEGIN
  CREATE TYPE public.diet_type AS ENUM ('veg','non_veg','vegan');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS diet_type public.diet_type NOT NULL DEFAULT 'veg';