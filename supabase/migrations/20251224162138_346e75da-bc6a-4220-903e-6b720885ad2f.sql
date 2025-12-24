-- Create table for mentor contacts/messages
CREATE TABLE public.mentor_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  mentor_id UUID NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for sessions/bookings
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  mentor_id UUID NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'upcoming',
  subject TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentor_contacts
CREATE POLICY "Students can view their own contacts"
ON public.mentor_contacts FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can create contacts"
ON public.mentor_contacts FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Mentors can view contacts to them"
ON public.mentor_contacts FOR SELECT
USING (auth.uid() = mentor_id);

-- RLS policies for sessions
CREATE POLICY "Students can view their own sessions"
ON public.sessions FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Mentors can view their sessions"
ON public.sessions FOR SELECT
USING (auth.uid() = mentor_id);

CREATE POLICY "Students can create sessions"
ON public.sessions FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their sessions"
ON public.sessions FOR UPDATE
USING (auth.uid() = student_id OR auth.uid() = mentor_id);