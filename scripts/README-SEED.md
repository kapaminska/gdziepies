# Skrypt do dodawania przykładowych ogłoszeń

Ten skrypt dodaje 10 przykładowych ogłoszeń o zaginionych psach do bazy danych.

## Wymagania

1. **Zmienne środowiskowe:**
   - `SUPABASE_URL` - URL projektu Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (omija RLS)

2. **Użytkownik w bazie danych:**
   - W bazie musi istnieć co najmniej jeden użytkownik (profil w tabeli `profiles`)
   - Jeśli nie masz użytkownika, utwórz go przez:
     - **Skrypt (zalecane):** `npm run create:user`
     - **Supabase Studio:** Otwórz http://127.0.0.1:54323 > Authentication > Users > Add User
     - **Lub przez API:** Użyj skryptu `scripts/create-user.js`

## Użycie

### Lokalne środowisko (Supabase lokalny)

1. Uruchom lokalny Supabase:
   ```bash
   supabase start
   ```

2. Pobierz klucze:
   ```bash
   supabase status
   ```
   Skopiuj `API URL` i `service_role key`

3. Ustaw zmienne środowiskowe:
   ```bash
   export SUPABASE_URL=http://127.0.0.1:54321
   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. Uruchom skrypt:
   ```bash
   npm run seed:announcements
   ```

### Środowisko produkcyjne

1. Pobierz klucze z Supabase Dashboard:
   - Project Settings > API
   - Skopiuj `Project URL` i `service_role` key

2. Ustaw zmienne środowiskowe:
   ```bash
   export SUPABASE_URL=https://your-project.supabase.co
   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. Uruchom skrypt:
   ```bash
   npm run seed:announcements
   ```

### Użycie pliku .env

Możesz również utworzyć plik `.env` w katalogu głównym projektu:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Następnie użyj narzędzia do ładowania zmiennych środowiskowych (np. `dotenv-cli`):

```bash
npm install -D dotenv-cli
npx dotenv-cli npm run seed:announcements
```

## Co robi skrypt?

1. Łączy się z bazą danych Supabase używając service role key (omija RLS)
2. Sprawdza, czy istnieje użytkownik w bazie danych
3. Dodaje 10 przykładowych ogłoszeń o zaginionych psach:
   - Różne rasy psów (Golden Retriever, York, Husky, Beagle, Border Collie, Labrador, Chihuahua, German Shepherd, Cocker Spaniel, Shih Tzu)
   - Różne lokalizacje w Polsce
   - Różne rozmiary, kolory i wiek
   - Różne daty zdarzeń

## Bezpieczeństwo

⚠️ **UWAGA:** Service role key ma pełny dostęp do bazy danych i omija wszystkie polityki RLS. Używaj go tylko w bezpiecznym środowisku (lokalnie lub w zaufanych skryptach). Nigdy nie commituj service role key do repozytorium!

