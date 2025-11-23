# API Endpoint Implementation Plan: Announcements (Ogłoszenia)

## 1. Przegląd punktu końcowego

Endpointy ogłoszeń (`/announcements`) stanowią główny zasób aplikacji GdziePies, umożliwiając użytkownikom przeglądanie, tworzenie, edytowanie i usuwanie ogłoszeń o zaginionych lub znalezionych zwierzętach. 

Ponieważ aplikacja wykorzystuje Supabase z PostgREST, endpointy będą działać jako warstwa pośrednia między frontendem a automatycznie generowanym API PostgREST. Implementacja w Astro Server Endpoints pozwala na:
- Centralizację walidacji danych wejściowych przy użyciu Zod
- Ekstrakcję logiki biznesowej do serwisów
- Spójną obsługę błędów i odpowiedzi
- Dodatkową warstwę bezpieczeństwa przed bezpośrednim dostępem do PostgREST

Endpointy obsługują następujące operacje:
- **GET /api/announcements** - Lista i filtrowanie ogłoszeń (US-004)
- **POST /api/announcements** - Tworzenie nowego ogłoszenia (US-005)
- **GET /api/announcements/{id}** - Szczegóły pojedynczego ogłoszenia
- **PATCH /api/announcements/{id}** - Aktualizacja ogłoszenia (US-006, US-007)
- **DELETE /api/announcements/{id}** - Usuwanie ogłoszenia (US-006)

## 2. Wykorzystywane typy

### 2.1. DTOs (Data Transfer Objects)

Z pliku `src/types.ts`:

- **`AnnouncementDto`**: Reprezentuje pełne ogłoszenie z informacjami o autorze
  ```typescript
  type AnnouncementDto = Tables<'announcements'> & {
    author: ProfileDto | null;
  };
  ```

- **`ProfileDto`**: Publiczny profil użytkownika (z widoku `profiles_public`)
  ```typescript
  type ProfileDto = Tables<'profiles_public'>;
  ```

### 2.2. Command Modele

- **`CreateAnnouncementCommand`**: Komenda do tworzenia ogłoszenia
  ```typescript
  type CreateAnnouncementCommand = Omit<
    TablesInsert<'announcements'>,
    'id' | 'created_at' | 'updated_at' | 'author_id' | 'status'
  >;
  ```

- **`UpdateAnnouncementCommand`**: Komenda do aktualizacji ogłoszenia
  ```typescript
  type UpdateAnnouncementCommand = Omit<
    TablesUpdate<'announcements'>,
    'id' | 'created_at' | 'updated_at' | 'author_id'
  >;
  ```

### 2.3. Enum Types

- **`AnnouncementType`**: `'lost' | 'found'`
- **`AnnouncementStatus`**: `'active' | 'resolved'`
- **`AnimalSpecies`**: `'dog' | 'cat'`
- **`AnimalSize`**: `'small' | 'medium' | 'large'`
- **`AnimalAgeRange`**: `'young' | 'adult' | 'senior'`

### 2.4. Schematy Zod (do walidacji)

Należy utworzyć schematy Zod w `src/lib/validators/announcements.ts`:

- **`createAnnouncementSchema`**: Walidacja dla POST
- **`updateAnnouncementSchema`**: Walidacja dla PATCH
- **`getAnnouncementsQuerySchema`**: Walidacja parametrów zapytania dla GET
- **`announcementIdSchema`**: Walidacja UUID w ścieżce

## 3. Wspólne formaty błędów

Wszystkie endpointy używają spójnego formatu błędów:

**400 Bad Request:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nieprawidłowe dane wejściowe",
    "details": [
      {
        "field": "title",
        "message": "Tytuł jest wymagany"
      },
      {
        "field": "species",
        "message": "Gatunek musi być 'dog' lub 'cat'"
      }
    ]
  }
}
```

**401 Unauthorized:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Wymagane uwierzytelnienie"
  }
}
```

**403 Forbidden:**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Brak uprawnień do wykonania tej operacji"
  }
}
```

**404 Not Found:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Ogłoszenie o podanym ID nie zostało znalezione"
  }
}
```

