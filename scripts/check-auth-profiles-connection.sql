-- Sprawdź połączenie między auth.users a public.profiles
-- Wykonaj w Supabase Studio > SQL Editor

-- 1. Sprawdź czy foreign key istnieje
SELECT
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'profiles'
  AND ccu.table_name = 'users';

-- 2. Sprawdź czy funkcja ma dostęp do schematu auth
SELECT 
  proname,
  prosecdef,
  proconfig,
  prosrc
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Sprawdź search_path funkcji
SELECT 
  p.proname,
  p.prosecdef,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
WHERE p.proname = 'handle_new_user';

-- 4. Sprawdź czy trigger ma dostęp do auth.users
SELECT 
  tgname,
  tgrelid::regclass as table_name,
  tgenabled,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 5. Sprawdź uprawnienia między schematami
SELECT 
  nspname as schema_name,
  nspowner::regrole as owner
FROM pg_namespace
WHERE nspname IN ('auth', 'public');

-- 6. Sprawdź czy można odwołać się do auth.users z funkcji
-- To powinno zwrócić błąd jeśli nie ma dostępu
SELECT COUNT(*) FROM auth.users LIMIT 1;


