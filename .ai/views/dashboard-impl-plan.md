Oto szczegółowy plan implementacji widoku "Panel Użytkownika" (Moje Konto), przygotowany na podstawie dostarczonego PRD, historyjek użytkownika i specyfikacji technicznej.

---

# Plan implementacji widoku Panel Użytkownika

## 1. Przegląd
Widok "Panel Użytkownika" (`UserDashboard`) służy do zarządzania ogłoszeniami stworzonymi przez zalogowanego użytkownika. Umożliwia przeglądanie listy własnych ogłoszeń, edytowanie ich treści, usuwanie oraz zmienianie statusu na "ZNALEZIONE". Jest to kluczowy element dla cyklu życia ogłoszenia (US-006, US-007).

## 2. Routing widoku
- **Ścieżka:** `/moje-konto`
- **Typ:** Trasa chroniona (Protected Route).
- **Wymagania:** Dostęp tylko dla zalogowanych użytkowników. W przypadku braku sesji, następuje przekierowanie do `/logowanie`.

## 3. Struktura komponentów
Widok zostanie zbudowany w oparciu o architekturę "Islands" frameworku Astro. Główny kontener będzie komponentem Astro (SSR), który załaduje interaktywną "wyspę" Reactową obsługującą logikę stanu.

**Hierarchia:**
1. `UserAccountPage` (`src/pages/moje-konto.astro`) - Główny layout, weryfikacja sesji po stronie serwera.
2. `UserAdsDashboard` (`src/components/dashboard/UserAdsDashboard.tsx`) - Główny komponent React (Island). Zarządza stanem listy i komunikacją z API.
    - `DashboardFilters` (`src/components/dashboard/DashboardFilters.tsx`) - Opcjonalne proste filtrowanie (np. aktywne/zakończone).
    - `AdCard` (`src/components/dashboard/AdCard.tsx`) - Karta pojedynczego ogłoszenia.
        - `AdStatusBadge` (Komponent UI) - Wizualna reprezentacja statusu.
        - `AdActionsMenu` (Shadcn DropdownMenu) - Menu kontekstowe (Edytuj, Zakończ, Usuń).
    - `DeleteConfirmationDialog` (`src/components/dashboard/DeleteConfirmationDialog.tsx`) - Modal potwierdzający usunięcie (Shadcn Dialog/AlertDialog).
    - `PaginationControl` (Shadcn Pagination) - Nawigacja po stronach wyników.
    - `EmptyState` - Komponent wyświetlany przy braku ogłoszeń.

## 4. Szczegóły komponentów

### `UserAccountPage` (Astro)
- **Opis:** Strona serwerowa Astro. Odpowiada za sprawdzenie sesji użytkownika (Supabase SSR) i wyrenderowanie layoutu aplikacji. Przekazuje ID zalogowanego użytkownika do komponentu React.
- **Interakcje:** Przekierowanie przy braku autoryzacji.
- **Propsy:** Brak (strona najwyższego poziomu).

### `UserAdsDashboard` (React Island)
- **Opis:** Kontener zarządzający stanem ogłoszeń. Pobiera dane z API przy montowaniu (lub otrzymuje wstępne dane z Astro) i obsługuje odświeżanie listy po akcjach użytkownika.
- **Główne elementy:** `div` (grid layout), lista komponentów `AdCard`, loader.
- **Stan:**
  - `ads`: `AnnouncementDto[]` - lista ogłoszeń.
  - `isLoading`: `boolean`.
  - `page`: `number` - aktualna strona paginacji.
  - `isDeleteDialogOpen`: `boolean` - sterowanie modalem.
  - `adToDelete`: `string | null` - ID ogłoszenia do usunięcia.
- **Obsługiwane zdarzenia:**
  - `fetchAds()`: Pobranie danych z `/api/announcements`.
  - `handleStatusChange(id, newStatus)`: Wywołanie PATCH.
  - `handleDeleteRequest(id)`: Otwarcie modala.
  - `handleDeleteConfirm()`: Wywołanie DELETE i odświeżenie listy.