**409 Conflict:**
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Konflikt danych",
    "details": "Szczegóły konfliktu"
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Wystąpił błąd serwera"
  }
}
```

## 4. Endpoint 1: GET /api/announcements - Lista i filtrowanie

### 4.1. Szczegóły żądania

**Metoda HTTP:** `GET`

**Struktura URL:** `/api/announcements`

**Parametry zapytania:**

**Wymagane:**
- Brak

**Opcjonalne:**
- `type`: `'lost' | 'found'` - Typ ogłoszenia
- `species`: `'dog' | 'cat'` - Gatunek zwierzęcia
- `voivodeship`: `string` - Województwo
- `poviat`: `string` - Powiat
- `size`: `'small' | 'medium' | 'large'` - Rozmiar zwierzęcia
- `color`: `string` - Kolor zwierzęcia
- `age_range`: `'young' | 'adult' | 'senior'` - Przedział wiekowy
- `event_date_from`: `string` (ISO date) - Data zdarzenia od
- `event_date_to`: `string` (ISO date) - Data zdarzenia do
- `status`: `'active' | 'resolved'` - Status ogłoszenia (domyślnie: `'active'`)
- `page`: `number` - Numer strony (domyślnie: 1)
- `limit`: `number` - Liczba wyników na stronę (domyślnie: 20, maksimum: 100)
- `order_by`: `'created_at' | 'event_date'` - Sortowanie (domyślnie: `'created_at'`)
- `order`: `'asc' | 'desc'` - Kierunek sortowania (domyślnie: `'desc'`)

**Request Body:** Brak

**Nagłówki:**
- `apikey`: `<SUPABASE_ANON_KEY>` (opcjonalny, jeśli używamy bezpośrednio PostgREST)
- `Authorization`: `Bearer <ACCESS_TOKEN>` (opcjonalny, dla dodatkowych danych)

### 4.2. Szczegóły odpowiedzi

**Sukces (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Zaginął Golden Retriever",
      "type": "lost",
      "status": "active",
      "voivodeship": "Mazowieckie",
      "poviat": "Warszawa",
      "location_details": "Park przy ul. Głównej",
      "event_date": "2023-11-01",
      "species": "dog",
      "image_url": "https://xyz.supabase.co/storage/v1/object/public/imgs/dog1.jpg",
      "size": "large",
      "color": "golden",
      "age_range": "adult",
      "description": "Przyjazny pies, ma niebieską obrożę",
      "special_marks": "Biała plama na klatce piersiowej",
      "is_aggressive": false,
      "is_fearful": false,
      "created_at": "2023-11-01T12:00:00Z",
      "updated_at": null,
      "author": {
        "id": "user-uuid",
        "username": "jan_kowalski"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Uwaga:** `phone_number` autora **nie jest zwracane** w odpowiedzi (US-010). Aby pobrać dane kontaktowe, należy wywołać endpoint RPC `/rpc/get_contact_details`.

### 4.3. Przepływ danych

1. **Odbierz żądanie** w `src/pages/api/announcements/index.ts` (GET handler)
2. **Waliduj parametry zapytania** przy użyciu `getAnnouncementsQuerySchema`
3. **Wywołaj serwis** `AnnouncementService.getAnnouncements(queryParams)`
4. **Serwis wykonuje:**
   - Buduje zapytanie PostgREST z filtrami
   - Wykonuje JOIN z tabelą `profiles` dla danych autora (tylko `username`)
   - Stosuje paginację (domyślnie: 20, maksimum: 100)
   - Sortuje wyniki (domyślnie: `created_at DESC`)
5. **Zwróć odpowiedź** z danymi i metadanymi paginacji

### 4.4. Względy bezpieczeństwa

- **Uwierzytelnianie:** Nie wymagane (publiczny dostęp)
- **Autoryzacja:** RLS policy `Allow public read` - wszyscy mogą czytać ogłoszenia
- **Walidacja danych wejściowych:**
  - Wszystkie parametry zapytania walidowane przez `getAnnouncementsQuerySchema`
  - Walidacja enumów dla `type`, `species`, `size`, `age_range`, `status`
  - Walidacja formatu daty dla `event_date_from` i `event_date_to`
  - Walidacja paginacji (limit maksymalnie 100)
- **Prywatność danych:** `phone_number` nie jest zwracane (tylko `username` z profilu)

### 4.5. Obsługa błędów

| Scenariusz | Kod statusu | Komunikat |
|------------|-------------|-----------|
| Nieprawidłowe parametry zapytania | 400 | "Nieprawidłowe dane wejściowe" + szczegóły |
| Nieprawidłowe wartości enum | 400 | "Nieprawidłowe dane wejściowe" + dozwolone wartości |
| Błąd bazy danych | 500 | "Wystąpił błąd serwera" |

### 4.6. Wydajność

- **Indeksy bazy danych:** Wykorzystanie indeksów z `db-plan.md`:
  - `idx_announcements_location` (voivodeship, poviat)
  - `idx_announcements_species`
  - `idx_announcements_status`
  - `idx_announcements_size`, `age_range`, `color`, `event_date`
- **JOIN z profiles:** Użyj `select` z PostgREST: `*,profiles!inner(username)` - tylko `username`
- **Paginacja:** Domyślny limit: 20 wyników, maksymalny: 100 wyników
- **Optymalizacja:** Zwracaj tylko wymagane pola, unikaj pobierania niepotrzebnych kolumn

## 5. Endpoint 2: POST /api/announcements - Tworzenie ogłoszenia

### 5.1. Szczegóły żądania

**Metoda HTTP:** `POST`

**Struktura URL:** `/api/announcements`

**Parametry zapytania:** Brak

**Request Body:**
```typescript
{
  title: string;                    // Wymagane, min 3, max 200 znaków
  type: 'lost' | 'found';           // Wymagane
  species: 'dog' | 'cat';           // Wymagane
  voivodeship: string;              // Wymagane
  poviat: string;                   // Wymagane
  event_date: string;               // Wymagane, format ISO date (YYYY-MM-DD)
  image_url: string;                // Wymagane, URL do zdjęcia w Supabase Storage
  location_details?: string;        // Opcjonalne, max 500 znaków
  size?: 'small' | 'medium' | 'large';
  color?: string;                   // Opcjonalne, max 50 znaków
  age_range?: 'young' | 'adult' | 'senior';
  description?: string;             // Opcjonalne, max 2000 znaków
  special_marks?: string;           // Opcjonalne, max 500 znaków
  is_aggressive?: boolean;          // Domyślnie: false
  is_fearful?: boolean;             // Domyślnie: false
}
```

**Nagłówki:**
- `Authorization`: `Bearer <ACCESS_TOKEN>` (Wymagany)
- `Content-Type`: `application/json`

### 5.2. Szczegóły odpowiedzi

**Sukces (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Znaleziono małego kota",
    "type": "found",
    "status": "active",
    "species": "cat",
    "voivodeship": "Pomorskie",
    "poviat": "Gdańsk",
    "location_details": "Park Oliwski, przy stawie",
    "event_date": "2023-11-02",
    "image_url": "sciezka/do/zdjecia.jpg",
    "size": "small",
    "color": "black",
    "age_range": "young",
    "description": "Bardzo przyjazny, ma czerwoną obrożę.",
    "special_marks": null,
    "is_aggressive": false,
    "is_fearful": true,
    "created_at": "2023-11-02T10:30:00Z",
    "updated_at": null,
    "author": {
      "id": "user-uuid",
      "username": "anna_nowak"
    }
  }
}
```

