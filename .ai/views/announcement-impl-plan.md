To jest plan implementacji widoku szczegółów ogłoszenia, zapisany w formacie Markdown.

```markdown
# Plan implementacji widoku Szczegóły Ogłoszenia

## 1. Przegląd
Widok szczegółowy ogłoszenia (`/ogloszenia/[id]`) jest kluczowym punktem aplikacji, służącym do prezentacji pełnych informacji o zaginionym lub znalezionym zwierzęciu. Jego głównym celem jest umożliwienie identyfikacji zwierzęcia, skontaktowanie się z właścicielem (z zachowaniem prywatności) oraz wymiana informacji poprzez komentarze. Widok musi być wysoce wydajny (SSR dla treści statycznych) i interaktywny w sekcjach kontaktu oraz komentarzy (React Islands).

## 2. Routing widoku
- **Ścieżka:** `/ogloszenia/[id]`
- **Typ:** Dynamiczna ścieżka Astro (Server-Side Rendering).

## 3. Struktura komponentów
Drzewo komponentów dla tego widoku:

*   `Page: src/pages/ogloszenia/[id].astro` (Główny layout i pobieranie danych SSR)
    *   `MainWrapper` (Layout ogólny)
        *   `AdContainer` (Grid: Lewa kolumna - Media, Prawa - Info)
            *   `GalleryDisplay` (Komponent Astro/React - karuzela lub grid zdjęć)
            *   `ShareButton` (React Island - `client:visible`)
            *   `ReportButton` (React Island - `client:visible`)
            *   `AdStatusBadge` (Komponent Astro - status wizualny)
            *   `AuthorControls` (React Island - `client:load` - tylko dla autora)
            *   `AdInfoDetails` (Komponent Astro - tabela cech)
            *   `ContactReveal` (React Island - `client:visible`)
        *   `CommentsSection` (React Island - `client:visible`)
            *   `CommentList`
            *   `CommentForm`

## 4. Szczegóły komponentów

### `src/pages/ogloszenia/[id].astro`
- **Opis:** Główna strona. W sekcji frontmatter (SSR) pobiera dane ogłoszenia bezpośrednio z Supabase (lub via helpery), obsługuje błędy 404 jeśli ID nie istnieje.
- **Główne elementy:** Pobieranie danych, przekazywanie propsów do komponentów potomnych.
- **Obsługiwane walidacja:** Sprawdzenie czy `id` jest poprawnym UUID. Przekierowanie do 404 w przypadku braku danych.

### `AdInfoDetails` (Astro)
- **Opis:** Statyczna prezentacja danych tekstowych (Tytuł, Opis, Cechy: Gatunek, Rasa, Kolor, Lokalizacja).
- **Główne elementy:** Semantyczne tagi HTML (`dl`, `dt`, `dd`, `h1`, `p`).
- **Propsy:** `announcement: AnnouncementDto`

### `GalleryDisplay` (React - opcjonalnie Astro jeśli brak interakcji)
- **Opis:** Wyświetla główne zdjęcie oraz miniatury (jeśli jest więcej niż jedno).
- **Główne elementy:** `img` z odpowiednimi atrybutami `alt` i optymalizacją.
- **Propsy:** `images: string[]` (tablica URLi)

### `ContactReveal` (React Island)
- **Opis:** Ukrywa dane kontaktowe. Po kliknięciu sprawdza sesję. Jeśli zalogowany -> wykonuje RPC `get_contact_details`. Jeśli nie -> pokazuje CTA do logowania.
- **Obsługiwane interakcje:** Kliknięcie "Pokaż numer".
- **Typy:** Wymaga typu odpowiedzi z RPC.
- **Zarządzanie stanem:** `isLoading`, `contactData` (string | null), `error`.

### `AuthorControls` (React Island)
- **Opis:** Panel widoczny tylko gdy `current_user.id === announcement.author_id`. Umożliwia edycję (link) i zmianę statusu.
- **Obsługiwane interakcje:** Kliknięcie "Oznacz jako ZNALEZIONE".
- **Integracja API:** `PATCH /api/announcements/[id]`
- **Walidacja:** Status można zmienić tylko jeśli obecny status != 'resolved'.

### `CommentsSection` (React Island)
- **Opis:** Kontener dla listy komentarzy i formularza.
- **Zarządzanie stanem:** `comments` (lista), `isLoading`.
- **Integracja API:** `GET /api/comments?announcement_id=...` (initial load/hydration).

### `CommentForm` (React Component - dziecko CommentsSection)
- **Opis:** Formularz dodawania komentarza.
- **Główne elementy:** `Textarea`, `Checkbox` ("Widziałem to zwierzę"), `Button`.
- **Obsługiwane interakcje:** Submit formularza.
- **Walidacja:** Treść nie może być pusta.
- **Integracja API:** `POST /api/comments`.

### `ShareButton` (React Island)
- **Opis:** Przycisk kopiujący aktualny URL do schowka.
- **Interakcje:** Kliknięcie -> Kopiowanie -> Toast "Skopiowano link".

### `ReportButton` (React Island)
- **Opis:** Przycisk otwierający modal/dialog z powodem zgłoszenia.
- **Interakcje:** Otwarcie modala, wybór powodu, wysłanie.
- **Integracja API:** `POST /api/reports` (mock lub implementacja w przyszłości).

## 5. Typy

Wykorzystujemy typy z `types.ts`. Dodatkowo potrzebujemy typów dla propsów komponentów React.

```typescript
// Import z types.ts
import type { AnnouncementDto, CommentDto, ProfileDto } from '@/types';