### `AdCard` (React)
- **Opis:** Prezentuje skrótowe informacje o ogłoszeniu (zdjęcie, tytuł, data, status).
- **Główne elementy:** `Card` (Shadcn), `img` (thumbnail), `Badge` (status), `DropdownMenu` (akcje).
- **Propsy:**
  - `ad`: `AnnouncementDto`
  - `onStatusChange`: `(id: string, status: AnnouncementStatus) => void`
  - `onDelete`: `(id: string) => void`
- **Logika UI:**
  - Jeśli status == `resolved`, przycisk "Oznacz jako znalezione" jest ukryty lub nieaktywny.
  - Przycisk "Edytuj" jest linkiem (`<a href="...">`) do strony edycji.

### `DeleteConfirmationDialog` (React)
- **Opis:** Modal ostrzegawczy przed nieodwracalnym usunięciem.
- **Główne elementy:** `AlertDialog` (Shadcn).
- **Propsy:**
  - `open`: `boolean`
  - `onOpenChange`: `(open: boolean) => void`
  - `onConfirm`: `() => void`
  - `isDeleting`: `boolean` (dla stanu loading przycisku potwierdzenia).

## 5. Typy

Należy wykorzystać istniejące definicje z `types.ts` i ewentualnie rozszerzyć je o typy pomocnicze dla widoku.

```typescript
// Import z types.ts
import type { AnnouncementDto, AnnouncementStatus } from '@/types';

// Typy lokalne dla komponentu Dashboard
export type DashboardState = {
  ads: AnnouncementDto[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number; // Jeśli API zwraca count
  }
};

// Props dla UserAdsDashboard
export interface UserAdsDashboardProps {
  userId: string; // ID zalogowanego użytkownika do zapytań API
}
```

## 6. Zarządzanie stanem
Zarządzanie stanem będzie odbywać się lokalnie w komponencie `UserAdsDashboard` przy użyciu hooków React:
- `useState`: Przechowywanie listy ogłoszeń, stanów ładowania i widoczności modala.
- `useEffect`: Do pobrania listy ogłoszeń po zamontowaniu komponentu (jeśli nie przekazujemy danych początkowych z Astro) oraz przy zmianie strony paginacji.
- **Custom Hook (Opcjonalnie):** `useUserAnnouncements(userId)` – w celu wyseparowania logiki `fetch`, `update` i `delete` z warstwy widoku.

## 7. Integracja API

Komponenty będą komunikować się z backendem za pośrednictwem endpointów opisanych w specyfikacji.

1.  **Pobieranie listy (GET):**
    -   **URL:** `/api/announcements?author_id=eq.{userId}&select=*,profiles(username)&order=created_at.desc`
    -   **Parametry:** `page` (do obliczenia `offset` i `limit` w Supabase/PostgREST).
    -   **Odpowiedź:** `AnnouncementDto[]`.

2.  **Zmiana statusu (PATCH):**
    -   **URL:** `/api/announcements?id=eq.{adId}`
    -   **Body:** `{ "status": "resolved" }`
    -   **Nagłówki:** `Content-Type: application/json`
    -   **Obsługa:** Optimistic update (natychmiastowa aktualizacja UI) lub przeładowanie listy po sukcesie.

3.  **Usuwanie (DELETE):**
    -   **URL:** `/api/announcements?id=eq.{adId}`
    -   **Obsługa:** Usunięcie elementu z lokalnego stanu `ads` po otrzymaniu statusu `204 No Content`.

## 8. Interakcje użytkownika

1.  **Wejście na stronę:** Użytkownik widzi loader, a następnie listę swoich ogłoszeń posortowaną od najnowszych.
2.  **Zmiana statusu na "ZNALEZIONE":**
    -   Użytkownik klika ikonę "..." (więcej opcji) na karcie ogłoszenia.
    -   Wybiera "Oznacz jako znalezione".
    -   Status na karcie zmienia się wizualnie (np. na zielony badge "ZNALEZIONE").
    -   Wyświetla się powiadomienie (Toast) o sukcesie.
