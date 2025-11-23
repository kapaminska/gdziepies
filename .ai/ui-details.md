# Szczegóły implementacji widoków - GdziePies

## 1. Strona Główna (Home Page)

### 2. Opis widoku:

<view_description>

**Ścieżka:** `/`
**Główny cel:** Natychmiastowe skierowanie użytkownika do poszukiwań lub dodania ogłoszenia oraz prezentacja najnowszych zgłoszeń.
**Kluczowe informacje:**
- Główne przyciski CTA ("Zgubiłem", "Znalazłem").
- Karuzela z najnowszymi ogłoszeniami.
- Krótkie wyjaśnienie działania serwisu.
**Kluczowe komponenty:**
- `HeroSection` (Statyczny).
- `LatestAdsCarousel` (React Island - client:load) – interaktywna karuzela.
**UX/A11y/Bezpieczeństwo:** Wysoki kontrast dla CTA, semantyczna struktura nagłówków.

</view_description>

### 3. User Stories:

<user_stories>

- **ID: US-003**
  - **Tytuł:** Przeglądanie ogłoszeń przez niezalogowanego użytkownika
  - **Opis:** Jako osoba odwiedzająca stronę, chcę móc przeglądać listę wszystkich ogłoszeń i wchodzić w ich szczegóły, aby zorientować się, jakie zwierzęta są poszukiwane lub zostały znalezione w mojej okolicy.
  - **Kryteria akceptacji:**
    1. Strona główna wyświetla karuzelę z najnowszymi ogłoszeniami.
    2. Użytkownik może przejść do listy wszystkich ogłoszeń.
    3. Użytkownik może otworzyć stronę szczegółową dowolnego ogłoszenia.
    4. Na stronie szczegółowej ogłoszenia dane kontaktowe właściciela są ukryte, a w ich miejscu widnieje przycisk/link "Zaloguj się, aby zobaczyć dane kontaktowe".

</user_stories>

### 4. Endpoint Description:

<endpoint_description>

#### Lista i filtrowanie ogłoszeń
- **Metoda:** `GET`
- **URL:** `/announcements`
- **Opis:** Pobiera stronicowaną listę ogłoszeń. Obsługuje złożone filtrowanie dla wyszukiwarki (US-004).
- **Parametry zapytania (Składnia PostgREST):**
  - `select`: `*,profiles(username)` (Pobiera szczegóły ogłoszenia + nazwę autora)
  - `type`: `eq.lost` | `eq.found`
  - `species`: `eq.dog` | `eq.cat`
  - `voivodeship`: `eq.{wartość}`
  - `poviat`: `eq.{wartość}`
  - `size`: `eq.small` | `medium` | `large`
  - `color`: `eq.{wartość}`
  - `age_range`: `eq.young` | `adult` | `senior`
  - `event_date`: `gte.{data}` (Od) & `lte.{data}` (Do)
  - `status`: `eq.active` (Domyślnie) lub `eq.resolved`
  - `order`: `created_at.desc` (Najnowsze pierwsze)
  - `offset`: `{liczba}` (Start stronicowania)
  - `limit`: `{liczba}` (Rozmiar strony)

</endpoint_description>

### 5. Endpoint Implementation:

<endpoint_implementation>

- **GET /api/announcements** - Implementacja w ```18:43:src/pages/api/announcements/index.ts```

</endpoint_implementation>

---

## 2. Lista Ogłoszeń (Search/Listing)

### 2. Opis widoku:

<view_description>

**Ścieżka:** `/ogloszenia`
**Główny cel:** Umożliwienie znalezienia konkretnego zwierzęcia poprzez filtrowanie i przeglądanie wyników.
**Kluczowe informacje:**
- Siatka kart ogłoszeń (zdjęcie, tytuł, data, lokalizacja, status).
- Panel filtrów (Filtrowanie fasetowe).
**Kluczowe komponenty:**
- `AdCard` (Statyczny komponent Astro).
- `FilterSidebar` (Desktop - React).
- `MobileFilterModal` (Mobile - React, pełnoekranowy modal).
- `Pagination` / `LoadMore`.
**UX/A11y/Bezpieczeństwo:** Stan filtrów synchronizowany z URL (shareable links). Filtry mobilne łatwe do obsługi kciukiem.

