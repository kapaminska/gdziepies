import type { FilterState } from '@/types/announcement-filters';
import type { AnimalSpecies, AnimalSize, AnimalAgeRange, AnnouncementType } from '@/types';
import { FilterSection } from './FilterSection';
import { LocationSelect } from './LocationSelect';
import { DatePickerWithRange } from './DatePickerWithRange';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | Date | undefined) => void;
  onClearFilters: () => void;
}

const SPECIES_OPTIONS: { value: AnimalSpecies; label: string }[] = [
  { value: 'dog', label: 'Pies' },
  { value: 'cat', label: 'Kot' },
];

const SIZE_OPTIONS: { value: AnimalSize; label: string }[] = [
  { value: 'small', label: 'Mały' },
  { value: 'medium', label: 'Średni' },
  { value: 'large', label: 'Duży' },
];

const AGE_RANGE_OPTIONS: { value: AnimalAgeRange; label: string }[] = [
  { value: 'young', label: 'Młody' },
  { value: 'adult', label: 'Dorosły' },
  { value: 'senior', label: 'Starszy' },
];

const ALL_OPTION_VALUE = '__all__';

/**
 * Filter sidebar for desktop view.
 */
export function FilterSidebar({
  filters,
  onFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  const hasActiveFilters = Boolean(
    filters.announcement_type ||
      filters.species ||
      filters.voivodeship ||
      filters.poviat ||
      filters.size ||
      filters.color ||
      filters.age_range ||
      filters.date_from ||
      filters.date_to
  );

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtry</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Wyczyść
          </Button>
        )}
      </div>

      <FilterSection title="Typ ogłoszenia">
        <RadioGroup
          value={filters.announcement_type || ''}
          onValueChange={(value) =>
            onFilterChange('announcement_type', (value || undefined) as AnnouncementType | undefined)
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lost" id="type-lost" />
            <Label htmlFor="type-lost" className="cursor-pointer">
              Zaginiony
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="found" id="type-found" />
            <Label htmlFor="type-found" className="cursor-pointer">
              Znaleziony
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="type-all" />
            <Label htmlFor="type-all" className="cursor-pointer">
              Wszystkie
            </Label>
          </div>
        </RadioGroup>
      </FilterSection>

      <FilterSection title="Gatunek">
        <Select
          value={filters.species ?? ALL_OPTION_VALUE}
          onValueChange={(value) => {
            const nextValue = value === ALL_OPTION_VALUE ? undefined : (value as AnimalSpecies);
            onFilterChange('species', nextValue);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Wszystkie gatunki" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION_VALUE}>Wszystkie</SelectItem>
            {SPECIES_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Lokalizacja">
        <LocationSelect
          voivodeship={filters.voivodeship}
          poviat={filters.poviat}
          onVoivodeshipChange={(value) => onFilterChange('voivodeship', value)}
          onPoviatChange={(value) => onFilterChange('poviat', value)}
        />
      </FilterSection>

      <FilterSection title="Rozmiar">
        <Select
          value={filters.size ?? ALL_OPTION_VALUE}
          onValueChange={(value) => {
            const nextValue = value === ALL_OPTION_VALUE ? undefined : (value as AnimalSize);
            onFilterChange('size', nextValue);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Wszystkie rozmiary" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION_VALUE}>Wszystkie</SelectItem>
            {SIZE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Kolor">
        <Input
          type="text"
          placeholder="Wpisz kolor..."
          value={filters.color || ''}
          onChange={(e) => onFilterChange('color', e.target.value || undefined)}
        />
      </FilterSection>

      <FilterSection title="Wiek">
        <Select
          value={filters.age_range ?? ALL_OPTION_VALUE}
          onValueChange={(value) => {
            const nextValue = value === ALL_OPTION_VALUE ? undefined : (value as AnimalAgeRange);
            onFilterChange('age_range', nextValue);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Wszystkie przedziały wiekowe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION_VALUE}>Wszystkie</SelectItem>
            {AGE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Data zdarzenia">
        <DatePickerWithRange
          dateFrom={filters.date_from}
          dateTo={filters.date_to}
          onDateChange={(from, to) => {
            onFilterChange('date_from', from);
            onFilterChange('date_to', to);
          }}
        />
      </FilterSection>
    </aside>
  );
}