3.  **Edycja ogłoszenia:**
    -   Użytkownik wybiera "Edytuj" z menu.
    -   Następuje przekierowanie do `/ogloszenia/[id]/edytuj`.
4.  **Usuwanie ogłoszenia:**
    -   Użytkownik wybiera "Usuń".
    -   Pojawia się modal: "Czy na pewno chcesz usunąć to ogłoszenie? Tej operacji nie można cofnąć."
    -   Po kliknięciu "Anuluj" modal znika.
    -   Po kliknięciu "Usuń" przycisk wchodzi w stan loading, modal znika, ogłoszenie znika z listy, pojawia się Toast "Ogłoszenie usunięte".

## 9. Warunki i walidacja

-   **Uprawnienia (Frontend):** Przycisk "Edytuj" i "Usuń" jest dostępny tylko dla autora (gwarantowane przez pobieranie listy tylko dla `author_id` = `current_user`).
-   **Blokada statusu:** Jeśli ogłoszenie ma status `resolved`, opcja "Oznacz jako znalezione" powinna być zablokowana lub zamieniona na tekst informacyjny (zgodnie z logiką biznesową, zazwyczaj nie przywraca się statusu do `active` w prosty sposób w MVP, chyba że zdefiniowano inaczej).
-   **Walidacja API:** API zwróci błąd, jeśli użytkownik spróbuje edytować/usunąć cudze ogłoszenie (RLS). Frontend musi obsłużyć ten błąd (np. wylogować użytkownika lub wyświetlić komunikat "Brak uprawnień").

## 10. Obsługa błędów

-   **Błąd ładowania listy:** Wyświetlenie komunikatu "Nie udało się pobrać ogłoszeń. Spróbuj ponownie." z przyciskiem ponowienia.
-   **Błąd akcji (Delete/Patch):** Wyświetlenie powiadomienia typu Toast z treścią błędu. Stan UI (np. usunięty element) powinien zostać przywrócony, jeśli zastosowano optimistic updates.
-   **Pusta lista:** Wyświetlenie komponentu `EmptyState` z zachętą "Nie dodałeś jeszcze żadnych ogłoszeń" i przyciskiem "Dodaj ogłoszenie".

## 11. Kroki implementacji

1.  **Przygotowanie strony Astro:**
    -   Utworzenie pliku `src/pages/moje-konto.astro`.
    -   Implementacja weryfikacji sesji (redirect jeśli brak).
    -   Pobranie `userId`.

2.  **Implementacja komponentów UI (Atomów):**
    -   Stworzenie `AdStatusBadge` (użycie wariantów z Shadcn Badge).
    -   Konfiguracja `DeleteConfirmationDialog`.

3.  **Implementacja `AdCard`:**
    -   Stworzenie layoutu karty.
    -   Podpięcie `DropdownMenu` z Shadcn.
    -   Otypowanie propsów.

4.  **Implementacja `UserAdsDashboard` (Logic Core):**
    -   Setup stanu (`useState`, `useEffect`).
    -   Funkcja `fetchAds` integrująca się z `/api/announcements`.
    -   Funkcje obsługi zdarzeń (`handleDelete`, `handleStatus`).
    -   Integracja `AdCard` wewnątrz gridu.

5.  **Integracja z API:**
    -   Implementacja zapytań `fetch` do endpointów PATCH i DELETE.
    -   Dodanie obsługi błędów (try/catch) i powiadomień (Toast).

6.  **Stylizacja i RWD:**
    -   Dostosowanie gridu (1 kolumna mobile, 2-3 kolumny tablet/desktop).
    -   Weryfikacja wyglądu na mobile (zgodnie z PRD).

7.  **Testy manualne:**
    -   Scenariusz dodania ogłoszenia, przejścia do panelu, zmiany statusu i usunięcia.
    -   Weryfikacja zachowania po odświeżeniu strony.

8.  **Zapis pliku:** Zapisz plan w `.ai/user-dashboard-view-implementation-plan.md`.