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

const ALL_OPTION_VALUE = '__all__';

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
          value={voivodeship ?? ALL_OPTION_VALUE}
          onValueChange={(value) => {
            const nextValue = value === ALL_OPTION_VALUE ? undefined : value;
            onVoivodeshipChange(nextValue);
            // Reset poviat when voivodeship changes
            if (nextValue !== voivodeship) {
              onPoviatChange(undefined);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Wybierz województwo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION_VALUE}>Wszystkie</SelectItem>
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
          value={poviat ?? ALL_OPTION_VALUE}
          onValueChange={(value) => {
            const nextValue = value === ALL_OPTION_VALUE ? undefined : value;
            onPoviatChange(nextValue);
          }}
          disabled={isPoviatDisabled}
        >
          <SelectTrigger className="w-full" disabled={isPoviatDisabled}>
            <SelectValue placeholder={isPoviatDisabled ? 'Najpierw wybierz województwo' : 'Wybierz powiat'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION_VALUE}>Wszystkie</SelectItem>
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

