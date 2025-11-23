# Testowanie API Endpointów

Ten dokument opisuje jak testować endpointy API dla ogłoszeń.

## Wymagania

1. **Uruchomiony serwer deweloperski Astro:**
   ```bash
   npm run dev
   ```
   Serwer powinien działać na `http://localhost:3000` (domyślnie).

2. **Skonfigurowane zmienne środowiskowe:**
   - `SUPABASE_URL` - URL do Supabase
   - `SUPABASE_KEY` - Klucz anonimowy Supabase

## Uruchomienie testów

### Podstawowe użycie

```bash
npm run test:api
```

### Z niestandardowym URL

```bash
npm run test:api -- --base-url http://localhost:3000
```

Lub używając zmiennej środowiskowej:

```bash
API_BASE_URL=http://localhost:3000 npm run test:api
```

## Testowane scenariusze

### Publiczne endpointy (bez autoryzacji)

1. ✅ **GET /api/announcements** - Lista ogłoszeń bez filtrów
2. ✅ **GET /api/announcements?type=lost&species=dog** - Lista z filtrami
3. ✅ **GET /api/announcements?type=invalid** - Walidacja nieprawidłowych filtrów (400)
4. ✅ **GET /api/announcements/{id}** - Szczegóły ogłoszenia
5. ✅ **GET /api/announcements/{invalid-uuid}** - Walidacja UUID (400)
6. ✅ **GET /api/announcements/{non-existent-id}** - Nieistniejące ogłoszenie (404)

### Chronione endpointy (wymagają autoryzacji)

7. ✅ **POST /api/announcements** - Tworzenie bez autoryzacji (401)
8. ✅ **POST /api/announcements** - Nieprawidłowe dane (400/401)
9. ✅ **PATCH /api/announcements/{id}** - Aktualizacja bez autoryzacji (401)
10. ✅ **DELETE /api/announcements/{id}** - Usuwanie bez autoryzacji (401)

## Przykładowe wyniki

```
🚀 Starting API Tests...
Base URL: http://localhost:4321

🧪 Testing: GET /api/announcements - Lista ogłoszeń (bez filtrów)
✅ Status: 200, Items: 5

🧪 Testing: GET /api/announcements - Lista z filtrami
✅ Status: 200

...

📊 Test Summary
============================================================
Total: 10
Passed: 10
Failed: 0
============================================================
```

## Testowanie z autoryzacją

Aby przetestować endpointy wymagające autoryzacji (POST, PATCH, DELETE), musisz:

1. **Uzyskać token JWT z Supabase Auth:**
   - Zaloguj się przez Supabase Auth
   - Pobierz token z sesji

2. **Zmodyfikować skrypt testowy:**
   - Dodaj token do nagłówka `Authorization: Bearer <token>`
   - Utwórz testy dla autoryzowanych użytkowników

## Rozszerzanie testów

Możesz rozszerzyć skrypt `scripts/test-api.js` o dodatkowe testy:

- Testy z prawdziwą autoryzacją
- Testy aktualizacji własnych ogłoszeń
- Testy próby aktualizacji cudzych ogłoszeń (403)
- Testy usuwania ogłoszeń
- Testy paginacji
- Testy sortowania

## Troubleshooting

### Błąd: "fetch failed" lub "ECONNREFUSED"
- Upewnij się, że serwer Astro jest uruchomiony (`npm run dev`)
- Sprawdź, czy URL jest poprawny (domyślnie `http://localhost:3000`)
- Jeśli aplikacja działa na innym porcie, użyj: `npm run test:api -- --base-url http://localhost:<PORT>`

### Błąd: "401 Unauthorized" dla publicznych endpointów
- Sprawdź konfigurację Supabase RLS policies
- Upewnij się, że endpointy są publiczne

### Błąd: "500 Internal Server Error"
- Sprawdź logi serwera Astro
- Sprawdź konfigurację zmiennych środowiskowych
- Sprawdź połączenie z bazą danych Supabase

