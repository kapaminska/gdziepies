--- START OF FILE .ai/auth-view-implementation-plan.md ---

```markdown
# Plan implementacji widoku Logowanie / Rejestracja (Auth)

## 1. Przegląd
Widok ten obejmuje proces uwierzytelniania użytkowników w aplikacji GdziePies. Składa się z dwóch stron (Logowanie i Rejestracja), które wykorzystują wspólny komponent formularza. Celem jest umożliwienie użytkownikom uzyskania tokena sesji (JWT) za pośrednictwem Supabase Auth, co pozwoli na dostęp do chronionych funkcji systemu (dodawanie ogłoszeń, komentowanie).

## 2. Routing widoku
Aplikacja będzie obsługiwać dwie oddzielne ścieżki (Pages w Astro), które będą renderować ten sam główny komponent interaktywny z różną konfiguracją:
*   `/logowanie` - Strona logowania.
*   `/rejestracja` - Strona zakładania nowego konta.

> **Uwaga:** Jeśli użytkownik jest już zalogowany, wejście na te podstrony powinno skutkować automatycznym przekierowaniem na stronę główną (`/`). Weryfikacja powinna nastąpić na poziomie Astro (Middleware lub logic w sekcji frontmatter `.astro`).

## 3. Struktura komponentów
Drzewo komponentów dla tego widoku:

*   `Layout.astro` (Główny layout aplikacji - header/footer)
    *   `LoginPage.astro` / `RegisterPage.astro` (Strony Astro)
        *   `AuthForm.tsx` (React Island - `client:load`)
            *   `Card` (Shadcn UI - kontener)
                *   `CardHeader`, `CardTitle`, `CardDescription`
                *   `CardContent`
                    *   `Form` (React Hook Form provider)
                        *   `FormField` (Wrapper dla inputów)
                            *   `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
                            *   `Input` (Komponent UI)
                    *   `Button` (Submit - ze stanem ładowania)
                    *   `Alert` (Wyświetlanie błędów ogólnych)
                *   `CardFooter` (Linki pomocnicze: "Nie masz konta?", "Zapomniałeś hasła?")

## 4. Szczegóły komponentów

### `AuthForm.tsx`
*   **Opis:** Główny, interaktywny komponent obsługujący logikę logowania i rejestracji.
*   **Główne elementy:** Formularz HTML zarządzany przez `react-hook-form`, komponenty UI z biblioteki `shadcn/ui`.
*   **Obsługiwane interakcje:**
    *   Wprowadzanie danych (email, hasło, powtórz hasło).
    *   Walidacja "onBlur" lub "onChange".
    *   Submisja formularza (przycisk "Zaloguj się" / "Zarejestruj się").
    *   Przełączanie widoczności hasła (opcjonalnie, UX improvement).
*   **Obsługiwana walidacja (Zod Schema):**
    *   **E-mail:** Wymagany, poprawny format (regex/zod email).
    *   **Hasło:** Wymagane, min. 6 znaków.
    *   **Powtórz hasło (tylko Rejestracja):** Wymagane, musi być identyczne jak pole "Hasło".
*   **Typy:** `AuthFormProps`, `LoginSchemaType`, `RegisterSchemaType`.
*   **Propsy (`AuthFormProps`):**
    *   `mode`: `'login' | 'register'` - determinuje tryb działania formularza.

### `LoginPage.astro` / `RegisterPage.astro`
*   **Opis:** Statyczne strony Astro, które renderują layout i osadzają `AuthForm`.
*   **Logika:** Sprawdzenie sesji po stronie serwera (lub w middleware) - jeśli sesja istnieje, redirect do `/`.

## 5. Typy

```typescript
// Definicje typów dla formularza

import { z } from "zod";

// Schema dla logowania
export const loginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format adresu e-mail" }),
  password: z.string().min(1, { message: "Hasło jest wymagane" }),
});

// Schema dla rejestracji
export const registerSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format adresu e-mail" }),
  password: z.string().min(6, { message: "Hasło musi mieć minimum 6 znaków" }),
  confirmPassword: z.string().min(1, { message: "Potwierdzenie hasła jest wymagane" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła muszą być identyczne",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export interface AuthFormProps {
  mode: 'login' | 'register';
}
```

## 6. Zarządzanie stanem
Stan jest zarządzany lokalnie w komponencie `AuthForm.tsx` przy użyciu bibliotek:
*   **`react-hook-form`**: Zarządza wartościami pól, stanem "touched", "dirty" oraz błędami walidacji.
*   **`useState` (React)**:
    *   `globalError`: string | null – do przechowywania błędów zwróconych przez Supabase (np. "Invalid login credentials").
    *   `isLoading`: boolean – (może być pobrane z `formState.isSubmitting` z react-hook-form) do blokowania przycisku podczas żądania.

