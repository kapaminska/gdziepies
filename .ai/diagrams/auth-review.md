# Analiza zgodności diagramu autentykacji - GdziePies

## Podsumowanie

Diagram w pliku `.ai/diagrams/auth.md` jest **w większości poprawny**, ale zawiera kilka nieścisłości technicznych i drobnych problemów zgodności z dokumentacją oraz regułami formatowania.

## ✅ Co jest poprawne

1. **Struktura diagramu** - używa `sequenceDiagram`, `autonumber`, poprawnie deklaruje uczestników
2. **Zgodność z PRD** - wszystkie wymagane przepływy (US-001, US-002, wylogowanie, dostęp do chronionych zasobów) są obecne
3. **Zgodność z auth-spec** - większość przepływów jest zgodna ze specyfikacją
4. **Składnia Mermaid** - używa poprawnych strzałek, bloków `alt/else/end`, `activate/deactivate`
5. **Przepływ rejestracji** - poprawnie pokazuje oczekiwanie 300ms i `getSession()` po `signUp()`
6. **Przepływ API** - poprawnie pokazuje ekstrakcję tokenu z nagłówka i ustawienie sesji

## ⚠️ Problemy i nieścisłości

### 1. Middleware ekstrakcja tokenu (linie 144, 177)

**Problem**: Diagram pokazuje `Middleware->>SupabaseAuth: Sprawdzenie cookie/token`, sugerując że middleware "sprawdza" u Supabase.

**Rzeczywistość**: Middleware ekstrahuje token samodzielnie z nagłówka `Authorization` lub cookie, parsuje go lokalnie i ustawia sesję przez `setSession()`. Nie komunikuje się z Supabase w celu "sprawdzenia".

**Sugerowana poprawka**:
```mermaid
Middleware->>Middleware: Ekstrakcja tokenu z cookie/nagłówka
Middleware->>SupabaseAuth: setSession({ access_token })
```

### 2. Kolejność walidacji w logowaniu (linie 186-187)

**Problem**: Diagram pokazuje Submit przed walidacją:
```mermaid
Browser->>AuthForm: Submit formularza
AuthForm->>AuthForm: Walidacja Zod (email, hasło)
```

**Rzeczywistość**: Walidacja Zod odbywa się przed submitem (przez `react-hook-form` z `mode: 'onBlur'`), a submit następuje tylko po pomyślnej walidacji.

**Sugerowana poprawka**:
```mermaid
AuthForm->>AuthForm: Walidacja Zod (email, hasło)
Browser->>AuthForm: Submit formularza (po walidacji)
```

### 3. Przepływ wylogowania (linia 262)

**Problem**: Diagram pokazuje `SupabaseAuth->>Browser: Usunięcie sesji z localStorage`, sugerując że Supabase "wysyła" operację usunięcia.

**Rzeczywistość**: Supabase usuwa sesję automatycznie podczas `signOut()`, nie jest to osobna operacja "wysłana" do przeglądarki.

**Sugerowana poprawka**:
```mermaid
Browser->>SupabaseAuth: signOut()
activate SupabaseAuth
SupabaseAuth->>SupabaseAuth: Usunięcie sesji z localStorage
SupabaseAuth-->>Browser: Wylogowanie zakończone
deactivate SupabaseAuth
```

### 4. Długość linii (linie 229, 247, 293, 300)

**Problem**: Niektóre linie mogą przekraczać limit 80 znaków (reguła z mermaid-diagram-ui.mdc).

**Przykłady**:
- Linia 229: `Browser->>API: POST /api/announcements<br/>Authorization: Bearer token` (~70 znaków, OK)
- Linia 247: `API->>Database: INSERT announcement<br/>RLS sprawdza auth.uid()` (~65 znaków, OK)
- Linia 293: `Browser->>API: RPC get_contact_details<br/>Authorization: Bearer token` (~70 znaków, OK)
- Linia 300: `API->>Database: Wywołanie funkcji RPC<br/>RLS sprawdza autoryzację` (~65 znaków, OK)

