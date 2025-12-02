# Rozwiązywanie problemu z tworzeniem użytkownika

Jeśli wystąpi błąd "Database error creating new user", oto kilka rozwiązań:

## Rozwiązanie 1: Supabase Studio (NAJPROSTSZE) ⭐

1. Otwórz Supabase Studio: **http://127.0.0.1:54323**
2. Przejdź do: **Authentication** > **Users**
3. Kliknij **Add User** lub **Invite User**
4. Wprowadź:
   - Email: `test@example.com`
   - Password: `test123456`
   - (Opcjonalnie) Auto Confirm User: ✅ (zaznacz)
5. Kliknij **Create User**

Profil zostanie utworzony automatycznie przez trigger.

## Rozwiązanie 2: Przez skrypt z zmiennymi środowiskowymi

1. Pobierz klucze:
   ```bash
   supabase status
   ```

2. Ustaw zmienne środowiskowe:
   ```bash
   export SUPABASE_URL=http://127.0.0.1:54321
   export SUPABASE_SERVICE_ROLE_KEY=sb_secret_...  # z supabase status
   ```

3. Uruchom skrypt:
   ```bash
   npm run create:user:direct
   ```

## Rozwiązanie 3: Przez plik .env

1. Utwórz plik `.env` w katalogu głównym:
   ```env
   SUPABASE_URL=http://127.0.0.1:54321
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...  # z supabase status
   ```

2. Użyj `dotenv-cli`:
   ```bash
   npm install -D dotenv-cli
   npx dotenv-cli npm run create:user:direct
   ```

## Rozwiązanie 4: Sprawdzenie triggera

Jeśli trigger nie działa, sprawdź:

1. Czy migracje zostały zastosowane:
   ```bash
   supabase db reset
   ```

2. Sprawdź logi Supabase w terminalu, gdzie uruchomiłeś `supabase start`

3. Sprawdź, czy trigger istnieje w bazie (przez Supabase Studio > SQL Editor):
   ```sql
   SELECT trigger_name, event_manipulation, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

## Rozwiązanie 5: Ręczne utworzenie profilu

Jeśli użytkownik został utworzony, ale profil nie:

1. Znajdź ID użytkownika w Supabase Studio (Authentication > Users)
2. W SQL Editor wykonaj:
   ```sql
   INSERT INTO public.profiles (id, username, created_at)
   VALUES (
     'USER_ID_TUTAJ',  -- wklej ID użytkownika
     'test',           -- username
     NOW()
   );
   ```

## Najczęstsze przyczyny błędów

1. **Trigger nie działa** - uruchom `supabase db reset`
2. **Brak uprawnień** - użyj service_role key
3. **Użytkownik już istnieje** - użyj innego emaila lub usuń istniejącego
4. **Brak zmiennych środowiskowych** - ustaw SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY

## Weryfikacja

Po utworzeniu użytkownika, sprawdź:

```bash
# Sprawdź czy użytkownik istnieje
npm run check:supabase

# Sprawdź czy możesz dodać ogłoszenia
npm run seed:announcements
```


