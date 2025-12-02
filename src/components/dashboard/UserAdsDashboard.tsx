import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import type { AnnouncementDto, AnnouncementStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { DashboardAdCard } from './AdCard';
import { DashboardEmptyState } from './DashboardEmptyState';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

const PAGE_SIZE = 20;

interface UserAdsDashboardProps {
  userId: string;
}

async function getAccessToken(): Promise<string> {
  const { getOrCreateSupabaseClient } = await import('@/lib/supabase-client-factory');

  const supabaseClient = getOrCreateSupabaseClient();

  if (!supabaseClient) {
    throw new Error('Brak konfiguracji Supabase');
  }

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    throw new Error('Brak sesji. Zaloguj się ponownie.');
  }

  return session.access_token;
}

export function UserAdsDashboard({ userId }: UserAdsDashboardProps) {
  const [ads, setAds] = useState<AnnouncementDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMutationId, setStatusMutationId] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(pagination.totalPages, 1),
    [pagination.totalPages]
  );

  const fetchAds = useCallback(
    async (pageToLoad: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          author_id: userId,
          page: String(pageToLoad),
          limit: String(PAGE_SIZE),
          order_by: 'created_at',
          order: 'desc',
        });

        const response = await fetch(`/api/announcements?${params.toString()}`);

        const result = await response.json().catch(() => null);

        if (!response.ok || !result) {
          throw new Error(
            (result && result.message) || 'Nie udało się pobrać ogłoszeń.'
          );
        }

        setAds(result.data ?? []);
        setPagination(
          result.pagination ?? {
            page: pageToLoad,
            limit: PAGE_SIZE,
            total: result.data?.length ?? 0,
            totalPages: 1,
          }
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Nie udało się pobrać ogłoszeń.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchAds(page);
  }, [fetchAds, page]);

  const handleRetry = () => {
    fetchAds(page);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }
    setPage(nextPage);
  };

  const handleDeleteRequest = (announcementId: string) => {
    setAdToDelete(announcementId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!adToDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/announcements/${adToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          (errorData && errorData.message) || 'Nie udało się usunąć ogłoszenia.'
        );
      }

      toast.success('Ogłoszenie usunięte');
      setIsDeleteDialogOpen(false);
      setAdToDelete(null);
      await fetchAds(page);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nie udało się usunąć ogłoszenia.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (id: string, status: AnnouncementStatus) => {
    if (statusMutationId === id) {
      return;
    }

    setStatusMutationId(id);
    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          (errorData && errorData.message) ||
            'Nie udało się zaktualizować statusu ogłoszenia.'
        );
      }

      setAds((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      toast.success('Ogłoszenie oznaczone jako znalezione');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Nie udało się zaktualizować statusu ogłoszenia.';
      toast.error(message);
    } finally {
      setStatusMutationId(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="mb-4 font-medium text-destructive">{error}</p>
          <Button variant="outline" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Spróbuj ponownie
          </Button>
        </div>
      );
    }

    if (ads.length === 0) {
      return <DashboardEmptyState />;
    }

    return (
      <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ads.map((ad) => (
            <DashboardAdCard
              key={ad.id}
              ad={ad}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteRequest}
              isUpdatingStatus={statusMutationId === ad.id}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Poprzednia
            </Button>
            <span className="text-sm text-muted-foreground">
              Strona {page} z {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Następna
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Twoje ogłoszenia</h1>
        <p className="text-sm text-muted-foreground">
          Zarządzaj swoimi ogłoszeniami, edytuj je, aktualizuj status i usuwaj zakończone wpisy.
        </p>
      </header>

      {renderContent()}

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}

