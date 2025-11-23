-- Script to fix the handle_new_user trigger
-- Run this in Supabase Studio > SQL Editor if trigger is not working
-- 
-- This script will:
-- 1. Check current state of trigger and function
-- 2. Recreate the function with proper permissions
-- 3. Recreate the trigger
-- 4. Grant necessary permissions
-- 5. Verify everything is set up correctly

-- =====================================================================
-- 1. DIAGNOSTICS: Check current state
-- =====================================================================

-- Check if function exists
SELECT 
  'Function check' as check_type,
  proname as name,
  prosecdef as is_security_definer,
  CASE WHEN prosecdef THEN '✅ SECURITY DEFINER' ELSE '❌ SECURITY INVOKER' END as status
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check if trigger exists
SELECT 
  'Trigger check' as check_type,
  tgname as name,
  tgrelid::regclass as table_name,
  CASE WHEN tgenabled = 'O' THEN '✅ Enabled' ELSE '❌ Disabled' END as status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- =====================================================================
-- 2. FIX: Ensure pgcrypto extension exists (needed for gen_random_bytes)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- =====================================================================
-- 3. FIX: Recreate function with proper permissions and error handling
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_username text;
BEGIN
  -- Extract username from email (part before @)
  -- If email is null or doesn't contain @, generate a fallback
  v_username := COALESCE(
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- Ensure username is not empty and has minimum length
  IF v_username IS NULL OR length(v_username) = 0 THEN
    v_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;
  
  -- Create profile with same id; username from email before '@'
  -- Use ON CONFLICT to handle race conditions gracefully
  INSERT INTO public.profiles (id, username, created_at)
  VALUES (NEW.id, v_username, NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    -- In production, you might want to log this to a table
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- =====================================================================
-- 4. FIX: Grant necessary permissions to function
-- =====================================================================

-- Grant execute permission to authenticated users (though trigger runs automatically)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- =====================================================================
-- 5. FIX: Recreate trigger
-- =====================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after user is inserted
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 6. FIX: Ensure proper permissions on profiles table
-- =====================================================================

-- Grant necessary permissions (RLS will still apply, but function runs as SECURITY DEFINER)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO postgres, service_role;

-- =====================================================================
-- 7. VERIFICATION: Check if everything is set up correctly
-- =====================================================================

SELECT 
  'Function exists' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
  ) THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
  'Function is SECURITY DEFINER' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user' AND prosecdef = true
  ) THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
  'Trigger exists' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
  'Trigger is enabled' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' AND tgenabled = 'O'
  ) THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
  'pgcrypto extension exists' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
  ) THEN '✅' ELSE '❌' END as status;

