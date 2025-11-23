import { X } from 'lucide-react';
import type { FilterState } from '@/types/announcement-filters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface ActiveFiltersBarProps {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState) => void;
  onClearAll: () => void;
}

const FILTER_LABELS: Record<keyof FilterState, string> = {
  announcement_type: 'Typ',
  species: 'Gatunek',
  voivodeship: 'Województwo',
  poviat: 'Powiat',
  size: 'Rozmiar',
  color: 'Kolor',
  age_range: 'Wiek',
  date_from: 'Data od',
  date_to: 'Data do',
  status: 'Status',
};

const SPECIES_LABELS: Record<string, string> = {
  dog: 'Pies',
  cat: 'Kot',
};

const SIZE_LABELS: Record<string, string> = {
  small: 'Mały',
  medium: 'Średni',
  large: 'Duży',
};

const AGE_LABELS: Record<string, string> = {
  young: 'Młody',
  adult: 'Dorosły',
  senior: 'Starszy',
};

const TYPE_LABELS: Record<string, string> = {
  lost: 'Zaginiony',
  found: 'Znaleziony',
};

/**
 * Get display value for a filter.
 */
function getFilterValue(key: keyof FilterState, value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  if (key === 'date_from' || key === 'date_to') {
    if (value instanceof Date) {
      return format(value, 'd MMM yyyy', { locale: pl });
    }
    return String(value);
  }

  if (key === 'species') {
    return SPECIES_LABELS[String(value)] || String(value);
  }

  if (key === 'size') {
    return SIZE_LABELS[String(value)] || String(value);
  }

  if (key === 'age_range') {
    return AGE_LABELS[String(value)] || String(value);
  }

  if (key === 'announcement_type') {
    return TYPE_LABELS[String(value)] || String(value);
  }

  return String(value);
}

/**
 * Bar displaying active filters as removable chips.
 */
export function ActiveFiltersBar({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersBarProps) {
  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  ) as Array<[keyof FilterState, unknown]>;

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Aktywne filtry:</span>
      {activeFilters.map(([key, value]) => {
        // Skip status if it's 'active' (default)
        if (key === 'status' && value === 'active') {
          return null;
        }

        // Handle date range specially
        if (key === 'date_from' || key === 'date_to') {
          if (key === 'date_from' && filters.date_to) {
            // Only show one badge for date range
            return null;
          }
          if (key === 'date_to' && filters.date_from) {
            const from = getFilterValue('date_from', filters.date_from);
            const to = getFilterValue('date_to', filters.date_to);
            return (
              <Badge key="date_range" variant="secondary" className="gap-1">
                Data: {from} - {to}
                <button
                  onClick={() => {
                    onRemoveFilter('date_from');
                    onRemoveFilter('date_to');
                  }}
                  className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          }
        }

        const label = FILTER_LABELS[key] || key;
        const displayValue = getFilterValue(key, value);

        return (
          <Badge key={key} variant="secondary" className="gap-1">
            {label}: {displayValue}
            <button
              onClick={() => onRemoveFilter(key)}
              className="ml-1 rounded-full hover:bg-secondary-foreground/20"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}
      <Button variant="ghost" size="sm" onClick={onClearAll}>
        Wyczyść wszystkie
      </Button>
    </div>
  );
}

