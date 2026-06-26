-- Migration: admin user management v2
-- Run in Supabase SQL Editor

-- 1. Function to list all profiles + email (no auth.uid() check inside — security is in the server action)
CREATE OR REPLACE FUNCTION get_all_profiles_with_email()
RETURNS TABLE (
  id          UUID,
  full_name   TEXT,
  username    TEXT,
  role        TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.username,
    p.role::TEXT,
    u.email,
    p.created_at
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_profiles_with_email() TO authenticated;

-- 2. Function to update any user's role (also SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION admin_update_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new_role NOT IN ('admin', 'vendedor', 'secretaria') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  UPDATE profiles SET role = new_role WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_user_role(UUID, TEXT) TO authenticated;
