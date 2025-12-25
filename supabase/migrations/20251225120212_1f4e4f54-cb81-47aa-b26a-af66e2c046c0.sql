-- Fix handle_new_user() to always assign 'student' role on signup
-- This prevents privilege escalation via client-controlled metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'student'  -- Always default to student role, mentor role must be earned through BecomeMentor page
  );
  RETURN NEW;
END;
$$;