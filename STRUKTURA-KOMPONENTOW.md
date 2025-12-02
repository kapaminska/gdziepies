# Struktura Komponentów i Zależności - GdziePies

## Diagram ASCII - Hierarchia Komponentów

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LAYOUT.astro                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Header.tsx (client:load)                                             │  │
│  │  ├── auth/AuthForm                                                    │  │
│  │  ├── ui/button                                                        │  │
│  │  ├── ui/avatar                                                        │  │
│  │  ├── ui/drawer                                                        │  │
│  │  └── ui/dropdown-menu                                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  <slot /> ────┐                                                              │
│               │                                                              │
└───────────────┼──────────────────────────────────────────────────────────────┘
                │
                ├──────────────────────────────────────────────────────────────┐
                │                                                              │
                ▼                                                              ▼
        ┌───────────────┐                                            ┌───────────────┐
        │  index.astro  │                                            │ ogloszenia/   │
        │               │                                            │ index.astro   │
        │  ┌──────────┐ │                                            │               │
        │  │ Hero    │ │                                            │  ┌──────────┐ │
        │  │ Section │ │                                            │  │Announce- │ │
        │  └──────────┘ │                                            │  │ment      │ │
        │               │                                            │  │Browser   │ │
        │  ┌──────────┐ │                                            │  └──────────┘ │
        │  │LatestAds│ │                                            │       │       │
        │  │Carousel │ │                                            │       ▼       │
        │  └──────────┘ │                                            │  ┌──────────┐ │
        └───────────────┘                                            │  │Filter    │ │
                                                                    │  │Sidebar   │ │
                                                                    │  └──────────┘ │
                                                                    │               │
                                                                    │  ┌──────────┐ │
                                                                    │  │Announce- │ │
                                                                    │  │mentGrid  │ │
                                                                    │  └──────────┘ │
                                                                    │       │       │
                                                                    │       ▼       │
                                                                    │  ┌──────────┐ │
                                                                    │  │Pagination│ │
                                                                    │  └──────────┘ │
                                                                    └───────────────┘
                │
                ├──────────────────────────────────────────────────────────────┐
                │                                                              │
                ▼                                                              ▼
        ┌───────────────┐                                            ┌───────────────┐
        │ dodaj-        │                                            │ ogloszenia/   │
        │ ogloszenie    │                                            │ [id].astro    │
        │ .astro        │                                            │               │
        │               │                                            │  ┌──────────┐ │
        │  ┌──────────┐ │                                            │  │AdInfo    │ │
        │  │ AdForm   │ │                                            │  │Details   │ │
        │  └────┬─────┘ │                                            │  └──────────┘ │
        │       │       │                                            │               │
        │       ├───────┼────────────────────────────────────────────┤               │
        │       │       │                                            │  ┌──────────┐ │
        │       ▼       │                                            │  │Gallery   │ │
        │  ┌──────────┐ │                                            │  │Display   │ │
        │  │Image     │ │                                            │  └──────────┘ │
        │  │Uploader  │ │                                            │               │
        │  └──────────┘ │                                            │  ┌──────────┐ │
        │               │                                            │  │Share     │ │
        │  ┌──────────┐ │                                            │  │Button    │ │
        │  │Location  │ │                                            │  └──────────┘ │
        │  │Cascader  │ │                                            │               │
        │  └──────────┘ │                                            │  ┌──────────┐ │
        │               │                                            │  │Contact   │ │
        │  ┌──────────┐ │                                            │  │Reveal    │ │
        │  │Form      │ │                                            │  └──────────┘ │
        │  │(react-   │ │                                            │               │
        │  │hook-form)│ │                                            │  ┌──────────┐ │
        │  └──────────┘ │                                            │  │Author    │ │
        └───────────────┘                                            │  │Controls  │ │
                                                                    │  └──────────┘ │
                                                                    │               │
                                                                    │  ┌──────────┐ │
                                                                    │  │Comments  │ │
                                                                    │  │Section   │ │
                                                                    │  └────┬─────┘ │
                                                                    │       │       │
                                                                    │       ├───────┤
                                                                    │       │       │
                                                                    │       ▼       │
                                                                    │  ┌──────────┐ │
                                                                    │  │Comment   │ │
                                                                    │  │List      │ │
                                                                    │  └──────────┘ │
                                                                    │               │
                                                                    │  ┌──────────┐ │
                                                                    │  │Comment   │ │
                                                                    │  │Form      │ │
                                                                    │  └──────────┘ │
                                                                    └───────────────┘
                │
                ├──────────────────────────────────────────────────────────────┐
                │                                                              │
                ▼                                                              ▼
        ┌───────────────┐                                            ┌───────────────┐
        │ moje-konto    │                                            │ logowanie/    │
        │ .astro        │                                            │ rejestracja   │
        │               │                                            │ reset-hasla   │
        │  ┌──────────┐ │                                            │               │
        │  │Dashboard │ │                                            │  ┌──────────┐ │
        │  │Guard     │ │                                            │  │AuthForm  │ │
        │  └────┬─────┘ │                                            │  └──────────┘ │
        │       │       │                                            │               │
        │       ▼       │                                            │  ┌──────────┐ │
        │  ┌──────────┐ │                                            │  │Password  │ │
        │  │Account   │ │                                            │  │ResetForm │ │
        │  │Tabs      │ │                                            │  └──────────┘ │
        │  └────┬─────┘ │                                            └───────────────┘
        │       │       │
        │       ├───────┼────────────────────────────────────────────┐
        │       │       │                                            │
        │       ▼       ▼                                            ▼
        │  ┌──────────┐ │                                    ┌───────────────┐
        │  │UserAds  │ │                                    │ moje-konto/   │
        │  │Dashboard │ │                                    │ edycja/[id]   │
        │  └────┬─────┘ │                                    │               │
        │       │       │                                    │  ┌──────────┐ │
        │       ▼       │                                    │  │Edit      │ │
        │  ┌──────────┐ │                                    │  │Announce- │ │
        │  │AdCard    │ │                                    │  │ment      │ │
        │  │(dashboard)│                                    │  │Guard     │ │
        │  └──────────┘ │                                    │  └────┬─────┘ │
        │               │                                    │       │       │
        │  ┌──────────┐ │                                    │       ▼       │
        │  │AdStatus  │ │                                    │  ┌──────────┐ │
        │  │Badge     │ │                                    │  │AdForm    │ │
        │  └──────────┘ │                                    │  │(mode=    │ │
        │               │                                    │  │edit)     │ │
        │  ┌──────────┐ │                                    │  └──────────┘ │
        │  │Delete    │ │                                    └───────────────┘
        │  │Confirm   │ │
        │  │Dialog    │ │
        │  └──────────┘ │
        │               │
        │  ┌──────────┐ │
        │  │Profile   │ │
        │  │Form      │ │
        │  └────┬─────┘ │
        │       │       │
        │       ▼       │
        │  ┌──────────┐ │
        │  │Avatar    │ │
        │  │Uploader  │ │
        │  └──────────┘ │
        └───────────────┘
