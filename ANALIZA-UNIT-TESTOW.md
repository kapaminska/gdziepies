# Analiza Elementów Wartych Przetestowania Unit Testami

## Priorytet 1: Funkcje Czyste i Logika Biznesowa (NAJWAŻNIEJSZE)

### ✅ 1. Walidatory (`lib/validators/*.ts`)

**Dlaczego warto testować:**
- Czysta logika bez zależności zewnętrznych
- Krytyczne dla bezpieczeństwa danych
- Łatwe do testowania (tylko input/output)
- Wysoki ROI - małe nakłady, duże korzyści

**Co testować:**
```typescript
// lib/validators/announcements.ts
- ✅ createAnnouncementSchema - wszystkie przypadki walidacji
  - Minimalna długość tytułu (3 znaki)
  - Maksymalna długość tytułu (200 znaków)
  - Wymagane pola (title, species, voivodeship, poviat, event_date, image_url)
  - Format daty (YYYY-MM-DD)
  - Format URL zdjęcia
  - Enum values (type: 'lost'/'found', species: 'dog'/'cat')
  - Opcjonalne pola z limitami znaków
  - Domyślne wartości (is_aggressive, is_fearful)

- ✅ updateAnnouncementSchema - partial updates
  - Wszystkie pola opcjonalne
  - Walidacja gdy pole jest podane
  - Nullable fields (size, color, age_range)

- ✅ getAnnouncementsQuerySchema - query params
  - Transformacja string -> number dla page/limit
  - Domyślne wartości
  - Walidacja zakresu dat (event_date_from <= event_date_to)
  - Enum values dla wszystkich filtrów
```

**Przykładowe testy:**
```typescript
describe('createAnnouncementSchema', () => {
  it('should accept valid announcement data', () => {});
  it('should reject title shorter than 3 characters', () => {});
  it('should reject invalid date format', () => {});
  it('should reject invalid URL', () => {});
  it('should set default values for is_aggressive and is_fearful', () => {});
});
```

---

### ✅ 2. Funkcje Pomocnicze (`lib/utils.ts`, `lib/constants/locations.ts`)

**Dlaczego warto testować:**
- Używane w wielu miejscach
- Proste funkcje czyste
- Łatwe do testowania
- Wysoka wartość przy małym nakładzie

**Co testować:**
```typescript
// lib/utils.ts
- ✅ cn() - funkcja łączenia klas CSS
  - Łączenie wielu klas
  - Obsługa undefined/null
  - Konflikt klas Tailwind (twMerge)

// lib/constants/locations.ts
- ✅ getVoivodeshipNames() - lista województw
  - Zwraca wszystkie województwa
  - Poprawna kolejność

- ✅ getPowiatsForVoivodeship() - powiaty dla województwa
  - Zwraca powiaty dla istniejącego województwa
  - Zwraca pustą tablicę dla nieistniejącego

- ✅ isValidVoivodeship() - walidacja województwa
  - Zwraca true dla istniejącego
  - Zwraca false dla nieistniejącego
  - Case sensitivity

- ✅ isValidPoviat() - walidacja powiatu w województwie
  - Zwraca true dla poprawnej kombinacji
  - Zwraca false dla nieistniejącego powiatu
  - Zwraca false dla powiatu z innego województwa
```

---

### ✅ 3. Klasy Błędów (`lib/errors.ts`)

**Dlaczego warto testować:**
- Używane w całej aplikacji
- Ważne dla obsługi błędów
- Proste do testowania
- Zapewniają spójność komunikatów błędów

**Co testować:**
```typescript
// lib/errors.ts
- ✅ ApiError - konstrukcja i właściwości
- ✅ ValidationError - komunikat i fieldErrors
- ✅ NotFoundError - komunikat z ID i bez ID
- ✅ UnauthorizedError - domyślny komunikat
- ✅ ForbiddenError - komunikat
- ✅ ConflictError - komunikat i details
- ✅ handleApiError() - obsługa różnych typów błędów
  - Mapowanie ApiError -> Response
  - Obsługa nieoczekiwanych błędów
  - Poprawne status codes
  - Format odpowiedzi JSON
```

---

### ✅ 4. Funkcje Transformacji Danych (`lib/api/announcements.ts`)

**Dlaczego warto testować:**
- Transformacja między formatami danych
- Logika budowania query string
- Formatowanie dat

