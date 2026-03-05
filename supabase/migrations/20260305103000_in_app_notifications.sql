-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Create a database trigger function automatically notifying mentors on new session bookings
CREATE OR REPLACE FUNCTION public.notify_mentor_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  student_name TEXT;
BEGIN
  -- Fetch the student's name
  SELECT full_name INTO student_name FROM public.profiles WHERE user_id = NEW.student_id;
  
  -- Insert into notifications table
  INSERT INTO public.notifications (user_id, title, message, link)
  VALUES (
    NEW.mentor_id,
    'New Session Request',
    student_name || ' has requested a new mentoring session with you.',
    '/mentor-dashboard'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger
DROP TRIGGER IF EXISTS trg_notify_mentor_on_booking ON public.sessions;
CREATE TRIGGER trg_notify_mentor_on_booking
AFTER INSERT ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.notify_mentor_on_booking();

-- Create a database trigger function automatically notifying students when accepted
CREATE OR REPLACE FUNCTION public.notify_student_on_accept()
RETURNS TRIGGER AS $$
DECLARE
  mentor_name TEXT;
BEGIN
  -- Only trigger if status changed to upcoming (accepted)
  IF NEW.status = 'upcoming' AND OLD.status = 'pending' THEN
    SELECT full_name INTO mentor_name FROM public.profiles WHERE user_id = NEW.mentor_id;
    
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (
      NEW.student_id,
      'Session Accepted!',
      mentor_name || ' has accepted your session request.',
      '/dashboard'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger
DROP TRIGGER IF EXISTS trg_notify_student_on_accept ON public.sessions;
CREATE TRIGGER trg_notify_student_on_accept
AFTER UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.notify_student_on_accept();
