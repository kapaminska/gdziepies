# API Endpoint Implementation Plan: Comments (Komentarze)

## 1. Przegląd punktu końcowego

Endpointy komentarzy (`/api/comments`) umożliwiają użytkownikom przeglądanie i dodawanie komentarzy do ogłoszeń o zaginionych lub znalezionych zwierzętach. Komentarze wspierają funkcjonalność "Widziano zwierzę" (US-009), która pozwala użytkownikom oznaczać komentarze jako zgłoszenia zauważenia zwierzęcia.

Ponieważ aplikacja wykorzystuje Supabase z PostgREST, endpointy działają jako warstwa pośrednia między frontendem a automatycznie generowanym API PostgREST. Implementacja w Astro Server Endpoints pozwala na:
- Centralizację walidacji danych wejściowych przy użyciu Zod
- Ekstrakcję logiki biznesowej do serwisów
- Spójną obsługę błędów i odpowiedzi
- Dodatkową warstwę bezpieczeństwa przed bezpośrednim dostępem do PostgREST
- Weryfikację istnienia powiązanego ogłoszenia przed utworzeniem komentarza

Endpointy obsługują następujące operacje:
- **GET /api/comments** - Lista komentarzy dla konkretnego ogłoszenia
- **POST /api/comments** - Dodawanie nowego komentarza (US-009)

## 2. Wykorzystywane typy

### 2.1. DTOs (Data Transfer Objects)

Z pliku `src/types.ts`:

- **`CommentDto`**: Reprezentuje komentarz z informacjami o autorze
  ```typescript
  type CommentDto = Tables<'comments'> & {
    author: ProfileDto | null;
  };
  ```

- **`ProfileDto`**: Publiczny profil użytkownika (z widoku `profiles_public`)
  ```typescript
  type ProfileDto = Tables<'profiles_public'>;
  ```

### 2.2. Command Modele

- **`AddCommentCommand`**: Komenda do dodawania komentarza
  ```typescript
  type AddCommentCommand = Omit<
    TablesInsert<'comments'>,
    'id' | 'created_at' | 'author_id'
  >;
  ```

  Składa się z:
  - `announcement_id`: `uuid` (wymagane) - ID ogłoszenia, do którego dodawany jest komentarz
  - `content`: `string` (wymagane) - Treść komentarza
  - `is_sighting`: `boolean` (opcjonalne, domyślnie `false`) - Flaga oznaczająca, czy komentarz jest zgłoszeniem zauważenia zwierzęcia

### 2.3. Schematy Zod (do walidacji)

Należy utworzyć schematy Zod w `src/lib/validators/comments.ts`:

- **`getCommentsQuerySchema`**: Walidacja parametrów zapytania dla GET
  ```typescript
  import { z } from 'zod';
  import { uuidSchema } from './common'; // Wspólny schemat UUID

  export const getCommentsQuerySchema = z.object({
    announcement_id: uuidSchema,
    order: z.enum(['asc', 'desc']).optional().default('asc'),
  });
  ```

- **`addCommentSchema`**: Walidacja dla POST
  ```typescript
  export const addCommentSchema = z.object({
    announcement_id: uuidSchema,
    content: z.string()
      .min(1, 'Treść komentarza nie może być pusta')
      .max(5000, 'Treść komentarza nie może przekraczać 5000 znaków'),
    is_sighting: z.boolean().optional().default(false),
  });
  ```

### 2.4. Format błędów

Wszystkie endpointy używają spójnego formatu błędów:

