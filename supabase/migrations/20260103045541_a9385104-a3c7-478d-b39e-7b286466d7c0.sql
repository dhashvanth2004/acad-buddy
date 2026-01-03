-- Fix: Profiles publicly accessible without authentication
-- Drop the overly permissive policy that allows unauthenticated access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy requiring authentication to view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);