# Specyfikacja architektury modułu autentykacji - GdziePies

## 1. Przegląd

Moduł autentykacji w aplikacji GdziePies wykorzystuje Supabase Auth do zarządzania użytkownikami i sesjami. Aplikacja działa w trybie SSR (Server-Side Rendering) z Astro 5, gdzie komponenty React są hydratowane po stronie klienta dla interaktywnych elementów formularzy.

### 1.1. Wymagania funkcjonalne (z PRD)

- **US-001**: Rejestracja nowego użytkownika (email + hasło)
- **US-002**: Logowanie użytkownika (email + hasło)
- **Wylogowanie**: Możliwość wylogowania się z systemu (wymaganie z PRD sekcja 3.1)
- **US-003**: Przeglądanie ogłoszeń przez niezalogowanego użytkownika (z ograniczeniami)
- **US-005**: Dodawanie nowego ogłoszenia (wymaga autoryzacji)
- **US-006**: Zarządzanie własnymi ogłoszeniami (wymaga autoryzacji)
- **US-007**: Oznaczanie ogłoszenia jako "ZNALEZIONE" (wymaga autoryzacji - tylko autor może oznaczyć)
- **US-008**: Dodawanie komentarza pod ogłoszeniem (wymaga autoryzacji, zablokowane dla ogłoszeń "ZNALEZIONE")
- **US-009**: Zgłaszanie, że zwierzę było widziane (wymaga autoryzacji)
- **US-010**: Dostęp do danych kontaktowych (tylko dla zalogowanych)

### 1.2. Status implementacji

#### ✅ Zaimplementowane i działające

**Podstawowe funkcje autoryzacji:**
- ✅ **US-001**: Rejestracja użytkownika (email + hasło)
- ✅ **US-002**: Logowanie użytkownika (email + hasło)
- ✅ **Wylogowanie**: Pełna funkcjonalność wylogowania
- ✅ **Middleware autoryzacji**: Ekstrakcja tokenu z cookies/nagłówków
- ✅ **Synchronizacja stanu**: `onAuthStateChange` w komponentach
- ✅ **Singleton pattern**: Klient Supabase z `supabase-client-factory.ts`

**Ochrona zasobów:**
- ✅ **US-005**: Dodawanie ogłoszeń (wymaga autoryzacji)
- ✅ **US-006**: Zarządzanie ogłoszeniami (wymaga autoryzacji)
- ✅ **US-007**: Oznaczanie jako "ZNALEZIONE" (wymaga autoryzacji, blokuje komentarze)
- ✅ **US-008**: Dodawanie komentarzy (wymaga autoryzacji)
- ✅ **US-009**: Zgłaszanie "widziałem zwierzę" (wymaga autoryzacji)
- ✅ **US-010**: Dostęp do danych kontaktowych (tylko dla zalogowanych)

**Komponenty UI:**
- ✅ `AuthForm.tsx` - formularz logowania/rejestracji
- ✅ `Header.tsx` - nawigacja z menu użytkownika
- ✅ `DashboardGuard.tsx` - ochrona stron wymagających autoryzacji
- ✅ `ContactReveal.tsx` - ujawnianie danych kontaktowych
- ✅ `CommentForm.tsx` - formularz komentarzy (z blokadą dla "ZNALEZIONE")
- ✅ `AdForm.tsx` - formularz dodawania/edycji ogłoszeń

**Strony:**
- ✅ `/logowanie` - strona logowania
- ✅ `/rejestracja` - strona rejestracji
- ✅ `/moje-konto` - dashboard użytkownika (chroniony)
- ✅ `/dodaj-ogloszenie` - dodawanie ogłoszeń (chroniony)

**Walidacja i bezpieczeństwo:**
- ✅ Schematy Zod (`loginSchema`, `registerSchema`)
- ✅ Mapowanie błędów Supabase na komunikaty po polsku
- ✅ RLS (Row Level Security) w bazie danych
- ✅ Walidacja tokenów w middleware

#### 🔄 Do zaimplementowania

**Odzyskiwanie hasła (główna brakująca funkcjonalność):**

**Komponenty React:**
- 🔄 `src/components/auth/PasswordResetForm.tsx` - formularz inicjacji resetu hasła
- 🔄 `src/components/auth/PasswordResetConfirmForm.tsx` - formularz potwierdzenia resetu hasła

**Strony Astro:**
- 🔄 `src/pages/odzyskiwanie-hasla.astro` - strona inicjacji resetu hasła
- 🔄 `src/pages/reset-hasla.astro` - strona potwierdzenia resetu hasła

**Rozszerzenia istniejących plików:**
- 🔄 `src/components/auth/AuthForm.tsx` - zmiana linku "Zapomniałeś hasła?" z `#` na `/odzyskiwanie-hasla` (linia 296)
- 🔄 `src/components/auth/auth-schema.ts` - dodanie schematów:
  - `passwordResetSchema` (walidacja email)
  - `passwordResetConfirmSchema` (walidacja password + confirmPassword)

**Integracja z Supabase Auth:**
- 🔄 Wywołanie `client.auth.resetPasswordForEmail()` w `PasswordResetForm`
- 🔄 Wywołanie `client.auth.updateUser({ password })` w `PasswordResetConfirmForm`

**Konfiguracja Supabase (poza kodem):**
- 🔄 Dostosowanie szablonu e-mail resetu hasła do języka polskiego
- 🔄 Ustawienie `redirectTo` na `/reset-hasla` w konfiguracji Supabase

**Testy:**
- 🔄 Testy manualne przepływu resetu hasła
- 🔄 Testy błędów (nieprawidłowy email, wygasły token, itp.)

#### 🔧 Opcjonalne ulepszenia (niekrytyczne)

**Obsługa błędów:**
- 🔧 Rozszerzenie `mapSupabaseError` o błędy resetu hasła (opcjonalne)
- 🔧 Lepsza obsługa przypadku "email niepotwierdzony" (możliwość ponownego wysłania)

**Walidacja:**
- 🔧 Dodanie walidacji siły hasła (oprócz minimum 6 znaków)
- 🔧 Walidacja formatu telefonu w profilu użytkownika (jeśli wymagana)

