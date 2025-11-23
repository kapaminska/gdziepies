-- =====================================================================
-- Szybka naprawa funkcji handle_new_user
-- Uruchom ten skrypt w Supabase Studio > SQL Editor
-- =====================================================================

-- 1. Upewnij się, że rozszerzenie pgcrypto jest dostępne
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 2. Napraw funkcję handle_new_user zgodnie z dokumentacją Supabase
--    - ustaw search_path na pusty string dla bezpieczeństwa
--    - w pełni kwalifikuj wszystkie referencje do schematów
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_username text;
BEGIN
  -- Wyciągnij username z emaila (część przed '@')
  v_username := COALESCE(
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- Upewnij się, że username nie jest pusty
  IF v_username IS NULL OR length(v_username) = 0 THEN
    v_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;
  
  -- Utwórz profil z tym samym id
  -- W pełni kwalifikuj schemat: public.profiles
  INSERT INTO public.profiles (id, username, created_at)
  VALUES (NEW.id, v_username, NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Loguj błąd, ale nie przerywaj tworzenia użytkownika
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Nadaj uprawnienia do funkcji
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- 4. Usuń i odtwórz trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 5. Sprawdź, czy wszystko działa
SELECT 
  'Function check' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user' 
    AND prosecdef = true
    AND proconfig::text LIKE '%search_path=%'
  ) THEN '✅ Function fixed' ELSE '❌ Function not fixed' END as status
UNION ALL
SELECT 
  'Trigger check' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgenabled = 'O'
  ) THEN '✅ Trigger active' ELSE '❌ Trigger not active' END as status;

