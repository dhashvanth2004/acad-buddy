DO $$ 
DECLARE
  target_user_id UUID;
BEGIN
  -- 1. Ensure the is_admin column actually exists on the profiles table (fixes previous error)
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;

  -- 2. Find the user ID based on varying spellings of dhashvanthsai (dhashavanthsai, dhashvanthsai, etc.)
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email LIKE 'dhash%@gmail.com'
  LIMIT 1;

  -- 3. Elevate user to Admin
  IF target_user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET is_admin = true 
    WHERE user_id = target_user_id;

    RAISE NOTICE 'Admin granted to %', target_user_id;
  ELSE
    RAISE NOTICE 'No matching email found in auth.users';
  END IF;
END $$;