```

## Struktura Katalogów Komponentów

```
src/components/
│
├── announcements/          # Komponenty związane z ogłoszeniami
│   ├── AnnouncementBrowser.tsx    # Główny kontener przeglądarki
│   │   ├── FilterSidebar.tsx      # Panel filtrów (desktop)
│   │   ├── MobileFilterTrigger.tsx # Przycisk filtrów (mobile)
│   │   ├── ActiveFiltersBar.tsx   # Pasek aktywnych filtrów
│   │   ├── AnnouncementGrid.tsx   # Siatka ogłoszeń
│   │   │   ├── AdCard.tsx         # Karta ogłoszenia
│   │   │   ├── AdCardSkeleton.tsx # Skeleton loading
│   │   │   ├── EmptyState.tsx     # Stan pusty
│   │   │   └── ErrorState.tsx     # Stan błędu
│   │   └── Pagination.tsx         # Paginacja
│   │
│   ├── AdForm.tsx                 # Formularz dodawania/edycji
│   │   ├── ImageUploader.tsx      # Upload zdjęć
│   │   ├── LocationCascader.tsx   # Wybór lokalizacji
│   │   └── LocationSelect.tsx     # Select lokalizacji
│   │
│   ├── AdInfoDetails.astro        # Szczegóły ogłoszenia (Astro)
│   ├── GalleryDisplay.tsx         # Galeria zdjęć
│   ├── ShareButton.tsx            # Udostępnianie
│   ├── ReportButton.tsx           # Zgłaszanie
│   ├── ContactReveal.tsx          # Ujawnianie kontaktu
│   ├── AuthorControls.tsx         # Kontrole autora
│   ├── CommentsSection.tsx       # Sekcja komentarzy
│   │   ├── CommentList.tsx        # Lista komentarzy
│   │   └── CommentForm.tsx        # Formularz komentarza
│   └── EditAnnouncementGuard.tsx  # Guard edycji
│
├── auth/                   # Komponenty autoryzacji
│   ├── AuthForm.tsx        # Formularz logowania/rejestracji
│   ├── PasswordResetForm.tsx      # Formularz resetu hasła
│   ├── PasswordResetConfirmForm.tsx # Potwierdzenie resetu
│   └── auth-schema.ts      # Schematy walidacji
│
├── dashboard/              # Komponenty panelu użytkownika
│   ├── DashboardGuard.tsx  # Guard autoryzacji
│   ├── AccountTabs.tsx     # Zakładki konta
│   │   ├── UserAdsDashboard.tsx   # Dashboard ogłoszeń
│   │   │   ├── AdCard.tsx         # Karta ogłoszenia (dashboard)
│   │   │   ├── AdStatusBadge.tsx  # Status ogłoszenia
│   │   │   └── DeleteConfirmationDialog.tsx # Dialog usuwania
│   │   └── DashboardEmptyState.tsx # Stan pusty
│   └── AdStatusBadge.tsx   # Badge statusu
│
├── profile/                # Komponenty profilu
│   ├── ProfileForm.tsx     # Formularz profilu
│   └── AvatarUploader.tsx  # Upload avatara
│
├── ui/                     # Komponenty UI (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── checkbox.tsx
│   ├── radio-group.tsx
│   ├── tabs.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── alert.tsx
│   ├── alert-dialog.tsx
│   ├── drawer.tsx
│   ├── dropdown-menu.tsx
│   ├── popover.tsx
│   ├── calendar.tsx
│   ├── skeleton.tsx
│   ├── label.tsx
│   └── sonner.tsx          # Toast notifications
│
├── Header.tsx              # Główny header aplikacji
├── HeroSection.astro       # Sekcja hero (Astro)
├── HeroButtons.tsx         # Przyciski hero
├── LatestAdsCarousel.tsx   # Karuzela ostatnich ogłoszeń
└── Welcome.astro           # Komponent powitalny
```

## Zależności między Komponentami

### Warstwa Layout
```
Layout.astro
  ├── Header.tsx (client:load)
  │   ├── auth/AuthForm
  │   ├── ui/button
  │   ├── ui/avatar
  │   ├── ui/drawer
  │   └── ui/dropdown-menu
  └── ui/sonner (Toaster)
