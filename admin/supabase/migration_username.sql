-- Migration: username-based login + settings support
-- Run this once in your Supabase SQL editor

-- 1. Add username column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON profiles(username) WHERE username IS NOT NULL;

-- 2. SECURITY DEFINER function so the anon (unauthenticated) role can
--    look up a user's email by their username without bypassing RLS elsewhere.
CREATE OR REPLACE FUNCTION get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT au.email INTO v_email
  FROM auth.users au
  JOIN public.profiles p ON p.id = au.id
  WHERE LOWER(p.username) = LOWER(p_username)
  LIMIT 1;
  RETURN v_email;
END;
$$;

GRANT EXECUTE ON FUNCTION get_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_email_by_username(TEXT) TO authenticated;

-- 3. Allow users to update their own profile (full_name, username)
--    (The policy already exists for SELECT; add UPDATE if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
