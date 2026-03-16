-- Create RPC function to get global platform stats securely bypassing RLS
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_mentors INT;
  total_sessions INT;
  avg_rating NUMERIC;
  total_subjects INT;
BEGIN
  -- Count active mentors
  SELECT count(*) INTO total_mentors FROM profiles WHERE role = 'mentor';
  
  -- Count total sessions
  SELECT count(*) INTO total_sessions FROM sessions;
  
  -- Average rating
  SELECT coalesce(avg(rating), 0) INTO avg_rating FROM reviews;
  
  -- Total unique subjects
  SELECT count(DISTINCT unnest(subjects)) INTO total_subjects FROM profiles WHERE role = 'mentor' AND subjects IS NOT NULL;
  
  RETURN json_build_object(
    'mentors', total_mentors,
    'sessions', total_sessions,
    'averageRating', ROUND(avg_rating, 1),
    'subjects', total_subjects
  );
END;
$$;