</view_description>

### 3. User Stories:

<user_stories>

- **ID: US-003**
  - **Tytuł:** Przeglądanie ogłoszeń przez niezalogowanego użytkownika
  - **Opis:** Jako osoba odwiedzająca stronę, chcę móc przeglądać listę wszystkich ogłoszeń i wchodzić w ich szczegóły, aby zorientować się, jakie zwierzęta są poszukiwane lub zostały znalezione w mojej okolicy.
  - **Kryteria akceptacji:**
    1. Strona główna wyświetla karuzelę z najnowszymi ogłoszeniami.
    2. Użytkownik może przejść do listy wszystkich ogłoszeń.
    3. Użytkownik może otworzyć stronę szczegółową dowolnego ogłoszenia.
    4. Na stronie szczegółowej ogłoszenia dane kontaktowe właściciela są ukryte, a w ich miejscu widnieje przycisk/link "Zaloguj się, aby zobaczyć dane kontaktowe".

- **ID: US-004**
  - **Tytuł:** Wyszukiwanie i filtrowanie ogłoszeń
  - **Opis:** Jako użytkownik, chcę móc filtrować ogłoszenia na podstawie kluczowych kryteriów, takich jak gatunek, lokalizacja, wielkość i kolor, aby szybko zawęzić wyniki do interesujących mnie przypadków.
  - **Kryteria akceptacji:**
    1. Na stronie z listą ogłoszeń dostępny jest panel filtrowania.
    2. Panel zawiera filtry: gatunek (pies/kot), lokalizacja (lista województw i powiatów), wielkość, kolor sierści, przedział wiekowy, data.
    3. Po zastosowaniu filtrów lista ogłoszeń jest dynamicznie aktualizowana i wyświetla tylko pasujące wyniki.
    4. Możliwe jest jednoczesne użycie wielu filtrów.

</user_stories>

### 4. Endpoint Description:

<endpoint_description>

#### Lista i filtrowanie ogłoszeń
- **Metoda:** `GET`
- **URL:** `/announcements`
- **Opis:** Pobiera stronicowaną listę ogłoszeń. Obsługuje złożone filtrowanie dla wyszukiwarki (US-004).
- **Parametry zapytania (Składnia PostgREST):**
  - `select`: `*,profiles(username)` (Pobiera szczegóły ogłoszenia + nazwę autora)
  - `type`: `eq.lost` | `eq.found`
  - `species`: `eq.dog` | `eq.cat`
  - `voivodeship`: `eq.{wartość}`
  - `poviat`: `eq.{wartość}`
  - `size`: `eq.small` | `medium` | `large`
  - `color`: `eq.{wartość}`
  - `age_range`: `eq.young` | `adult` | `senior`
  - `event_date`: `gte.{data}` (Od) & `lte.{data}` (Do)
  - `status`: `eq.active` (Domyślnie) lub `eq.resolved`
  - `order`: `created_at.desc` (Najnowsze pierwsze)
  - `offset`: `{liczba}` (Start stronicowania)
  - `limit`: `{liczba}` (Rozmiar strony)

</endpoint_description>

### 5. Endpoint Implementation:

<endpoint_implementation>

- **GET /api/announcements** - Implementacja w ```18:43:src/pages/api/announcements/index.ts```

</endpoint_implementation>

---

## 3. Dodawanie / Edycja Ogłoszenia (Create/Edit Ad)

### 2. Opis widoku:

<view_description>

**Ścieżka:** `/dodaj-ogloszenie`, `/moje-konto/edycja/[id]` (Trasy chronione)
**Główny cel:** Zebranie ustrukturyzowanych danych o zwierzęciu.
**Kluczowe informacje:**
- Formularz wieloetapowy lub długa sekcja podzielona na grupy logiczne.
**Kluczowe komponenty:**
- `AdForm` (React Island - client:only).
- `ImageUploader` (Drag & Drop z podglądem).
- `LocationCascader` (Województwo -> Powiat).
**UX/A11y/Bezpieczeństwo:** Zapobieganie utracie danych (alert przy próbie wyjścia), walidacja pól wymaganych, optymalizacja obrazów przed wysyłką.