**Co testować:**
```typescript
// lib/api/announcements.ts
- ✅ formatDate() - formatowanie Date -> YYYY-MM-DD
  - Różne daty
  - Edge cases (początek roku, koniec miesiąca)
  - Padding zerami

- ✅ buildQueryString() - budowanie query params
  - Wszystkie parametry
  - Opcjonalne parametry (pomijanie undefined)
  - Formatowanie dat
  - Paginacja i sortowanie
```

---

## Priorytet 2: Hooks i Logika Stanu (WAŻNE, ale wymaga mockowania)

### ⚠️ 5. Custom Hooks (`hooks/useAnnouncementSearch.ts`)

**Dlaczego warto testować:**
- Złożona logika stanu
- Synchronizacja z URL
- Debouncing
- Obsługa błędów

**Co testować:**
```typescript
// hooks/useAnnouncementSearch.ts
- ✅ parseUrlParams() - parsowanie URL params
  - Wszystkie typy filtrów
  - Nieprawidłowe wartości (ignorowanie)
  - Brak parametrów

- ✅ buildUrlParams() - budowanie URL params
  - Wszystkie filtry
  - Paginacja (tylko page > 1)
  - Format dat

- ✅ updateUrl() - aktualizacja URL bez reload
  - Poprawne URL
  - Puste parametry

- ✅ useAnnouncementSearch hook (z mockowaniem)
  - Inicjalizacja z URL
  - Zmiana filtrów
  - Debouncing dla color field
  - Synchronizacja URL przy zmianie filtrów
  - Obsługa browser back/forward
  - Fetch danych przy zmianie filtrów
  - Obsługa błędów
```

**Uwaga:** Wymaga mockowania `fetch` i `window.history`

---

## Priorytet 3: Serwisy (WAŻNE, ale wymaga mockowania Supabase)

### ⚠️ 6. Serwisy (`lib/services/*.service.ts`)

**Dlaczego warto testować:**
- Logika biznesowa
- Transformacja danych
- Obsługa błędów
- Autoryzacja i uprawnienia

**Co testować:**
```typescript
// lib/services/announcement.service.ts
- ✅ getAnnouncements() - pobieranie listy
  - Budowanie query z filtrami
  - Paginacja
  - Sortowanie
  - Transformacja danych (profiles_public -> author)
  - Obsługa błędów bazy danych
  - Pusta lista

- ✅ getAnnouncementById() - pobieranie pojedynczego
  - Znaleziony rekord
  - NotFoundError dla nieistniejącego
  - Transformacja danych

- ✅ createAnnouncement() - tworzenie
  - Poprawne tworzenie
  - ConflictError dla duplikatów
  - Ustawienie status='active'
  - Domyślne wartości is_aggressive/is_fearful

- ✅ updateAnnouncement() - aktualizacja
  - Aktualizacja przez autora (sukces)
  - ForbiddenError dla nie-autora
  - NotFoundError dla nieistniejącego
  - Usuwanie undefined values

- ✅ deleteAnnouncement() - usuwanie
  - Usuwanie przez autora (sukces)
  - ForbiddenError dla nie-autora
  - NotFoundError dla nieistniejącego

// lib/services/comments.service.ts
- ✅ getCommentsByAnnouncementId() - pobieranie komentarzy
  - Sortowanie asc/desc
  - Transformacja danych
  - Pusta lista

- ✅ verifyAnnouncementExists() - weryfikacja istnienia
  - Istniejące ogłoszenie
  - NotFoundError dla nieistniejącego

- ✅ createComment() - tworzenie komentarza
  - Poprawne tworzenie
  - NotFoundError dla nieistniejącego ogłoszenia
  - ConflictError dla błędów FK
  - Domyślna wartość is_sighting
```

**Uwaga:** Wymaga mockowania Supabase Client

---

## Priorytet 4: Komponenty React (OPCJONALNE, zależnie od złożoności)

### ⚠️ 7. Proste Komponenty UI

**Dlaczego warto testować:**
- Podstawowa funkcjonalność
- Props i rendering
- Interakcje użytkownika

