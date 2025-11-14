-- 1) Ensure robust, collision-free tracking_id generation using a sequence
-- Create sequence for tracking numbers (id portion only)
CREATE SEQUENCE IF NOT EXISTS public.complaint_tracking_seq START 1;

-- 2) Replace generate_tracking_id() to use the sequence (thread-safe)
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS character varying
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_no BIGINT;
BEGIN
  next_no := nextval('public.complaint_tracking_seq');
  RETURN 'C-' || lpad(next_no::text, 4, '0');
END;
$$;

-- 3) Remove problematic default of empty string so NEW.tracking_id is truly NULL unless set
ALTER TABLE public.complaints ALTER COLUMN tracking_id DROP DEFAULT;

-- 4) (Re)create BEFORE INSERT trigger wiring to set_tracking_id() which calls generate_tracking_id()
DROP TRIGGER IF EXISTS before_insert_complaints_set_tracking ON public.complaints;
CREATE TRIGGER before_insert_complaints_set_tracking
BEFORE INSERT ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.set_tracking_id();