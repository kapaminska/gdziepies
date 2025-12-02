import { Button } from '@/components/ui/button';

interface DashboardEmptyStateProps {
  title?: string;
  description?: string;
}

export function DashboardEmptyState({
  title = 'Nie dodałeś jeszcze żadnych ogłoszeń',
  description = 'Twoje ogłoszenia pojawią się tutaj po opublikowaniu pierwszego wpisu.',
}: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 text-sm text-muted-foreground">{description}</p>
      <Button asChild>
        <a href="/dodaj-ogloszenie">Dodaj ogłoszenie</a>
      </Button>
    </div>
  );
}


