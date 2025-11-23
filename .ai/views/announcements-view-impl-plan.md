
```markdown
# Plan implementacji widoku Lista Ogłoszeń (Search/Listing)

## 1. Przegląd
Widok `/ogloszenia` służy do przeglądania, wyszukiwania i filtrowania ogłoszeń o zaginionych i znalezionych zwierzętach. Jest to kluczowy element aplikacji dla użytkowników niezalogowanych (Gości) oraz zalogowanych, realizujący User Stories US-003 i US-004. Widok opiera się na architekturze "Smart Container" w React osadzonej w stronie Astro, co zapewnia dynamiczne filtrowanie bez przeładowania strony przy zachowaniu synchronizacji stanu z URL.

## 2. Routing widoku
- **Ścieżka:** `/ogloszenia` (oraz `/ogloszenia/index.astro`)
- **Dostępność:** Publiczna (nie wymaga logowania).

## 3. Struktura komponentów

```text
src/pages/ogloszenia/index.astro (Layout główny)
└── AnnouncementBrowser.tsx (Smart Container - React)
    ├── FilterSidebar.tsx (Panel filtrów - Desktop)
    │   ├── LocationSelect.tsx (Wybór województwa/powiatu)
    │   └── FilterSection.tsx (Generyczna sekcja filtra)
    ├── MobileFilterTrigger.tsx (Przycisk otwierający modal na mobile)
    │   └── MobileFilterModal.tsx (Wraper filtrów dla mobile - Shadcn Drawer/Dialog)
    ├── ActiveFiltersBar.tsx (Lista aktywnych filtrów - Chips)
    ├── AnnouncementGrid.tsx (Siatka wyników)
    │   ├── AdCard.tsx (Pojedyncza karta ogłoszenia)
    │   └── AdCardSkeleton.tsx (Stan ładowania)
    └── Pagination.tsx (Nawigacja po stronach)
```

## 4. Szczegóły komponentów

### `AnnouncementBrowser` (Container)
- **Opis:** Główny komponent zarządzający stanem aplikacji. Odpowiada za pobieranie danych z API, synchronizację filtrów z URL (Query Params) i przekazywanie danych do komponentów prezentacyjnych.
- **Główne elementy:** `div` (layout grid: sidebar + content), `FilterSidebar`, `AnnouncementGrid`.
- **Obsługiwane interakcje:** Zmiana filtrów, paginacja, inicjalizacja stanu z URL.
- **Zarządzanie stanem:**
  - `filters`: Obiekt stanu filtrów.
  - `announcements`: Tablica ogłoszeń.
  - `isLoading`: Stan ładowania.
  - `pagination`: Aktualna strona, limit.
- **Typy:** `BrowserState`, `FilterParams`.

### `FilterSidebar` (Desktop) & `MobileFilterModal` (Mobile)
- **Opis:** Komponenty prezentujące formularz filtrowania. Wersja mobilna to modal/drawer zawierający te same inputy co sidebar.
- **Główne elementy:**
  - `Select` (Shadcn) dla Gatunku, Województwa, Powiatu, Rozmiaru, Wieku.
  - `Input` (Color).
  - `DatePickerWithRange` (Shadcn) dla zakresu dat.
  - `RadioGroup` dla typu ogłoszenia (Zaginione/Znalezione).
- **Obsługiwane interakcje:** Wybór wartości inputów, resetowanie filtrów.
- **Propsy:**
  - `filters`: Aktualny stan filtrów.
  - `onFilterChange`: Callback `(key, value) => void`.
  - `dictionaries`: Dane słownikowe (województwa, enums).

### `AnnouncementGrid`
- **Opis:** Kontener wyświetlający listę ogłoszeń lub stan pusty/ładowania.
- **Główne elementy:** Grid CSS (Tailwind), lista komponentów `AdCard`.
- **Warunki walidacji:** Jeśli lista pusta i `!isLoading` -> wyświetl komponent `EmptyState`.
- **Propsy:**
  - `items`: Tablica `AnnouncementDto`.
  - `isLoading`: boolean.

### `AdCard`
- **Opis:** Karta prezentująca pojedyncze ogłoszenie.
- **Główne elementy:**
  - Zdjęcie (z fallbackiem).
  - Badge (Zaginiony/Znaleziony).
  - Tytuł, Lokalizacja, Data.
  - Link do szczegółów (`/ogloszenia/[id]`).
- **Typy:** Wymaga obiektu `AnnouncementDto`.

### `LocationSelect`
- **Opis:** Zestaw dwóch selectów (Województwo, Powiat). Powiat aktywuje się dopiero po wybraniu województwa.
- **Walidacja:** Lista powiatów filtrowana na podstawie wybranego `voivodeship`.

## 5. Typy

Plik: `src/types/announcement-filters.ts` (nowy plik)

```typescript
import type { AnimalSpecies, AnimalSize, AnimalAgeRange, AnnouncementType, AnnouncementStatus } from '@/types';