```

### Warstwa Stron
```
index.astro
  └── Layout.astro
      ├── HeroSection.astro
      └── LatestAdsCarousel.tsx

ogloszenia/index.astro
  └── Layout.astro
      └── AnnouncementBrowser.tsx
          ├── FilterSidebar.tsx
          │   ├── FilterSection.tsx
          │   ├── LocationSelect.tsx
          │   └── DatePickerWithRange.tsx
          ├── MobileFilterTrigger.tsx
          ├── ActiveFiltersBar.tsx
          ├── AnnouncementGrid.tsx
          │   ├── AdCard.tsx
          │   ├── AdCardSkeleton.tsx
          │   ├── EmptyState.tsx
          │   └── ErrorState.tsx
          └── Pagination.tsx

ogloszenia/[id].astro
  └── Layout.astro
      ├── AdInfoDetails.astro
      ├── GalleryDisplay.tsx
      ├── ShareButton.tsx
      ├── ReportButton.tsx
      ├── ContactReveal.tsx
      ├── AuthorControls.tsx
      └── CommentsSection.tsx
          ├── CommentList.tsx
          └── CommentForm.tsx

dodaj-ogloszenie.astro
  └── Layout.astro
      └── AdForm.tsx
          ├── ImageUploader.tsx
          ├── LocationCascader.tsx
          └── ui/form, ui/input, ui/textarea, ui/select, etc.