</view_description>

### 3. User Stories:

<user_stories>

- **ID: US-005**
  - **Tytuł:** Dodawanie nowego ogłoszenia
  - **Opis:** Jako zalogowany użytkownik, który zgubił lub znalazł zwierzę, chcę móc dodać nowe, szczegółowe ogłoszenie, aby poinformować o tym społeczność.
  - **Kryteria akceptacji:**
    1. Dostępny jest formularz dodawania ogłoszenia.
    2. Formularz wymaga wypełnienia pól obowiązkowych: status, gatunek, powiat, data, zdjęcie, tytuł.
    3. Formularz umożliwia wypełnienie pól opcjonalnych: szczegółowa lokalizacja, rozmiar, kolor, wiek, temperament (agresywny/lękliwy), opis.
    4. System waliduje, czy zdjęcie zostało dodane.
    5. Po poprawnym wypełnieniu formularza i jego wysłaniu, ogłoszenie jest publikowane i widoczne w serwisie.

- **ID: US-006**
  - **Tytuł:** Zarządzanie własnymi ogłoszeniami
  - **Opis:** Jako zalogowany użytkownik, chcę mieć dostęp do listy moich ogłoszeń, abym mógł je edytować lub usunąć.
  - **Kryteria akceptacji:**
    1. W profilu użytkownika znajduje się sekcja "Moje ogłoszenia".
    2. Na liście przy każdym ogłoszeniu widoczne są opcje "Edytuj" i "Usuń".
    3. Kliknięcie "Edytuj" przenosi do formularza z wypełnionymi danymi ogłoszenia, które można zmodyfikować.
    4. Kliknięcie "Usuń" powoduje usunięcie ogłoszenia po uprzednim potwierdzeniu operacji.

</user_stories>

### 4. Endpoint Description:

<endpoint_description>

#### Dodawanie ogłoszenia
- **Metoda:** `POST`
- **URL:** `/announcements`
- **Opis:** Tworzy nowe ogłoszenie (US-005). Użytkownik musi być uwierzytelniony.
- **Ładunek żądania (Payload):**
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
- **Odpowiedź sukcesu (201 Created):** Zwraca utworzony obiekt.
- **Błąd (400 Bad Request):** Brakujące wymagane pola lub nieprawidłowe wartości ENUM.

#### Aktualizacja ogłoszenia (Edycja / Oznaczenie jako znalezione)
- **Metoda:** `PATCH`
- **URL:** `/announcements?id=eq.{uuid}`
- **Opis:** Aktualizuje istniejące ogłoszenie. Używane do edycji szczegółów (US-006) lub zmiany statusu na 'resolved' (US-007). RLS zapewnia, że tylko autor może to zrobić.
- **Ładunek żądania (Przykład oznaczenia jako znalezione):**
  ```json
  {
    "status": "resolved"
  }
  ```
- **Odpowiedź sukcesu (200 OK / 204 No Content):** Zwraca zaktualizowany obiekt lub puste potwierdzenie.

#### Szczegóły ogłoszenia
- **Metoda:** `GET`
- **URL:** `/announcements?id=eq.{uuid}`
- **Opis:** Pobiera pełne szczegóły konkretnego ogłoszenia.
- **Parametry zapytania:** `select=*,profiles(username)`
- **Odpowiedź sukcesu (200 OK):** Zwraca tablicę zawierającą pojedynczy obiekt ogłoszenia.

#### Usuwanie ogłoszenia
- **Metoda:** `DELETE`
- **URL:** `/announcements?id=eq.{uuid}`
- **Opis:** Trwale usuwa ogłoszenie (US-006).
- **Odpowiedź sukcesu (204 No Content):** Pusta treść.

</endpoint_description>

### 5. Endpoint Implementation:

<endpoint_implementation>

