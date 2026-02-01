-- Create mentor_availability table for managing availability slots
CREATE TABLE public.mentor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT unique_mentor_slot UNIQUE (mentor_id, day_of_week, start_time, end_time)
);

-- Enable RLS
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;

-- Mentors can view their own availability
CREATE POLICY "Mentors can view their own availability"
ON public.mentor_availability
FOR SELECT
USING (auth.uid() = mentor_id);

-- Mentors can insert their own availability
CREATE POLICY "Mentors can insert their own availability"
ON public.mentor_availability
FOR INSERT
WITH CHECK (auth.uid() = mentor_id);

-- Mentors can update their own availability
CREATE POLICY "Mentors can update their own availability"
ON public.mentor_availability
FOR UPDATE
USING (auth.uid() = mentor_id);

-- Mentors can delete their own availability
CREATE POLICY "Mentors can delete their own availability"
ON public.mentor_availability
FOR DELETE
USING (auth.uid() = mentor_id);

-- Students can view mentor availability (for booking)
CREATE POLICY "Authenticated users can view mentor availability"
ON public.mentor_availability
FOR SELECT
USING (is_available = true);

-- Add trigger for updated_at
CREATE TRIGGER update_mentor_availability_updated_at
  BEFORE UPDATE ON public.mentor_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();