**400 Bad Request (Walidacja):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nieprawidłowe dane wejściowe",
    "details": [
      {
        "field": "announcement_id",
        "message": "announcement_id jest wymagane"
      },
      {
        "field": "content",
        "message": "Treść komentarza nie może być pusta"
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
    "message": "Nie można dodać komentarza do nieistniejącego ogłoszenia"
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

---

## 3. Endpoint: GET /api/comments - Lista komentarzy

### 3.1. Szczegóły żądania

**Metoda HTTP:** `GET`

**Struktura URL:** `/api/comments`

**Parametry zapytania:**

**Wymagane:**
- `announcement_id`: `uuid` - Identyfikator ogłoszenia, dla którego pobierane są komentarze

**Opcjonalne:**
- `order`: `'asc' | 'desc'` - Kierunek sortowania według daty utworzenia (domyślnie: `'asc'` - najstarsze pierwsze)

**Request Body:** Brak

**Nagłówki:**
- `apikey`: `<SUPABASE_ANON_KEY>` (opcjonalny)
- `Authorization`: `Bearer <ACCESS_TOKEN>` (opcjonalny, nie wymagany dla odczytu)

**Uwaga:** Endpoint jest publiczny - nie wymaga uwierzytelnienia (zgodnie z RLS: "Allow public read").

### 3.2. Szczegóły odpowiedzi

**Sukces (200 OK):**
```json
{
  "data": [
    {
      "id": 101,
      "announcement_id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Widziałem tego psa przy dworcu!",
      "is_sighting": true,
      "created_at": "2023-11-01T14:30:00Z",
      "author": {
        "id": "user-uuid",
        "username": "anna_nowak"
      }
    },
    {
      "id": 102,
      "announcement_id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Sprawdzam czy pies nadal tam jest.",
      "is_sighting": false,
      "created_at": "2023-11-01T15:00:00Z",
      "author": {
        "id": "user-uuid-2",
        "username": "jan_kowalski"
      }
    }
  ],
  "meta": {
    "count": 2,
    "announcement_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Uwaga:** Jeśli ogłoszenie nie istnieje lub nie ma komentarzy, zwracana jest pusta tablica `[]`.

### 3.3. Przepływ danych

1. **Odbieranie żądania:**
   - Astro Server Endpoint odbiera żądanie GET z parametrem `announcement_id`
   - Middleware Astro zapewnia dostęp do `context.locals.supabase`

2. **Walidacja:**
   - Parametry zapytania są walidowane przy użyciu `getCommentsQuerySchema` (Zod)
   - Jeśli walidacja nie powiedzie się, zwracany jest błąd 400

3. **Weryfikacja ogłoszenia (opcjonalna):**
   - Serwis sprawdza, czy ogłoszenie o podanym `announcement_id` istnieje
   - Jeśli nie istnieje, zwracany jest błąd 404 (lub pusta tablica, w zależności od wymagań biznesowych)

4. **Pobieranie komentarzy:**
   - Serwis wykonuje zapytanie do Supabase PostgREST:
     ```typescript
     const { data, error } = await supabase
       .from('comments')
       .select('*, profiles:author_id(username)')
       .eq('announcement_id', announcementId)
       .order('created_at', { ascending: order === 'asc' });
     ```
   - RLS automatycznie filtruje wyniki zgodnie z politykami bezpieczeństwa

5. **Transformacja danych:**
   - Serwis mapuje odpowiedź z PostgREST do formatu `CommentDto[]`
   - Przekształca relację `profiles` na pole `author`

6. **Zwracanie odpowiedzi:**
   - Endpoint zwraca odpowiedź JSON z kodem 200 OK

### 3.4. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja:**
  - Endpoint jest publiczny - nie wymaga uwierzytelnienia
  - RLS na poziomie bazy danych zapewnia, że tylko publiczne dane są zwracane
  - Polityka RLS: "Allow public read" dla tabeli `comments`

- **Walidacja danych wejściowych:**
  - UUID `announcement_id` jest walidowany pod kątem poprawnego formatu
  - Parametr `order` jest walidowany jako enum ('asc' | 'desc')

- **Ochrona przed atakami:**
  - Supabase PostgREST automatycznie parametryzuje zapytania SQL (ochrona przed SQL Injection)
  - Nie używamy surowych zapytań SQL - wszystkie operacje przechodzą przez Supabase SDK

- **Prywatność danych:**
  - W odpowiedziach zwracany jest tylko publiczny profil autora (`username`)
  - Prywatne dane kontaktowe (`phone_number`) nie są zwracane w odpowiedziach komentarzy

### 3.5. Obsługa błędów

1. **Brak parametru `announcement_id`:**
   - Kod: `400 Bad Request`
   - Komunikat: "Parametr announcement_id jest wymagany"
   - Szczegóły: Pole `announcement_id` w `details`

2. **Nieprawidłowy format UUID:**
   - Kod: `400 Bad Request`
   - Komunikat: "Nieprawidłowy format UUID dla announcement_id"
   - Szczegóły: Pole `announcement_id` w `details`

3. **Błąd połączenia z bazą danych:**
   - Kod: `500 Internal Server Error`
   - Komunikat: "Wystąpił błąd serwera"
   - Logowanie: Pełny błąd jest logowany po stronie serwera

4. **Błąd RLS (nieoczekiwany):**
   - Kod: `500 Internal Server Error`
   - Komunikat: "Wystąpił błąd serwera"
   - Logowanie: Szczegóły błędu są logowane

---

## 4. Endpoint: POST /api/comments - Dodawanie komentarza

### 4.1. Szczegóły żądania

**Metoda HTTP:** `POST`

**Struktura URL:** `/api/comments`

**Parametry zapytania:** Brak

**Request Body:**
```json
{
  "announcement_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Widziałem tego psa przy dworcu!",
  "is_sighting": true
}
```

**Pola:**
- `announcement_id`: `uuid` (wymagane) - ID ogłoszenia
- `content`: `string` (wymagane, 1-5000 znaków) - Treść komentarza
- `is_sighting`: `boolean` (opcjonalne, domyślnie `false`) - Czy komentarz jest zgłoszeniem zauważenia zwierzęcia

**Nagłówki:**
- `apikey`: `<SUPABASE_ANON_KEY>` (wymagany)
- `Authorization`: `Bearer <ACCESS_TOKEN>` (wymagany) - Token JWT użytkownika

**Uwaga:** Endpoint wymaga uwierzytelnienia (zgodnie z RLS: "Allow authenticated insert"). Pole `author_id` jest automatycznie przypisywane na podstawie tokenu JWT przez Supabase.

### 4.2. Szczegóły odpowiedzi

**Sukces (201 Created):**
```json
{
  "data": {
    "id": 103,
    "announcement_id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Widziałem tego psa przy dworcu!",
    "is_sighting": true,
    "created_at": "2023-11-01T16:00:00Z",
    "author": {
      "id": "current-user-uuid",
      "username": "current_user"
    }
  }
}
```

### 4.3. Przepływ danych

1. **Odbieranie żądania:**
   - Astro Server Endpoint odbiera żądanie POST z ciałem JSON
   - Middleware Astro zapewnia dostęp do `context.locals.supabase`

2. **Weryfikacja uwierzytelnienia:**
   - Endpoint sprawdza obecność tokenu JWT w nagłówku `Authorization`
   - Jeśli brak tokenu, zwracany jest błąd 401
   - Token jest weryfikowany przez Supabase (automatycznie przez RLS)

3. **Walidacja:**
   - Ciało żądania jest walidowane przy użyciu `addCommentSchema` (Zod)
   - Jeśli walidacja nie powiedzie się, zwracany jest błąd 400 z szczegółami

4. **Weryfikacja ogłoszenia:**
   - Serwis sprawdza, czy ogłoszenie o podanym `announcement_id` istnieje i jest aktywne
   - Jeśli nie istnieje, zwracany jest błąd 404
   - Jeśli ogłoszenie ma status `resolved`, można rozważyć blokadę dodawania komentarzy (opcjonalne, zgodnie z wymaganiami biznesowymi)

5. **Tworzenie komentarza:**
   - Serwis przygotowuje dane do wstawienia:
     ```typescript
     const commentData: TablesInsert<'comments'> = {
       announcement_id: validatedData.announcement_id,
       content: validatedData.content,
       is_sighting: validatedData.is_sighting ?? false,
       author_id: userId, // Pobrane z tokenu JWT przez Supabase
     };
     ```
   - Wykonuje zapytanie do Supabase:
     ```typescript
     const { data, error } = await supabase
       .from('comments')
       .insert(commentData)
       .select('*, profiles:author_id(username)')
       .single();
     ```
   - RLS automatycznie weryfikuje uprawnienia użytkownika

6. **Obsługa błędów bazy danych:**
   - Jeśli wystąpi błąd klucza obcego (ogłoszenie nie istnieje), zwracany jest błąd 409
   - Inne błędy bazy danych są mapowane na odpowiednie kody statusu

7. **Transformacja danych:**
   - Serwis mapuje odpowiedź z PostgREST do formatu `CommentDto`
   - Przekształca relację `profiles` na pole `author`

8. **Zwracanie odpowiedzi:**
   - Endpoint zwraca odpowiedź JSON z kodem 201 Created

### 4.4. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja:**
  - Endpoint wymaga uwierzytelnienia - token JWT w nagłówku `Authorization`
  - RLS automatycznie przypisuje `author_id` na podstawie `auth.uid()` z tokenu JWT
  - Polityka RLS: "Allow authenticated insert" dla tabeli `comments`
  - Użytkownik nie może podać własnego `author_id` - jest to automatycznie przypisywane

- **Walidacja danych wejściowych:**
  - Wszystkie dane wejściowe są walidowane przy użyciu Zod przed wysłaniem do bazy danych
  - Długość treści komentarza jest ograniczona do 5000 znaków (zapobiega atakom DoS)
  - UUID `announcement_id` jest walidowany pod kątem poprawnego formatu
  - Ograniczenia NOT NULL w bazie danych zapewniają integralność danych
  - Klucze obce zapewniają, że `announcement_id` wskazuje na istniejące ogłoszenie
  - RLS zapobiega manipulacji danymi przez nieautoryzowanych użytkowników

- **Ochrona przed atakami:**
  - **SQL Injection:** Supabase PostgREST automatycznie parametryzuje zapytania SQL. Nie używamy surowych zapytań SQL - wszystkie operacje przechodzą przez Supabase SDK
  - **XSS (Cross-Site Scripting):** Treść komentarza jest przechowywana jako tekst w bazie danych. Frontend jest odpowiedzialny za odpowiednie escapowanie treści przed wyświetleniem. Rozważyć sanitizację treści komentarza przed zapisem (opcjonalne)
  - **CSRF (Cross-Site Request Forgery):** Uwierzytelnienie oparte na tokenach JWT zmniejsza ryzyko CSRF. Token JWT jest przechowywany w bezpieczny sposób po stronie klienta
  - **Rate Limiting:** Rozważyć implementację rate limitingu dla endpointu POST (np. maksymalnie 10 komentarzy na minutę na użytkownika). Można to zaimplementować w przyszłości przy użyciu middleware lub Supabase Edge Functions

- **Prywatność danych:**
  - W odpowiedziach zwracany jest tylko publiczny profil autora (`username`)
  - Prywatne dane kontaktowe (`phone_number`) nie są zwracane w odpowiedziach komentarzy
  - Dostęp do prywatnych danych wymaga wywołania dedykowanego endpointu RPC (US-010)

### 4.5. Obsługa błędów

1. **Brak tokenu uwierzytelnienia:**
   - Kod: `401 Unauthorized`
   - Komunikat: "Wymagane uwierzytelnienie"
   - Sprawdzenie: Weryfikacja obecności nagłówka `Authorization`

2. **Nieprawidłowy/wygasły token:**
   - Kod: `401 Unauthorized`
   - Komunikat: "Nieprawidłowy lub wygasły token"
   - Sprawdzenie: Supabase automatycznie weryfikuje token przez RLS

3. **Brakujące wymagane pola:**
   - Kod: `400 Bad Request`
   - Komunikat: "Nieprawidłowe dane wejściowe"
   - Szczegóły: Lista pól z błędami walidacji

4. **Treść komentarza za długa:**
   - Kod: `400 Bad Request`
   - Komunikat: "Treść komentarza nie może przekraczać 5000 znaków"
   - Szczegóły: Pole `content` w `details`

5. **Ogłoszenie nie istnieje:**
   - Kod: `404 Not Found`
   - Komunikat: "Ogłoszenie o podanym ID nie zostało znalezione"
   - Sprawdzenie: Weryfikacja istnienia ogłoszenia przed utworzeniem komentarza

6. **Naruszenie klucza obcego (announcement_id):**
   - Kod: `409 Conflict`
   - Komunikat: "Nie można dodać komentarza do nieistniejącego ogłoszenia"
   - Sprawdzenie: Błąd zwracany przez Supabase przy próbie wstawienia

7. **Błąd RLS (brak uprawnień):**
   - Kod: `403 Forbidden`
   - Komunikat: "Brak uprawnień do wykonania tej operacji"
   - Sprawdzenie: RLS automatycznie blokuje operację

8. **Błąd połączenia z bazą danych:**
   - Kod: `500 Internal Server Error`
   - Komunikat: "Wystąpił błąd serwera"
   - Logowanie: Pełny błąd jest logowany po stronie serwera

---

## 5. Implementacja obsługi błędów

### 5.1. Klasy błędów (wspólne z innymi endpointami)

```typescript
// src/lib/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
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

export class ConflictError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(409, 'CONFLICT', message, details);
    this.name = 'ConflictError';
  }
}
```

### 5.2. Middleware obsługi błędów w endpointach

```typescript
// W każdym handlerze endpointu
export async function POST(context: APIContext) {
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

### 5.3. Logowanie błędów

- **Błędy walidacji:** Nie są logowane (są to błędy klienta)
- **Błędy autoryzacji:** Logowane na poziomie INFO
- **Błędy bazy danych:** Logowane na poziomie ERROR z pełnymi szczegółami
- **Nieoczekiwane błędy:** Logowane na poziomie ERROR z pełnym stack trace

---

## 6. Rozważania dotyczące wydajności

### 6.1. Optymalizacja zapytań

- **Indeksy bazy danych:**
  - Indeks `idx_comments_announcement_id` zapewnia szybkie pobieranie komentarzy dla konkretnego ogłoszenia
  - Indeks `idx_comments_author_id` przyspiesza zapytania związane z autorem

- **Selekcja pól:**
  - Używamy `select` w PostgREST, aby pobrać tylko wymagane pola
  - W odpowiedziach zwracamy tylko publiczne dane profilu (`username`), nie wszystkie pola z tabeli `profiles`

- **JOIN z profiles:**
  - PostgREST automatycznie optymalizuje zapytania JOIN
  - Indeks na `profiles.id` (klucz główny) zapewnia szybkie łączenie

### 6.2. Paginacja (opcjonalna, do rozważenia w przyszłości)

Obecnie endpoint GET zwraca wszystkie komentarze dla ogłoszenia. Jeśli liczba komentarzy może być duża, należy rozważyć implementację paginacji:

```typescript
// Przykład paginacji (do implementacji w przyszłości)
const { data, error } = await supabase
  .from('comments')
  .select('*, profiles:author_id(username)')
  .eq('announcement_id', announcementId)
  .order('created_at', { ascending: order === 'asc' })
  .range((page - 1) * limit, page * limit - 1);
```

**Parametry paginacji:**
- `page`: Numer strony (domyślnie: 1)
- `limit`: Liczba wyników na stronę (domyślnie: 50, maksimum: 100)

### 6.3. Cache (opcjonalne)

- **Cache komentarzy:**
  - Rozważyć cache'owanie komentarzy dla często przeglądanych ogłoszeń
  - Cache powinien być invalidowany przy dodaniu nowego komentarza
  - Można użyć Astro Cache API lub zewnętrznego cache (np. Redis)

### 6.4. Limity i throttling

- **Paginacja:** Jeśli zostanie zaimplementowana, maksymalnie 100 wyników na stronę
- **Rate limiting:** Rozważyć w przyszłości (np. 10 komentarzy/minutę na użytkownika dla POST)
- **Długość treści:** Maksymalnie 5000 znaków na komentarz (zapobiega nadmiernemu zużyciu zasobów)

### 6.5. Optymalizacja odpowiedzi

- **Minimalizacja danych:** Zwracamy tylko wymagane pola (użyj `select` w PostgREST)
- **Kompresja:** Astro automatycznie kompresuje odpowiedzi JSON (gzip)
- **Brak niepotrzebnych pól:** Nie zwracamy pól systemowych, które nie są potrzebne frontendowi

---

## 7. Etapy wdrożenia

### Krok 1: Przygotowanie struktury plików i typów

1. **Utwórz katalogi (jeśli nie istnieją):**
   - `src/lib/services/` - dla serwisów
   - `src/lib/validators/` - dla schematów Zod
   - `src/lib/errors.ts` - dla klas błędów (jeśli nie istnieje)
   - `src/pages/api/comments/` - dla endpointów API

2. **Sprawdź istnienie typów:**
   - Upewnij się, że typy `CommentDto` i `AddCommentCommand` istnieją w `src/types.ts`
   - Jeśli nie, dodaj je zgodnie z sekcją 2.1 i 2.2

### Krok 2: Utworzenie schematów walidacji Zod

1. **Utwórz plik `src/lib/validators/common.ts`:**
   ```typescript
   import { z } from 'zod';

   export const uuidSchema = z.string().uuid('Nieprawidłowy format UUID');
   ```

2. **Utwórz plik `src/lib/validators/comments.ts`:**
   - Zaimplementuj `getCommentsQuerySchema` zgodnie z sekcją 2.3
   - Zaimplementuj `addCommentSchema` zgodnie z sekcją 2.3

### Krok 3: Utworzenie serwisu komentarzy

1. **Utwórz plik `src/lib/services/comments.service.ts`:**
   - Zaimplementuj funkcję `getCommentsByAnnouncementId(announcementId: string, order?: 'asc' | 'desc'): Promise<CommentDto[]>`
   - Zaimplementuj funkcję `createComment(command: AddCommentCommand, userId: string): Promise<CommentDto>`
   - Zaimplementuj funkcję pomocniczą `verifyAnnouncementExists(announcementId: string): Promise<boolean>`

2. **Użyj Supabase client z context:**
   - Serwis powinien przyjmować `SupabaseClient` jako parametr (z `context.locals.supabase`)
   - Nie importuj `supabaseClient` bezpośrednio - używaj parametru

3. **Obsługa błędów w serwisie:**
   - Mapuj błędy Supabase na odpowiednie klasy błędów (NotFoundError, ConflictError, etc.)
   - Rzucaj wyjątki, które będą obsłużone w endpointach

### Krok 4: Utworzenie endpointu GET /api/comments

1. **Utwórz plik `src/pages/api/comments/index.ts`:**
   ```typescript
   import type { APIContext } from 'astro';
   import { getCommentsQuerySchema } from '../../../lib/validators/comments';
   import { getCommentsByAnnouncementId } from '../../../lib/services/comments.service';
   import { ValidationError, handleApiError } from '../../../lib/errors';

   export const prerender = false;

   export async function GET(context: APIContext) {
     try {
       // Walidacja parametrów
       const queryParams = Object.fromEntries(context.url.searchParams);
       const validatedParams = getCommentsQuerySchema.parse(queryParams);
       
       // Pobranie komentarzy
       const comments = await getCommentsByAnnouncementId(
         context.locals.supabase,
         validatedParams.announcement_id,
         validatedParams.order
       );
       
       // Zwrócenie odpowiedzi
       return new Response(
         JSON.stringify({
           data: comments,
           meta: {
             count: comments.length,
             announcement_id: validatedParams.announcement_id,
           },
         }),
         {
           status: 200,
           headers: { 'Content-Type': 'application/json' },
         }
       );
     } catch (error) {
       return handleApiError(error);
     }
   }
   ```

2. **Dodaj funkcję pomocniczą `handleApiError`:**
   - W `src/lib/errors.ts` utwórz funkcję, która mapuje błędy na odpowiedzi HTTP

### Krok 5: Utworzenie endpointu POST /api/comments

1. **Rozszerz plik `src/pages/api/comments/index.ts`:**
   - Dodaj funkcję `POST` zgodnie z przepływem danych z sekcji 4.3
   - Zaimplementuj weryfikację uwierzytelnienia
   - Zaimplementuj walidację danych wejściowych
   - Zaimplementuj wywołanie serwisu

2. **Weryfikacja uwierzytelnienia:**
   ```typescript
   // Pobranie użytkownika z tokenu JWT
   const { data: { user }, error: authError } = await context.locals.supabase.auth.getUser();
   if (authError || !user) {
     throw new UnauthorizedError();
   }
   ```

### Krok 6: Testowanie endpointów

1. **Testy jednostkowe serwisu:**
   - Utwórz testy dla `comments.service.ts`
   - Przetestuj scenariusze sukcesu i błędów

2. **Testy integracyjne endpointów:**
   - Przetestuj GET z różnymi parametrami
   - Przetestuj POST z poprawnymi i niepoprawnymi danymi
   - Przetestuj obsługę błędów (401, 404, 409, 500)

3. **Testy ręczne:**
   - Użyj narzędzi takich jak Postman lub curl do testowania endpointów
   - Zweryfikuj odpowiedzi i kody statusu

### Krok 7: Dokumentacja i refaktoryzacja

1. **Dodaj komentarze JSDoc:**
   - Udokumentuj funkcje serwisu
   - Udokumentuj endpointy API

2. **Refaktoryzacja:**
   - Sprawdź kod pod kątem duplikacji
   - Upewnij się, że obsługa błędów jest spójna
   - Zweryfikuj zgodność z zasadami kodowania z `shared.mdc`

### Krok 8: Integracja z frontendem

1. **Utworzenie funkcji pomocniczych:**
   - Utwórz funkcje w `src/lib/api/comments.ts` do wywoływania endpointów z frontendu
   - Użyj TypeScript dla bezpieczeństwa typów

2. **Integracja z komponentami React:**
   - Użyj utworzonych funkcji w komponentach React
   - Zaimplementuj obsługę błędów po stronie klienta

---

## 8. Uwagi dodatkowe

### 8.1. Rozważenia biznesowe

- **Komentarze do rozwiązanych ogłoszeń:**
  - Zgodnie z wymaganiami, ogłoszenia ze statusem `resolved` mogą blokować dodawanie nowych komentarzy
  - Rozważyć dodanie weryfikacji statusu ogłoszenia przed utworzeniem komentarza
  - Jeśli wymagane, dodać odpowiedni błąd (np. 400 Bad Request z komunikatem "Nie można dodać komentarza do rozwiązanych ogłoszeń")

- **Flaga `is_sighting`:**
  - Frontend jest odpowiedzialny za interpretację tej flagi i zastosowanie odpowiednich stylów CSS
  - Backend tylko przechowuje wartość boolean

### 8.2. Przyszłe rozszerzenia

- **Edycja i usuwanie komentarzy:**
  - RLS już obsługuje UPDATE i DELETE dla własnych komentarzy
  - Można dodać endpointy PATCH i DELETE w przyszłości, jeśli wymagane

- **Oznaczanie komentarzy jako przydatne:**
  - Rozważyć dodanie systemu "lików" lub "przydatnych" komentarzy
  - Wymagałoby to dodatkowej tabeli `comment_reactions`

- **Powiadomienia:**
  - Rozważyć implementację powiadomień dla autora ogłoszenia, gdy dodawany jest nowy komentarz
  - Można użyć Supabase Realtime lub zewnętrznego serwisu powiadomień

### 8.3. Zgodność z wymaganiami

- **US-009:** Flaga "Widziano zwierzę" jest zaimplementowana przez pole `is_sighting`
- **RLS:** Wszystkie polityki bezpieczeństwa są zdefiniowane w bazie danych i automatycznie egzekwowane
- **Walidacja:** Wszystkie dane wejściowe są walidowane zarówno po stronie serwera (Zod), jak i bazy danych (ograniczenia)