**Wniosek**: Wszystkie linie są w granicach 80 znaków, więc problem nie występuje.

### 5. Brakujący przepływ: Odzyskiwanie hasła

**Problem**: W `auth-spec.md` jest wspomniane odzyskiwanie hasła jako "DO IMPLEMENTACJI", ale nie jest w diagramie.

**Uzasadnienie**: To jest OK, ponieważ funkcjonalność nie jest jeszcze zaimplementowana. Diagram pokazuje tylko istniejące przepływy.

**Sugestia**: Po implementacji odzyskiwania hasła, należy dodać przepływ do diagramu.

### 6. Przepływ dostępu do chronionego zasobu (linia 215)

**Problem**: Diagram pokazuje `Browser->>Browser: DashboardGuard sprawdza sesję`, ale `DashboardGuard` jest komponentem React, nie przeglądarką.

**Sugerowana poprawka**:
```mermaid
Browser->>AuthForm: DashboardGuard sprawdza sesję
```
Lub lepiej:
```mermaid
Note over Browser: DashboardGuard (komponent React)
Browser->>SupabaseAuth: getSession()
```

### 7. Przepływ danych kontaktowych (linia 288)

**Problem**: Diagram pokazuje `Browser->>Browser: Kliknięcie "Pokaż dane kontaktowe"`, ale powinno być `Browser->>ContactReveal` (komponent React).

**Sugerowana poprawka**:
Dodać uczestnika `ContactReveal` lub użyć bardziej ogólnego opisu.

## 📋 Rekomendacje

### Wysokie priorytety

1. **Poprawić przepływ middleware** (linie 144, 177) - pokazać lokalną ekstrakcję tokenu zamiast "sprawdzania" u Supabase
2. **Poprawić kolejność walidacji** (linie 186-187) - walidacja przed submitem
3. **Poprawić przepływ wylogowania** (linia 262) - usunięcie sesji jako lokalna operacja Supabase

### Średnie priorytety

4. **Dodać uczestnika dla komponentów React** - rozważyć dodanie `ContactReveal` i `DashboardGuard` jako osobnych uczestników dla większej przejrzystości
5. **Ujednolicić nazewnictwo** - używać spójnych nazw dla operacji (np. zawsze "Ekstrakcja tokenu" zamiast "Sprawdzenie cookie/token")

### Niskie priorytety

6. **Dodać przepływ odzyskiwania hasła** - po implementacji funkcjonalności
7. **Rozszerzyć opis diagramu** - dodać informacje o brakujących przepływach (odzyskiwanie hasła)

## ✅ Zgodność z regułami formatowania

- ✅ Używa `sequenceDiagram` i `autonumber`
- ✅ Deklaruje uczestników przez `participant`
- ✅ Używa odpowiednich strzałek (`->`, `-->>`, `->>`)
- ✅ Poprawnie używa `activate`/`deactivate`
- ✅ Poprawnie używa `alt`/`else`/`end`
- ✅ Linie nie przekraczają 80 znaków
- ✅ Nie używa niedozwolonych znaków w identyfikatorach
- ✅ Używa `<br/>` dla długich etykiet

## 📊 Ocena ogólna

**Ocena: 8/10**

Diagram jest **bardzo dobry** i poprawnie przedstawia większość przepływów autentykacji. Główne problemy to nieścisłości techniczne dotyczące działania middleware i kolejności operacji, które można łatwo poprawić. Diagram jest zgodny z regułami formatowania Mermaid i w większości zgodny z dokumentacją.

## 🔧 Sugerowane poprawki

Zalecam wprowadzenie następujących poprawek:

1. Zmienić linie 144 i 177 - pokazać lokalną ekstrakcję tokenu
2. Zmienić linie 186-187 - poprawić kolejność walidacji
3. Zmienić linię 262 - poprawić przepływ wylogowania
4. Rozważyć dodanie uczestników dla komponentów React (opcjonalnie)

Po wprowadzeniu tych poprawek diagram będzie w pełni zgodny z dokumentacją i rzeczywistą implementacją.

