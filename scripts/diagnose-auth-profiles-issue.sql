-- Diagnostyka problemu na styku auth.users i public.profiles
-- Wykonaj w Supabase Studio > SQL Editor

-- =====================================================================
-- 1. Sprawdź foreign key constraint
-- =====================================================================
SELECT
  'Foreign Key Check' as check_type,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema || '.' || ccu.table_name AS references_table,
  ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'profiles'
  AND tc.table_schema = 'public';

-- =====================================================================
-- 2. Sprawdź funkcję handle_new_user - search_path i uprawnienia
-- =====================================================================
SELECT 
  'Function Check' as check_type,
  proname,
  prosecdef as is_security_definer,
  proconfig as search_path_config,
  -- Wyciągnij search_path z proconfig
  (SELECT string_agg(setting, ', ') 
   FROM unnest(proconfig) AS setting 
   WHERE setting LIKE 'search_path=%') as search_path
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Sprawdź pełną definicję funkcji
SELECT 
  'Function Definition' as check_type,
  pg_get_functiondef(oid) as full_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- =====================================================================
-- 3. Sprawdź trigger - czy jest na właściwej tabeli
-- =====================================================================
SELECT 
  'Trigger Check' as check_type,
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  CASE WHEN tgenabled = 'O' THEN '✅ Enabled' ELSE '❌ Disabled' END as status,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- =====================================================================
-- 4. Sprawdź uprawnienia między schematami
-- =====================================================================
SELECT 
  'Schema Permissions' as check_type,
  nspname as schema_name,
  nspowner::regrole as owner,
  CASE 
    WHEN nspname = 'auth' THEN 'System schema for authentication'
    WHEN nspname = 'public' THEN 'Public application schema'
    ELSE 'Other'
  END as description
FROM pg_namespace
WHERE nspname IN ('auth', 'public');

-- =====================================================================
-- 5. Sprawdź czy funkcja może odwołać się do auth.users
-- =====================================================================
-- To sprawdzi czy są jakieś problemy z dostępem
SELECT 
  'Access Test' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
    THEN '✅ auth.users exists'
    ELSE '❌ auth.users NOT FOUND'
  END as status;

-- =====================================================================
-- 6. Sprawdź RLS na profiles - czy blokuje INSERT
-- =====================================================================
SELECT 
  'RLS Policies on profiles' as check_type,
  policyname,
  cmd as command,
  permissive,
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Sprawdź czy istnieje polityka INSERT
SELECT 
  'INSERT Policy Check' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'profiles' AND cmd = 'INSERT'
    )
    THEN '✅ INSERT policy exists'
    ELSE '❌ NO INSERT POLICY - THIS IS THE PROBLEM!'
  END as status;

-- =====================================================================
-- 7. Sprawdź czy owner funkcji ma uprawnienia
-- =====================================================================
SELECT 
  'Function Owner Permissions' as check_type,
  p.proname,
  p.proowner::regrole as owner,
  p.prosecdef as is_security_definer,
  CASE 
    WHEN p.prosecdef THEN '✅ Runs as function owner (bypasses RLS)'
    ELSE '❌ Runs as caller (RLS applies)'
  END as security_status
FROM pg_proc p
WHERE p.proname = 'handle_new_user';