**UX:**
- 🔧 Wyświetlanie komunikatu sukcesu po rejestracji (obecnie tylko przekierowanie)
- 🔧 Wyświetlanie komunikatu sukcesu po resetowaniu hasła
- 🔧 Ulepszenie loading states w komponentach autoryzacji

**Konfiguracja Supabase:**
- 🔧 Decyzja, czy wymagać potwierdzenia e-mail przed logowaniem
- 🔧 Jeśli tak, dodanie funkcjonalności ponownego wysłania e-maila weryfikacyjnego

### 1.3. Dodatkowe wymagania (niezaimplementowane)

- **Odzyskiwanie hasła**: Funkcjonalność resetowania hasła przez e-mail (link w AuthForm istnieje, ale nie prowadzi do implementacji) - **patrz sekcja 1.2: Do zaimplementowania**

## 2. Architektura interfejsu użytkownika

### 2.1. Struktura komponentów i stron

#### 2.1.1. Strony Astro (Server-Side)

**`src/pages/logowanie.astro`**
- **Odpowiedzialność**: Renderowanie strony logowania
- **Funkcjonalność**:
  - Sprawdzenie, czy użytkownik jest już zalogowany (server-side) - jeśli tak, przekierowanie na `/`
  - Przekazanie konfiguracji Supabase do komponentu klienckiego przez props i `window.__SUPABASE_URL__`
  - Obsługa parametru `redirectTo` z query string dla przekierowania po zalogowaniu
- **Integracja**: Renderuje komponent `AuthForm` w trybie `login` z `client:load`

**`src/pages/rejestracja.astro`**
- **Odpowiedzialność**: Renderowanie strony rejestracji
- **Funkcjonalność**:
  - Sprawdzenie, czy użytkownik jest już zalogowany (server-side) - jeśli tak, przekierowanie na `/`
  - Przekazanie konfiguracji Supabase do komponentu klienckiego
  - Obsługa parametru `redirectTo` z query string
- **Integracja**: Renderuje komponent `AuthForm` w trybie `register` z `client:load`

**`src/pages/odzyskiwanie-hasla.astro`** (DO UTWORZENIA)
- **Odpowiedzialność**: Renderowanie strony inicjacji odzyskiwania hasła
- **Funkcjonalność**:
  - Sprawdzenie, czy użytkownik jest już zalogowany - jeśli tak, przekierowanie na `/`
  - Renderowanie formularza do wprowadzenia adresu e-mail
  - Przekazanie konfiguracji Supabase do komponentu klienckiego
- **Integracja**: Renderuje komponent `PasswordResetForm` z `client:load`

**`src/pages/reset-hasla.astro`** (DO UTWORZENIA)
- **Odpowiedzialność**: Renderowanie strony resetowania hasła po kliknięciu w link z e-maila
- **Funkcjonalność**:
  - Pobranie tokenu resetowania z query string (`token`, `type`)
  - Walidacja tokenu (server-side lub client-side)
  - Renderowanie formularza do wprowadzenia nowego hasła
  - Przekazanie tokenu i konfiguracji Supabase do komponentu klienckiego
- **Integracja**: Renderuje komponent `PasswordResetConfirmForm` z `client:load`

#### 2.1.2. Komponenty React (Client-Side)

**`src/components/auth/AuthForm.tsx`** (ISTNIEJE - WYMAGA ROZSZERZENIA)
- **Odpowiedzialność**: Uniwersalny formularz autentykacji (logowanie/rejestracja)
- **Stan**: 
  - `mode: 'login' | 'register'` - tryb działania formularza
  - `isLoading: boolean` - stan ładowania podczas przetwarzania
  - `globalError: string | null` - globalny błąd formularza
- **Funkcjonalność**:
  - Walidacja pól formularza przez Zod (`loginSchema` / `registerSchema`)
  - Integracja z Supabase Auth (`signInWithPassword` / `signUp`)
  - Mapowanie błędów Supabase na komunikaty po polsku
  - Automatyczne przekierowanie po sukcesie (z obsługą `redirectTo`)
  - Link do odzyskiwania hasła (obecnie nieaktywny - wymaga implementacji)
- **Wymagane rozszerzenia**:
  - Dodanie linku do `/odzyskiwanie-hasla` zamiast `#` w linii 296
  - Ulepszenie obsługi błędów dla przypadków edge (np. email niepotwierdzony)

**`src/components/auth/PasswordResetForm.tsx`** (DO UTWORZENIA)
- **Odpowiedzialność**: Formularz inicjacji odzyskiwania hasła
- **Stan**:
  - `email: string` - adres e-mail użytkownika
  - `isLoading: boolean` - stan ładowania
  - `isSuccess: boolean` - czy wysłano e-mail z sukcesem
  - `error: string | null` - komunikat błędu
- **Funkcjonalność**:
  - Walidacja adresu e-mail przez Zod
  - Wywołanie `client.auth.resetPasswordForEmail()` z Supabase
  - Wyświetlenie komunikatu sukcesu z instrukcjami
  - Link powrotu do logowania
- **Integracja**: Używa `getOrCreateSupabaseClient` z `supabase-client-factory`

**`src/components/auth/PasswordResetConfirmForm.tsx`** (DO UTWORZENIA)
- **Odpowiedzialność**: Formularz potwierdzenia resetowania hasła
- **Stan**:
  - `password: string` - nowe hasło
  - `confirmPassword: string` - potwierdzenie hasła
  - `isLoading: boolean` - stan ładowania
  - `error: string | null` - komunikat błędu
  - `isSuccess: boolean` - czy reset zakończony sukcesem
- **Funkcjonalność**:
  - Walidacja hasła (minimum 6 znaków, zgodność z potwierdzeniem)
  - Wywołanie `client.auth.updateUser()` z nowym hasłem
  - Przekierowanie do logowania po sukcesie
  - Obsługa nieprawidłowego/wygasłego tokenu
- **Integracja**: Używa `getOrCreateSupabaseClient` i token z URL

**`src/components/auth/auth-schema.ts`** (ISTNIEJE - WYMAGA ROZSZERZENIA)
- **Odpowiedzialność**: Schematy walidacji Zod dla formularzy autentykacji
- **Istniejące schematy**:
  - `loginSchema` - walidacja logowania (email, password)
  - `registerSchema` - walidacja rejestracji (email, password, confirmPassword)