// Typy propsów dla komponentów widoku
export interface AdPageProps {
  announcement: AnnouncementDto;
  currentUser: ProfileDto | null; // Potrzebne do sprawdzenia uprawnień autora
}

export interface ContactRevealProps {
  announcementId: string;
  initialIsVisible?: boolean; // Opcjonalnie, jeśli np. autor zawsze widzi
}

export interface CommentSectionProps {
  announcementId: string;
  currentUser?: ProfileDto | null; // Do wyświetlenia awatara w formularzu
  isResolved: boolean; // Jeśli true, blokujemy dodawanie komentarzy (US-007)
}

export interface AuthorControlsProps {
  announcementId: string;
  currentStatus: string;
}

// Typ odpowiedzi z API komentarzy (rozszerzony o profil)
export type CommentWithAuthor = CommentDto & {
  profiles: { username: string } | null
};
```

## 6. Zarządzanie stanem

Stan jest podzielony między serwer (Astro) a klienta (React Islands):

1.  **Astro (Server):**
    *   Pobiera `AnnouncementDto` na podstawie URL params.
    *   Określa czy użytkownik jest autorem (na podstawie sesji cookie).
    *   Ten stan jest niezmienny po załadowaniu strony (poza interakcjami klienta).

2.  **React (Client - `useAnnouncementState` hook opcjonalnie):**
    *   **ContactReveal:** Lokalny stan `useState<string | null>(null)` dla numeru telefonu.
    *   **Comments:** Użycie `useEffect` lub biblioteki (np. TanStack Query) do pobrania i odświeżania listy komentarzy, aby zapewnić aktualność.
    *   **AuthorControls:** Stan loading podczas wykonywania zapytania PATCH.

## 7. Integracja API

### Pobieranie danych ogłoszenia (Astro Server-Side)
- Bezpośrednie użycie klienta Supabase wewnątrz bloku frontmatter `.astro`.
- Zapytanie: `from('announcements').select('*, author:profiles_public(*)').eq('id', id).single()`

### Zmiana statusu (AuthorControls)
- **Request:** `PATCH /api/announcements/[id]`
- **Body:** `{ "status": "resolved" }`
- **Response:** `200 OK` lub `204 No Content`.

### Pobieranie kontaktu (ContactReveal)
- **Request:** `rpc('get_contact_details', { p_announcement_id: id })` (Bezpośrednio przez Supabase Client w przeglądarce, z autentykacją).
- **Response:** `string` (numer telefonu) lub błąd (jeśli brak uprawnień).

### Obsługa komentarzy
- **Listowanie:** `GET /api/comments?announcement_id=eq.[UUID]&select=*,profiles(username)&order=created_at.asc`
- **Dodawanie:** `POST /api/comments`
    - **Body:** `{ announcement_id: string, content: string, is_sighting: boolean }`
    - **Response:** Nowo utworzony obiekt komentarza (do dodania do listy lokalnej).

## 8. Interakcje użytkownika

1.  **Otwarcie strony:** Użytkownik widzi pełne dane. Jeśli status to "resolved", widzi banner "ZNALEZIONE".
2.  **Kliknięcie "Pokaż dane kontaktowe":**
    *   *Niezalogowany:* Pojawia się tooltip/alert "Zaloguj się, aby zobaczyć".
    *   *Zalogowany:* Wywołanie RPC, spinner, podmiana przycisku na numer telefonu.
3.  **Dodanie komentarza:**
    *   Wpisanie treści, opcjonalnie zaznaczenie "Widziałem...".
    *   Kliknięcie "Wyślij".
    *   Formularz się czyści, nowy komentarz pojawia się na dole listy (lub na górze, zależnie od sortowania).
4.  **Autor - Zmiana statusu:**
    *   Kliknięcie "Oznacz jako ZNALEZIONE".
    *   Potwierdzenie (window.confirm lub modal).
    *   Wysyłka PATCH.
    *   Odświeżenie widoku (np. `window.location.reload()` lub update stanu lokalnego UI).

## 9. Warunki i walidacja

-   **Widoczność Kontaktu (US-010):** Komponent `ContactReveal` sprawdza `session` przed próbą pobrania danych. Back-end (RPC) dodatkowo waliduje uprawnienia (Security Definer).
-   **Edycja/Status (US-006, US-007):** Przycisk widoczny tylko jeśli `session.user.id === announcement.author_id`.
-   **Dodawanie komentarzy (US-007):** Zablokowane (formularz disabled lub ukryty), jeśli `announcement.status === 'resolved'`.
-   **Walidacja formularza komentarza:** Pole `content` jest `required`, min. 3 znaki.

## 10. Obsługa błędów

-   **Błąd 404:** Jeśli ID ogłoszenia nie istnieje w DB -> przekierowanie na stronę 404 (Astro `return Astro.redirect('/404')`).
-   **Błąd API Komentarzy:** Toast z komunikatem "Nie udało się dodać komentarza. Spróbuj ponownie."
-   **Błąd RPC Kontaktu:** Jeśli RPC zwróci błąd (np. brak uprawnień mimo zalogowania), wyświetlenie komunikatu "Brak dostępu do danych".
-   **Błąd Sieci:** Obsługa catch w fetch/axios, wyświetlenie stosownego komunikatu użytkownikowi.

## 11. Kroki implementacji

1.  **Setup Strony Astro:** Utworzenie pliku `src/pages/ogloszenia/[id].astro`. Dodanie logiki pobierania `AnnouncementDto` z bazy w frontmatter. Obsługa przypadku braku ogłoszenia (404).
2.  **Statyczny UI:** Implementacja layoutu przy użyciu Tailwind Grid. Wyświetlenie zdjęć, tytułu, opisów i tabeli cech (`AdInfoDisplay`). Dodanie badge'a statusu.
3.  **Komponent AuthorControls:** Stworzenie komponentu React. Implementacja logiki sprawdzania czy user jest autorem (przekazanie user ID z Astro props). Obsługa endpointu PATCH do zmiany statusu.
4.  **Komponent ContactReveal:** Implementacja logiki "ukrytej kurtyny". Integracja z Supabase Client (`rpc`) do bezpiecznego pobierania numeru. Obsługa stanu ładowania i błędu.
5.  **System Komentarzy:**
    *   Implementacja `CommentList` (wyświetlanie, wyróżnianie "Widziano").
    *   Implementacja `CommentForm` (walidacja, checkbox "Sighting").
    *   Spięcie z API `/api/comments` (GET i POST).
    *   Obsługa blokady komentowania dla ogłoszeń zakończonych.
6.  **Przyciski Akcji:** Implementacja `ShareButton` (Clipboard API) oraz szkieletu `ReportButton`.
7.  **Dostosowanie RWD:** Weryfikacja wyglądu na mobile (stackowanie kolumn) vs desktop (layout dwukolumnowy).
8.  **Testy manualne:** Sprawdzenie scenariuszy: gość, zalogowany user, autor, ogłoszenie znalezione.
```