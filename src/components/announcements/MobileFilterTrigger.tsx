import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import type { FilterState } from '@/types/announcement-filters';
import { FilterSidebar } from './FilterSidebar';

interface MobileFilterTriggerProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | Date | undefined) => void;
  onClearFilters: () => void;
}

/**
 * Mobile filter trigger button that opens a drawer with filters.
 */
export function MobileFilterTrigger({
  filters,
  onFilterChange,
  onClearFilters,
}: MobileFilterTriggerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <Filter className="mr-2 h-4 w-4" />
          Filtruj
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filtry</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[80vh] overflow-y-auto px-4 pb-4">
          <FilterSidebar
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

