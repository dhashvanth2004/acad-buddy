-- Fix PII leak: Only allow viewing mentor profiles or own profile
DROP POLICY IF EXISTS "Anyone can view all profiles" ON public.profiles;

CREATE POLICY "Anyone can view mentor profiles"
ON public.profiles
FOR SELECT
TO public
USING (role = 'mentor' OR auth.uid() = user_id);

-- Add missing performance indexes
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON public.sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_mentor_id ON public.sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_contacts_student_id ON public.mentor_contacts(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_contacts_mentor_id ON public.mentor_contacts(mentor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_student_id ON public.reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_mentor_id ON public.reviews(mentor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_session_id ON public.reviews(session_id);