**Co testować:**
```typescript
// Komponenty z małą logiką biznesową
- ✅ Badge - wyświetlanie różnych wariantów
- ✅ Button - różne warianty i stany
- ✅ Avatar - wyświetlanie inicjałów
- ✅ Skeleton - loading state

// Komponenty z logiką
- ✅ Pagination - obliczanie stron, nawigacja
- ✅ AdStatusBadge - mapowanie status -> wariant
- ✅ ContactReveal - ujawnianie kontaktu po kliknięciu
```

**NIE warto testować:**
- Komponenty shadcn/ui (są już przetestowane)
- Komponenty złożone z wieloma zależnościami (lepiej testować integracyjnie)
- Komponenty głównie prezentacyjne bez logiki

---

## Priorytet 5: Funkcje URL i Parsing (ŚREDNI PRIORYTET)

### ✅ 8. Funkcje Parsowania URL (`hooks/useAnnouncementSearch.ts`)

**Dlaczego warto testować:**
- Logika parsowania jest złożona
- Wiele edge cases
- Ważne dla UX (zachowanie filtrów w URL)

**Szczegółowe testy:**
```typescript
- parseUrlParams()
  - Pojedyncze parametry
  - Wszystkie parametry razem
  - Nieprawidłowe wartości (ignorowanie)
  - Brak parametrów (pusty obiekt)
  - Case sensitivity dla enum values
  - Parsowanie dat (poprawne i niepoprawne)
  - SSR safety (typeof window === 'undefined')

- buildUrlParams()
  - Pojedyncze filtry
  - Wszystkie filtry
  - Paginacja (page=1 pomijany)
  - Format dat (YYYY-MM-DD)
  - Puste filtry (pusty string)
```

---

## Podsumowanie - Rekomendacje

### 🎯 ZACZNIJ OD (Najwyższy ROI):

1. **Walidatory** - krytyczne, łatwe, szybkie
2. **Funkcje pomocnicze** - używane wszędzie, proste
3. **Klasy błędów** - ważne dla spójności
4. **Funkcje transformacji** - logika biznesowa

### 📊 NASTĘPNIE (Średni ROI):

5. **Funkcje parsowania URL** - złożona logika, wiele edge cases
6. **Hooks** - wymaga mockowania, ale ważna logika
7. **Serwisy** - wymaga mockowania Supabase, ale kluczowa logika biznesowa

### 🔄 OPCJONALNIE (Niski ROI dla unit testów):

8. **Komponenty React** - lepiej testować integracyjnie (E2E)
9. **API endpoints** - lepiej testować integracyjnie

---

## Przykładowa Struktura Testów

```
src/
├── lib/
│   ├── validators/
│   │   └── __tests__/
│   │       ├── announcements.test.ts
│   │       ├── comments.test.ts
│   │       └── profiles.test.ts
│   ├── utils/
│   │   └── __tests__/
│   │       └── utils.test.ts
│   ├── constants/
│   │   └── __tests__/
│   │       └── locations.test.ts
│   ├── errors/
│   │   └── __tests__/
│   │       └── errors.test.ts
│   └── api/
│       └── __tests__/
│           └── announcements.test.ts
├── hooks/
│   └── __tests__/
│       └── useAnnouncementSearch.test.ts
└── services/
    └── __tests__/
        ├── announcement.service.test.ts
        └── comments.service.test.ts
```

---

## Metryki Sukcesu

**Dobre pokrycie testami:**
- ✅ Walidatory: **>95%** (wszystkie edge cases)
- ✅ Funkcje pomocnicze: **>90%**
- ✅ Klasy błędów: **100%**
- ✅ Funkcje transformacji: **>90%**
- ✅ Hooks: **>80%** (główne ścieżki)
- ✅ Serwisy: **>70%** (happy path + główne błędy)

**Czego NIE testować unit testami:**
- ❌ Integracje z Supabase (użyj testów integracyjnych)
- ❌ Komponenty z wieloma zależnościami (użyj testów E2E)
- ❌ API endpoints (użyj testów integracyjnych)
- ❌ Komponenty shadcn/ui (już przetestowane)

---

## Narzędzia i Setup

**Zalecane narzędzia:**
- ✅ Vitest - szybki, kompatybilny z Vite
- ✅ @testing-library/react - testowanie komponentów React
- ✅ @testing-library/react-hooks - testowanie hooks
- ✅ MSW (Mock Service Worker) - mockowanie API calls
- ✅ vi.mock() - mockowanie Supabase Client

**Przykładowy setup:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