- **POST /api/announcements** - Implementacja w ```50:86:src/pages/api/announcements/index.ts```
- **GET /api/announcements/{id}** - Implementacja w ```18:47:src/pages/api/announcements/[id].ts```
- **PATCH /api/announcements/{id}** - Implementacja w ```54:107:src/pages/api/announcements/[id].ts```
- **DELETE /api/announcements/{id}** - Implementacja w ```114:154:src/pages/api/announcements/[id].ts```

</endpoint_implementation>

---

## 4. Szczegóły Ogłoszenia (Ad Details)

### 2. Opis widoku:

<view_description>

**Ścieżka:** `/ogloszenia/[id]`
**Główny cel:** Prezentacja pełnych informacji o zwierzęciu i umożliwienie kontaktu lub zgłoszenia wskazówki.
**Kluczowe informacje:**
- Pełna galeria zdjęć lub duże zdjęcie główne.
- Szczegółowy opis, cechy, lokalizacja.
- Status ogłoszenia (jeśli "ZNALEZIONE" -> wyraźny banner).
- Sekcja kontaktowa (warunkowa).
- Komentarze.
**Kluczowe komponenty:**
- `AdInfoDisplay` (Astro SSR).
- `ContactReveal` (React Island) – sprawdza sesję Supabase; pokazuje dane lub placeholder z CTA do logowania.
- `CommentsSection` (React Island) – lista + formularz z opcją "Widziałem to zwierzę".
- `ShareButton` (kopiowanie linku).
- `ReportAbuseButton`.
**UX/A11y/Bezpieczeństwo:** Dane kontaktowe nigdy nie są renderowane w kodzie HTML dla niezalogowanych (ochrona przed scrapingiem). Wyraźny komunikat o statusie "ZNALEZIONE".

</view_description>

### 3. User Stories:

<user_stories>

- **ID: US-003**
  - **Tytuł:** Przeglądanie ogłoszeń przez niezalogowanego użytkownika
  - **Opis:** Jako osoba odwiedzająca stronę, chcę móc przeglądać listę wszystkich ogłoszeń i wchodzić w ich szczegóły, aby zorientować się, jakie zwierzęta są poszukiwane lub zostały znalezione w mojej okolicy.
  - **Kryteria akceptacji:**
    1. Strona główna wyświetla karuzelę z najnowszymi ogłoszeniami.
    2. Użytkownik może przejść do listy wszystkich ogłoszeń.
    3. Użytkownik może otworzyć stronę szczegółową dowolnego ogłoszenia.
    4. Na stronie szczegółowej ogłoszenia dane kontaktowe właściciela są ukryte, a w ich miejscu widnieje przycisk/link "Zaloguj się, aby zobaczyć dane kontaktowe".

- **ID: US-007**
  - **Tytuł:** Oznaczanie ogłoszenia jako "ZNALEZIONE"
  - **Opis:** Jako autor ogłoszenia o zaginionym zwierzęciu, które się odnalazło, chcę móc oznaczyć je jako "ZNALEZIONE", aby poinformować innych i zakończyć poszukiwania.
  - **Kryteria akceptacji:**
    1. Na stronie szczegółowej mojego ogłoszenia oraz na liście moich ogłoszeń widoczny jest przycisk "Oznacz jako ZNALEZIONE".
    2. Po kliknięciu przycisku, ogłoszenie otrzymuje wyraźny status wizualny (np. banner, etykieta "ZNALEZIONE").
    3. Ogłoszenie ze statusem "ZNALEZIONE" pozostaje widoczne w serwisie, ale może być inaczej prezentowane na listach.
    4. Formularz dodawania komentarzy pod takim ogłoszeniem jest zablokowany.

- **ID: US-008**
  - **Tytuł:** Dodawanie komentarza pod ogłoszeniem
  - **Opis:** Jako zalogowany użytkownik, chcę móc dodać komentarz pod ogłoszeniem, aby podzielić się informacją lub wesprzeć właściciela.
  - **Kryteria akceptacji:**
    1. Pod szczegółami ogłoszenia widoczny jest formularz dodawania komentarza (tylko dla zalogowanych).
    2. Po dodaniu, komentarz jest widoczny na liście pod ogłoszeniem wraz z nazwą użytkownika i datą.

