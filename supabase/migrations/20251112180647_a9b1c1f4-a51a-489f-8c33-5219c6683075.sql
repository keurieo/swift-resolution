-- Ensure the trigger for auto-generating tracking IDs is properly attached
DROP TRIGGER IF EXISTS set_complaint_tracking_id ON public.complaints;

CREATE TRIGGER set_complaint_tracking_id
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  WHEN (NEW.tracking_id IS NULL OR NEW.tracking_id = '')
  EXECUTE FUNCTION public.set_tracking_id();

-- Make tracking_id optional for inserts by adding a default
ALTER TABLE public.complaints 
  ALTER COLUMN tracking_id SET DEFAULT '';