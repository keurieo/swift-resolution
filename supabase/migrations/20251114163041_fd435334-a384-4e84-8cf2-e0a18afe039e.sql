-- Make tracking_id optional for inserts by setting a server-side default using the generator
ALTER TABLE public.complaints ALTER COLUMN tracking_id SET DEFAULT public.generate_tracking_id();