- **ID: US-009**
  - **Tytuł:** Zgłaszanie, że zwierzę było widziane
  - **Opis:** Jako zalogowany użytkownik, który zauważył poszukiwane zwierzę, chcę móc dodać specjalny komentarz "Widziałem/am to zwierzę", aby moja informacja była dobrze widoczna dla właściciela.
  - **Kryteria akceptacji:**
    1. Formularz dodawania komentarza zawiera checkbox lub przycisk "Widziałem/am to zwierzę".
    2. Po zaznaczeniu tej opcji i dodaniu komentarza, jest on wizualnie wyróżniony na liście komentarzy (np. innym tłem, ikoną).

- **ID: US-010**
  - **Tytuł:** Dostęp do danych kontaktowych
  - **Opis:** Jako zalogowany użytkownik, chcę widzieć dane kontaktowe autora ogłoszenia, aby móc się z nim bezpośrednio skontaktować w sprawie zwierzęcia.
  - **Kryteria akceptacji:**
    1. Gdy jestem zalogowany, na stronie szczegółowej ogłoszenia widzę dane kontaktowe podane przez autora.
    2. Gdy nie jestem zalogowany, dane te są ukryte.

- **ID: US-011**
  - **Tytuł:** Generowanie linku do udostępnienia
  - **Opis:** Jako użytkownik, chcę móc łatwo skopiować bezpośredni link do strony ogłoszenia, aby udostępnić je na swoich mediach społecznościowych.
  - **Kryteria akceptacji:**
    1. Na stronie każdego ogłoszenia znajduje się przycisk "Udostępnij" lub "Kopiuj link".
    2. Kliknięcie przycisku kopiuje do schowka unikalny URL prowadzący do tego konkretnego ogłoszenia.

- **ID: US-012**
  - **Tytuł:** Zgłaszanie nadużyć
  - **Opis:** Jako użytkownik, chcę mieć możliwość zgłoszenia ogłoszenia, które wydaje mi się nieodpowiednie, fałszywe lub jest spamem, aby administrator mógł je zweryfikować.
  - **Kryteria akceptacji:**
    1. Na stronie każdego ogłoszenia znajduje się przycisk "Zgłoś nadużycie".
    2. Po kliknięciu przycisku, system wysyła powiadomienie e-mail na zdefiniowany adres administratora, zawierające link do zgłaszanego ogłoszenia.
    3. Użytkownik otrzymuje potwierdzenie, że zgłoszenie zostało wysłane.

</user_stories>

### 4. Endpoint Description:

<endpoint_description>

#### Szczegóły ogłoszenia
- **Metoda:** `GET`
- **URL:** `/announcements?id=eq.{uuid}`
- **Opis:** Pobiera pełne szczegóły konkretnego ogłoszenia.
- **Parametry zapytania:** `select=*,profiles(username)`
- **Odpowiedź sukcesu (200 OK):** Zwraca tablicę zawierającą pojedynczy obiekt ogłoszenia.

#### Aktualizacja ogłoszenia (Edycja / Oznaczenie jako znalezione)
- **Metoda:** `PATCH`
- **URL:** `/announcements?id=eq.{uuid}`
- **Opis:** Aktualizuje istniejące ogłoszenie. Używane do edycji szczegółów (US-006) lub zmiany statusu na 'resolved' (US-007). RLS zapewnia, że tylko autor może to zrobić.
- **Ładunek żądania (Przykład oznaczenia jako znalezione):**
  ```json
  {
    "status": "resolved"
  }
  ```
- **Odpowiedź sukcesu (200 OK / 204 No Content):** Zwraca zaktualizowany obiekt lub puste potwierdzenie.

#### Lista komentarzy
- **Metoda:** `GET`
- **URL:** `/comments?announcement_id=eq.{uuid}`
- **Opis:** Listuje wszystkie komentarze dla konkretnego ogłoszenia.
- **Parametry zapytania:** `select=*,profiles(username)&order=created_at.asc`
- **Odpowiedź sukcesu (200 OK):**
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
- **Metoda:** `POST`
- **URL:** `/comments`
- **Opis:** Dodaje nowy komentarz. Obsługuje flagę "Widziano zwierzę" (US-009).
- **Ładunek żądania:**
  ```json
  {
    "announcement_id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Sprawdzam czy pies nadal tam jest.",
    "is_sighting": false
  }
  ```
