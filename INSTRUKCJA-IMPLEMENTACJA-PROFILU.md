# Instrukcja implementacji profilu użytkownika - Krok po kroku

## 📋 Przegląd zmian

Zostały zaimplementowane następujące funkcjonalności:
- ✅ Dodanie kolumny `avatar_url` do tabeli `profiles`
- ✅ Utworzenie bucketu Storage `avatars` dla zdjęć profilowych
- ✅ Formularz edycji profilu z zakładkami na stronie `/moje-konto`
- ✅ Wyświetlanie avatara w komentarzach
- ✅ Wyświetlanie emaila w danych kontaktowych na ogłoszeniach

## 🚀 Kroki do wykonania

### Krok 1: Upewnij się, że Supabase działa lokalnie

```bash
# Sprawdź status Supabase
supabase status

# Jeśli nie działa, uruchom:
supabase start
```

**Oczekiwany wynik:** Powinieneś zobaczyć informacje o lokalnym projekcie Supabase z URL-ami i kluczami.

---

### Krok 2: Zastosuj migracje bazy danych

Migracje zostały utworzone w folderze `supabase/migrations/`:
- `20251202111615_add_avatar_url_to_profiles.sql` - dodaje kolumnę avatar_url
- `20251202111621_create_avatars_bucket.sql` - tworzy bucket avatars
- `20251202111711_extend_get_contact_details_with_email.sql` - rozszerza funkcję RPC o email

**Opcja A: Reset bazy (usuwa wszystkie dane, aplikuje wszystkie migracje)**
```bash
supabase db reset
```
⚠️ **Uwaga:** To usunie wszystkie dane z lokalnej bazy danych!

**Opcja B: Zastosuj tylko nowe migracje (bez utraty danych)**
```bash
# Sprawdź, które migracje są już zastosowane
supabase migration list

# Zastosuj nowe migracje
supabase db push
```

**Opcja C: Ręczne zastosowanie przez Supabase Studio (ZALECANE dla pierwszej próby)**
1. Otwórz Supabase Studio: http://127.0.0.1:54323
2. Przejdź do **SQL Editor**
3. Otwórz każdy plik migracji z `supabase/migrations/` i wykonaj go po kolei:
   - `20251202111615_add_avatar_url_to_profiles.sql`
   - `20251202111621_create_avatars_bucket.sql`
   - `20251202111711_extend_get_contact_details_with_email.sql`
4. Kliknij **Run** (lub Ctrl+Enter) dla każdego pliku

---

### Krok 3: Regeneruj typy TypeScript

Po zastosowaniu migracji, typy TypeScript muszą zostać zaktualizowane:

```bash
# Dla lokalnego Supabase
npx supabase gen types typescript --local > src/db/database.types.ts
```

**Alternatywnie (jeśli używasz zdalnego Supabase):**
```bash
# Pobierz project-id z Supabase Dashboard
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/db/database.types.ts
```

**Weryfikacja:** Sprawdź, czy plik `src/db/database.types.ts` zawiera:
- Kolumnę `avatar_url` w typie `profiles`
- Kolumnę `avatar_url` w widoku `profiles_public`
- Rozszerzoną funkcję `get_contact_details` zwracającą `phone_number` i `email`

---

### Krok 4: Sprawdź konfigurację zmiennych środowiskowych

Upewnij się, że masz skonfigurowane zmienne środowiskowe:

```bash
# Sprawdź status Supabase, aby zobaczyć klucze
supabase status
```

W pliku `.env` (lub `.env.local`) powinny być:
```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=eyJhbGc...  # anon key z supabase status
```

---

### Krok 5: Uruchom aplikację i przetestuj

```bash
# Zainstaluj zależności (jeśli jeszcze nie)
npm install

# Uruchom serwer deweloperski
npm run dev
```

**Testy do wykonania:**

1. **Zaloguj się do aplikacji**
   - Przejdź do `/logowanie`
   - Zaloguj się istniejącym kontem lub utwórz nowe

2. **Przejdź do profilu**
   - Kliknij "Moje konto" w nagłówku
   - Powinieneś zobaczyć zakładki: "Moje ogłoszenia" i "Profil"

3. **Przetestuj formularz profilu (zakładka "Profil")**
   - ✅ Upload zdjęcia profilowego (przeciągnij lub kliknij)
   - ✅ Wpisz numer telefonu
   - ✅ Sprawdź, że email jest widoczny (read-only)
   - ✅ Kliknij "Zapisz zmiany"
   - ✅ Sprawdź, czy pojawia się komunikat sukcesu

4. **Sprawdź wyświetlanie avatara**
   - Przejdź do dowolnego ogłoszenia z komentarzami
   - Sprawdź, czy avatary autorów komentarzy są wyświetlane

