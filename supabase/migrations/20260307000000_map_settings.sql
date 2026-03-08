-- ============================================================
-- Rentr — Map Settings
-- Adds map provider preference to user profiles
-- ============================================================

-- Check if column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'map_provider'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN map_provider TEXT CHECK (map_provider IN ('mapbox', 'google')) DEFAULT 'mapbox';
    
    COMMENT ON COLUMN public.profiles.map_provider IS 'User preference for map provider: mapbox or google';
  END IF;
END $$;