### 5.3. Przepływ danych

1. **Odbierz żądanie** w `src/pages/api/announcements/index.ts` (POST handler)
2. **Sprawdź autoryzację** - pobierz użytkownika z tokenu JWT (`context.locals.supabase.auth.getUser()`)
3. **Waliduj body** przy użyciu `createAnnouncementSchema`
   - **Wymagane pola (zgodnie z api-plan.md 4.1):** `title`, `species`, `voivodeship`, `poviat`, `event_date`, `image_url`
   - **Walidacja enumów:** `type` ('lost' | 'found'), `species` ('dog' | 'cat'), `size`, `age_range`
4. **Wywołaj serwis** `AnnouncementService.createAnnouncement(command, userId)`
5. **Serwis wykonuje:**
   - Mapuje `CreateAnnouncementCommand` na `TablesInsert<'announcements'>`
   - Dodaje `author_id` z `userId` (z tokenu JWT)
   - Ustawia `status: 'active'` (domyślnie)
   - Ustawia `is_aggressive: false` i `is_fearful: false` (jeśli nie podano)
   - Wstawia rekord do bazy przez Supabase client
   - Pobiera utworzony rekord z danymi autora (JOIN z `profiles`)
6. **Zwróć odpowiedź** z utworzonym obiektem (201 Created)

### 5.4. Względy bezpieczeństwa

- **Uwierzytelnianie:** Wymagane (Bearer token)
- **Autoryzacja:** 
  - RLS policy `Allow authenticated insert` - tylko zalogowani użytkownicy mogą tworzyć ogłoszenia
  - `author_id` jest automatycznie przypisywane z tokenu JWT
- **Walidacja danych wejściowych (zgodnie z api-plan.md 4.1):**
  - **Pola wymagane:** `title`, `species`, `voivodeship`, `poviat`, `event_date`, `image_url`
  - Brak któregokolwiek z wymaganych pól → **400 Bad Request** z szczegółami walidacji
  - **Walidacja enumów:**
    - `species`: Musi być dokładnie `"dog"` lub `"cat"`
    - `type`: Musi być `"lost"` lub `"found"`
    - `size`: Musi pasować do enum `animal_size` lub `null`
    - `age_range`: Musi pasować do enum `animal_age_range` lub `null`
  - Nieprawidłowe wartości enum → **400 Bad Request**
  - Sanityzacja: trim whitespace, walidacja formatu daty (ISO 8601), ograniczenia długości stringów

### 5.5. Obsługa błędów

| Scenariusz | Kod statusu | Komunikat |
|------------|-------------|-----------|
| Brak tokenu autoryzacji | 401 | "Wymagane uwierzytelnienie" |
| Nieprawidłowy token | 401 | "Nieprawidłowy token autoryzacji" |
| Brak wymaganych pól | 400 | "Nieprawidłowe dane wejściowe" + szczegóły |
| Nieprawidłowe wartości enum | 400 | "Nieprawidłowe dane wejściowe" + dozwolone wartości |
| Błąd bazy danych | 500 | "Wystąpił błąd serwera" |

### 5.6. Wydajność

- **Indeksy:** Wykorzystanie indeksów dla szybkiego wstawiania
- **JOIN z profiles:** Efektywny JOIN tylko dla `username` autora
- **Optymalizacja:** Minimalizacja danych w odpowiedzi

## 6. Endpoint 3: GET /api/announcements/{id} - Szczegóły ogłoszenia

### 6.1. Szczegóły żądania

**Metoda HTTP:** `GET`

**Struktura URL:** `/api/announcements/{id}`

**Parametry zapytania:** Brak

**Parametry ścieżki:**
- `id`: `uuid` - Identyfikator ogłoszenia (wymagany)

**Request Body:** Brak

**Nagłówki:**
- `apikey`: `<SUPABASE_ANON_KEY>` (opcjonalny)
- `Authorization`: `Bearer <ACCESS_TOKEN>` (opcjonalny)

### 6.2. Szczegóły odpowiedzi