5. **Sprawdź dane kontaktowe na ogłoszeniu**
   - Przejdź do dowolnego ogłoszenia
   - Kliknij "Pokaż numer telefonu" w sekcji "Dane kontaktowe"
   - Sprawdź, czy wyświetla się zarówno numer telefonu, jak i email

---

### Krok 6: Weryfikacja w Supabase Studio

1. Otwórz Supabase Studio: http://127.0.0.1:54323

2. **Sprawdź tabelę profiles:**
   - Przejdź do **Table Editor** > **profiles**
   - Sprawdź, czy kolumna `avatar_url` istnieje
   - Sprawdź, czy możesz zobaczyć dane użytkowników

3. **Sprawdź widok profiles_public:**
   - Przejdź do **Table Editor** > **profiles_public**
   - Sprawdź, czy kolumna `avatar_url` jest widoczna

4. **Sprawdź bucket avatars:**
   - Przejdź do **Storage** > **avatars**
   - Sprawdź, czy bucket istnieje
   - Po uploadzie avatara, sprawdź czy plik pojawił się w folderze `{userId}/avatar.{ext}`

5. **Sprawdź funkcję RPC:**
   - Przejdź do **SQL Editor**
   - Wykonaj test:
   ```sql
   SELECT * FROM get_contact_details('TWOJE_ANNOUNCEMENT_ID');
   ```
   - Powinieneś otrzymać `phone_number` i `email`

---

## 🐛 Rozwiązywanie problemów

### Problem: Błąd "column avatar_url does not exist"
**Rozwiązanie:** Migracje nie zostały zastosowane. Wykonaj Krok 2 ponownie.

### Problem: Błąd "bucket avatars does not exist"
**Rozwiązanie:** Migracja bucketu nie została zastosowana. Wykonaj migrację `20251202111621_create_avatars_bucket.sql` ręcznie w SQL Editor.

### Problem: Typy TypeScript są nieaktualne
**Rozwiązanie:** Wykonaj Krok 3 ponownie. Upewnij się, że migracje zostały zastosowane przed regeneracją typów.

### Problem: Avatar nie wyświetla się po uploadzie
**Rozwiązanie:**
1. Sprawdź w Supabase Studio > Storage > avatars, czy plik został przesłany
2. Sprawdź w konsoli przeglądarki, czy nie ma błędów CORS
3. Sprawdź, czy URL avatara jest poprawnie zapisany w tabeli `profiles`

### Problem: Email nie wyświetla się w danych kontaktowych
**Rozwiązanie:**
1. Sprawdź, czy migracja `20251202111711_extend_get_contact_details_with_email.sql` została zastosowana
2. Sprawdź w SQL Editor, czy funkcja zwraca email:
   ```sql
   SELECT * FROM get_contact_details('TWOJE_ANNOUNCEMENT_ID');
   ```

---

## ✅ Checklist końcowy

- [ ] Migracje zostały zastosowane (Krok 2)
- [ ] Typy TypeScript zostały zregenerowane (Krok 3)
- [ ] Aplikacja działa bez błędów (Krok 5)
- [ ] Formularz profilu działa poprawnie
- [ ] Avatar wyświetla się w komentarzach
- [ ] Email wyświetla się w danych kontaktowych
- [ ] Bucket `avatars` istnieje w Storage
- [ ] Kolumna `avatar_url` istnieje w tabeli `profiles`

---

## 📝 Dodatkowe informacje

### Struktura nowych plików:

**Komponenty:**
- `src/components/profile/AvatarUploader.tsx` - komponent uploadu avatara
- `src/components/profile/ProfileForm.tsx` - formularz edycji profilu
- `src/components/dashboard/AccountTabs.tsx` - komponent zakładek

**Migracje:**
- `supabase/migrations/20251202111615_add_avatar_url_to_profiles.sql`
- `supabase/migrations/20251202111621_create_avatars_bucket.sql`
- `supabase/migrations/20251202111711_extend_get_contact_details_with_email.sql`

**Zmodyfikowane pliki:**
- `src/lib/services/storage.service.ts` - dodana metoda `uploadAvatar`
- `src/components/dashboard/DashboardGuard.tsx` - używa `AccountTabs`
- `src/components/announcements/ContactReveal.tsx` - wyświetla email
- `src/components/announcements/CommentList.tsx` - wyświetla avatar

---

## 🎉 Gotowe!

Po wykonaniu wszystkich kroków, funkcjonalność profilu użytkownika powinna działać poprawnie. Jeśli napotkasz jakiekolwiek problemy, sprawdź sekcję "Rozwiązywanie problemów" powyżej.