- **Wymagane rozszerzenia**:
  - `passwordResetSchema` - walidacja inicjacji resetu (email)
  - `passwordResetConfirmSchema` - walidacja potwierdzenia resetu (password, confirmPassword)

#### 2.1.3. Komponenty wykorzystujące autoryzację

**`src/components/Header.tsx`** (ISTNIEJE)
- **Odpowiedzialność**: Nagłówek aplikacji z nawigacją i menu użytkownika
- **Funkcjonalność autoryzacji**:
  - Wyświetlanie stanu zalogowania użytkownika (server-side + client-side)
  - Przycisk wylogowania (`handleLogout` - wywołuje `client.auth.signOut()`)
  - Drawer z formularzem logowania dla niezalogowanych
  - Linki do chronionych sekcji dla zalogowanych
- **Stan**: 
  - `user: SupabaseUser | null` - aktualny użytkownik
  - `isLoginDrawerOpen: boolean` - stan draweru logowania
- **Integracja**: Nasłuchuje zmian autoryzacji przez `onAuthStateChange`

**`src/components/announcements/ContactReveal.tsx`** (ISTNIEJE)
- **Odpowiedzialność**: Ujawnianie danych kontaktowych autora ogłoszenia
- **Funkcjonalność autoryzacji**:
  - Sprawdzenie sesji przed wyświetleniem danych (`client.auth.getSession()`)
  - Przekierowanie do logowania z `redirectTo` jeśli użytkownik niezalogowany
  - Wywołanie RPC `get_contact_details` tylko dla zalogowanych
- **Stan**:
  - `contactData: ContactData | null` - dane kontaktowe (null = nie ujawnione)
  - `isLoading: boolean` - stan ładowania
  - `error: string | null` - komunikat błędu

**`src/components/announcements/CommentForm.tsx`** (ISTNIEJE)
- **Odpowiedzialność**: Formularz dodawania komentarza pod ogłoszeniem
- **Funkcjonalność autoryzacji**:
  - Sprawdzenie sesji przed wysłaniem komentarza
  - Przekierowanie do logowania z `redirectTo` jeśli użytkownik niezalogowany
  - Wysyłanie tokenu autoryzacji w nagłówku `Authorization: Bearer ${token}`
  - Blokada formularza dla ogłoszeń ze statusem "resolved" (ZNALEZIONE) - zgodnie z US-007
- **Stan**:
  - `content: string` - treść komentarza
  - `isSighting: boolean` - czy komentarz oznacza "widziałem zwierzę"
  - `isSubmitting: boolean` - stan wysyłania
- **Props**:
  - `isResolved: boolean` - czy ogłoszenie jest oznaczone jako znalezione (blokuje formularz)

**`src/components/announcements/AdForm.tsx`** (ISTNIEJE)
- **Odpowiedzialność**: Formularz dodawania i edycji ogłoszeń
- **Funkcjonalność autoryzacji**:
  - Sprawdzenie sesji przed wysłaniem ogłoszenia (client-side)
  - Przekierowanie do logowania z `redirectTo` jeśli użytkownik niezalogowany
  - Wysyłanie tokenu autoryzacji w nagłówku `Authorization: Bearer ${token}` do POST/PATCH /api/announcements
  - Walidacja, że użytkownik jest autorem przy edycji (wymaganie US-006)
- **Stan**:
  - `mode: 'create' | 'edit'` - tryb działania formularza
  - `isSubmitting: boolean` - stan wysyłania
  - Formularz z polami zgodnie z PRD US-005 (obowiązkowe i opcjonalne)
- **Użycie**: Strony `/dodaj-ogloszenie` i `/moje-konto/edycja/[id]`

**`src/components/dashboard/DashboardGuard.tsx`** (ISTNIEJE)
- **Odpowiedzialność**: Komponent ochrony stron wymagających autoryzacji
- **Funkcjonalność**:
  - Sprawdzenie sesji po załadowaniu komponentu
  - Przekierowanie do logowania z `redirectTo` jeśli brak sesji
  - Nasłuchiwanie zmian autoryzacji i przekierowanie przy wylogowaniu
  - Wyświetlanie loader podczas sprawdzania autoryzacji
- **Użycie**: Ochrona strony `/moje-konto` i innych chronionych sekcji

### 2.2. Walidacja i komunikaty błędów

#### 2.2.1. Walidacja po stronie klienta (Zod)

**Logowanie** (`loginSchema`):
- Email: format e-mail (walidacja Zod `email()`)
- Hasło: wymagane (minimum 1 znak)

**Rejestracja** (`registerSchema`):
- Email: format e-mail (walidacja Zod `email()`)
- Hasło: minimum 6 znaków
- Potwierdzenie hasła: zgodność z hasłem (refine)

**Odzyskiwanie hasła** (`passwordResetSchema` - DO UTWORZENIA):
- Email: format e-mail (walidacja Zod `email()`)

**Potwierdzenie resetu** (`passwordResetConfirmSchema` - DO UTWORZENIA):
- Hasło: minimum 6 znaków
- Potwierdzenie hasła: zgodność z hasłem (refine)

#### 2.2.2. Mapowanie błędów Supabase

Funkcja `mapSupabaseError` w `AuthForm.tsx` mapuje błędy Supabase na komunikaty po polsku:

- `invalid login credentials` → "Nieprawidłowy adres e-mail lub hasło"
- `user already registered` → "Użytkownik o tym adresie e-mail już istnieje"
- `email not confirmed` → "Adres e-mail nie został potwierdzony. Sprawdź swoją skrzynkę pocztową."
- `network` / `fetch` → "Wystąpił problem z połączeniem. Spróbuj ponownie później."
- Domyślny → "Wystąpił błąd podczas uwierzytelniania"

**Wymagane rozszerzenia**:
- Mapowanie błędów dla resetu hasła:
  - `email_not_found` → "Nie znaleziono użytkownika o podanym adresie e-mail"
  - `token_expired` → "Link resetujący hasło wygasł. Wyślij nowy link."
  - `invalid_token` → "Nieprawidłowy link resetujący hasło."

### 2.3. Scenariusze użytkownika

#### 2.3.1. Rejestracja (US-001)

