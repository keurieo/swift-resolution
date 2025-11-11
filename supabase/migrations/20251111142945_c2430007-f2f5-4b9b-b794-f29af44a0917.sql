-- Fix security warnings: Update functions with proper search_path
-- Drop trigger first, then recreate with updated function

DROP TRIGGER IF EXISTS set_complaint_tracking_id ON public.complaints;

DROP FUNCTION IF EXISTS public.generate_tracking_id() CASCADE;
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id VARCHAR(20);
  year_str VARCHAR(4);
  counter INT;
BEGIN
  year_str := to_char(now(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(tracking_id FROM 8) AS INT)), 0) + 1
  INTO counter
  FROM public.complaints
  WHERE tracking_id LIKE 'C-' || year_str || '-%';
  
  new_id := 'C-' || year_str || '-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_id;
END;
$$;

DROP FUNCTION IF EXISTS public.set_tracking_id() CASCADE;
CREATE OR REPLACE FUNCTION public.set_tracking_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := public.generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER set_complaint_tracking_id
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tracking_id();