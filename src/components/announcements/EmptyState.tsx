import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onClearFilters?: () => void;
}

/**
 * Empty state component when no announcements are found.
 */
export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Search className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-semibold">Nie znaleziono ogłoszeń</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Nie znaleziono ogłoszeń spełniających wybrane kryteria.
      </p>
      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Wyczyść filtry
        </Button>
      )}
    </div>
  );
}

