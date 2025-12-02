# Skrypt do tworzenia użytkownika testowego

Ten skrypt tworzy użytkownika testowego w Supabase Auth, który automatycznie otrzyma profil w tabeli `profiles` dzięki triggerowi w bazie danych.

## Wymagania

1. **Zmienne środowiskowe:**
   - `SUPABASE_URL` - URL projektu Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (omija RLS)

2. **Uruchomiony Supabase:**
   - Lokalnie: `supabase start`
   - Lub dostęp do produkcyjnego Supabase

## Użycie

### Podstawowe użycie (domyślne dane)

```bash
npm run create:user
```

To utworzy użytkownika z:
- Email: `test@example.com`
- Hasło: `test123456`

### Z własnymi danymi

```bash
npm run create:user -- --email twoj@email.com --password twojehaslo123
```

### Z zmiennymi środowiskowymi

```bash
export SUPABASE_URL=http://127.0.0.1:54321
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
npm run create:user
```

## Co robi skrypt?

1. Łączy się z Supabase używając service role key
2. Tworzy użytkownika w `auth.users` przez Admin API
3. Automatycznie potwierdza email (dla lokalnego developmentu)
4. Sprawdza, czy profil został utworzony automatycznie przez trigger
5. Wyświetla szczegóły utworzonego użytkownika

## Inne sposoby tworzenia użytkownika

### 1. Przez Supabase Studio (Web UI)

1. Otwórz Supabase Studio: http://127.0.0.1:54323
2. Przejdź do **Authentication** > **Users**
3. Kliknij **Add User** lub **Invite User**
4. Wprowadź email i hasło
5. Użytkownik zostanie utworzony, a profil automatycznie przez trigger

### 2. Przez API (programowo)

Możesz użyć Supabase JS Client w swoim kodzie:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase.auth.admin.createUser({
  email: 'user@example.com',
  password: 'securepassword123',
  email_confirm: true, // Auto-confirm for local dev
});
```

### 3. Przez formularz rejestracji (gdy będzie zaimplementowany)

Gdy strona rejestracji będzie gotowa (`/rejestracja`), użytkownicy będą mogli rejestrować się samodzielnie.

## Rozwiązywanie problemów

### Błąd: "User already registered"

Użytkownik o tym adresie email już istnieje. Możesz:
- Użyć innego adresu email
- Sprawdzić istniejących użytkowników w Supabase Studio
- Usunąć użytkownika i utworzyć ponownie

### Błąd: "Profile not created"

Trigger `handle_new_user` powinien automatycznie tworzyć profil. Sprawdź:
- Czy migracja została uruchomiona: `supabase migration up`
- Czy trigger istnieje w bazie danych
- Logi Supabase w terminalu

### Błąd: "Invalid API key"

Sprawdź, czy:
- `SUPABASE_SERVICE_ROLE_KEY` jest poprawny
- Używasz **service role key**, nie **anon key**
- Supabase jest uruchomiony (`supabase status`)

## Bezpieczeństwo

⚠️ **UWAGA:** Service role key ma pełny dostęp do bazy danych i omija wszystkie polityki RLS. Używaj go tylko w bezpiecznym środowisku (lokalnie lub w zaufanych skryptach). Nigdy nie commituj service role key do repozytorium!


