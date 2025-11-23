```markdown
# Dokument wymagań produktu (PRD) - GdziePies
## 1. Przegląd produktu
GdziePies to responsywna aplikacja webowa (RWD) zaprojektowana jako centralna platforma do zgłaszania i poszukiwania zaginionych oraz znalezionych zwierząt domowych, głównie psów i kotów. Celem produktu jest skonsolidowanie rozproszonych obecnie ogłoszeń (głównie w mediach społecznościowych) w jednym, dedykowanym miejscu, aby maksymalnie zwiększyć szansę na szybkie odnalezienie pupila.

Aplikacja umożliwia użytkownikom tworzenie prostych kont, publikowanie szczegółowych ogłoszeń, ich przeglądanie i filtrowanie według kluczowych kryteriów. Platforma kładzie nacisk na prostotę obsługi i szybkość działania, umożliwiając łatwe udostępnianie ogłoszeń oraz interakcję społeczności w postaci komentarzy i informacji o zauważeniu zwierzęcia. Wersja MVP skupia się na kluczowych funkcjonalnościach, świadomie odkładając na później zaawansowane funkcje społecznościowe i integracje.

## 2. Problem użytkownika
Obecnie właściciele zaginionych zwierząt oraz osoby, które znalazły błąkającego się pupila, borykają się z brakiem jednego, centralnego miejsca do publikacji i wyszukiwania informacji. Główne problemy to:
*   Fragmentacja informacji: Ogłoszenia są rozproszone po wielu lokalnych grupach na Facebooku, co utrudnia dotarcie do wszystkich zainteresowanych i wymaga od właściciela publikacji w wielu miejscach.
*   Brak standaryzacji: Ogłoszenia w mediach społecznościowych często są niekompletne, brakuje w nich kluczowych informacji, takich jak dokładna data, lokalizacja czy cechy charakterystyczne zwierzęcia.
*   Niska efektywność wyszukiwania: Media społecznościowe nie oferują dedykowanych filtrów do wyszukiwania zwierząt (np. po rasie, wielkości, kolorze sierści, lokalizacji), co sprawia, że przeglądanie ogłoszeń jest czasochłonne i nieefektywne.
*   Tymczasowość postów: Posty w mediach społecznościowych szybko "giną" na tablicach, tracąc na widoczności.
*   Brak centralnego statusu: Trudno jest śledzić, które zwierzęta zostały już odnalezione, co prowadzi do dezinformacji.

GdziePies ma na celu rozwiązanie tych problemów poprzez stworzenie dedykowanej, łatwej w obsłudze platformy, która usprawni proces poszukiwań i zwiększy szansę na szczęśliwe zakończenie.

## 3. Wymagania funkcjonalne
### 3.1. System kont użytkowników
*   Rejestracja użytkownika za pomocą adresu e-mail i hasła.
*   Logowanie do systemu.
*   Możliwość wylogowania się.

### 3.2. Zarządzanie ogłoszeniami
*   Zalogowany użytkownik może dodać nowe ogłoszenie (zaginiony/znaleziony).
*   Formularz dodawania ogłoszenia zawiera pola obowiązkowe i opcjonalne.
    *   Pola obowiązkowe: Status (zaginiony/znaleziony), Gatunek (pies/kot), Lokalizacja (województwo, powiat), Data zdarzenia, Zdjęcie, Tytuł.
    *   Pola opcjonalne: Szczegółowy opis lokalizacji (ulica, park), Rozmiar (mały, średni, duży), Kolor umaszczenia, Przedział wiekowy, Opis dodatkowy, Znaki szczególne, Checkboxy: "agresywny", "lękliwy".
*   Użytkownik może przeglądać listę swoich ogłoszeń.
*   Użytkownik może edytować swoje ogłoszenia.
*   Użytkownik może usunąć swoje ogłoszenia.
*   Użytkownik może oznaczyć swoje ogłoszenie statusem "ZNALEZIONE". Ogłoszenie pozostaje widoczne z wyraźnym oznaczeniem.

### 3.3. Przeglądanie i wyszukiwanie ogłoszeń
*   Strona główna wyświetla karuzelę z najnowszymi ogłoszeniami.
*   Dostępna jest strona z listą wszystkich aktywnych ogłoszeń.
*   Użytkownicy mogą wyszukiwać i filtrować ogłoszenia po kryteriach:
    *   Gatunek (pies/kot)
    *   Przedział wiekowy
    *   Kolor sierści
    *   Wielkość (mały, średni, duży)
    *   Lokalizacja (województwo, powiat)
    *   Data zaginięcia/znalezienia (w przedziale)
*   Każde ogłoszenie ma swoją dedykowaną podstronę ze wszystkimi szczegółami.

### 3.4. Interakcje i bezpieczeństwo
*   Dane kontaktowe (np. e-mail, telefon) autora ogłoszenia są widoczne wyłącznie dla zalogowanych użytkowników. Dla niezalogowanych wyświetlany jest komunikat zachęcający do rejestracji/logowania.
*   Zalogowani użytkownicy mogą dodawać komentarze pod ogłoszeniami.
*   Przy dodawaniu komentarza użytkownik może go oznaczyć jako "Widziałem/am to zwierzę". Taki komentarz jest wizualnie wyróżniony.
*   Każde ogłoszenie posiada przycisk "Zgłoś nadużycie", który wysyła powiadomienie e-mail do administratora serwisu.
*   Możliwość wygenerowania unikalnego linku do ogłoszenia w celu łatwego udostępnienia.

### 3.5. Wymagania techniczne
*   Aplikacja musi być w pełni responsywna (RWD), zapewniając poprawne działanie na urządzeniach mobilnych (smartfony, tablety) i desktopowych.

## 4. Granice produktu
### 4.1. Funkcjonalności w zakresie MVP
*   Prosty system kont użytkowników (rejestracja, logowanie email/hasło).
*   Pełen cykl zarządzania ogłoszeniem (dodawanie, edycja, usuwanie, zmiana statusu na "ZNALEZIONE").
*   Wyszukiwarka z filtrami po kluczowych, predefiniowanych kryteriach.
*   Przegląd wszystkich ogłoszeń i karuzela najnowszych na stronie głównej.
*   System komentarzy z opcją oznaczenia "widziano zwierzę".
*   Generowanie linku do udostępniania.
*   Podstawowy mechanizm zgłaszania nadużyć.
*   Pełna responsywność (RWD).

### 4.2. Funkcjonalności poza zakresem MVP
*   Zaawansowane funkcje społecznościowe (profile użytkowników, listy znajomych, polubienia).
*   Wewnętrzny komunikator między użytkownikami.
*   Import wielu ogłoszeń z plików.
*   Integracje z innymi platformami (np. automatyczne publikowanie na Facebooku).
*   Dedykowane aplikacje mobilne (iOS, Android).
*   Automatyczna archiwizacja lub wygaszanie starych ogłoszeń.
*   Zaawansowana moderacja treści przez panel administratora.
*   Logowanie przez media społecznościowe (Google, Facebook).
*   Automatyczne przypomnienia o aktualizacji ogłoszeń.
*   Śledzenie analityczne wygenerowanych linków.

## 5. Historyjki użytkowników
---
*   ID: US-001
*   Tytuł: Rejestracja nowego użytkownika
*   Opis: Jako nowy użytkownik, chcę móc założyć konto w serwisie używając mojego adresu e-mail i hasła, aby móc dodawać ogłoszenia i komentować istniejące.
*   Kryteria akceptacji:
    1.  Formularz rejestracji zawiera pola: adres e-mail, hasło, powtórz hasło.
    2.  System waliduje poprawność formatu adresu e-mail.
    3.  System sprawdza, czy hasła w obu polach są identyczne.
    4.  System sprawdza, czy podany adres e-mail nie jest już zarejestrowany.
    5.  Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany na stronę główną.

---
*   ID: US-002
*   Tytuł: Logowanie użytkownika
*   Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na moje konto podając e-mail i hasło, aby uzyskać dostęp do moich ogłoszeń i pełnej funkcjonalności serwisu.
*   Kryteria akceptacji:
    1.  Formularz logowania zawiera pola: adres e-mail, hasło.
    2.  System wyświetla komunikat o błędzie w przypadku podania nieprawidłowego e-maila lub hasła.
    3.  Po pomyślnym zalogowaniu użytkownik jest przekierowywany na stronę główną.

---
*   ID: US-003
*   Tytuł: Przeglądanie ogłoszeń przez niezalogowanego użytkownika
*   Opis: Jako osoba odwiedzająca stronę, chcę móc przeglądać listę wszystkich ogłoszeń i wchodzić w ich szczegóły, aby zorientować się, jakie zwierzęta są poszukiwane lub zostały znalezione w mojej okolicy.
*   Kryteria akceptacji:
    1.  Strona główna wyświetla karuzelę z najnowszymi ogłoszeniami.
    2.  Użytkownik może przejść do listy wszystkich ogłoszeń.
    3.  Użytkownik może otworzyć stronę szczegółową dowolnego ogłoszenia.
    4.  Na stronie szczegółowej ogłoszenia dane kontaktowe właściciela są ukryte, a w ich miejscu widnieje przycisk/link "Zaloguj się, aby zobaczyć dane kontaktowe".

---
*   ID: US-004
*   Tytuł: Wyszukiwanie i filtrowanie ogłoszeń
*   Opis: Jako użytkownik, chcę móc filtrować ogłoszenia na podstawie kluczowych kryteriów, takich jak gatunek, lokalizacja, wielkość i kolor, aby szybko zawęzić wyniki do interesujących mnie przypadków.
*   Kryteria akceptacji:
    1.  Na stronie z listą ogłoszeń dostępny jest panel filtrowania.
    2.  Panel zawiera filtry: gatunek (pies/kot), lokalizacja (lista województw i powiatów), wielkość, kolor sierści, przedział wiekowy, data.
    3.  Po zastosowaniu filtrów lista ogłoszeń jest dynamicznie aktualizowana i wyświetla tylko pasujące wyniki.
    4.  Możliwe jest jednoczesne użycie wielu filtrów.

---
*   ID: US-005
*   Tytuł: Dodawanie nowego ogłoszenia
*   Opis: Jako zalogowany użytkownik, który zgubił lub znalazł zwierzę, chcę móc dodać nowe, szczegółowe ogłoszenie, aby poinformować o tym społeczność.
*   Kryteria akceptacji:
    1.  Dostępny jest formularz dodawania ogłoszenia.
    2.  Formularz wymaga wypełnienia pól obowiązkowych: status, gatunek, powiat, data, zdjęcie, tytuł.
    3.  Formularz umożliwia wypełnienie pól opcjonalnych: szczegółowa lokalizacja, rozmiar, kolor, wiek, temperament (agresywny/lękliwy), opis.
    4.  System waliduje, czy zdjęcie zostało dodane.
    5.  Po poprawnym wypełnieniu formularza i jego wysłaniu, ogłoszenie jest publikowane i widoczne w serwisie.

---
*   ID: US-006
*   Tytuł: Zarządzanie własnymi ogłoszeniami
*   Opis: Jako zalogowany użytkownik, chcę mieć dostęp do listy moich ogłoszeń, abym mógł je edytować lub usunąć.
*   Kryteria akceptacji:
    1.  W profilu użytkownika znajduje się sekcja "Moje ogłoszenia".
    2.  Na liście przy każdym ogłoszeniu widoczne są opcje "Edytuj" i "Usuń".
    3.  Kliknięcie "Edytuj" przenosi do formularza z wypełnionymi danymi ogłoszenia, które można zmodyfikować.
    4.  Kliknięcie "Usuń" powoduje usunięcie ogłoszenia po uprzednim potwierdzeniu operacji.

---
*   ID: US-007
*   Tytuł: Oznaczanie ogłoszenia jako "ZNALEZIONE"
*   Opis: Jako autor ogłoszenia o zaginionym zwierzęciu, które się odnalazło, chcę móc oznaczyć je jako "ZNALEZIONE", aby poinformować innych i zakończyć poszukiwania.
*   Kryteria akceptacji:
    1.  Na stronie szczegółowej mojego ogłoszenia oraz na liście moich ogłoszeń widoczny jest przycisk "Oznacz jako ZNALEZIONE".
    2.  Po kliknięciu przycisku, ogłoszenie otrzymuje wyraźny status wizualny (np. banner, etykieta "ZNALEZIONE").
    3.  Ogłoszenie ze statusem "ZNALEZIONE" pozostaje widoczne w serwisie, ale może być inaczej prezentowane na listach.
    4.  Formularz dodawania komentarzy pod takim ogłoszeniem jest zablokowany.

---
*   ID: US-008
*   Tytuł: Dodawanie komentarza pod ogłoszeniem
*   Opis: Jako zalogowany użytkownik, chcę móc dodać komentarz pod ogłoszeniem, aby podzielić się informacją lub wesprzeć właściciela.
*   Kryteria akceptacji:
    1.  Pod szczegółami ogłoszenia widoczny jest formularz dodawania komentarza (tylko dla zalogowanych).
    2.  Po dodaniu, komentarz jest widoczny na liście pod ogłoszeniem wraz z nazwą użytkownika i datą.

---
*   ID: US-009
*   Tytuł: Zgłaszanie, że zwierzę było widziane
*   Opis: Jako zalogowany użytkownik, który zauważył poszukiwane zwierzę, chcę móc dodać specjalny komentarz "Widziałem/am to zwierzę", aby moja informacja była dobrze widoczna dla właściciela.
*   Kryteria akceptacji:
    1.  Formularz dodawania komentarza zawiera checkbox lub przycisk "Widziałem/am to zwierzę".
    2.  Po zaznaczeniu tej opcji i dodaniu komentarza, jest on wizualnie wyróżniony na liście komentarzy (np. innym tłem, ikoną).

---
*   ID: US-010
*   Tytuł: Dostęp do danych kontaktowych
*   Opis: Jako zalogowany użytkownik, chcę widzieć dane kontaktowe autora ogłoszenia, aby móc się z nim bezpośrednio skontaktować w sprawie zwierzęcia.
*   Kryteria akceptacji:
    1.  Gdy jestem zalogowany, na stronie szczegółowej ogłoszenia widzę dane kontaktowe podane przez autora.
    2.  Gdy nie jestem zalogowany, dane te są ukryte.

---
*   ID: US-011
*   Tytuł: Generowanie linku do udostępnienia
*   Opis: Jako użytkownik, chcę móc łatwo skopiować bezpośredni link do strony ogłoszenia, aby udostępnić je na swoich mediach społecznościowych.
*   Kryteria akceptacji:
    1.  Na stronie każdego ogłoszenia znajduje się przycisk "Udostępnij" lub "Kopiuj link".
    2.  Kliknięcie przycisku kopiuje do schowka unikalny URL prowadzący do tego konkretnego ogłoszenia.

---
*   ID: US-012
*   Tytuł: Zgłaszanie nadużyć
*   Opis: Jako użytkownik, chcę mieć możliwość zgłoszenia ogłoszenia, które wydaje mi się nieodpowiednie, fałszywe lub jest spamem, aby administrator mógł je zweryfikować.
*   Kryteria akceptacji:
    1.  Na stronie każdego ogłoszenia znajduje się przycisk "Zgłoś nadużycie".
    2.  Po kliknięciu przycisku, system wysyła powiadomienie e-mail na zdefiniowany adres administratora, zawierające link do zgłaszanego ogłoszenia.
    3.  Użytkownik otrzymuje potwierdzenie, że zgłoszenie zostało wysłane.

---
*   ID: US-013
*   Tytuł: Responsywność interfejsu
*   Opis: Jako użytkownik korzystający z serwisu na telefonie komórkowym, chcę, aby strona poprawnie się wyświetlała i była w pełni funkcjonalna na małym ekranie, abym mógł z niej wygodnie korzystać w terenie.
*   Kryteria akceptacji:
    1.  Wszystkie elementy strony (przyciski, formularze, teksty, zdjęcia) są czytelne i łatwe w obsłudze na ekranach o szerokości od 320px wzwyż.
    2.  Nawigacja dostosowuje się do mniejszych ekranów (np. zmienia się w tzw. "hamburger menu").
    3.  Nie występuje poziomy pasek przewijania.

## 6. Metryki sukcesu
*   Cel główny: Osiągnięcie wskaźnika 20% ogłoszeń o zaginięciu oznaczonych jako "ZNALEZIONE" w ciągu 3 miesięcy od uruchomienia serwisu.
    *   Sposób pomiaru: Automatyczne śledzenie w bazie danych stosunku liczby ogłoszeń ze statusem "ZNALEZIONE" do całkowitej liczby ogłoszeń o zaginięciu w danym okresie.
*   Cel dodatkowy: Osiągnięcie progu 50 wygenerowanych linków do ogłoszeń miesięcznie.
    *   Sposób pomiaru: Ze względu na ograniczenia MVP, początkowy pomiar może być utrudniony. Wdrożenie pełnej analityki tej funkcji jest planowane po MVP. Początkowo sukces będzie oceniany na podstawie ogólnego wzrostu ruchu i zaangażowania.

### Metryki szczegółowe MVP
*   **Komentarze "Widziałem zwierzę"**: 20% komentarzy to zgłoszenia o zauważeniu zwierzęcia.
*   **Współczynnik udostępnień**: 30% ogłoszeń ma wygenerowany link udostępnienia.
*   **Współczynnik konwersji**: 15% odwiedzających rejestruje się w serwisie.
*   **Zgłoszenia nadużyć**: < 5% ogłoszeń zgłaszanych jako nadużycie.
*   **Fałszywe ogłoszenia**: < 2% ogłoszeń to spam/fałszywe informacje.

### Ryzyko
*   **Brak strategii pozyskiwania użytkowników**: Niska liczba użytkowników i ogłoszeń może uniemożliwić osiągnięcie i rzetelny pomiar kluczowych metryk sukcesu, co może prowadzić do błędnych wniosków na temat skuteczności platformy. **Mitigacja**: Wprowadzenie strategii marketingowej już w fazie MVP, skupienie na lokalnych społecznościach i mediach społecznościowych.

*   **Niska jakość ogłoszeń**: Brak moderacji treści może prowadzić do publikacji niekompletnych lub fałszywych ogłoszeń, co obniży zaufanie użytkowników. **Mitigacja**: Wprowadzenie walidacji formularzy, wymaganie zdjęć, system zgłaszania nadużyć.

*   **Problemy techniczne na urządzeniach mobilnych**: Błędy w responsywności mogą znacząco wpłynąć na user experience, szczególnie że większość użytkowników będzie korzystać z urządzeń mobilnych. **Mitigacja**: Intensywne testowanie na różnych urządzeniach, priorytet dla mobile-first design.

*   **Brak zaangażowania społeczności**: Niska aktywność w komentarzach i udostępnieniach może wskazywać na problemy z UX lub brak wartości dla użytkowników. **Mitigacja**: Uproszczenie procesu dodawania komentarzy, jasne wskazówki dla użytkowników, gamifikacja (np. licznik pomocy).

*   **Problemy z bezpieczeństwem danych**: Wyciek danych kontaktowych może zniszczyć zaufanie do platformy. **Mitigacja**: Implementacja odpowiednich zabezpieczeń w Supabase, szyfrowanie danych wrażliwych, regularne audyty bezpieczeństwa.
```