**Sukces (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Zaginął Golden Retriever",
    "type": "lost",
    "status": "active",
    "voivodeship": "Mazowieckie",
    "poviat": "Warszawa",
    "location_details": "Park przy ul. Głównej",
    "event_date": "2023-11-01",
    "species": "dog",
    "image_url": "https://xyz.supabase.co/storage/v1/object/public/imgs/dog1.jpg",
    "size": "large",
    "color": "golden",
    "age_range": "adult",
    "description": "Przyjazny pies, ma niebieską obrożę",
    "special_marks": "Biała plama na klatce piersiowej",
    "is_aggressive": false,
    "is_fearful": false,
    "created_at": "2023-11-01T12:00:00Z",
    "updated_at": null,
    "author": {
      "id": "user-uuid",
      "username": "jan_kowalski"
    }
  }
}
```

**Uwaga:** `phone_number` autora **nie jest zwracane** w odpowiedzi (US-010).

### 6.3. Przepływ danych

1. **Odbierz żądanie** w `src/pages/api/announcements/[id].ts` (GET handler)
2. **Waliduj parametr `id`** (format UUID) przy użyciu `announcementIdSchema`
3. **Wywołaj serwis** `AnnouncementService.getAnnouncementById(id)`
4. **Serwis wykonuje:**
   - Wykonuje SELECT z JOIN do `profiles` (tylko `username`)
   - Sprawdza, czy ogłoszenie istnieje
5. **Zwróć odpowiedź:**
   - 200 OK z danymi, jeśli znaleziono
   - 404 Not Found, jeśli nie znaleziono

### 6.4. Względy bezpieczeństwa

- **Uwierzytelnianie:** Nie wymagane (publiczny dostęp)
- **Autoryzacja:** RLS policy `Allow public read` - wszyscy mogą czytać ogłoszenia
- **Walidacja danych wejściowych:**
  - Walidacja UUID dla parametru `id` w ścieżce
  - Nieprawidłowy format UUID → **400 Bad Request**
- **Prywatność danych:** `phone_number` nie jest zwracane (tylko `username` z profilu)

### 6.5. Obsługa błędów

| Scenariusz | Kod statusu | Komunikat |
|------------|-------------|-----------|
| Nieprawidłowy format UUID | 400 | "Nieprawidłowy format ID" |
| Ogłoszenie nie istnieje | 404 | "Ogłoszenie o podanym ID nie zostało znalezione" |
| Błąd bazy danych | 500 | "Wystąpił błąd serwera" |

### 6.6. Wydajność

- **Indeksy:** Wykorzystanie indeksu PRIMARY KEY dla szybkiego wyszukiwania po `id`
- **JOIN z profiles:** Efektywny JOIN tylko dla `username` autora
- **Optymalizacja:** Zwracaj tylko wymagane pola

## 7. Endpoint 4: PATCH /api/announcements/{id} - Aktualizacja ogłoszenia

### 7.1. Szczegóły żądania

**Metoda HTTP:** `PATCH`

**Struktura URL:** `/api/announcements/{id}`

**Parametry zapytania:** Brak

**Parametry ścieżki:**
- `id`: `uuid` - Identyfikator ogłoszenia (wymagany)

**Request Body:**
```typescript
{
  title?: string;                   // min 3, max 200 znaków
  type?: 'lost' | 'found';
  species?: 'dog' | 'cat';
  voivodeship?: string;
  poviat?: string;
  event_date?: string;              // format ISO date (YYYY-MM-DD)
  image_url?: string;
  location_details?: string;        // max 500 znaków
  size?: 'small' | 'medium' | 'large';
  color?: string;                   // max 50 znaków
  age_range?: 'young' | 'adult' | 'senior';
  description?: string;             // max 2000 znaków
  special_marks?: string;           // max 500 znaków
  is_aggressive?: boolean;
  is_fearful?: boolean;
  status?: 'active' | 'resolved';   // Dla US-007 (oznaczenie jako znalezione)
}
```

**Nagłówki:**
- `Authorization`: `Bearer <ACCESS_TOKEN>` (Wymagany)
- `Content-Type`: `application/json`

### 7.2. Szczegóły odpowiedzi

**Sukces (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Zaginął Golden Retriever",
    "type": "lost",
    "status": "resolved",
    // ... wszystkie zaktualizowane pola
    "updated_at": "2023-11-03T14:20:00Z",
    "author": {
      "id": "user-uuid",
      "username": "jan_kowalski"
    }
  }
}
```

### 7.3. Przepływ danych

1. **Odbierz żądanie** w `src/pages/api/announcements/[id].ts` (PATCH handler)
2. **Sprawdź autoryzację** - pobierz użytkownika z tokenu JWT
3. **Waliduj parametr `id`** (format UUID) i **body** przy użyciu `updateAnnouncementSchema`
   - Wszystkie pola w body są opcjonalne (partial update)
   - Walidacja enumów dla pól, które są aktualizowane
4. **Wywołaj serwis** `AnnouncementService.updateAnnouncement(id, command, userId)`
5. **Serwis wykonuje:**
   - Sprawdza, czy ogłoszenie istnieje (404 jeśli nie)
   - Sprawdza uprawnienia (RLS + dodatkowa walidacja: `announcement.author_id === userId`)
   - Jeśli użytkownik nie jest autorem → 403 Forbidden
   - Mapuje `UpdateAnnouncementCommand` na `TablesUpdate<'announcements'>`
   - Ustawia `updated_at: now()`
   - Aktualizuje rekord w bazie
   - Pobiera zaktualizowany rekord z danymi autora (JOIN)
6. **Zwróć odpowiedź** z zaktualizowanym obiektem (200 OK)

**Uwaga:** Aktualizacja `status: 'resolved'` jest używana do oznaczenia ogłoszenia jako znalezione (US-007). Frontend jest odpowiedzialny za interpretację tego statusu (baner "ZNALEZIONE", blokada komentarzy).

### 7.4. Względy bezpieczeństwa

- **Uwierzytelnianie:** Wymagane (Bearer token)
- **Autoryzacja:**
  - RLS policy `Allow self update` - tylko autor może aktualizować swoje ogłoszenie
  - Dodatkowa walidacja w serwisie: sprawdzenie `author_id === userId`
  - Próba aktualizacji cudzego ogłoszenia → **403 Forbidden**
