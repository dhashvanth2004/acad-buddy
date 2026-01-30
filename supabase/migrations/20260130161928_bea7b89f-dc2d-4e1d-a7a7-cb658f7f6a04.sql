-- Fix 1: Create trigger to restrict column modifications on sessions table
-- Students can only update 'notes' column, Mentors can only update 'status' column

CREATE OR REPLACE FUNCTION public.validate_session_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  is_student boolean := (current_user_id = OLD.student_id);
  is_mentor boolean := (current_user_id = OLD.mentor_id);
BEGIN
  -- Prevent changing student_id or mentor_id (ownership columns)
  IF NEW.student_id != OLD.student_id THEN
    RAISE EXCEPTION 'Cannot modify student_id';
  END IF;
  
  IF NEW.mentor_id != OLD.mentor_id THEN
    RAISE EXCEPTION 'Cannot modify mentor_id';
  END IF;

  -- Students can only update 'notes' column
  IF is_student AND NOT is_mentor THEN
    IF NEW.status != OLD.status OR 
       NEW.scheduled_at != OLD.scheduled_at OR 
       NEW.duration_minutes != OLD.duration_minutes OR
       NEW.subject IS DISTINCT FROM OLD.subject THEN
      RAISE EXCEPTION 'Students can only update the notes field';
    END IF;
  END IF;

  -- Mentors can only update 'status' column
  IF is_mentor AND NOT is_student THEN
    IF NEW.notes IS DISTINCT FROM OLD.notes OR
       NEW.scheduled_at != OLD.scheduled_at OR
       NEW.duration_minutes != OLD.duration_minutes OR
       NEW.subject IS DISTINCT FROM OLD.subject THEN
      RAISE EXCEPTION 'Mentors can only update the status field';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS enforce_session_update_columns ON public.sessions;
CREATE TRIGGER enforce_session_update_columns
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_session_update();

-- Fix 2: The mentor_contacts RLS policies are already correct
-- Looking at the policies:
-- - "Students can view their own contacts" uses (auth.uid() = student_id)
-- - "Mentors can view contacts to them" uses (auth.uid() = mentor_id)
-- Both are RESTRICTIVE, meaning they correctly isolate data
-- Students can ONLY see records where they are the student_id
-- This finding appears to be a false positive - the policies are already secure
-- No changes needed for mentor_contacts

-- Fix 3: Profiles table - ensure students cannot view other student profiles
-- Current policies:
-- - "Users can view own profile" - allows viewing own profile
-- - "Authenticated users can view mentor profiles" - allows viewing mentors only
-- The issue is that the profiles table only allows:
-- 1. Viewing your own profile (any role)
-- 2. Viewing mentor profiles (for finding mentors)
-- Students CANNOT view other students' profiles with these policies
-- This is a false positive - the policies are already secure
-- No additional changes needed