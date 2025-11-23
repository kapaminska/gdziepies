# Plan API REST

Ten plan został zaprojektowany dla aplikacji **GdziePies**, wykorzystującej **Supabase** jako infrastrukturę backendową.

Ponieważ stos technologiczny opiera się na Supabase, plan ten wykorzystuje funkcję **PostgREST**, która automatycznie generuje API RESTful na podstawie schematu bazy danych PostgreSQL. Takie podejście zapewnia szybki rozwój, bezpieczeństwo typów oraz ścisłe przestrzeganie ograniczeń zdefiniowanych w schemacie bazy danych.

## 1. Zasoby

API jest zorganizowane wokół następujących głównych zasobów, które mapują się bezpośrednio na tabele bazy danych oraz funkcje niestandardowe:

| Zasób | Ścieżka punktu końcowego | Encja bazy danych | Opis |
| :--- | :--- | :--- | :--- |
| **Profile** | `/profiles` | `public.profiles` | Informacje o tożsamości użytkownika (publiczny odczyt nazwy, autoryzowana edycja). |
| **Ogłoszenia** | `/announcements` | `public.announcements` | Główny zasób dla ogłoszeń o zaginionych i znalezionych zwierzętach. |
| **Komentarze** | `/comments` | `public.comments` | Dyskusje użytkowników i zgłoszenia zauważenia zwierzęcia przypisane do ogłoszeń. |
| **Zgłoszenia** | `/reports` | `public.reports` | Mechanizm zgłaszania nadużyć. |
| **Kontakt (RPC)** | `/rpc/get_contact_details` | *Funkcja* | Bezpieczna metoda pobierania prywatnych danych kontaktowych (US-010). |

---

## 2. Punkty końcowe

**Bazowy URL:** `https://<project-ref>.supabase.co/rest/v1`
**Wspólne nagłówki:**
*   `apikey`: `<SUPABASE_ANON_KEY>` (Wymagany dla wszystkich żądań)
*   `Authorization`: `Bearer <ACCESS_TOKEN>` (Wymagany dla akcji chronionych)

### 2.1. Ogłoszenia (Announcements)

#### Lista i filtrowanie ogłoszeń
*   **Metoda:** `GET`
*   **URL:** `/announcements`
*   **Opis:** Pobiera stronicowaną listę ogłoszeń. Obsługuje złożone filtrowanie dla wyszukiwarki (US-004).
*   **Parametry zapytania (Składnia PostgREST):**
    *   `select`: `*,profiles(username)` (Pobiera szczegóły ogłoszenia + nazwę autora)
    *   `type`: `eq.lost` | `eq.found`
    *   `species`: `eq.dog` | `eq.cat`
    *   `voivodeship`: `eq.{wartość}`
    *   `poviat`: `eq.{wartość}`
    *   `size`: `eq.small` | `medium` | `large`
    *   `color`: `eq.{wartość}`
    *   `age_range`: `eq.young` | `adult` | `senior`
    *   `event_date`: `gte.{data}` (Od) & `lte.{data}` (Do)
    *   `status`: `eq.active` (Domyślnie) lub `eq.resolved`
    *   `order`: `created_at.desc` (Najnowsze pierwsze)
    *   `offset`: `{liczba}` (Start stronicowania)
    *   `limit`: `{liczba}` (Rozmiar strony)
*   **Odpowiedź sukcesu (200 OK):**
    ```json
    [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Zaginął Golden Retriever",
        "type": "lost",
        "status": "active",
        "voivodeship": "Mazowieckie",
        "poviat": "Warszawa",
        "event_date": "2023-11-01",
        "species": "dog",
        "image_url": "https://xyz.supabase.co/storage/v1/object/public/imgs/dog1.jpg",
        "size": "large",
        "created_at": "2023-11-01T12:00:00Z",
        "profiles": {
          "username": "jan_kowalski"
        }
      }
    ]
    ```

#### Dodawanie ogłoszenia
*   **Metoda:** `POST`
*   **URL:** `/announcements`
*   **Opis:** Tworzy nowe ogłoszenie (US-005). Użytkownik musi być uwierzytelniony.
*   **Ładunek żądania (Payload):**
    ```json
    {
      "title": "Znaleziono małego kota",
      "type": "found",
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
      "is_aggressive": false,
      "is_fearful": true
    }
    ```
    *Uwaga: `author_id` jest przypisywane automatycznie przez Supabase (RLS/Domyślne wartości) na podstawie tokenu JWT.*
