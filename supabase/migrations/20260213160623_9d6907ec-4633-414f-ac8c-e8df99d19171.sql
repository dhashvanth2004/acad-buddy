
-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  mentor_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Students can create reviews for their completed sessions
CREATE POLICY "Students can create reviews for completed sessions"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM public.sessions
    WHERE sessions.id = session_id
      AND sessions.student_id = auth.uid()
      AND sessions.mentor_id = reviews.mentor_id
      AND sessions.status = 'completed'
  )
);

-- Anyone authenticated can view reviews
CREATE POLICY "Authenticated users can view reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- Students can update their own reviews
CREATE POLICY "Students can update their own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id);

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
