DO $$ 
DECLARE
  target_user_id UUID;
BEGIN
  -- Safely get the UUID matching either dhashvanthsai@gmail or dhashvanthsai@gmail.com
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email LIKE 'dhashvanthsai@gmail%';

  -- If the user exists in the auth tier, flip their is_admin flag within their connected profile
  IF target_user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET is_admin = true 
    WHERE user_id = target_user_id;

    RAISE NOTICE 'Successfully granted admin privileges to user ID: %', target_user_id;
  ELSE
    RAISE NOTICE 'No user found matching dhashvanthsai@gmail%';
  END IF;
END $$;