- **Walidacja danych wejściowych:**
  - Walidacja UUID dla parametru `id`
  - Wszystkie pola w body są opcjonalne (partial update)
  - Walidacja enumów dla pól, które są aktualizowane
  - Sanityzacja: trim whitespace, walidacja formatu daty, ograniczenia długości stringów
- **Ograniczenia:**
  - `author_id` nie może być zmienione (pomijane w `UpdateAnnouncementCommand`)
  - `id`, `created_at`, `updated_at` są zarządzane przez system

### 7.5. Obsługa błędów

| Scenariusz | Kod statusu | Komunikat |
|------------|-------------|-----------|
| Brak tokenu autoryzacji | 401 | "Wymagane uwierzytelnienie" |
| Nieprawidłowy token | 401 | "Nieprawidłowy token autoryzacji" |
| Brak uprawnień (nie jest autorem) | 403 | "Brak uprawnień do wykonania tej operacji" |
| Nieprawidłowy format UUID | 400 | "Nieprawidłowy format ID" |
| Ogłoszenie nie istnieje | 404 | "Ogłoszenie o podanym ID nie zostało znalezione" |
| Nieprawidłowe dane wejściowe | 400 | "Nieprawidłowe dane wejściowe" + szczegóły |
| Błąd bazy danych | 500 | "Wystąpił błąd serwera" |

### 7.6. Wydajność

- **Indeksy:** Wykorzystanie indeksu PRIMARY KEY dla szybkiego wyszukiwania po `id`
- **JOIN z profiles:** Efektywny JOIN tylko dla `username` autora
- **Optymalizacja:** Aktualizuj tylko zmienione pola

## 8. Endpoint 5: DELETE /api/announcements/{id} - Usuwanie ogłoszenia

### 8.1. Szczegóły żądania

**Metoda HTTP:** `DELETE`

**Struktura URL:** `/api/announcements/{id}`

**Parametry zapytania:** Brak

**Parametry ścieżki:**
- `id`: `uuid` - Identyfikator ogłoszenia (wymagany)

**Request Body:** Brak

**Nagłówki:**
- `Authorization`: `Bearer <ACCESS_TOKEN>` (Wymagany)

### 8.2. Szczegóły odpowiedzi

**Sukces (204 No Content):**

Brak treści odpowiedzi.

### 8.3. Przepływ danych

1. **Odbierz żądanie** w `src/pages/api/announcements/[id].ts` (DELETE handler)
2. **Sprawdź autoryzację** - pobierz użytkownika z tokenu JWT
3. **Waliduj parametr `id`** (format UUID) przy użyciu `announcementIdSchema`
4. **Wywołaj serwis** `AnnouncementService.deleteAnnouncement(id, userId)`
5. **Serwis wykonuje:**
   - Sprawdza, czy ogłoszenie istnieje (404 jeśli nie)
   - Sprawdza uprawnienia (RLS + dodatkowa walidacja: `announcement.author_id === userId`)
   - Jeśli użytkownik nie jest autorem → 403 Forbidden
   - Usuwa rekord z bazy (CASCADE usunie powiązane komentarze i zgłoszenia)
6. **Zwróć odpowiedź** 204 No Content

### 8.4. Względy bezpieczeństwa

- **Uwierzytelnianie:** Wymagane (Bearer token)
- **Autoryzacja:**
  - RLS policy `Allow self delete` - tylko autor może usuwać swoje ogłoszenie
  - Dodatkowa walidacja w serwisie: sprawdzenie `author_id === userId`
  - Próba usunięcia cudzego ogłoszenia → **403 Forbidden**
- **Walidacja danych wejściowych:**
  - Walidacja UUID dla parametru `id`
  - Nieprawidłowy format UUID → **400 Bad Request**
- **CASCADE:** Usunięcie ogłoszenia automatycznie usuwa powiązane komentarze i zgłoszenia (zdefiniowane w schemacie bazy)

### 8.5. Obsługa błędów

| Scenariusz | Kod statusu | Komunikat |
|------------|-------------|-----------|
| Brak tokenu autoryzacji | 401 | "Wymagane uwierzytelnienie" |
| Nieprawidłowy token | 401 | "Nieprawidłowy token autoryzacji" |
| Brak uprawnień (nie jest autorem) | 403 | "Brak uprawnień do wykonania tej operacji" |
| Nieprawidłowy format UUID | 400 | "Nieprawidłowy format ID" |
| Ogłoszenie nie istnieje | 404 | "Ogłoszenie o podanym ID nie zostało znalezione" |
| Błąd bazy danych | 500 | "Wystąpił błąd serwera" |

### 8.6. Wydajność

- **Indeksy:** Wykorzystanie indeksu PRIMARY KEY dla szybkiego wyszukiwania po `id`
- **CASCADE:** Automatyczne usuwanie powiązanych rekordów przez bazę danych (efektywne)

## 9. Logika biznesowa

### 9.1. Oznaczanie jako znalezione (US-007)

- **Implementacja:** Zaimplementowane wyłącznie jako aktualizacja danych w bazie
- **Mechanizm:** Klient wysyła żądanie `PATCH /api/announcements/{id}` z body: `{ "status": "resolved" }`
- **Odpowiedzialność backendu:**
  - Walidacja, że użytkownik jest autorem ogłoszenia (RLS + dodatkowa walidacja)
  - Aktualizacja pola `status` na `"resolved"` w bazie danych
  - Zwrócenie zaktualizowanego obiektu
- **Odpowiedzialność frontendu:**
  - Interpretacja statusu `"resolved"` do wyświetlenia banera "ZNALEZIONE"
  - Blokada formularza komentarzy dla ogłoszeń ze statusem `"resolved"`
  - Opcjonalnie: wizualne wyróżnienie ogłoszeń ze statusem `"resolved"`