## 7. Integracja API
Integracja odbywa się bezpośrednio przez Supabase JS Client (`@supabase/supabase-js`).

*   **Klient:** Należy zaimportować instancję klienta Supabase (zdefiniowaną w utils/lib projektu).
*   **Metody:**
    *   Logowanie: `supabase.auth.signInWithPassword({ email, password })`
    *   Rejestracja: `supabase.auth.signUp({ email, password })`
*   **Obsługa odpowiedzi:**
    *   **Sukces:** Obiekt `data.user` nie jest nullem, `error` jest nullem.
    *   **Błąd:** Obiekt `error` zawiera `message`.

## 8. Interakcje użytkownika
1.  **Wejście na stronę:** Użytkownik widzi formularz odpowiedni dla danej ścieżki.
2.  **Wypełnianie pól:** Walidacja błędów następuje w czasie rzeczywistym (lub przy opuszczeniu pola).
3.  **Kliknięcie Submit (Błąd walidacji):** Formularz nie jest wysyłany, pola z błędami są podświetlone na czerwono z komunikatem.
4.  **Kliknięcie Submit (Poprawne dane):**
    *   Inputy i przycisk zostają zablokowane (disabled).
    *   Przycisk pokazuje spinner/stan ładowania.
    *   Wysłanie żądania do Supabase.
5.  **Odpowiedź Sukces (Logowanie/Rejestracja):**
    *   Przekierowanie na stronę główną `window.location.href = '/'`.
6.  **Odpowiedź Błąd API:**
    *   Odblokowanie formularza.
    *   Wyświetlenie komunikatu błędu w komponencie `Alert` nad formularzem (np. "Nieprawidłowe dane logowania" lub "Użytkownik o takim adresie już istnieje").
7.  **Przełączanie trybu:** Kliknięcie w link pod formularzem (np. "Zarejestruj się") przenosi na drugą podstronę (`/rejestracja`).

## 9. Warunki i walidacja
*   **Frontend (Zod):**
    *   Email: musi być poprawnym adresem e-mail.
    *   Hasło (Rejestracja): min. 6 znaków.
    *   ConfirmPassword: musi równać się Password.
*   **Backend (Supabase):**
    *   Unikalność e-maila (przy rejestracji).
    *   Poprawność danych uwierzytelniających (przy logowaniu).

## 10. Obsługa błędów
*   **Błędy formularza:** Wyświetlane bezpośrednio pod polem input (`FormMessage` z shadcn/ui).
*   **Błędy uwierzytelniania (Supabase):**
    *   `AuthApiError`: Przechwytywanie błędów takich jak "Invalid login credentials", "User already registered". Należy mapować te komunikaty na język polski, jeśli to możliwe, lub wyświetlać ogólny komunikat.
*   **Błędy sieciowe:** Wyświetlenie ogólnego komunikatu "Wystąpił problem z połączeniem. Spróbuj ponownie później." w komponencie `Alert`.

## 11. Kroki implementacji

1.  **Przygotowanie typów i schematów:**
    *   Utworzenie pliku `src/components/auth/auth-schema.ts` z definicjami Zod dla logowania i rejestracji.
2.  **Stworzenie komponentu AuthForm:**
    *   Utworzenie `src/components/auth/AuthForm.tsx`.
    *   Implementacja struktury wizualnej przy użyciu Shadcn (Card, Form, Input, Button).
    *   Podpięcie `useForm` i `zodResolver`.
3.  **Implementacja logiki biznesowej w AuthForm:**
    *   Dodanie obsługi `onSubmit`.
    *   Wywołanie `supabase.auth.signInWithPassword` dla trybu 'login'.
    *   Wywołanie `supabase.auth.signUp` dla trybu 'register'.
    *   Obsługa przekierowania po sukcesie (`window.location.href = '/'`).
    *   Obsługa błędów i wyświetlanie ich w UI.
4.  **Stworzenie stron Astro:**
    *   Utworzenie `src/pages/logowanie.astro`: renderuje `<AuthForm mode="login" client:load />`.
    *   Utworzenie `src/pages/rejestracja.astro`: renderuje `<AuthForm mode="register" client:load />`.
5.  **Zabezpieczenie stron (Opcjonalnie w tym kroku):**
    *   Dodanie logiki sprawdzającej ciasteczko sesyjne w nagłówku pliku `.astro`, aby przekierować zalogowanych użytkowników.
6.  **Weryfikacja:**
    *   Testy manualne: rejestracja nowego konta, logowanie, próba rejestracji na istniejący email, walidacja haseł.
```