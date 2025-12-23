-- Add subjects and hourly_rate columns to profiles table for mentors
ALTER TABLE public.profiles 
ADD COLUMN subjects text[] DEFAULT NULL,
ADD COLUMN hourly_rate decimal(10, 2) DEFAULT NULL;