- **Odpowiedź sukcesu (201 Created):** Zwraca utworzony komentarz.

#### Pobranie danych kontaktowych autora (RPC)
- **Metoda:** `POST`
- **URL:** `/rpc/get_contact_details`
- **Opis:** Bezpiecznie pobiera numer telefonu autora ogłoszenia. Jest to wywołanie **Funkcji PostgreSQL**. Wymusza prywatność, zapewniając, że tylko uwierzytelnieni użytkownicy mogą pobrać te dane i tylko na wyraźne żądanie (US-010).
- **Ładunek żądania:**
  ```json
  {
    "p_announcement_id": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```
- **Odpowiedź sukcesu (200 OK):**
  ```json
  "+48987654321"
  ```
  *(Zwraca ciąg znaków bezpośrednio lub null, jeśli brak dostępu/danych)*

#### Zgłoszenie nadużycia
- **Metoda:** `POST`
- **URL:** `/reports`
- **Opis:** Wysyła zgłoszenie dotyczące ogłoszenia (US-012).
- **Ładunek żądania:**
  ```json
  {
    "announcement_id": "550e8400-e29b-41d4-a716-446655440000",
    "reason": "Fałszywe ogłoszenie / Spam"
  }
  ```
- **Odpowiedź sukcesu (201 Created):** Zwraca obiekt zgłoszenia.
- **Błąd (409 Conflict):** Użytkownik już zgłosił to ogłoszenie (wymuszone przez ograniczenie UNIQUE).

</endpoint_description>

### 5. Endpoint Implementation:

<endpoint_implementation>

- **GET /api/announcements/{id}** - Implementacja w ```18:47:src/pages/api/announcements/[id].ts```
- **PATCH /api/announcements/{id}** - Implementacja w ```54:107:src/pages/api/announcements/[id].ts```
- **GET /api/comments** - Implementacja w ```27:65:src/pages/api/comments/index.ts```
- **POST /api/comments** - Implementacja w ```85:121:src/pages/api/comments/index.ts```
- **POST /rpc/get_contact_details** - Funkcja PostgreSQL w bazie danych (niezaimplementowana jako endpoint Astro)
- **POST /api/reports** - Endpoint do zgłaszania nadużyć (niezaimplementowany)

</endpoint_implementation>

---

## 5. Logowanie / Rejestracja (Auth)

### 2. Opis widoku:

<view_description>

**Ścieżka:** `/logowanie`, `/rejestracja`
**Główny cel:** Uwierzytelnienie użytkownika.
**Kluczowe informacje:**
- Formularz e-mail/hasło.
- Linki "Zapomniałem hasła" i "Nie mam konta".
**Kluczowe komponenty:**
- `AuthForm` (React Island - client:load) – walidacja po stronie klienta i obsługa błędów Supabase.
**UX/A11y/Bezpieczeństwo:** Jasne komunikaty błędów, obsługa menedżerów haseł, walidacja formatu e-mail w czasie rzeczywistym.

</view_description>

### 3. User Stories:

<user_stories>

- **ID: US-001**
  - **Tytuł:** Rejestracja nowego użytkownika
  - **Opis:** Jako nowy użytkownik, chcę móc założyć konto w serwisie używając mojego adresu e-mail i hasła, aby móc dodawać ogłoszenia i komentować istniejące.
  - **Kryteria akceptacji:**
    1. Formularz rejestracji zawiera pola: adres e-mail, hasło, powtórz hasło.
    2. System waliduje poprawność formatu adresu e-mail.
    3. System sprawdza, czy hasła w obu polach są identyczne.
    4. System sprawdza, czy podany adres e-mail nie jest już zarejestrowany.
    5. Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany na stronę główną.

