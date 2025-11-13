-- Update the tracking ID generation function to create simpler, shorter IDs
-- New format will be: C-NNNN (just C- followed by a 4-digit number)

CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id VARCHAR(20);
  counter INT;
BEGIN
  -- Get the next number in sequence
  SELECT COALESCE(MAX(CAST(SUBSTRING(tracking_id FROM 3) AS INT)), 0) + 1
  INTO counter
  FROM public.complaints
  WHERE tracking_id ~ '^C-[0-9]+$';
  
  -- Format: C-NNNN (e.g., C-0001, C-0002, etc.)
  new_id := 'C-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_id;
END;
$$;