export interface FilterState {
  announcement_type?: AnnouncementType; // 'lost' | 'found'
  species?: AnimalSpecies;
  voivodeship?: string; // nazwa lub kod TERYT
  poviat?: string;
  size?: AnimalSize;
  color?: string;
  age_range?: AnimalAgeRange;
  date_from?: Date;
  date_to?: Date;
  status?: AnnouncementStatus; // Domyślnie 'active'
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FetchAnnouncementsParams extends FilterState {
  page: number;
  pageSize: number;
}
```

## 6. Zarządzanie stanem

Wykorzystanie Custom Hooka: `useAnnouncementSearch`.

- **Lokalizacja:** `src/hooks/useAnnouncementSearch.ts`
- **Odpowiedzialność:**
  1. **URL Sync (Two-way binding):**
     - Przy montowaniu: Parsowanie `window.location.search` do stanu `filters`.
     - Przy zmianie `filters`: Aktualizacja URL (z wykorzystaniem `history.pushState` lub nawigacji Astro, aby nie przeładowywać strony).
  2. **Data Fetching:**
     - Użycie `useEffect` nasłuchującego na zmiany w `filters` oraz `pagination.page`.
     - Wywołanie funkcji pomocniczej `getAnnouncements`.
     - Obsługa `isLoading` i `error`.
  3. **Debouncing:** Opóźnienie zapytania API przy wpisywaniu tekstu (np. kolor) o 300-500ms.

## 7. Integracja API

- **Endpoint:** `/api/announcements` (zgodnie z definicją w punkcie 4).
- **Adapter klienta (`src/lib/api/announcements.ts`):**
  Funkcja mapująca stan filtrów na parametry PostgREST oczekiwane przez endpoint.

```typescript
// Przykład mapowania (fragment logiczny)
const params = new URLSearchParams();
if (filters.species) params.append('species', `eq.${filters.species}`);
if (filters.voivodeship) params.append('voivodeship', `eq.${filters.voivodeship}`);
if (filters.date_from) params.append('event_date', `gte.${formatDate(filters.date_from)}`);
// ... itd.
params.append('order', 'created_at.desc');
```

- **Typ odpowiedzi:**
```typescript
{
  data: AnnouncementDto[];
  count: number; // Całkowita liczba rekordów (do paginacji)
  error?: string;
}
```

## 8. Interakcje użytkownika

1. **Wejście na stronę:**
   - URL jest pusty -> Ładowanie domyślnych (wszystkich aktywnych, najnowszych) ogłoszeń.
   - URL zawiera parametry (np. `?species=dog`) -> Ładowanie przefiltrowanej listy.
2. **Zmiana filtra (np. Gatunek: Pies):**
   - Stan `filters.species` zmienia się na `dog`.
   - URL aktualizuje się do `?species=dog`.
   - Lista ogłoszeń zostaje zastąpiona szkieletami (loading).
   - Następuje zapytanie do API.
   - Nowe wyniki renderują się na liście.
3. **Wybór województwa:**
   - Select powiatów odblokowuje się i ładuje listę dla danego województwa.
   - Wyczyszczenie województwa resetuje również powiat.
4. **Mobile:**
   - Kliknięcie "Filtruj" otwiera Drawer.
   - Zmiana opcji w Drawerze nie triggeruje API natychmiast (opcjonalnie: przycisk "Zastosuj").
   - Zamknięcie Drawera / Kliknięcie "Zastosuj" aktualizuje listę.

## 9. Warunki i walidacja

- **Daty:** `date_to` nie może być wcześniejsze niż `date_from`. UI powinno to blokować (DatePicker range mode).
- **Lokalizacja:** Powiat jest zależny od województwa. Nie można wybrać powiatu bez województwa.
- **Status:** Domyślnie pobierane są tylko ogłoszenia `status: eq.active`. Użytkownik może (jeśli dodamy taki filtr w UI, choć w MVP nie jest wymagany dla szukającego) zmienić na `resolved`. Wg User Stories szukamy aktywnych zgłoszeń, więc domyślnie `active`.
- **Paginacja:** Przycisk "Następna strona" zablokowany, jeśli `current_page * limit >= total_count`.

## 10. Obsługa błędów

- **Błąd sieci/API:** Wyświetlenie komponentu `ErrorState` w miejscu Gridu z przyciskiem "Spróbuj ponownie".
- **Brak wyników:** Wyświetlenie `EmptyState` z komunikatem "Nie znaleziono ogłoszeń spełniających kryteria" i przyciskiem "Wyczyść filtry".
- **Błędne parametry w URL:** Jeśli użytkownik wpisze w URL `?species=ufo` (wartość spoza Enum), walidator przy parsowaniu powinien to zignorować i przyjąć `undefined`.

## 11. Kroki implementacji

1. **Setup Typów i Stałych:**
   - Stworzenie pliku `src/types/announcement-filters.ts`.
   - Przygotowanie tablic stałych dla selectów (województwa/powiaty - json lub import z biblioteki, opcje Enumów z `types.ts`).
2. **Warstwa API (Client):**
   - Implementacja funkcji `fetchAnnouncements` w `src/lib/api/announcements.ts` obsługującej budowanie query string w formacie PostgREST.
3. **Komponenty UI (Stateless):**
   - Implementacja `AdCard` (używając Shadcn Card).
   - Implementacja `AdCardSkeleton`.
   - Implementacja formularzy filtrów (`LocationSelect`, `FilterSidebar`).
4. **Hook Logiki Biznesowej:**
   - Implementacja `useAnnouncementSearch` (obsługa stanu, URL, fetchowania).
5. **Integracja (Container):**
   - Stworzenie `AnnouncementBrowser.tsx` spinającego hooka z komponentami UI.
   - Dodanie obsługi wersji mobilnej (Drawer).
6. **Strona Astro:**
   - Utworzenie `src/pages/ogloszenia/index.astro`.
   - Zaimportowanie i osadzenie `AnnouncementBrowser` (client:load).
7. **Testy manualne:**
   - Weryfikacja filtrów złożonych (np. Pies + Mazowieckie + Zaginiony).
   - Sprawdzenie zachowania przycisku "Wstecz" w przeglądarce (czy wraca do poprzedniego stanu filtrów).
```