1. Użytkownik wchodzi na `/rejestracja`
2. Strona sprawdza server-side, czy użytkownik jest zalogowany → jeśli tak, przekierowanie na `/`
3. Renderowanie `AuthForm` w trybie `register`
4. Użytkownik wypełnia formularz (email, hasło, potwierdzenie hasła)
5. Walidacja po stronie klienta (Zod)
6. Wywołanie `client.auth.signUp()` z Supabase
7. Jeśli sukces:
   - Oczekiwanie na sesję (300ms delay)
   - Pobranie sesji przez `getSession()`
   - Automatyczne logowanie po rejestracji (zgodnie z PRD US-001)
   - Przekierowanie na `/` (strona główna) lub `redirectTo` jeśli podano (zgodnie z PRD US-001)
8. Jeśli błąd:
   - Wyświetlenie komunikatu błędu przez `mapSupabaseError`

#### 2.3.2. Logowanie (US-002)

1. Użytkownik wchodzi na `/logowanie` lub klika "Zaloguj się" w Header
2. Strona sprawdza server-side, czy użytkownik jest zalogowany → jeśli tak, przekierowanie na `/`
3. Renderowanie `AuthForm` w trybie `login`
4. Użytkownik wypełnia formularz (email, hasło)
5. Walidacja po stronie klienta (Zod)
6. Wywołanie `client.auth.signInWithPassword()` z Supabase
7. Jeśli sukces:
   - Sesja zapisywana automatycznie w localStorage przez Supabase
   - Przekierowanie na `/` (strona główna) lub `redirectTo` jeśli podano (zgodnie z PRD US-002)
8. Jeśli błąd:
   - Wyświetlenie komunikatu błędu przez `mapSupabaseError`

#### 2.3.3. Wylogowanie (wymaganie z PRD sekcja 3.1)

1. Użytkownik klika "Wyloguj się" w menu Header
2. Wywołanie `client.auth.signOut()` z Supabase
3. Usunięcie sesji z localStorage (automatycznie przez Supabase)
4. Przekierowanie na `/` (strona główna)
5. Header automatycznie aktualizuje się przez `onAuthStateChange`
6. Wszystkie komponenty nasłuchujące zmian autoryzacji aktualizują się automatycznie

#### 2.3.4. Odzyskiwanie hasła (DO IMPLEMENTACJI)

**Krok 1: Inicjacja resetu**
1. Użytkownik klika "Zapomniałeś hasła?" w formularzu logowania
2. Przekierowanie na `/odzyskiwanie-hasla`
3. Użytkownik wprowadza adres e-mail
4. Wywołanie `client.auth.resetPasswordForEmail(email, { redirectTo: '/reset-hasla' })`
5. Wyświetlenie komunikatu sukcesu z instrukcjami

**Krok 2: Reset hasła**
1. Użytkownik klika link w e-mailu (zawiera token i type)
2. Przekierowanie na `/reset-hasla?token=...&type=recovery`
3. Strona pobiera token z URL
4. Renderowanie `PasswordResetConfirmForm`
5. Użytkownik wprowadza nowe hasło i potwierdzenie
6. Walidacja po stronie klienta
7. Wywołanie `client.auth.updateUser({ password: newPassword })`
8. Jeśli sukces:
   - Przekierowanie na `/logowanie` z komunikatem sukcesu
9. Jeśli błąd:
   - Wyświetlenie komunikatu błędu (token wygasł/nieważny)

#### 2.3.5. Dostęp do chronionych zasobów

**Dane kontaktowe (US-010)**:
1. Niezalogowany użytkownik próbuje zobaczyć dane kontaktowe
2. `ContactReveal` sprawdza sesję → brak sesji
3. Wyświetlenie komunikatu/przycisku "Zaloguj się, aby zobaczyć dane kontaktowe" (zgodnie z PRD US-003)
4. Przekierowanie na `/logowanie?redirectTo=/ogloszenia/[id]` po kliknięciu
5. Po zalogowaniu automatyczne przekierowanie z powrotem
6. `ContactReveal` ponownie sprawdza sesję → sesja istnieje
7. Wywołanie RPC `get_contact_details` i wyświetlenie danych

**Dodawanie komentarza (US-008, US-009)**:
1. Niezalogowany użytkownik próbuje dodać komentarz
2. `CommentForm` sprawdza sesję → brak sesji
3. Przekierowanie na `/logowanie?redirectTo=/ogloszenia/[id]`
4. Po zalogowaniu automatyczne przekierowanie z powrotem
5. `CommentForm` ponownie sprawdza sesję → sesja istnieje
6. Sprawdzenie, czy ogłoszenie nie jest oznaczone jako "ZNALEZIONE" (status "resolved")
7. Jeśli ogłoszenie jest "ZNALEZIONE" → wyświetlenie komunikatu "Nie można już dodawać komentarzy" (zgodnie z US-007)
8. Jeśli ogłoszenie jest aktywne → wysłanie komentarza z tokenem w nagłówku `Authorization`

**Dodawanie ogłoszenia (US-005)**:
1. Użytkownik próbuje dodać ogłoszenie na `/dodaj-ogloszenie`
2. Strona pobiera użytkownika server-side
3. Jeśli brak sesji → komponent `AdForm` przekierowuje do `/logowanie?redirectTo=/dodaj-ogloszenie`
4. Po zalogowaniu automatyczne przekierowanie z powrotem
5. `AdForm` sprawdza sesję client-side → sesja istnieje
6. Wysłanie ogłoszenia z tokenem w nagłówku `Authorization: Bearer ${token}` do POST /api/announcements
7. API endpoint weryfikuje token i tworzy ogłoszenie z `author_id = auth.uid()`

**Zarządzanie ogłoszeniami (US-006)**:
1. Użytkownik próbuje wejść na `/moje-konto`
2. `DashboardGuard` sprawdza sesję → brak sesji
3. Przekierowanie na `/logowanie?redirectTo=/moje-konto`
4. Po zalogowaniu automatyczne przekierowanie na `/moje-konto`
5. `DashboardGuard` ponownie sprawdza sesję → sesja istnieje
6. Renderowanie zawartości dashboardu z listą ogłoszeń użytkownika

