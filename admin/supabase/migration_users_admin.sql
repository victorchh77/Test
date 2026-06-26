-- Migration: admin user management (safe version — NO RLS policies, only SECURITY DEFINER functions)
-- Run once in your Supabase SQL editor

-- 1. Get all profiles with email (admin only, bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_profiles_with_email()
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
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

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

GRANT EXECUTE ON FUNCTION get_profiles_with_email() TO authenticated;

-- 2. Update any user's role (admin only, bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION admin_update_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot change your own role';
  END IF;

  IF new_role NOT IN ('admin', 'vendedor', 'secretaria') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  UPDATE profiles SET role = new_role WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_user_role(UUID, TEXT) TO authenticated;