- **ID: US-002**
  - **Tytuł:** Logowanie użytkownika
  - **Opis:** Jako zarejestrowany użytkownik, chcę móc zalogować się na moje konto podając e-mail i hasło, aby uzyskać dostęp do moich ogłoszeń i pełnej funkcjonalności serwisu.
  - **Kryteria akceptacji:**
    1. Formularz logowania zawiera pola: adres e-mail, hasło.
    2. System wyświetla komunikat o błędzie w przypadku podania nieprawidłowego e-maila lub hasła.
    3. Po pomyślnym zalogowaniu użytkownik jest przekierowywany na stronę główną.

</user_stories>

### 4. Endpoint Description:

<endpoint_description>

Uwierzytelnianie w aplikacji GdziePies opiera się na **Supabase Auth (GoTrue)**. Aplikacja nie implementuje niestandardowej logiki JWT.

**Mechanizm:** Wszystkie żądania do chronionych punktów końcowych muszą zawierać nagłówek `Authorization`.
- `Authorization: Bearer <JWT_TOKEN>`

**Zarządzanie rolami:**
- **Rola Uwierzytelniona (Authenticated):** Przyznawana użytkownikom z ważnym tokenem JWT. Pozwala na `POST` do ogłoszeń/komentarzy/zgłoszeń oraz dostęp do RPC `get_contact_details`.
- **Rola Publiczna (Anon):** Pozwala na `GET` na ogłoszeniach i komentarzach (z wyłączeniem prywatnych danych kontaktowych).

**Row Level Security (RLS):**
- API automatycznie stosuje polityki RLS zdefiniowane w planie bazy danych.
- Przykład: Żądanie `DELETE` do `/announcements?id=eq.123` zakończy się niepowodzeniem (401/403) lub wpłynie na 0 wierszy, jeśli `auth.uid()` nie pasuje do `author_id` ogłoszenia.

**Pobranie własnego profilu**
- **Metoda:** `GET`
- **URL:** `/profiles?id=eq.{uuid_zalogowanego_uzytkownika}`
- **Opis:** Pobiera dane profilowe aktualnie zalogowanego użytkownika.
- **Odpowiedź sukcesu (200 OK):** Obiekt JSON z `username`, `phone_number`.

**Aktualizacja profilu**
- **Metoda:** `PATCH`
- **URL:** `/profiles?id=eq.{uuid_zalogowanego_uzytkownika}`
- **Opis:** Aktualizuje szczegóły użytkownika (np. numer telefonu).
- **Ładunek żądania:**
  ```json
  {
    "phone_number": "+48123456789"
  }
  ```

</endpoint_description>

### 5. Endpoint Implementation:

<endpoint_implementation>

- **Supabase Auth** - Uwierzytelnianie odbywa się bezpośrednio przez Supabase Client SDK (niezaimplementowane jako endpointy Astro)
- **GET /profiles** - Dostępne przez Supabase PostgREST (niezaimplementowane jako endpoint Astro)
- **PATCH /profiles** - Dostępne przez Supabase PostgREST (niezaimplementowane jako endpoint Astro)

</endpoint_implementation>

---

## 6. Panel Użytkownika (Dashboard)

### 2. Opis widoku:

<view_description>

**Ścieżka:** `/moje-konto` (Trasa chroniona)
**Główny cel:** Zarządzanie własnymi ogłoszeniami.
**Kluczowe informacje:**
- Lista dodanych ogłoszeń.
- Statusy każdego ogłoszenia.
**Kluczowe komponenty:**
- `UserAdsList` (React Island lub Astro z hydratacją przycisków akcji).
- `AdActionMenu` (Dropdown: Edytuj, Usuń, Oznacz jako Znalezione).
**UX/A11y/Bezpieczeństwo:** Potwierdzenie usunięcia (Modal). Łatwy dostęp do zmiany statusu.

</view_description>

### 3. User Stories:

<user_stories>

- **ID: US-006**
  - **Tytuł:** Zarządzanie własnymi ogłoszeniami
  - **Opis:** Jako zalogowany użytkownik, chcę mieć dostęp do listy moich ogłoszeń, abym mógł je edytować lub usunąć.
  - **Kryteria akceptacji:**
    1. W profilu użytkownika znajduje się sekcja "Moje ogłoszenia".
    2. Na liście przy każdym ogłoszeniu widoczne są opcje "Edytuj" i "Usuń".
    3. Kliknięcie "Edytuj" przenosi do formularza z wypełnionymi danymi ogłoszenia, które można zmodyfikować.
    4. Kliknięcie "Usuń" powoduje usunięcie ogłoszenia po uprzednim potwierdzeniu operacji.

