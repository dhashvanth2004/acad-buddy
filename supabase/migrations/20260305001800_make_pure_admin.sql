DO $$ 
DECLARE
  target_user_id UUID;
BEGIN
  -- 1. Find the specific user ID based on matching email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email LIKE 'dhashvanthsai@gmail.%' OR email = 'dhashvanthsai@gmail.com'
  LIMIT 1;

  IF target_user_id IS NOT NULL THEN
    -- 2. Grant them true Admin status, but completely overwrite their 'role' strictly to 'admin' so they are not categorized as a 'student' or 'mentor'
    UPDATE public.profiles 
    SET 
        is_admin = true,
        role = 'admin'
    WHERE user_id = target_user_id;

    -- 3. Delete any lingering mentor applications
    DELETE FROM public.mentor_applications 
    WHERE user_id = target_user_id;

    RAISE NOTICE 'Successfully purged user % of all standard roles (student/mentor) and flagged solely as Admin.', target_user_id;
  ELSE
    RAISE NOTICE 'No matching email found in auth.users';
  END IF;
END $$;
