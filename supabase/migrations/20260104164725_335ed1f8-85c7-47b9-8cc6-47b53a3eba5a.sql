-- Drop policy that allows anonymous access to mentor profiles
DROP POLICY IF EXISTS "Users can view mentor profiles" ON public.profiles;

-- Create new policy requiring authentication to view mentor profiles
CREATE POLICY "Authenticated users can view mentor profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (role = 'mentor');