**Oznaczanie jako "ZNALEZIONE" (US-007)**:
1. Autor ogłoszenia klika przycisk "Oznacz jako ZNALEZIONE" na stronie szczegółowej lub w dashboardzie
2. Wysłanie żądania PATCH /api/announcements/{id} z body: `{ "status": "resolved" }`
3. API endpoint weryfikuje, że użytkownik jest autorem (RLS + walidacja)
4. Aktualizacja statusu w bazie danych
5. Frontend aktualizuje UI - wyświetla baner "ZNALEZIONE"
6. Formularz komentarzy jest automatycznie zablokowany (sprawdzenie `isResolved` w `CommentForm`)

## 3. Logika backendowa

### 3.1. Middleware autoryzacji

**`src/middleware/index.ts`** (ISTNIEJE)

**Odpowiedzialność**:
- Inicjalizacja klienta Supabase dla każdego żądania
- Ekstrakcja tokenu autoryzacji z cookies lub nagłówka `Authorization`
- Ustawienie sesji w kontekście Supabase dla RLS (Row Level Security)
- Przekazanie klienta Supabase do `Astro.locals.supabase`

**Mechanizm**:
1. Sprawdzenie nagłówka `Authorization: Bearer <token>` (dla API calls)
2. Jeśli brak nagłówka, próba ekstrakcji z cookie `sb-<project-ref>-auth-token`
3. Parsowanie cookie (obsługa base64 i URL encoding)
4. Ustawienie sesji przez `supabaseClient.auth.setSession()`
5. Przekazanie klienta do `context.locals.supabase`

**Uwagi**:
- Middleware nie blokuje żądań bez sesji - strony obsługują autoryzację client-side
- Obsługa błędów jest graceful - jeśli parsowanie cookie się nie powiedzie, kontynuacja bez sesji

### 3.2. Endpointy API

Obecnie aplikacja nie posiada dedykowanych endpointów API dla autorykacji - wszystkie operacje wykonywane są bezpośrednio przez Supabase Auth po stronie klienta.

**Potencjalne rozszerzenia** (opcjonalne):
- `POST /api/auth/verify-email` - weryfikacja adresu e-mail (jeśli wymagana)
- `POST /api/auth/resend-verification` - ponowne wysłanie e-maila weryfikacyjnego

### 3.3. Walidacja danych wejściowych

**Po stronie klienta**:
- Walidacja przez Zod schematy przed wysłaniem do Supabase
- Walidacja formatu e-mail, długości hasła, zgodności haseł

**Po stronie Supabase**:
- Supabase Auth wykonuje własną walidację (format e-mail, siła hasła)
- Błędy zwracane przez Supabase są mapowane na komunikaty po polsku

### 3.4. Obsługa wyjątków

**Błędy sieciowe**:
- Mapowanie błędów `network` / `fetch` na komunikat "Wystąpił problem z połączeniem"
- Wyświetlenie komunikatu użytkownikowi przez `Alert` w `AuthForm`

**Błędy autoryzacji**:
- Mapowanie błędów Supabase przez `mapSupabaseError`
- Wyświetlenie komunikatu użytkownikowi
- Brak przekierowania - użytkownik może poprawić dane i spróbować ponownie

**Błędy sesji**:
- Jeśli sesja wygaśnie podczas korzystania z aplikacji:
  - `onAuthStateChange` w Header wykrywa zmianę
  - Użytkownik jest przekierowywany do logowania (przez `DashboardGuard` lub komponenty)
  - `redirectTo` zachowuje kontekst dla powrotu

### 3.5. Renderowanie server-side

**Layout (`src/layouts/Layout.astro`)**:
- Pobranie użytkownika server-side przez `Astro.locals.supabase.auth.getUser()`
- Przekazanie `initialUser` do komponentu `Header`
- Iniekcja konfiguracji Supabase do `window.__SUPABASE_URL__` i `window.__SUPABASE_KEY__`
- Obsługa błędów autoryzacji graceful (logowanie w dev mode, kontynuacja bez użytkownika)

**Strony chronione**:
- `/moje-konto` - używa `DashboardGuard` do sprawdzenia autoryzacji client-side
- `/dodaj-ogloszenie` - pobiera użytkownika server-side, ale nie blokuje renderowania (komponent `AdForm` obsługuje przekierowanie)

**Strony publiczne**:
- `/logowanie`, `/rejestracja` - sprawdzają server-side, czy użytkownik jest zalogowany, i przekierowują na `/` jeśli tak

## 4. System autentykacji

### 4.1. Integracja z Supabase Auth

**Klient Supabase**:
- **Server-side**: Tworzony w middleware dla każdego żądania (`createClient` z `persistSession: false`)
- **Client-side**: Singleton przez `getOrCreateSupabaseClient` w `supabase-client-factory.ts` (`persistSession: true`, `autoRefreshToken: true`)

**Operacje autoryzacji**:
- **Rejestracja**: `client.auth.signUp({ email, password })`
- **Logowanie**: `client.auth.signInWithPassword({ email, password })`
- **Wylogowanie**: `client.auth.signOut()`
- **Odzyskiwanie hasła (inicjacja)**: `client.auth.resetPasswordForEmail(email, { redirectTo })` (DO IMPLEMENTACJI)
- **Odzyskiwanie hasła (potwierdzenie)**: `client.auth.updateUser({ password })` (DO IMPLEMENTACJI)
- **Sprawdzenie sesji**: `client.auth.getSession()`
- **Pobranie użytkownika**: `client.auth.getUser()`
- **Nasłuchiwanie zmian**: `client.auth.onAuthStateChange(callback)`

### 4.2. Zarządzanie sesją

**Storage**:
- Sesja przechowywana w `localStorage` przez Supabase (automatycznie)
- Klucz: `sb-<project-ref>-auth-token` (format JSON lub base64)

**Refresh token**:
- Automatyczne odświeżanie tokenu przez Supabase (`autoRefreshToken: true`)
- Obsługa wygaśnięcia sesji przez `onAuthStateChange`

**Synchronizacja server-client**:
- Server-side: Sesja ekstrahowana z cookie w middleware
- Client-side: Sesja odczytywana z localStorage przez Supabase
- Synchronizacja przez `onAuthStateChange` - wszystkie komponenty nasłuchujące aktualizują się automatycznie

### 4.3. Row Level Security (RLS)

**Profil użytkownika**:
- Tabela `profiles` ma RLS włączone
- Użytkownik może odczytywać tylko swój profil
- Trigger `handle_new_user` automatycznie tworzy profil przy rejestracji

