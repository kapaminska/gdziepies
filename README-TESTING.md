# Testing Guide

Ten projekt używa dwóch głównych narzędzi do testowania:

## Testy Jednostkowe (Vitest)

### Instalacja i Konfiguracja

Środowisko testowe jest już skonfigurowane. Używa:
- **Vitest** - framework testowy
- **React Testing Library** - do testowania komponentów React
- **jsdom** - środowisko DOM dla testów

### Struktura Testów

Testy jednostkowe znajdują się w katalogu `src/` i mają rozszerzenie `.test.ts` lub `.test.tsx`:

```
src/
  components/
    button.test.tsx
  lib/
    utils.test.ts
  test/
    setup.ts          # Globalna konfiguracja testów
```

### Uruchamianie Testów

```bash
# Uruchom wszystkie testy
npm run test

# Tryb watch (automatyczne uruchamianie przy zmianach)
npm run test:watch

# UI mode (wizualny interfejs)
npm run test:ui

# Z raportem pokrycia kodu
npm run test:coverage

# Jednorazowe uruchomienie wszystkich testów
npm run test:unit
```

### Pisanie Testów

Przykład testu komponentu React:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Mockowanie

Vitest używa obiektu `vi` do mockowania:

```typescript
import { vi } from 'vitest';

// Mock funkcji
const mockFn = vi.fn();

// Mock modułu
vi.mock('@/lib/api/announcements', () => ({
  fetchAnnouncements: vi.fn(),
}));

// Spy na istniejącej funkcji
vi.spyOn(console, 'log');
```

## Testy E2E (Playwright)

### Instalacja i Konfiguracja

Playwright jest skonfigurowany do używania tylko przeglądarki Chromium (Desktop Chrome).

### Struktura Testów

Testy E2E znajdują się w katalogu `e2e/`:

```
e2e/
  auth/
    login.spec.ts
  announcements/
    create.spec.ts
  fixtures/
    test-user.ts      # Page Object Model helpers
```

### Uruchamianie Testów E2E

```bash
# Uruchom wszystkie testy E2E
npm run test:e2e

# UI mode (wizualny interfejs)
npm run test:e2e:ui

# Tryb debugowania
npm run test:e2e:debug

# Codegen (generowanie testów przez nagrywanie)
npm run test:e2e:codegen
```

### Pisanie Testów E2E

Przykład testu E2E:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*/);
  });
});
```

### Page Object Model

Zalecane jest użycie Page Object Model dla lepszej organizacji testów:

```typescript
// e2e/fixtures/login-page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/logowanie');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### Visual Comparison

Playwright wspiera porównywanie wizualne:

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

### Trace Viewer

Gdy test się nie powiedzie, możesz użyć trace viewer do debugowania:

```bash
npx playwright show-trace trace.zip
```

## Best Practices

### Testy Jednostkowe

1. **Używaj opisowych nazw testów** - `it('should display error when form is invalid')`
2. **Testuj zachowanie, nie implementację** - skup się na tym, co użytkownik widzi i robi
3. **Używaj Arrange-Act-Assert pattern**
4. **Mockuj zewnętrzne zależności** - API, baza danych, itp.
5. **Używaj `vi.fn()` i `vi.spyOn()` zamiast kompleksowych mocków**

### Testy E2E

1. **Używaj Page Object Model** - dla lepszej organizacji i reużywalności
2. **Używaj locatorów zamiast selektorów CSS** - bardziej odporne na zmiany
3. **Izoluj testy** - każdy test powinien być niezależny
4. **Używaj browser contexts** - dla izolacji środowiska testowego
5. **Testuj krytyczne ścieżki użytkownika** - logowanie, tworzenie ogłoszeń, itp.

## CI/CD

Testy mogą być uruchamiane w CI/CD:

```yaml
# Przykład dla GitHub Actions
- name: Run unit tests
  run: npm run test:unit

- name: Run E2E tests
  run: npm run test:e2e
```

## Wsparcie

W razie problemów:
- Sprawdź dokumentację [Vitest](https://vitest.dev/)
- Sprawdź dokumentację [Playwright](https://playwright.dev/)
- Sprawdź dokumentację [React Testing Library](https://testing-library.com/react)
