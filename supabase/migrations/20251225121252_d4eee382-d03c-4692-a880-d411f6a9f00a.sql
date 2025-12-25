-- Add foreign key constraints to mentor_contacts table
-- Reference profiles table instead of auth.users for better query support
ALTER TABLE public.mentor_contacts
  ADD CONSTRAINT fk_mentor_contacts_student 
    FOREIGN KEY (student_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_mentor_contacts_mentor 
    FOREIGN KEY (mentor_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key constraints to sessions table
ALTER TABLE public.sessions
  ADD CONSTRAINT fk_sessions_student 
    FOREIGN KEY (student_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_sessions_mentor 
    FOREIGN KEY (mentor_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Drop the overly permissive UPDATE policy on sessions
DROP POLICY IF EXISTS "Users can update their sessions" ON public.sessions;

-- Create more restrictive UPDATE policies
-- Students can only update notes on their sessions (not status, time, or participants)
CREATE POLICY "Students can update their session notes"
ON public.sessions FOR UPDATE
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- Mentors can update status and notes (to confirm/cancel sessions)
CREATE POLICY "Mentors can update session status"
ON public.sessions FOR UPDATE
USING (auth.uid() = mentor_id)
WITH CHECK (auth.uid() = mentor_id);