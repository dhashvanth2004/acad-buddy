-- Allow students to delete their own upcoming/pending sessions
CREATE POLICY "Students can delete upcoming sessions"
ON public.sessions
FOR DELETE
USING (
  auth.uid() = student_id AND
  status IN ('upcoming', 'pending') AND
  scheduled_at > now()
);

-- Allow mentors to delete sessions they're involved in
CREATE POLICY "Mentors can delete their sessions"
ON public.sessions
FOR DELETE
USING (
  auth.uid() = mentor_id AND
  status IN ('upcoming', 'pending')
);