import type { AnnouncementDto } from '@/types';
import { AdCard } from './AdCard';
import { AdCardSkeleton } from './AdCardSkeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

interface AnnouncementGridProps {
  items: AnnouncementDto[];
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  onClearFilters?: () => void;
}

/**
 * Grid component displaying announcements or loading/error states.
 */
export function AnnouncementGrid({
  items,
  isLoading,
  error,
  onRetry,
  onClearFilters,
}: AnnouncementGridProps) {
  if (error) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <AdCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((announcement) => (
        <AdCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
}