### 9.2. Flaga widoczności (US-009)

- **Uwaga:** Ta funkcjonalność dotyczy komentarzy, nie ogłoszeń
- **Implementacja:** Flaga `is_sighting` jest przechowywana w tabeli `comments`
- **Odpowiedzialność frontendu:** Użycie flagi `is_sighting` do zastosowania specyficznych stylów CSS (wyróżnienia) dla komentarza

### 9.3. Jedno zgłoszenie na użytkownika

- **Uwaga:** Ta funkcjonalność dotyczy zgłoszeń (reports), nie ogłoszeń
- **Implementacja:** Baza danych wymusza `UNIQUE(announcement_id, reporting_user_id)` w tabeli `reports`
- **Obsługa:** API zwróci błąd **409 Conflict**, jeśli użytkownik spróbuje wielokrotnie zgłosić to samo ogłoszenie

### 9.4. Prywatność danych (US-010)

- **Dane kontaktowe:** `phone_number` **nie jest zwracane** w odpowiedziach GET `/api/announcements`
- **Publiczne dane:** Tylko `username` z profilu autora jest zwracane w odpowiedziach
- **Bezpieczne pobieranie danych kontaktowych:**
  - Aby pobrać `phone_number` autora ogłoszenia, należy wywołać dedykowany endpoint RPC: `/rpc/get_contact_details`
  - Endpoint RPC wymaga uwierzytelnienia i zwraca `phone_number` tylko na wyraźne żądanie
  - Implementacja RPC endpoint jest opisana w osobnej specyfikacji (nie w tym planie)

## 10. Wspólne mechanizmy bezpieczeństwa

### 10.1. Uwierzytelnianie

- **Mechanizm:** Supabase Auth (JWT tokens)
- **Weryfikacja:** 
  - Pobierz użytkownika z `context.locals.supabase.auth.getUser()`
  - Jeśli brak tokenu lub nieprawidłowy → 401 Unauthorized
  - Token jest automatycznie weryfikowany przez Supabase client

### 10.2. Autoryzacja (RLS)

- **RLS Policies:** Automatycznie egzekwowane przez Supabase
  - `Allow public read` - dla GET (wszyscy)
  - `Allow authenticated insert` - dla POST (tylko zalogowani)
  - `Allow self update` - dla PATCH (tylko autor)
  - `Allow self delete` - dla DELETE (tylko autor)
- **Dodatkowa walidacja w serwisie:**
  - Przed PATCH/DELETE sprawdź, czy `announcement.author_id === userId`
  - Jeśli nie → 403 Forbidden (nawet jeśli RLS przepuści, dodatkowa warstwa bezpieczeństwa)

### 10.3. Walidacja danych wejściowych

- **Zod schemas:** Wszystkie dane wejściowe walidowane przez Zod
- **Pola wymagane (zgodnie z api-plan.md 4.1):**
  - Dla POST `/api/announcements`: `title`, `species`, `voivodeship`, `poviat`, `event_date`, `image_url`
  - Brak któregokolwiek z wymaganych pól → **400 Bad Request** z szczegółami walidacji
- **Walidacja typów danych i enumów (zgodnie z api-plan.md 4.1):**
  - `species`: Musi być dokładnie `"dog"` lub `"cat"` (enum `animal_species`)
  - `type`: Musi być `"lost"` lub `"found"` (enum `announcement_type`)
  - `status`: Musi być `"active"` lub `"resolved"` (enum `announcement_status`)
  - `size`: Musi pasować do enum `animal_size` (`"small"`, `"medium"`, `"large"`) lub `null`
  - `age_range`: Musi pasować do enum `animal_age_range` (`"young"`, `"adult"`, `"senior"`) lub `null`
  - Nieprawidłowe wartości enum → **400 Bad Request**
- **Sanityzacja:**
  - Trim whitespace dla stringów
  - Walidacja formatu daty (ISO 8601, YYYY-MM-DD)
  - Walidacja UUID dla parametrów ścieżki
  - Ograniczenia długości stringów (zgodnie ze specyfikacją)
- **Klucze obce:** 
  - Dla komentarzy/zgłoszeń: `announcement_id` musi istnieć w tabeli `announcements`
  - Naruszenie klucza obcego → **409 Conflict**

### 10.4. Ochrona przed atakami

- **SQL Injection:** Chronione przez Supabase client (parametryzowane zapytania)
- **XSS:** Dane wyjściowe są serializowane jako JSON (Astro automatycznie)
- **CSRF:** Nie dotyczy (API używa Bearer tokens, nie cookies)
- **Rate Limiting:** Rozważyć implementację w przyszłości (nie w pierwszej wersji)

### 10.5. Implementacja obsługi błędów

**Struktura błędów:**
```typescript
// src/lib/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public fieldErrors: Array<{ field: string; message: string }>) {
    super(400, 'VALIDATION_ERROR', message, fieldErrors);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    super(404, 'NOT_FOUND', `${resource} o podanym ID nie zostało znalezione`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Wymagane uwierzytelnienie') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Brak uprawnień do wykonania tej operacji') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}
```

**Middleware obsługi błędów:**
```typescript
// W każdym handlerze endpointu
export async function GET(context: APIContext) {
  try {
    // ... logika endpointu
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        }),
        {
          status: error.statusCode,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Nieoczekiwane błędy
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Wystąpił błąd serwera',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
```

