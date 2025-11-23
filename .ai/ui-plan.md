
# Architektura UI dla GdziePies

## 1. Przegląd struktury UI

Interfejs użytkownika aplikacji "GdziePies" został zaprojektowany w architekturze hybrydowej ("Islands Architecture") wykorzystującej **Astro** jako fundament do renderowania statycznego (SSR) dla zapewnienia maksymalnej wydajności i SEO, oraz **React** do obsługi interaktywnych komponentów (formularze, modale, obsługa stanu sesji). Stylowanie oparte jest na podejściu "Mobile First" z wykorzystaniem **Tailwind CSS v4** oraz biblioteki komponentów **shadcn/ui** (Radix UI).

Główne założenia:
*   **Wydajność (Core Web Vitals):** Kluczowe widoki (Strona główna, Lista ogłoszeń, Szczegóły) renderowane są po stronie serwera.
*   **Interaktywność:** Formularze, dynamiczne filtry i sekcje wymagające autoryzacji są wstrzykiwane jako "Wyspy" (React Islands).
*   **Responsywność:** Dedykowane wzorce UX dla urządzeń mobilnych (np. pełnoekranowy modal filtrów).

## 2. Lista widoków

### 2.1. Strona Główna (Home Page)
*   **Ścieżka:** `/`
*   **Główny cel:** Natychmiastowe skierowanie użytkownika do poszukiwań lub dodania ogłoszenia oraz prezentacja najnowszych zgłoszeń.
*   **Kluczowe informacje:**
    *   Główne przyciski CTA ("Zgubiłem", "Znalazłem").
    *   Karuzela z najnowszymi ogłoszeniami.
    *   Krótkie wyjaśnienie działania serwisu.
*   **Kluczowe komponenty:**
    *   `HeroSection` (Statyczny).
    *   `LatestAdsCarousel` (React Island - client:load) – interaktywna karuzela.
*   **UX/A11y/Bezpieczeństwo:** Wysoki kontrast dla CTA, semantyczna struktura nagłówków.

### 2.2. Lista Ogłoszeń (Search/Listing)
*   **Ścieżka:** `/ogloszenia`
*   **Główny cel:** Umożliwienie znalezienia konkretnego zwierzęcia poprzez filtrowanie i przeglądanie wyników.
*   **Kluczowe informacje:**
    *   Siatka kart ogłoszeń (zdjęcie, tytuł, data, lokalizacja, status).
    *   Panel filtrów (Filtrowanie fasetowe).
*   **Kluczowe komponenty:**
    *   `AdCard` (Statyczny komponent Astro).
    *   `FilterSidebar` (Desktop - React).
    *   `MobileFilterModal` (Mobile - React, pełnoekranowy modal).
    *   `Pagination` / `LoadMore`.
*   **UX/A11y/Bezpieczeństwo:** Stan filtrów synchronizowany z URL (shareable links). Filtry mobilne łatwe do obsługi kciukiem.

### 2.3. Szczegóły Ogłoszenia (Ad Details)
*   **Ścieżka:** `/ogloszenia/[id]`
*   **Główny cel:** Prezentacja pełnych informacji o zwierzęciu i umożliwienie kontaktu lub zgłoszenia wskazówki.
*   **Kluczowe informacje:**
    *   Pełna galeria zdjęć lub duże zdjęcie główne.
    *   Szczegółowy opis, cechy, lokalizacja.
    *   Status ogłoszenia (jeśli "ZNALEZIONE" -> wyraźny banner).
    *   Sekcja kontaktowa (warunkowa).
    *   Komentarze.
*   **Kluczowe komponenty:**
    *   `AdInfoDisplay` (Astro SSR).
    *   `ContactReveal` (React Island) – sprawdza sesję Supabase; pokazuje dane lub placeholder z CTA do logowania.
    *   `CommentsSection` (React Island) – lista + formularz z opcją "Widziałem to zwierzę".
    *   `ShareButton` (kopiowanie linku).
    *   `ReportAbuseButton`.
*   **UX/A11y/Bezpieczeństwo:** Dane kontaktowe nigdy nie są renderowane w kodzie HTML dla niezalogowanych (ochrona przed scrapingiem). Wyraźny komunikat o statusie "ZNALEZIONE".

### 2.4. Logowanie / Rejestracja (Auth)
*   **Ścieżka:** `/logowanie`, `/rejestracja`
*   **Główny cel:** Uwierzytelnienie użytkownika.
*   **Kluczowe informacje:**
    *   Formularz e-mail/hasło.
    *   Linki "Zapomniałem hasła" i "Nie mam konta".
*   **Kluczowe komponenty:**
    *   `AuthForm` (React Island - client:load) – walidacja po stronie klienta i obsługa błędów Supabase.
*   **UX/A11y/Bezpieczeństwo:** Jasne komunikaty błędów, obsługa menedżerów haseł, walidacja formatu e-mail w czasie rzeczywistym.

### 2.5. Dodawanie / Edycja Ogłoszenia (Create/Edit Ad)
*   **Ścieżka:** `/dodaj-ogloszenie`, `/moje-konto/edycja/[id]` (Trasy chronione)
*   **Główny cel:** Zebranie ustrukturyzowanych danych o zwierzęciu.
*   **Kluczowe informacje:**
    *   Formularz wieloetapowy lub długa sekcja podzielona na grupy logiczne.
*   **Kluczowe komponenty:**
    *   `AdForm` (React Island - client:only).
    *   `ImageUploader` (Drag & Drop z podglądem).
    *   `LocationCascader` (Województwo -> Powiat).
