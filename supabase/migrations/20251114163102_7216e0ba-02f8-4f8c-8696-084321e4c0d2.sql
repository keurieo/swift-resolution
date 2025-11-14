-- Enforce uniqueness at the database level
DO $$ BEGIN
  -- Create the unique index only if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'complaints_tracking_unique'
  ) THEN
    CREATE UNIQUE INDEX complaints_tracking_unique ON public.complaints(tracking_id);
  END IF;
END $$;