*   **Odpowiedź sukcesu (201 Created):** Zwraca utworzony obiekt.
*   **Błąd (400 Bad Request):** Brakujące wymagane pola lub nieprawidłowe wartości ENUM.

#### Szczegóły ogłoszenia
*   **Metoda:** `GET`
*   **URL:** `/announcements?id=eq.{uuid}`
*   **Opis:** Pobiera pełne szczegóły konkretnego ogłoszenia.
*   **Parametry zapytania:** `select=*,profiles(username)`
*   **Odpowiedź sukcesu (200 OK):** Zwraca tablicę zawierającą pojedynczy obiekt ogłoszenia.

#### Aktualizacja ogłoszenia (Edycja / Oznaczenie jako znalezione)
*   **Metoda:** `PATCH`
*   **URL:** `/announcements?id=eq.{uuid}`
*   **Opis:** Aktualizuje istniejące ogłoszenie. Używane do edycji szczegółów (US-006) lub zmiany statusu na 'resolved' (US-007). RLS zapewnia, że tylko autor może to zrobić.
*   **Ładunek żądania (Przykład oznaczenia jako znalezione):**
    ```json
    {
      "status": "resolved"
    }
    ```
*   **Odpowiedź sukcesu (200 OK / 204 No Content):** Zwraca zaktualizowany obiekt lub puste potwierdzenie.

#### Usuwanie ogłoszenia
*   **Metoda:** `DELETE`
*   **URL:** `/announcements?id=eq.{uuid}`
*   **Opis:** Trwale usuwa ogłoszenie (US-006).
*   **Odpowiedź sukcesu (204 No Content):** Pusta treść.

### 2.2. Komentarze (Comments)

#### Lista komentarzy
*   **Metoda:** `GET`
*   **URL:** `/comments?announcement_id=eq.{uuid}`
*   **Opis:** Listuje wszystkie komentarze dla konkretnego ogłoszenia.
*   **Parametry zapytania:** `select=*,profiles(username)&order=created_at.asc`
*   **Odpowiedź sukcesu (200 OK):**
    ```json
    [
      {
        "id": 101,
        "content": "Widziałem tego psa przy dworcu!",
        "is_sighting": true,
        "created_at": "2023-11-01T14:30:00Z",
        "profiles": {
          "username": "anna_nowak"
        }
      }
    ]
    ```

#### Dodawanie komentarza
*   **Metoda:** `POST`
*   **URL:** `/comments`
*   **Opis:** Dodaje nowy komentarz. Obsługuje flagę "Widziano zwierzę" (US-009).
*   **Ładunek żądania:**
    ```json
    {
      "announcement_id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Sprawdzam czy pies nadal tam jest.",
      "is_sighting": false
    }
    ```
*   **Odpowiedź sukcesu (201 Created):** Zwraca utworzony komentarz.

### 2.3. Profile i Bezpieczny Kontakt

#### Pobranie własnego profilu
*   **Metoda:** `GET`
*   **URL:** `/profiles?id=eq.{uuid_zalogowanego_uzytkownika}`
*   **Opis:** Pobiera dane profilowe aktualnie zalogowanego użytkownika.
*   **Odpowiedź sukcesu (200 OK):** Obiekt JSON z `username`, `phone_number`.

#### Aktualizacja profilu
*   **Metoda:** `PATCH`
*   **URL:** `/profiles?id=eq.{uuid_zalogowanego_uzytkownika}`
*   **Opis:** Aktualizuje szczegóły użytkownika (np. numer telefonu).
*   **Ładunek żądania:**
    ```json
    {
      "phone_number": "+48123456789"
    }
    ```

#### Pobranie danych kontaktowych autora (RPC)
*   **Metoda:** `POST`
*   **URL:** `/rpc/get_contact_details`
*   **Opis:** Bezpiecznie pobiera numer telefonu autora ogłoszenia. Jest to wywołanie **Funkcji PostgreSQL**. Wymusza prywatność, zapewniając, że tylko uwierzytelnieni użytkownicy mogą pobrać te dane i tylko na wyraźne żądanie (US-010).
*   **Ładunek żądania:**
    ```json
    {
      "p_announcement_id": "550e8400-e29b-41d4-a716-446655440000"
    }
    ```
