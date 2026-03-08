-- ============================================================
-- Verification Query - Check if map_provider column exists
-- Run this to verify the migration worked
-- ============================================================

-- Check if column exists
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'map_provider';

-- If the above returns a row, the column exists!
-- If it returns no rows, the column doesn't exist yet.
