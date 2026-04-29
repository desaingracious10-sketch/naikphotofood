-- ============================================================
-- NaikPhoto Admin Setup — Sesi 3
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- 1. Add is_admin column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Helper function: SECURITY DEFINER to avoid RLS recursion
--    Returns TRUE if the calling user is flagged as admin.
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- 3. Admin RLS policies — admins can read/update/delete all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.current_user_is_admin());

-- 4. Promote the first admin
--    Replace the email below with your actual admin email
--    (the user must have already registered via /register first)
UPDATE public.profiles
   SET is_admin = TRUE,
       status = 'active',
       activated_at = NOW()
 WHERE email = 'REPLACE_WITH_YOUR_ADMIN_EMAIL@example.com';

-- 5. Enable realtime broadcast for the profiles table (used by admin dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ============================================================
-- DONE. Verify with:
--   SELECT id, email, full_name, status, is_admin FROM public.profiles;
-- ============================================================