**Ogłoszenia**:
- Użytkownik może tworzyć ogłoszenia tylko gdy jest zalogowany (wymaganie US-005)
- Użytkownik może tworzyć ogłoszenia tylko dla siebie (`author_id = auth.uid()`)
- Użytkownik może edytować/usunąć tylko swoje ogłoszenia
- Użytkownik może oznaczyć jako "ZNALEZIONE" tylko swoje ogłoszenia (wymaganie US-007)
- Wszyscy mogą odczytywać aktywne ogłoszenia (również niezalogowani - wymaganie US-003)

**Komentarze**:
- Użytkownik może tworzyć komentarze tylko gdy jest zalogowany (wymaganie US-008)
- Komentarze są zablokowane dla ogłoszeń ze statusem "resolved" (ZNALEZIONE) - wymaganie US-007
- Użytkownik może edytować/usunąć tylko swoje komentarze
- Wszyscy mogą odczytywać komentarze do ogłoszeń (również niezalogowani)

**Dane kontaktowe**:
- Funkcja RPC `get_contact_details` sprawdza autoryzację
- Zwraca dane kontaktowe tylko dla zalogowanych użytkowników

### 4.4. Konfiguracja Supabase

**Zmienne środowiskowe**:
- `SUPABASE_URL` - URL projektu Supabase
- `SUPABASE_KEY` - Anon key (publiczny klucz)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (tylko dla skryptów administracyjnych)

**Konfiguracja Auth w Supabase**:
- Email confirmation: Wymagane (lub opcjonalne - do konfiguracji)
- Password reset: Włączone (wymaga konfiguracji e-mail templates)
- Email templates: Wymagane dostosowanie dla języka polskiego

## 5. Co już jest zrobione

### 5.1. Funkcjonalności zaimplementowane i działające

✅ **Rejestracja użytkownika (US-001)**
- Formularz rejestracji z walidacją (`AuthForm` w trybie `register`)
- Walidacja e-mail, hasła (min 6 znaków), potwierdzenia hasła
- Integracja z Supabase Auth (`signUp`)
- Automatyczne logowanie po rejestracji
- Przekierowanie po sukcesie z obsługą `redirectTo`
- Mapowanie błędów Supabase na komunikaty po polsku

✅ **Logowanie użytkownika (US-002)**
- Formularz logowania z walidacją (`AuthForm` w trybie `login`)
- Walidacja e-mail i hasła
- Integracja z Supabase Auth (`signInWithPassword`)
- Przekierowanie po sukcesie z obsługą `redirectTo`
- Mapowanie błędów Supabase na komunikaty po polsku
- Link do odzyskiwania hasła (obecnie nieaktywny - `#`)

✅ **Wylogowanie użytkownika** (wymaganie z PRD sekcja 3.1)
- Przycisk wylogowania w Header
- Integracja z Supabase Auth (`signOut`)
- Automatyczne przekierowanie na `/` po wylogowaniu
- Synchronizacja stanu przez `onAuthStateChange`
- Usunięcie sesji z localStorage

✅ **Ochrona stron wymagających autoryzacji**
- `DashboardGuard` dla strony `/moje-konto`
- Przekierowanie do logowania z `redirectTo`
- Sprawdzanie autoryzacji w komponentach (`ContactReveal`, `CommentForm`)

✅ **Dostęp do danych kontaktowych (US-010)**
- Komponent `ContactReveal` sprawdza autoryzację
- Przekierowanie do logowania dla niezalogowanych
- Wywołanie RPC `get_contact_details` dla zalogowanych
- Wyświetlanie danych kontaktowych tylko dla zalogowanych

✅ **Dodawanie komentarzy (US-008, US-009)**
- Komponent `CommentForm` sprawdza autoryzację
- Przekierowanie do logowania dla niezalogowanych
- Wysyłanie tokenu w nagłówku `Authorization`
- Obsługa checkboxa "Widziałem to zwierzę"
- Blokada formularza dla ogłoszeń "ZNALEZIONE" (status "resolved") - zgodnie z US-007

✅ **Middleware autoryzacji**
- Ekstrakcja tokenu z cookies lub nagłówka `Authorization`
- Ustawienie sesji w kontekście Supabase dla RLS
- Graceful handling błędów

✅ **Synchronizacja stanu autoryzacji**
- `onAuthStateChange` w Header synchronizuje stan użytkownika
- Wszystkie komponenty nasłuchujące aktualizują się automatycznie
- Server-side rendering z `initialUser` w Layout

✅ **Singleton pattern dla klienta Supabase**
- `supabase-client-factory.ts` zapobiega tworzeniu wielu instancji GoTrueClient
- Wsparcie dla konfiguracji przez props lub `window.__SUPABASE_URL__`

### 5.2. Funkcjonalności częściowo zaimplementowane

⚠️ **Odzyskiwanie hasła**
- Link "Zapomniałeś hasła?" istnieje w `AuthForm.tsx` (linia 296), ale prowadzi do `#`
- Brak strony `/odzyskiwanie-hasla`
- Brak strony `/reset-hasla`
- Brak komponentów `PasswordResetForm` i `PasswordResetConfirmForm`
- Brak schematów walidacji dla resetu hasła

### 5.3. Funkcjonalności wymagające ulepszeń

🔧 **Obsługa błędów**
- Rozszerzenie `mapSupabaseError` o błędy resetu hasła
- Lepsza obsługa przypadku "email niepotwierdzony" (możliwość ponownego wysłania)

🔧 **Walidacja**
- Dodanie walidacji siły hasła (opcjonalne - obecnie tylko minimum 6 znaków)
- Walidacja formatu telefonu w profilu użytkownika (jeśli wymagana)

🔧 **UX**
- Wyświetlanie komunikatu sukcesu po rejestracji (obecnie tylko przekierowanie)
- Wyświetlanie komunikatu sukcesu po resetowaniu hasła
- Loading states w komponentach autoryzacji (częściowo zaimplementowane)

## 6. Wymagane zmiany i rozszerzenia

### 6.1. Nowe pliki do utworzenia

1. **`src/pages/odzyskiwanie-hasla.astro`**
   - Strona inicjacji odzyskiwania hasła
   - Renderuje `PasswordResetForm`