moje-konto.astro
  └── Layout.astro
      └── DashboardGuard.tsx
          └── AccountTabs.tsx
              ├── UserAdsDashboard.tsx
              │   ├── AdCard.tsx (dashboard)
              │   ├── AdStatusBadge.tsx
              │   └── DeleteConfirmationDialog.tsx
              └── ProfileForm.tsx
                  └── AvatarUploader.tsx

moje-konto/edycja/[id].astro
  └── Layout.astro
      └── EditAnnouncementGuard.tsx
          └── AdForm.tsx (mode=edit)

logowanie.astro / rejestracja.astro
  └── Layout.astro
      └── auth/AuthForm.tsx

odzyskiwanie-hasla.astro / reset-hasla.astro
  └── Layout.astro
      ├── auth/PasswordResetForm.tsx
      └── auth/PasswordResetConfirmForm.tsx
```

## Zależności Bibliotek i Serwisów

### Hooks
```
useAnnouncementSearch.ts
  └── lib/api/announcements.ts
      └── lib/services/announcement.service.ts
```

### Serwisy
```
lib/services/
  ├── announcement.service.ts
  ├── comments.service.ts
  ├── reports.service.ts
  └── storage.service.ts
```

### Walidatory
```
lib/validators/
  ├── announcements.ts
  ├── comments.ts
  ├── reports.ts
  └── profiles.ts
```

### API Endpoints
```
pages/api/
  ├── announcements/
  │   ├── index.ts (GET, POST)
  │   └── [id].ts (GET, PATCH, DELETE)
  ├── comments/
  │   └── index.ts (GET, POST)
  └── reports/
      └── index.ts (POST)
```

## Typy Komponentów

### Astro Components (SSR)
- `Layout.astro` - Główny layout
- `HeroSection.astro` - Sekcja hero
- `AdInfoDetails.astro` - Szczegóły ogłoszenia
- `Welcome.astro` - Komponent powitalny

### React Components (Client-side)
- Wszystkie komponenty `.tsx` używają `client:load` lub `client:only="react"`
- Komponenty interaktywne (formularze, filtry, komentarze)
- Komponenty wymagające stanu (useState, useEffect)

### UI Components (shadcn/ui)
- Podstawowe komponenty UI używane przez wszystkie komponenty wyższego poziomu
- Wszystkie w katalogu `components/ui/`

## Przepływ Danych

```
User Interaction
    │
    ▼
React Component (client-side)
    │
    ├───► API Call (/api/*)
    │         │
    │         ▼
    │    API Endpoint (pages/api/*)
    │         │
    │         ▼
    │    Service Layer (lib/services/*)
    │         │
    │         ▼
    │    Supabase Client (lib/supabase-client-factory.ts)
    │         │
    │         ▼
    │    Supabase Database
    │
    └───► State Management (useState, useEffect)
              │
              ▼
         UI Update
```

## Kluczowe Zależności

1. **Layout.astro** - Używany przez wszystkie strony
2. **Header.tsx** - Obecny na wszystkich stronach przez Layout
3. **AnnouncementBrowser** - Centralny komponent przeglądarki ogłoszeń
4. **AdForm** - Używany zarówno do tworzenia jak i edycji
5. **DashboardGuard** - Chroni strony wymagające autoryzacji
6. **UI Components** - Wszystkie komponenty UI są podstawą dla innych komponentów

