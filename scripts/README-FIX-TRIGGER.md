# Naprawa błędu "Database error creating new user"

## Problem

Podczas tworzenia użytkownika przez Admin API lub przez stronę występuje błąd:
```
AuthApiError: Database error creating new user
status: 500
code: 'unexpected_failure'
```

## Przyczyna

Funkcja `handle_new_user()` w migracji używała `SET search_path = public, auth`, co jest niezgodne z najlepszymi praktykami bezpieczeństwa Supabase. Zgodnie z dokumentacją Supabase, funkcje z `SECURITY DEFINER` powinny używać `SET search_path = ''` (pusty string) i w pełni kwalifikować wszystkie referencje do schematów.

## Rozwiązanie

### Opcja 1: Szybka naprawa przez Supabase Studio (ZALECANE) ⭐

1. Otwórz Supabase Studio: **http://127.0.0.1:54323**
2. Przejdź do **SQL Editor**
3. Skopiuj i wklej zawartość pliku `scripts/apply-trigger-fix.sql`
4. Kliknij **Run** (lub Ctrl+Enter)
5. Sprawdź wyniki - powinny pokazać ✅ dla obu checków

### Opcja 2: Przez migrację (dla produkcji)

1. Migracja została utworzona: `supabase/migrations/20251123135958_fix_handle_new_user_trigger.sql`
2. Zastosuj migrację:
   ```bash
   # Dla lokalnego środowiska (resetuje bazę i aplikuje wszystkie migracje)
   supabase db reset
   
   # Lub dla produkcji (tylko nowe migracje)
   supabase db push
   ```

### Opcja 3: Ręcznie przez psql

```bash
# Połącz się z bazą
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Wykonaj skrypt
\i scripts/apply-trigger-fix.sql
```

## Co zostało naprawione?

1. ✅ `search_path` zmieniony z `'public, auth'` na `''` (pusty string)
2. ✅ Wszystkie referencje do schematów są w pełni kwalifikowane (`public.profiles`)
3. ✅ Dodana lepsza obsługa błędów z `EXCEPTION` blokiem
4. ✅ Funkcja używa `SECURITY DEFINER` zgodnie z dokumentacją Supabase
5. ✅ Trigger został odtworzony z poprawnymi ustawieniami

## Weryfikacja

Po zastosowaniu naprawy, przetestuj tworzenie użytkownika:

```bash
npm run create:user
```

Lub przez Supabase Studio:
1. Przejdź do **Authentication** > **Users**
2. Kliknij **Add User**
3. Wprowadź email i hasło
4. Użytkownik powinien zostać utworzony bez błędów

## Dokumentacja

Zgodnie z oficjalną dokumentacją Supabase:
- [Troubleshooting Dashboard Errors](https://supabase.com/docs/guides/troubleshooting/dashboard-errors-when-managing-users-N1ls4A)
- Funkcje z `SECURITY DEFINER` powinny używać `SET search_path = ''` dla bezpieczeństwa

## Uwagi

- Naprawa jest bezpieczna i nie wpływa na istniejących użytkowników
- Trigger nadal działa automatycznie przy tworzeniu nowych użytkowników
- Profil jest tworzony automatycznie z username wygenerowanym z emaila