- **ID: US-007**
  - **Tytuł:** Oznaczanie ogłoszenia jako "ZNALEZIONE"
  - **Opis:** Jako autor ogłoszenia o zaginionym zwierzęciu, które się odnalazło, chcę móc oznaczyć je jako "ZNALEZIONE", aby poinformować innych i zakończyć poszukiwania.
  - **Kryteria akceptacji:**
    1. Na stronie szczegółowej mojego ogłoszenia oraz na liście moich ogłoszeń widoczny jest przycisk "Oznacz jako ZNALEZIONE".
    2. Po kliknięciu przycisku, ogłoszenie otrzymuje wyraźny status wizualny (np. banner, etykieta "ZNALEZIONE").
    3. Ogłoszenie ze statusem "ZNALEZIONE" pozostaje widoczne w serwisie, ale może być inaczej prezentowane na listach.
    4. Formularz dodawania komentarzy pod takim ogłoszeniem jest zablokowany.

</user_stories>

### 4. Endpoint Description:

<endpoint_description>

#### Lista i filtrowanie ogłoszeń
- **Metoda:** `GET`
- **URL:** `/announcements`
- **Opis:** Pobiera stronicowaną listę ogłoszeń. Obsługuje złożone filtrowanie dla wyszukiwarki (US-004).
- **Parametry zapytania (Składnia PostgREST):**
  - `select`: `*,profiles(username)` (Pobiera szczegóły ogłoszenia + nazwę autora)
  - `author_id`: `eq.{uuid}` (Filtr do pobrania ogłoszeń konkretnego użytkownika)
  - `status`: `eq.active` (Domyślnie) lub `eq.resolved`
  - `order`: `created_at.desc` (Najnowsze pierwsze)
  - `offset`: `{liczba}` (Start stronicowania)
  - `limit`: `{liczba}` (Rozmiar strony)

#### Aktualizacja ogłoszenia (Edycja / Oznaczenie jako znalezione)
- **Metoda:** `PATCH`
- **URL:** `/announcements?id=eq.{uuid}`
- **Opis:** Aktualizuje istniejące ogłoszenie. Używane do edycji szczegółów (US-006) lub zmiany statusu na 'resolved' (US-007). RLS zapewnia, że tylko autor może to zrobić.
- **Ładunek żądania (Przykład oznaczenia jako znalezione):**
  ```json
  {
    "status": "resolved"
  }
  ```
- **Odpowiedź sukcesu (200 OK / 204 No Content):** Zwraca zaktualizowany obiekt lub puste potwierdzenie.

#### Usuwanie ogłoszenia
- **Metoda:** `DELETE`
- **URL:** `/announcements?id=eq.{uuid}`
- **Opis:** Trwale usuwa ogłoszenie (US-006).
- **Odpowiedź sukcesu (204 No Content):** Pusta treść.

#### Szczegóły ogłoszenia
- **Metoda:** `GET`
- **URL:** `/announcements?id=eq.{uuid}`
- **Opis:** Pobiera pełne szczegóły konkretnego ogłoszenia.
- **Parametry zapytania:** `select=*,profiles(username)`
- **Odpowiedź sukcesu (200 OK):** Zwraca tablicę zawierającą pojedynczy obiekt ogłoszenia.

</endpoint_description>

### 5. Endpoint Implementation:

<endpoint_implementation>

- **GET /api/announcements** - Implementacja w ```18:43:src/pages/api/announcements/index.ts``` (z filtrem `author_id` dla ogłoszeń użytkownika)
- **GET /api/announcements/{id}** - Implementacja w ```18:47:src/pages/api/announcements/[id].ts```
- **PATCH /api/announcements/{id}** - Implementacja w ```54:107:src/pages/api/announcements/[id].ts```
- **DELETE /api/announcements/{id}** - Implementacja w ```114:154:src/pages/api/announcements/[id].ts```

</endpoint_implementation>