2. **`src/pages/reset-hasla.astro`**
   - Strona potwierdzenia resetu hasła
   - Pobiera token z query string
   - Renderuje `PasswordResetConfirmForm`

3. **`src/components/auth/PasswordResetForm.tsx`**
   - Formularz inicjacji resetu hasła
   - Walidacja e-mail przez Zod
   - Wywołanie `resetPasswordForEmail`

4. **`src/components/auth/PasswordResetConfirmForm.tsx`**
   - Formularz potwierdzenia resetu hasła
   - Walidacja hasła przez Zod
   - Wywołanie `updateUser` z nowym hasłem

5. **Rozszerzenie `src/components/auth/auth-schema.ts`**
   - Dodanie `passwordResetSchema`
   - Dodanie `passwordResetConfirmSchema`

### 6.2. Zmiany w istniejących plikach

1. **`src/components/auth/AuthForm.tsx`**
   - Zmiana linku "Zapomniałeś hasła?" z `#` na `/odzyskiwanie-hasla` (linia 296)

2. **`src/components/auth/AuthForm.tsx`**
   - Rozszerzenie `mapSupabaseError` o błędy resetu hasła (opcjonalne)

### 6.3. Konfiguracja Supabase

1. **Email templates**
   - Dostosowanie szablonu e-mail resetu hasła do języka polskiego
   - Ustawienie `redirectTo` na `/reset-hasla`

2. **Email confirmation** (opcjonalne)
   - Decyzja, czy wymagać potwierdzenia e-mail przed logowaniem
   - Jeśli tak, dodanie funkcjonalności ponownego wysłania e-maila weryfikacyjnego

## 7. Diagramy architektury

### 7.1. Przepływ rejestracji

```
Użytkownik → /rejestracja
  ↓
Server-side: sprawdzenie czy zalogowany → jeśli tak, redirect na /
  ↓
Renderowanie AuthForm (mode: register)
  ↓
Użytkownik wypełnia formularz
  ↓
Walidacja Zod (email, password, confirmPassword)
  ↓
client.auth.signUp({ email, password })
  ↓
Supabase Auth tworzy użytkownika
  ↓
Trigger handle_new_user tworzy profil
  ↓
Oczekiwanie na sesję (300ms)
  ↓
client.auth.getSession()
  ↓
Redirect na / lub redirectTo
```

### 7.2. Przepływ logowania

```
Użytkownik → /logowanie?redirectTo=/ogloszenia/123
  ↓
Server-side: sprawdzenie czy zalogowany → jeśli tak, redirect na /
  ↓
Renderowanie AuthForm (mode: login)
  ↓
Użytkownik wypełnia formularz
  ↓
Walidacja Zod (email, password)
  ↓
client.auth.signInWithPassword({ email, password })
  ↓
Supabase Auth weryfikuje dane
  ↓
Sesja zapisywana w localStorage
  ↓
Redirect na / lub redirectTo (/ogloszenia/123)
```

### 7.3. Przepływ odzyskiwania hasła (DO IMPLEMENTACJI)

```
Użytkownik → klik "Zapomniałeś hasła?"
  ↓
Redirect na /odzyskiwanie-hasla
  ↓
Renderowanie PasswordResetForm
  ↓
Użytkownik wprowadza email
  ↓
Walidacja Zod (email)
  ↓
client.auth.resetPasswordForEmail(email, { redirectTo: '/reset-hasla' })
  ↓
Supabase wysyła e-mail z linkiem resetującym
  ↓
Wyświetlenie komunikatu sukcesu
  ↓
---
Użytkownik klika link w e-mailu
  ↓
Redirect na /reset-hasla?token=...&type=recovery
  ↓
Renderowanie PasswordResetConfirmForm
  ↓
Użytkownik wprowadza nowe hasło
  ↓
Walidacja Zod (password, confirmPassword)
  ↓
client.auth.updateUser({ password: newPassword })
  ↓
Supabase aktualizuje hasło
  ↓
Redirect na /logowanie z komunikatem sukcesu
```

### 7.4. Przepływ dostępu do chronionych zasobów

```
Użytkownik → próba dostępu do chronionego zasobu
  ↓
Komponent sprawdza client.auth.getSession()
  ↓
Brak sesji?
  ↓
TAK → Redirect na /logowanie?redirectTo=/zasób
  ↓
Użytkownik loguje się
  ↓
Redirect z powrotem na /zasób
  ↓
Komponent ponownie sprawdza sesję
  ↓
Sesja istnieje → Wyświetlenie zasobu
```

## 8. Bezpieczeństwo

### 8.1. Zabezpieczenia zaimplementowane

✅ **Hasła**
- Minimum 6 znaków (wymaganie Supabase)
- Hasła nie są przechowywane w plaintext (Supabase używa bcrypt)
- Tokeny sesji przechowywane bezpiecznie w localStorage

✅ **Sesje**
- Tokeny dostępu mają ograniczony czas życia
- Automatyczne odświeżanie tokenów przez Supabase
- Wylogowanie usuwa sesję z localStorage

✅ **RLS (Row Level Security)**
- Użytkownicy mogą modyfikować tylko swoje dane
- Funkcje RPC sprawdzają autoryzację
- Middleware ustawia sesję dla RLS

✅ **CSRF Protection**
- Supabase Auth używa tokenów CSRF w cookies
- Weryfikacja tokenów po stronie Supabase

### 8.2. Rekomendacje bezpieczeństwa

🔒 **Dodatkowe zabezpieczenia (opcjonalne)**:
- Rate limiting dla prób logowania (konfiguracja Supabase)
- Weryfikacja e-mail przed pierwszym logowaniem (konfiguracja Supabase)
- 2FA (dwuskładnikowa autoryzacja) - poza zakresem MVP
- Logowanie prób logowania (audit log) - poza zakresem MVP

## 9. Testowanie

### 9.1. Scenariusze testowe

**Rejestracja**:
1. Rejestracja z poprawnymi danymi → sukces, redirect
2. Rejestracja z istniejącym e-mailem → błąd "Użytkownik już istnieje"
3. Rejestracja z nieprawidłowym formatem e-mail → błąd walidacji
4. Rejestracja z hasłem < 6 znaków → błąd walidacji
5. Rejestracja z niezgodnymi hasłami → błąd walidacji

