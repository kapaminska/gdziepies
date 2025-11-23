import { useEffect } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  getPoviatsForVoivodeship,
  voivodeships,
} from '@/lib/data/polish-locations';

interface LocationCascaderProps {
  voivodeship?: string;
  poviat?: string;
  onVoivodeshipChange: (value: string) => void;
  onPoviatChange: (value: string) => void;
  voivodeshipError?: string;
  poviatError?: string;
  disabled?: boolean;
}

export function LocationCascader({
  voivodeship,
  poviat,
  onVoivodeshipChange,
  onPoviatChange,
  voivodeshipError,
  poviatError,
  disabled = false,
}: LocationCascaderProps) {
  const availablePoviats = voivodeship ? getPoviatsForVoivodeship(voivodeship) : [];

  // Reset poviat when voivodeship changes
  useEffect(() => {
    if (voivodeship && poviat) {
      const poviats = getPoviatsForVoivodeship(voivodeship);
      if (!poviats.includes(poviat)) {
        onPoviatChange('');
      }
    }
  }, [voivodeship, poviat, onPoviatChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voivodeship">
          Województwo <span className="text-destructive">*</span>
        </Label>
        <Select
          value={voivodeship || ''}
          onValueChange={onVoivodeshipChange}
          disabled={disabled}
        >
          <SelectTrigger
            id="voivodeship"
            aria-invalid={!!voivodeshipError}
            aria-describedby={voivodeshipError ? 'voivodeship-error' : undefined}
          >
            <SelectValue placeholder="Wybierz województwo" />
          </SelectTrigger>
          <SelectContent>
            {voivodeships.map((voiv) => (
              <SelectItem key={voiv} value={voiv}>
                {voiv}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {voivodeshipError && (
          <p
            id="voivodeship-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {voivodeshipError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="poviat">
          Powiat <span className="text-destructive">*</span>
        </Label>
        <Select
          value={poviat || ''}
          onValueChange={onPoviatChange}
          disabled={disabled || !voivodeship || availablePoviats.length === 0}
        >
          <SelectTrigger
            id="poviat"
            aria-invalid={!!poviatError}
            aria-describedby={poviatError ? 'poviat-error' : undefined}
          >
            <SelectValue
              placeholder={
                !voivodeship
                  ? 'Najpierw wybierz województwo'
                  : availablePoviats.length === 0
                    ? 'Brak dostępnych powiatów'
                    : 'Wybierz powiat'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availablePoviats.map((pov) => (
              <SelectItem key={pov} value={pov}>
                {pov}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {poviatError && (
          <p
            id="poviat-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {poviatError}
          </p>
        )}
      </div>
    </div>
  );
}

