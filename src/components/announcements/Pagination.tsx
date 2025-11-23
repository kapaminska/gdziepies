import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationState } from '@/types/announcement-filters';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

/**
 * Pagination component for navigating through pages.
 */
export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, pageSize, total } = pagination;
  const totalPages = Math.ceil(total / pageSize);
  const isFirstPage = page === 1;
  const isLastPage = page >= totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={isFirstPage}
      >
        <ChevronLeft className="h-4 w-4" />
        Poprzednia
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Strona {page} z {totalPages}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={isLastPage}
      >
        Następna
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

