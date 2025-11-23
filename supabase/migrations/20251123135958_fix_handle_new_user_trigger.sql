-- =====================================================================
-- migration:    fix_handle_new_user_trigger
-- filename:     20251123135958_fix_handle_new_user_trigger.sql
-- purpose:      Naprawa funkcji handle_new_user zgodnie z najlepszymi
--               praktykami Supabase - ustawienie search_path na pusty
--               string dla bezpieczeństwa i pełne kwalifikowanie schematów
--               UWAGA: Ta migracja jest wykonywana PO utworzeniu tabeli profiles
-- =====================================================================

-- =====================================================================
-- 1. Upewnij się, że rozszerzenie pgcrypto jest dostępne
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- =====================================================================
-- 2. Napraw funkcję handle_new_user zgodnie z dokumentacją Supabase
--    - ustaw search_path na pusty string dla bezpieczeństwa
--    - w pełni kwalifikuj wszystkie referencje do schematów
--    - dodaj lepszą obsługę błędów
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
  -- Wyciągnij username z emaila (część przed '@')
  -- Jeśli email jest null lub nie zawiera '@', wygeneruj fallback
  v_username := COALESCE(
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- Upewnij się, że username nie jest pusty i ma minimalną długość
  IF v_username IS NULL OR length(v_username) = 0 THEN
    v_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;
  
  -- Utwórz profil z tym samym id; username z emaila przed '@'
  -- Użyj ON CONFLICT, aby obsłużyć race conditions
  -- W pełni kwalifikuj schemat: public.profiles
  INSERT INTO public.profiles (id, username, created_at)
  VALUES (NEW.id, v_username, NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Loguj błąd, ale nie przerywaj tworzenia użytkownika
    -- W produkcji możesz chcieć logować to do tabeli
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- =====================================================================
-- 3. Nadaj uprawnienia do funkcji
-- =====================================================================
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- =====================================================================
-- 4. Usuń i odtwórz trigger
-- =====================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 5. Upewnij się, że uprawnienia na schemacie są poprawne
-- =====================================================================
-- Uprawnienia na tabeli profiles są już nadawane w oryginalnej migracji
-- (20251031120241_create_core_schema.sql), więc tutaj tylko upewniamy się
-- o uprawnieniach do schematu
GRANT USAGE ON SCHEMA public TO postgres, service_role;

-- =====================================================================
-- koniec migracji
-- =====================================================================

