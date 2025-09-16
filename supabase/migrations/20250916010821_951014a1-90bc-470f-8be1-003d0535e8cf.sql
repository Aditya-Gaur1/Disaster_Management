-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Update disaster_alerts table to include created_by
ALTER TABLE public.disaster_alerts 
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Update disaster_alerts RLS policies
CREATE POLICY "Teachers and admins can insert alerts" 
ON public.disaster_alerts 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND (
    public.has_role(auth.uid(), 'teacher') OR 
    public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Teachers and admins can update their alerts" 
ON public.disaster_alerts 
FOR UPDATE 
USING (
  auth.uid() = created_by AND (
    public.has_role(auth.uid(), 'teacher') OR 
    public.has_role(auth.uid(), 'admin')
  )
);

-- Trigger to update updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin role (replace with actual admin user ID)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;