-- Fix permissions for the auth trigger function
-- Grant necessary permissions to supabase_auth_admin role
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT INSERT ON public.profiles TO supabase_auth_admin;

-- Recreate the function with proper security definer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;