**Logowanie błędów:**
- **Console.error:** Dla wszystkich błędów (development)
- **Struktura logów:**
  ```typescript
  console.error('API Error:', {
    endpoint: context.url.pathname,
    method: context.request.method,
    error: error.message,
    stack: error.stack,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString(),
  });
  ```
- **Produkcja:** Rozważyć integrację z zewnętrznym systemem logowania (np. Sentry) w przyszłości

## 11. Wspólne rozważania dotyczące wydajności

### 11.1. Optymalizacja zapytań

- **Indeksy bazy danych:** Wykorzystanie istniejących indeksów z `db-plan.md`:
  - `idx_announcements_location` (voivodeship, poviat)
  - `idx_announcements_species`
  - `idx_announcements_status`
  - `idx_announcements_size`, `age_range`, `color`, `event_date`
  - `idx_announcements_author_id` (dla JOIN)

- **JOIN z profiles:** 
  - Użyj `select` z PostgREST: `*,profiles!inner(username)`
  - Unikaj pobierania niepotrzebnych kolumn

- **Paginacja:**
  - Domyślny limit: 20 wyników
  - Maksymalny limit: 100 wyników
  - Użyj `range()` w PostgREST dla efektywnej paginacji

### 11.2. Caching

- **Rozważyć w przyszłości:**
  - Cache dla listy ogłoszeń (TTL: 1-5 minut)
  - Cache dla szczegółów ogłoszenia (TTL: 1 minut)
  - Inwalidacja cache przy aktualizacji/usunięciu

### 11.3. Limity i throttling

- **Paginacja:** Maksymalnie 100 wyników na stronę
- **Rate limiting:** Rozważyć w przyszłości (np. 100 żądań/minutę na użytkownika)

### 11.4. Optymalizacja odpowiedzi

- **Minimalizacja danych:** Zwracaj tylko wymagane pola (użyj `select` w PostgREST)
- **Kompresja:** Astro automatycznie kompresuje odpowiedzi JSON (gzip)

## 12. Etapy wdrożenia

### Krok 1: Przygotowanie struktury plików i typów

1. **Utwórz katalogi:**
   - `src/lib/services/` - dla serwisów
   - `src/lib/validators/` - dla schematów Zod
   - `src/lib/errors.ts` - dla klas błędów
   - `src/pages/api/announcements/` - dla endpointów

2. **Utwórz plik z błędami:** `src/lib/errors.ts`
   - Zdefiniuj klasy błędów (ApiError, ValidationError, NotFoundError, etc.)

3. **Utwórz helper do odpowiedzi:** `src/lib/api-response.ts`
   - Funkcje pomocnicze do tworzenia spójnych odpowiedzi API

### Krok 2: Implementacja walidatorów Zod

1. **Utwórz plik:** `src/lib/validators/announcements.ts`
2. **Zdefiniuj schematy:**
   - `createAnnouncementSchema` - dla POST
     - **Wymagane pola:** `title`, `species`, `voivodeship`, `poviat`, `event_date`, `image_url`
     - **Walidacja enumów:** `type` ('lost' | 'found'), `species` ('dog' | 'cat')
     - **Opcjonalne enumy:** `size` ('small' | 'medium' | 'large'), `age_range` ('young' | 'adult' | 'senior')
     - **Domyślne wartości:** `is_aggressive: false`, `is_fearful: false`
   - `updateAnnouncementSchema` - dla PATCH
     - Wszystkie pola opcjonalne (partial update)
     - Walidacja enumów dla pól, które są aktualizowane
     - Obsługa `status: 'resolved'` dla US-007
   - `getAnnouncementsQuerySchema` - dla GET query params
     - Walidacja wszystkich opcjonalnych parametrów filtrowania
     - Walidacja enumów dla `type`, `species`, `size`, `age_range`, `status`
     - Walidacja formatu daty dla `event_date_from` i `event_date_to`
     - Walidacja paginacji (page, limit z maksimum 100)
   - `announcementIdSchema` - dla walidacji UUID w ścieżce
     - Format UUID v4

3. **Użyj enum types z `src/types.ts`** w schematach Zod
4. **Zgodność z api-plan.md 4.1:**
   - Brak wymaganych pól → zwróć szczegółowe błędy walidacji z nazwami pól
   - Nieprawidłowe wartości enum → zwróć komunikat z dozwolonymi wartościami

### Krok 3: Implementacja serwisu AnnouncementService

1. **Utwórz plik:** `src/lib/services/announcement.service.ts`
2. **Zaimplementuj metody:**
   - `getAnnouncements(queryParams, supabaseClient)` - lista z filtrowaniem
   - `getAnnouncementById(id, supabaseClient)` - szczegóły
   - `createAnnouncement(command, userId, supabaseClient)` - tworzenie
   - `updateAnnouncement(id, command, userId, supabaseClient)` - aktualizacja
   - `deleteAnnouncement(id, userId, supabaseClient)` - usuwanie

3. **Wykorzystaj typy z `src/types.ts`:**
   - `CreateAnnouncementCommand`
   - `UpdateAnnouncementCommand`
   - `AnnouncementDto`

4. **Obsłuż błędy Supabase:**
   - Mapuj błędy Supabase na `ApiError`
   - Sprawdzaj uprawnienia przed operacjami modyfikującymi

### Krok 4: Implementacja endpointu GET /api/announcements