*   **Odpowiedź sukcesu (200 OK):**
    ```json
    "+48987654321"
    ```
    *(Zwraca ciąg znaków bezpośrednio lub null, jeśli brak dostępu/danych)*

### 2.4. Zgłoszenia (Reports)

#### Zgłoszenie nadużycia
*   **Metoda:** `POST`
*   **URL:** `/reports`
*   **Opis:** Wysyła zgłoszenie dotyczące ogłoszenia (US-012).
*   **Ładunek żądania:**
    ```json
    {
      "announcement_id": "550e8400-e29b-41d4-a716-446655440000",
      "reason": "Fałszywe ogłoszenie / Spam"
    }
    ```
*   **Odpowiedź sukcesu (201 Created):** Zwraca obiekt zgłoszenia.
*   **Błąd (409 Conflict):** Użytkownik już zgłosił to ogłoszenie (wymuszone przez ograniczenie UNIQUE).

---

## 3. Uwierzytelnianie i autoryzacja

API opiera się na **Supabase Auth (GoTrue)**. Aplikacja nie musi implementować niestandardowej logiki JWT.

1.  **Mechanizm:** Wszystkie żądania do chronionych punktów końcowych muszą zawierać nagłówek `Authorization`.
    *   `Authorization: Bearer <JWT_TOKEN>`
2.  **Zarządzanie rolami:**
    *   **Rola Uwierzytelniona (Authenticated):** Przyznawana użytkownikom z ważnym tokenem JWT. Pozwala na `POST` do ogłoszeń/komentarzy/zgłoszeń oraz dostęp do RPC `get_contact_details`.
    *   **Rola Publiczna (Anon):** Pozwala na `GET` na ogłoszeniach i komentarzach (z wyłączeniem prywatnych danych kontaktowych).
3.  **Row Level Security (RLS):**
    *   API automatycznie stosuje polityki RLS zdefiniowane w planie bazy danych.
    *   Przykład: Żądanie `DELETE` do `/announcements?id=eq.123` zakończy się niepowodzeniem (401/403) lub wpłynie na 0 wierszy, jeśli `auth.uid()` nie pasuje do `author_id` ogłoszenia.

---

## 4. Walidacja i logika biznesowa

Ponieważ API jest oparte na schemacie, walidacja jest ściśle egzekwowana przez silnik bazy danych PostgreSQL.

### 4.1 Zasady walidacji
*   **Pola wymagane:** Próba utworzenia Ogłoszenia bez `title`, `species`, `voivodeship`, `poviat`, `event_date` lub `image_url` zwróci **400 Bad Request**.
*   **Typy danych i Enumy:**
    *   `species`: Musi być dokładnie "dog" lub "cat".
    *   `type`: Musi być "lost" lub "found".
    *   `status`: Musi być "active" lub "resolved".
    *   `size`, `age_range`: Muszą pasować do zdefiniowanych ENUM (np. "small", "adult").
*   **Klucze obce:** `announcement_id` w komentarzach/zgłoszeniach musi istnieć; w przeciwnym razie **409 Conflict** (Naruszenie klucza obcego).

### 4.2 Implementacja logiki biznesowej
*   **Oznaczanie jako znalezione (US-007):** Zaimplementowane wyłącznie jako aktualizacja danych. Klient wysyła `{ "status": "resolved" }` do punktu końcowego `PATCH`. Frontend jest odpowiedzialny za interpretację tego statusu, aby wyświetlić baner "ZNALEZIONE" i zablokować formularz komentarzy.
*   **Flaga widoczności (US-009):** Backend przechowuje wartość logiczną `is_sighting`. Frontend używa tej flagi do zastosowania specyficznych stylów CSS (wyróżnienia) dla komentarza.
*   **Prywatność (US-010):** Tabela `profiles` jest publicznie odczytywalna dla `username`, ale odpowiedź API dla `/announcements` **nie** zawiera `phone_number`. Należy wywołać specyficzny punkt końcowy RPC, aby bezpiecznie pobrać te dane.
*   **Jedno zgłoszenie na użytkownika:** Baza danych wymusza `UNIQUE(announcement_id, reporting_user_id)`. API zwróci błąd, jeśli użytkownik spróbuje wielokrotnie zgłosić to samo ogłoszenie.