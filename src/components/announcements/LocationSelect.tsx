import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getPowiatsForVoivodeship, getVoivodeshipNames } from '@/lib/constants/locations';

interface LocationSelectProps {
  voivodeship?: string;
  poviat?: string;
  onVoivodeshipChange: (value: string | undefined) => void;
  onPoviatChange: (value: string | undefined) => void;
}

/**
 * Component for selecting voivodeship and poviat.
 * Poviat selection is enabled only after selecting a voivodeship.
 */
export function LocationSelect({
  voivodeship,
  poviat,
  onVoivodeshipChange,
  onPoviatChange,
}: LocationSelectProps) {
  const voivodeshipNames = getVoivodeshipNames();
  const powiats = voivodeship ? getPowiatsForVoivodeship(voivodeship) : [];
  const isPoviatDisabled = !voivodeship;

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-2 block text-sm font-medium">Województwo</label>
        <Select
          value={voivodeship || ''}
          onValueChange={(value) => {
            onVoivodeshipChange(value || undefined);
            // Reset poviat when voivodeship changes
            if (value !== voivodeship) {
              onPoviatChange(undefined);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Wybierz województwo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Wszystkie</SelectItem>
            {voivodeshipNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Powiat</label>
        <Select
          value={poviat || ''}
          onValueChange={(value) => onPoviatChange(value || undefined)}
          disabled={isPoviatDisabled}
        >
          <SelectTrigger className="w-full" disabled={isPoviatDisabled}>
            <SelectValue placeholder={isPoviatDisabled ? 'Najpierw wybierz województwo' : 'Wybierz powiat'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Wszystkie</SelectItem>
            {powiats.map((poviatName) => (
              <SelectItem key={poviatName} value={poviatName}>
                {poviatName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