*   **UX/A11y/Bezpieczeństwo:** Zapobieganie utracie danych (alert przy próbie wyjścia), walidacja pól wymaganych, optymalizacja obrazów przed wysyłką.

### 2.6. Panel Użytkownika (Dashboard)
*   **Ścieżka:** `/moje-konto` (Trasa chroniona)
*   **Główny cel:** Zarządzanie własnymi ogłoszeniami.
*   **Kluczowe informacje:**
    *   Lista dodanych ogłoszeń.
    *   Statusy każdego ogłoszenia.
*   **Kluczowe komponenty:**
    *   `UserAdsList` (React Island lub Astro z hydratacją przycisków akcji).
    *   `AdActionMenu` (Dropdown: Edytuj, Usuń, Oznacz jako Znalezione).
*   **UX/A11y/Bezpieczeństwo:** Potwierdzenie usunięcia (Modal). Łatwy dostęp do zmiany statusu.

## 3. Mapa podróży użytkownika

### Scenariusz 1: Osoba poszukująca zwierzęcia (Gość -> Zalogowany)
1.  **Wejście:** Użytkownik wchodzi na stronę główną.
2.  **Wyszukiwanie:** Wybiera "Zgubiłem psa" lub korzysta z filtrów na liście ogłoszeń (np. Lokalizacja: Mazowieckie).
3.  **Przeglądanie:** Przegląda listę wyników, klika w interesujące zdjęcie.
4.  **Weryfikacja:** Na stronie szczegółów czyta opis. Chce zadzwonić.
5.  **Bariera:** Widzi zamazany numer telefonu i komunikat "Zaloguj się, aby zobaczyć".
6.  **Konwersja:** Klika "Zaloguj", przechodzi szybką rejestrację/logowanie.
7.  **Cel:** Wraca automatycznie do ogłoszenia, widzi numer, dzwoni.

### Scenariusz 2: Dodawanie ogłoszenia (Zalogowany)
1.  **Decyzja:** Użytkownik klika przycisk "Dodaj ogłoszenie" w nagłówku.
2.  **Formularz:** Wypełnia dane podstawowe (Gatunek, Status).
3.  **Lokalizacja:** Wybiera Województwo, następnie dynamicznie ładuje się lista Powiatów.
4.  **Media:** Przeciąga zdjęcie psa z pulpitu do strefy dropzone. Widzi miniaturkę.
5.  **Publikacja:** Klika "Dodaj". System waliduje dane.
6.  **Sukces:** Przekierowanie do nowo utworzonego ogłoszenia z komunikatem (Toast) "Ogłoszenie dodane".

## 4. Układ i struktura nawigacji

### Globalny Layout (App Shell)
*   **Header (Nagłówek):**
    *   Logo (powrót do Home).
    *   Nawigacja Desktop: "Ogłoszenia", "O nas".
    *   Akcje Prawostronne:
        *   Dla Gościa: "Zaloguj", przycisk "Dodaj ogłoszenie" (kieruje do logowania).
        *   Dla Zalogowanego: Przycisk "Dodaj ogłoszenie", Menu Użytkownika (Awatar -> Moje konto, Wyloguj).
    *   Mobile: Ikona Hamburger Menu (otwiera Drawer z nawigacją).
*   **Footer (Stopka):**
    *   Linki prawne (Regulamin, Polityka Prywatności).
    *   Linki pomocnicze.
    *   Copyright.

### Nawigacja mobilna
*   Dolny pasek nawigacji nie jest przewidziany w MVP (RWD oparte na Hamburger Menu).
*   W widoku listy ogłoszeń: Pływający przycisk (FAB) lub wyraźny przycisk "Filtruj" przyklejony u dołu ekranu lub pod nagłówkiem.

## 5. Kluczowe komponenty

### 5.1. UI Kit (shadcn/ui + Tailwind)
*   **Button:** Warianty Primary (akcent), Secondary, Destructive (usuwanie), Ghost (ikony).
*   **Card:** Kontener dla ogłoszeń z sekcją obrazu, treści i stopki.
*   **Badge:** Etykiety statusu ("ZAGINIONY" - czerwony, "ZNALEZIONY" - zielony, "Widziano" - żółty).
*   **Input/Select/Textarea:** Podstawowe elementy formularzy z obsługą stanów błędów.
*   **Toast:** System powiadomień wyskakujących (sukces, błąd, info).
*   **Dialog/Modal:** Używany do filtrów mobilnych, potwierdzeń akcji i logowania (opcjonalnie).

### 5.2. Komponenty Domenowe
*   **`AdCard`:** Prezentuje zdjęcie (aspect-ratio square), tytuł, datę i lokalizację. Zawiera badge statusu.
*   **`LocationCombobox`:** Komponent typu *Searchable Select* dla województw i powiatów. Obsługuje logikę kaskadową (wybór rodzica resetuje i ładuje dziecko).
*   **`ImageDropzone`:** Obszar przyjmujący pliki, wyświetlający podgląd i pozwalający usunąć wybrane zdjęcie przed wysłaniem.
*   **`CommentItem`:** Wyświetla treść komentarza, autora i datę. Jeśli flaga `is_seen` jest `true`, tło komentarza jest lekko wyróżnione, a ikona "Oko" jest widoczna.
*   **`EmptyState`:** Uniwersalny komponent wyświetlany gdy brak wyników wyszukiwania lub brak ogłoszeń w panelu użytkownika (ikona + tekst + przycisk akcji).
