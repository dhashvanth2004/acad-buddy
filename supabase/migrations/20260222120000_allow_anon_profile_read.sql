-- Drop existing profile view policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy allowing both authenticated and anonymous users to view profiles
CREATE POLICY "Anyone can view all profiles"
ON public.profiles
FOR SELECT
TO public
USING (true);
