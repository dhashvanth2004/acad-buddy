-- Add admin flag
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Optionally, make the first user an admin or provide a way to set it up.
-- Because there is no existing admin, we will just allow updating it manually from the database later.

-- Create mentor_applications table
CREATE TABLE IF NOT EXISTS public.mentor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  bio TEXT NOT NULL,
  subjects TEXT[] NOT NULL,
  hourly_rate NUMERIC DEFAULT 0,
  availability TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own application"
ON public.mentor_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own application"
ON public.mentor_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.mentor_applications FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can update applications"
ON public.mentor_applications FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

-- Update timestamp trigger
DROP TRIGGER IF EXISTS update_mentor_applications_updated_at ON public.mentor_applications;
CREATE TRIGGER update_mentor_applications_updated_at
BEFORE UPDATE ON public.mentor_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Admin approval function
CREATE OR REPLACE FUNCTION public.approve_mentor_application(app_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin BOOLEAN;
  app_record public.mentor_applications%ROWTYPE;
BEGIN
  -- Verify caller is admin
  SELECT is_admin INTO caller_is_admin FROM public.profiles WHERE user_id = auth.uid();
  IF caller_is_admin IS NOT true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Get application
  SELECT * INTO app_record FROM public.mentor_applications WHERE id = app_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF app_record.status != 'pending' THEN
    RAISE EXCEPTION 'Application is not pending. Current status: %', app_record.status;
  END IF;

  -- Update profile to mentor
  UPDATE public.profiles
  SET 
    role = 'mentor',
    full_name = app_record.full_name,
    department = app_record.department,
    year = app_record.year,
    bio = app_record.bio,
    subjects = app_record.subjects,
    hourly_rate = app_record.hourly_rate
  WHERE user_id = app_record.user_id;

  -- Mark application as approved
  UPDATE public.mentor_applications
  SET status = 'approved', updated_at = now()
  WHERE id = app_id;

  RETURN true;
END;
$$;

-- Admin rejection function
CREATE OR REPLACE FUNCTION public.reject_mentor_application(app_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO caller_is_admin FROM public.profiles WHERE user_id = auth.uid();
  IF caller_is_admin IS NOT true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.mentor_applications
  SET status = 'rejected', updated_at = now()
  WHERE id = app_id;

  RETURN true;
END;
$$;
