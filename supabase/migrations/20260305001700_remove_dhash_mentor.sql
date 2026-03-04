DO $$ 
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the specific user ID based on matching email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email LIKE 'dhashvanthsai@gmail.%' OR email = 'dhashvanthsai@gmail.com'
  LIMIT 1;

  IF target_user_id IS NOT NULL THEN
    -- 1. Strip the mentor role and reset to 'student' in the main profiles table
    UPDATE public.profiles 
    SET role = 'student' 
    WHERE user_id = target_user_id;

    -- 2. Fully delete any existing mentor applications submitted by this user so they are presented with a completely fresh "Become Mentor" screen instead of a pending/rejected wall.
    DELETE FROM public.mentor_applications 
    WHERE user_id = target_user_id;

    RAISE NOTICE 'Successfully reset user % role back to student, cleared previous mentor permissions.', target_user_id;
  ELSE
    RAISE NOTICE 'No matching email found in auth.users';
  END IF;
END $$;
