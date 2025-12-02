# CI/CD Pipeline

## Opis

Minimalny pipeline CI/CD dla projektu, który:

1. ✅ Uruchamia linter (ESLint)
2. ✅ Uruchamia testy jednostkowe (Vitest)
3. ✅ Buduje aplikację w trybie produkcyjnym (Astro build)
4. ✅ Uruchamia testy end-to-end (Playwright)

## Uruchamianie

Pipeline uruchamia się automatycznie:
- Po każdym pushu do brancha `master`
- Ręcznie przez GitHub Actions UI (przycisk "Run workflow")

## Konfiguracja Secrets (opcjonalnie)

Dla testów e2e, które mogą wymagać połączenia z Supabase, możesz skonfigurować secrets w GitHub:

1. Przejdź do: **Settings** → **Secrets and variables** → **Actions**
2. Dodaj następujące secrets (jeśli potrzebne):
   - `SUPABASE_URL` - URL projektu Supabase
   - `SUPABASE_KEY` - Anon key z Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (opcjonalnie)

**Uwaga:** Jeśli secrets nie są skonfigurowane, workflow użyje wartości domyślnych (lokalne Supabase). Dla podstawowych testów e2e mogą nie być wymagane.

## Struktura workflow

```
┌─────────────────┐
│  Checkout code  │
└────────┬────────┘
         │
┌────────▼────────┐
│  Setup Node.js  │ (z .nvmrc: 22.14.0)
└────────┬────────┘
         │
┌────────▼────────┐
│ Install deps    │ (npm ci)
└────────┬────────┘
         │
┌────────▼────────┐
│   Run linter    │ (npm run lint)
└────────┬────────┘
         │
┌────────▼────────┐
│  Unit tests     │ (npm run test:unit)
└────────┬────────┘
         │
┌────────▼────────┐
│  Build prod     │ (npm run build)
└────────┬────────┘
         │
┌────────▼────────┐
│ Install PW      │ (playwright install)
└────────┬────────┘
         │
┌────────▼────────┐
│   E2E tests     │ (npm run test:e2e)
└─────────────────┘
```

## Rozszerzanie

Aby dodać dodatkowe kroki (np. deployment), edytuj plik `.github/workflows/ci.yml`.

