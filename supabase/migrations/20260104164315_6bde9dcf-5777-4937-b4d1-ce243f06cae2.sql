-- Drop overly permissive policy that exposes all profiles to any authenticated user
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Allow viewing mentor profiles (needed for browsing/booking mentors)
CREATE POLICY "Users can view mentor profiles"
ON public.profiles FOR SELECT
USING (role = 'mentor');