import { useAnnouncementSearch } from '@/hooks/useAnnouncementSearch';
import { FilterSidebar } from './FilterSidebar';
import { MobileFilterTrigger } from './MobileFilterTrigger';
import { ActiveFiltersBar } from './ActiveFiltersBar';
import { AnnouncementGrid } from './AnnouncementGrid';
import { Pagination } from './Pagination';

/**
 * Main container component for browsing and filtering announcements.
 * Manages state, URL synchronization, and coordinates all sub-components.
 */
export function AnnouncementBrowser() {
  const {
    filters,
    pagination,
    announcements,
    isLoading,
    error,
    setFilter,
    clearFilters,
    setPagination,
    refetch,
  } = useAnnouncementSearch();

  const handleFilterChange = (key: keyof typeof filters, value: string | Date | undefined) => {
    setFilter(key, value);
  };

  const handleRemoveFilter = (key: keyof typeof filters) => {
    setFilter(key, undefined);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ogłoszenia</h1>
        <MobileFilterTrigger
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <ActiveFiltersBar
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={clearFilters}
          />

          <div className="mt-6">
            <AnnouncementGrid
              items={announcements}
              isLoading={isLoading}
              error={error}
              onRetry={refetch}
              onClearFilters={clearFilters}
            />
          </div>

          {!isLoading && !error && announcements.length > 0 && (
            <div className="mt-8">
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

