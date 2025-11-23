import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  onRetry?: () => void;
}

/**
 * Error state component when API request fails.
 */
export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="mb-2 text-lg font-semibold">Wystąpił błąd</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Nie udało się pobrać ogłoszeń. Spróbuj ponownie.
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Spróbuj ponownie
        </Button>
      )}
    </div>
  );
}