1. **Utwórz plik:** `src/pages/api/announcements/index.ts`
2. **Zaimplementuj handler GET:**
   - Pobierz parametry zapytania z `context.url.searchParams`
   - Waliduj parametry przy użyciu `getAnnouncementsQuerySchema`
   - Wywołaj `AnnouncementService.getAnnouncements()`
   - Zwróć odpowiedź z danymi i paginacją
   - Obsłuż błędy (try-catch z ApiError)

3. **Przetestuj:**
   - Lista bez filtrów
   - Lista z filtrami
   - Paginacja
   - Sortowanie

### Krok 5: Implementacja endpointu POST /api/announcements

1. **Rozszerz plik:** `src/pages/api/announcements/index.ts`
2. **Zaimplementuj handler POST:**
   - Sprawdź autoryzację (pobierz użytkownika z tokenu)
   - Parsuj i waliduj body przy użyciu `createAnnouncementSchema`
   - Wywołaj `AnnouncementService.createAnnouncement()`
   - Zwróć odpowiedź 201 Created z utworzonym obiektem
   - Obsłuż błędy (401, 400, 500)

3. **Przetestuj:**
   - Tworzenie z pełnymi danymi
   - Tworzenie z minimalnymi danymi
   - Walidacja błędnych danych
   - Brak autoryzacji

### Krok 6: Implementacja endpointu GET /api/announcements/{id}

1. **Utwórz plik:** `src/pages/api/announcements/[id].ts`
2. **Zaimplementuj handler GET:**
   - Pobierz `id` z `context.params.id`
   - Waliduj UUID przy użyciu `announcementIdSchema`
   - Wywołaj `AnnouncementService.getAnnouncementById()`
   - Zwróć odpowiedź 200 OK lub 404 Not Found
   - Obsłuż błędy

3. **Przetestuj:**
   - Pobranie istniejącego ogłoszenia
   - Pobranie nieistniejącego ogłoszenia
   - Nieprawidłowy format UUID

### Krok 7: Implementacja endpointu PATCH /api/announcements/{id}

1. **Rozszerz plik:** `src/pages/api/announcements/[id].ts`
2. **Zaimplementuj handler PATCH:**
   - Sprawdź autoryzację
   - Waliduj `id` i body przy użyciu schematów
   - Wywołaj `AnnouncementService.updateAnnouncement()`
   - Zwróć odpowiedź 200 OK z zaktualizowanym obiektem
   - Obsłuż błędy (401, 403, 404, 400, 500)

3. **Przetestuj:**
   - Aktualizacja własnego ogłoszenia
   - Próba aktualizacji cudzego ogłoszenia (403)
   - Aktualizacja nieistniejącego ogłoszenia (404)
   - Oznaczenie jako "resolved" (US-007)
   - Walidacja błędnych danych

### Krok 8: Implementacja endpointu DELETE /api/announcements/{id}

1. **Rozszerz plik:** `src/pages/api/announcements/[id].ts`
2. **Zaimplementuj handler DELETE:**
   - Sprawdź autoryzację
   - Waliduj `id`
   - Wywołaj `AnnouncementService.deleteAnnouncement()`
   - Zwróć odpowiedź 204 No Content
   - Obsłuż błędy (401, 403, 404, 500)

3. **Przetestuj:**
   - Usunięcie własnego ogłoszenia
   - Próba usunięcia cudzego ogłoszenia (403)
   - Usunięcie nieistniejącego ogłoszenia (404)

### Krok 9: Testy integracyjne i dokumentacja

1. **Utwórz testy:**
   - Testy jednostkowe dla serwisu (opcjonalnie, jeśli używamy frameworka testowego)
   - Testy integracyjne dla endpointów (ręczne lub automatyczne)

2. **Dokumentacja:**
   - Zaktualizuj `api-plan.md` z rzeczywistymi endpointami (jeśli różnią się od PostgREST)
   - Dodaj przykłady użycia w README lub dokumentacji API

### Krok 10: Refaktoryzacja i optymalizacja

1. **Przegląd kodu:**
   - Sprawdź zgodność z zasadami clean code
   - Upewnij się, że wszystkie błędy są obsłużone
   - Sprawdź wydajność zapytań

2. **Optymalizacja:**
   - Sprawdź, czy wszystkie zapytania wykorzystują indeksy
   - Zoptymalizuj JOIN z profiles
   - Rozważ cache (jeśli potrzebne)

3. **Linting:**
   - Uruchom linter i napraw wszystkie błędy
   - Upewnij się, że TypeScript nie zgłasza błędów

---

## Dodatkowe uwagi

### Różnice między PostgREST a Astro Server Endpoints

Ponieważ implementujemy warstwę pośrednią w Astro, endpointy będą dostępne pod `/api/announcements` zamiast bezpośrednio pod `/rest/v1/announcements` Supabase. To pozwala na:
- Centralizację walidacji
- Spójną obsługę błędów
- Dodatkową logikę biznesową przed dostępem do bazy

### Integracja z frontendem

Frontend powinien wywoływać endpointy Astro (`/api/announcements`), które następnie komunikują się z Supabase. Alternatywnie, frontend może wywoływać bezpośrednio PostgREST, ale wtedy tracimy korzyści z walidacji i obsługi błędów w warstwie Astro.

### Przyszłe rozszerzenia

- **Wyszukiwanie pełnotekstowe:** Rozważyć dodanie wyszukiwania w tytule i opisie
- **Filtrowanie po dacie utworzenia:** Dodatkowy filtr dla "najnowszych ogłoszeń"
- **Statystyki:** Endpoint do pobierania statystyk (liczba ogłoszeń, etc.)
- **Webhooks:** Powiadomienia o nowych ogłoszeniach (jeśli potrzebne)
