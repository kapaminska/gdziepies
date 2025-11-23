Dodawanie / Edycja Ogłoszenia (Create/Edit Ad)

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