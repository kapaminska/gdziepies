import { useEffect, useState } from 'react';
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';
import { AdForm } from './AdForm';
import type { AnnouncementDto } from '@/types';

interface EditAnnouncementGuardProps {
  announcementId: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export function EditAnnouncementGuard({
  announcementId,
  supabaseUrl,
  supabaseKey,
}: EditAnnouncementGuardProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<AnnouncementDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const client = getOrCreateSupabaseClient(supabaseUrl, supabaseKey);
        if (!client) {
          throw new Error('Missing Supabase configuration');
        }

        // Check authentication
        const { data: { session }, error: authError } = await client.auth.getSession();
        
        if (authError || !session?.user) {
          // Redirect to login with redirectTo parameter
          const redirectTo = encodeURIComponent(window.location.pathname);
          window.location.href = `/logowanie?redirectTo=${redirectTo}`;
          return;
        }

        const currentUserId = session.user.id;
        setUserId(currentUserId);

        // Fetch announcement data
        const response = await fetch(`/api/announcements/${announcementId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Announcement not found - redirect to dashboard
            window.location.href = '/moje-konto';
            return;
          }
          
          // Try to get error message from response
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.message || 'Nie udało się pobrać danych ogłoszenia';
          throw new Error(errorMessage);
        }

        const result = await response.json();
        
        if (!result || !result.data) {
          throw new Error('Nieprawidłowa odpowiedź z serwera');
        }
        
        const announcementData: AnnouncementDto = result.data;

        // Verify ownership
        if (announcementData.author_id !== currentUserId) {
          // User is not the owner - redirect to dashboard
          window.location.href = '/moje-konto';
          return;
        }

        setAnnouncement(announcementData);
      } catch (err) {
        console.error('Error loading announcement:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania danych';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [announcementId, supabaseUrl, supabaseKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="mb-4 font-medium text-destructive">{error}</p>
        <button
          onClick={() => window.location.href = '/moje-konto'}
          className="text-sm text-muted-foreground underline"
        >
          Wróć do panelu użytkownika
        </button>
      </div>
    );
  }

  if (!announcement || !userId) {
    return null;
  }

  return (
    <AdForm
      mode="edit"
      initialData={announcement}
      userId={userId}
      supabaseUrl={supabaseUrl}
      supabaseKey={supabaseKey}
    />
  );
}

