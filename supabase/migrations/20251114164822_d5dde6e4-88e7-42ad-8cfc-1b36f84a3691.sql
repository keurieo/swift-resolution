-- Add a sample department
INSERT INTO public.departments (name, email, sla_hours_by_category)
VALUES (
  'General Administration',
  'admin@college.edu',
  '{"Academic": 48, "Hostel": 24, "Infrastructure": 72, "Safety": 12, "Administration": 48, "Other": 48}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create a helper function to assign admin role to a user
CREATE OR REPLACE FUNCTION public.assign_admin_role(_user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO _user_id 
  FROM auth.users 
  WHERE email = _user_email;
  
  IF _user_id IS NOT NULL THEN
    -- Insert admin role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Note: To grant admin access to a user, run: SELECT assign_admin_role('user@example.com');