**Logowanie**:
1. Logowanie z poprawnymi danymi → sukces, redirect
2. Logowanie z nieprawidłowym hasłem → błąd "Nieprawidłowy e-mail lub hasło"
3. Logowanie z nieistniejącym e-mailem → błąd "Nieprawidłowy e-mail lub hasło"
4. Logowanie z nieprawidłowym formatem e-mail → błąd walidacji

**Wylogowanie**:
1. Wylogowanie z zalogowanego konta → sukces, redirect na /
2. Sprawdzenie, czy sesja została usunięta z localStorage

**Odzyskiwanie hasła** (DO IMPLEMENTACJI):
1. Inicjacja resetu z poprawnym e-mailem → sukces, e-mail wysłany
2. Inicjacja resetu z nieistniejącym e-mailem → błąd (lub sukces dla bezpieczeństwa)
3. Reset hasła z poprawnym tokenem → sukces, redirect na logowanie
4. Reset hasła z wygasłym tokenem → błąd "Token wygasł"
5. Reset hasła z nieprawidłowym tokenem → błąd "Nieprawidłowy token"

**Dodawanie ogłoszenia (US-005)**:
1. Próba dodania ogłoszenia bez logowania → redirect na logowanie z redirectTo
2. Dodawanie ogłoszenia z poprawnymi danymi (zalogowany) → sukces, ogłoszenie utworzone
3. Dodawanie ogłoszenia bez wymaganych pól → błąd walidacji 400
4. Dodawanie ogłoszenia z nieprawidłowym tokenem → błąd 401
5. Po zalogowaniu automatyczne przekierowanie z powrotem do formularza

**Oznaczanie jako "ZNALEZIONE" (US-007)**:
1. Próba oznaczenia ogłoszenia bez logowania → redirect na logowanie
2. Próba oznaczenia cudzego ogłoszenia → błąd 403 (brak uprawnień)
3. Oznaczenie własnego ogłoszenia jako "ZNALEZIONE" → sukces, status zmieniony na "resolved"
4. Sprawdzenie, czy formularz komentarzy jest zablokowany dla ogłoszenia "ZNALEZIONE"
5. Sprawdzenie, czy ogłoszenie "ZNALEZIONE" pozostaje widoczne w serwisie

**Dostęp do chronionych zasobów**:
1. Próba dostępu do danych kontaktowych bez logowania → wyświetlenie komunikatu/przycisku "Zaloguj się, aby zobaczyć dane kontaktowe" (US-003)
2. Próba dodania komentarza bez logowania → redirect na logowanie
3. Próba dodania komentarza do ogłoszenia "ZNALEZIONE" → formularz zablokowany (US-007)
4. Próba wejścia na /moje-konto bez logowania → redirect na logowanie
5. Po zalogowaniu automatyczne przekierowanie z powrotem do zasobu

## 10. Podsumowanie

### 10.1. Stan obecny

Aplikacja ma w pełni funkcjonalny moduł autorykacji dla rejestracji, logowania i wylogowania. System jest zintegrowany z Supabase Auth i wykorzystuje RLS do ochrony danych. Komponenty są responsywne i obsługują różne scenariusze użytkownika.

**Wszystkie wymagania z PRD dotyczące autoryzacji są zaimplementowane** (US-001, US-002, US-003, US-005, US-006, US-007, US-008, US-009, US-010).

### 10.2. Brakujące funkcjonalności

**Główna brakująca funkcjonalność: Odzyskiwanie hasła**

Szczegółowy plan implementacji znajduje się w sekcji **6. Wymagane zmiany i rozszerzenia**.

**Wymagane pliki do utworzenia:**
- 2 komponenty React (`PasswordResetForm.tsx`, `PasswordResetConfirmForm.tsx`)
- 2 strony Astro (`odzyskiwanie-hasla.astro`, `reset-hasla.astro`)
- Rozszerzenie schematów walidacji w `auth-schema.ts`

**Wymagane zmiany:**
- Aktualizacja linku w `AuthForm.tsx` (linia 296)
- Integracja z Supabase Auth API
- Konfiguracja email templates w Supabase

**Szacowany zakres:** ~300-400 linii kodu + konfiguracja Supabase

### 10.3. Rekomendacje

1. **Priorytet WYSOKI**: Implementacja odzyskiwania hasła zgodnie z sekcją 6.1
2. **Priorytet ŚREDNI**: Rozszerzenie obsługi błędów i komunikatów sukcesu
3. **Priorytet NISKI**: Dodanie walidacji siły hasła (oprócz minimum 6 znaków)
4. **Konfiguracja**: Dostosowanie szablonów e-mail w Supabase do języka polskiego

### 10.4. Zgodność z wymaganiami PRD

✅ **US-001**: Rejestracja - zaimplementowana i działająca
✅ **US-002**: Logowanie - zaimplementowane i działające
✅ **Wylogowanie**: Zaimplementowane i działające (wymaganie z PRD sekcja 3.1)
✅ **US-003**: Przeglądanie przez niezalogowanych - zaimplementowane (z ograniczeniami)
✅ **US-005**: Dodawanie ogłoszeń - wymaga autoryzacji (zaimplementowane w API endpoint POST /api/announcements)
✅ **US-006**: Zarządzanie ogłoszeniami - wymaga autoryzacji (zaimplementowane)
✅ **US-007**: Oznaczanie jako "ZNALEZIONE" - wymaga autoryzacji (zaimplementowane, blokuje komentarze)
✅ **US-008**: Dodawanie komentarzy - wymaga autoryzacji (zaimplementowane, zablokowane dla "ZNALEZIONE")
✅ **US-009**: Zgłaszanie "widziałem zwierzę" - wymaga autoryzacji (zaimplementowane)
✅ **US-010**: Dostęp do danych kontaktowych - tylko dla zalogowanych (zaimplementowane)

**Odzyskiwanie hasła** nie jest wymienione w wymaganiach PRD, ale jest standardową funkcjonalnością i powinno być zaimplementowane dla lepszego UX.

### 10.5. Szybkie odniesienie do statusu

Dla szybkiego przeglądu statusu implementacji, zobacz sekcję **1.2. Status implementacji** na początku tego dokumentu.

