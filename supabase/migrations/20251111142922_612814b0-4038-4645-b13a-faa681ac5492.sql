-- Create ENUM types
CREATE TYPE public.app_role AS ENUM ('student', 'department_officer', 'admin', 'ombudsperson', 'company_rep');
CREATE TYPE public.complaint_category AS ENUM ('Academic', 'Hostel', 'Infrastructure', 'Safety', 'Administration', 'Other');
CREATE TYPE public.complaint_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE public.complaint_status AS ENUM ('Submitted', 'Reviewed', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Reopened', 'Escalated');
CREATE TYPE public.feedback_status AS ENUM ('Resolved', 'Unresolved', 'Partial');
CREATE TYPE public.audit_action AS ENUM ('Submit', 'Review', 'Assign', 'Resolve', 'Close', 'Reopen', 'Escalate', 'Feedback');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150),
  department_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Roles table (CRITICAL: separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Department table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  sla_hours_by_category JSONB DEFAULT '{}',
  escalation_policy JSONB DEFAULT '{}',
  priority_thresholds JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Student table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  roll_number VARCHAR(20) UNIQUE NOT NULL,
  program VARCHAR(100),
  year_of_study SMALLINT,
  section VARCHAR(10),
  contact_number VARCHAR(15),
  is_anonymous_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Administrator table
CREATE TABLE public.administrators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  designation VARCHAR(100),
  authority_level SMALLINT DEFAULT 1,
  department_id UUID REFERENCES public.departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Company table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(15),
  service_category VARCHAR(100),
  contract_valid_till DATE,
  address TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Complaint table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id VARCHAR(20) UNIQUE NOT NULL,
  submitter_user_id UUID REFERENCES auth.users(id),
  submitter_pseudonym_hash VARCHAR(128),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category complaint_category NOT NULL,
  subcategory VARCHAR(100),
  department_assigned UUID REFERENCES public.departments(id),
  assigned_to_company UUID REFERENCES public.companies(id),
  priority complaint_priority DEFAULT 'Low',
  status complaint_status DEFAULT 'Submitted',
  attachments JSONB DEFAULT '[]',
  sentiment_score FLOAT,
  auto_escalated BOOLEAN DEFAULT false,
  escalation_level INT DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  assigned_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  sla_deadline TIMESTAMP WITH TIME ZONE,
  resolution_summary TEXT,
  immutable_hash VARCHAR(128)
);

-- Feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  feedback_status feedback_status NOT NULL,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reopened BOOLEAN DEFAULT false
);

-- AuditLog table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id),
  action audit_action NOT NULL,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key for department_id in profiles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_department_fkey 
  FOREIGN KEY (department_id) REFERENCES public.departments(id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security Definer Function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security Definer Function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('admin', 'ombudsperson', 'department_officer')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for departments
CREATE POLICY "Everyone can view departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for students
CREATE POLICY "Students can view their own data"
  ON public.students FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own data"
  ON public.students FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all students"
  ON public.students FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Students can insert their own data"
  ON public.students FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for administrators
CREATE POLICY "Administrators can view their own data"
  ON public.administrators FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all administrators"
  ON public.administrators FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage administrators"
  ON public.administrators FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for companies
CREATE POLICY "Authenticated users can view companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage companies"
  ON public.companies FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for complaints
CREATE POLICY "Users can view their own complaints"
  ON public.complaints FOR SELECT
  USING (
    auth.uid() = submitter_user_id 
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Users can insert complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (
    auth.uid() = submitter_user_id 
    OR submitter_user_id IS NULL
  );

CREATE POLICY "Admins can update complaints"
  ON public.complaints FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete complaints"
  ON public.complaints FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for feedback
CREATE POLICY "Users can view feedback for their complaints"
  ON public.feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = feedback.complaint_id
      AND complaints.submitter_user_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Users can insert feedback for their complaints"
  ON public.feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_id
      AND complaints.submitter_user_id = auth.uid()
    )
  );

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique tracking IDs
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
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

-- Trigger to auto-generate tracking_id
CREATE OR REPLACE FUNCTION public.set_tracking_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := public.generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_complaint_tracking_id
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tracking_id();