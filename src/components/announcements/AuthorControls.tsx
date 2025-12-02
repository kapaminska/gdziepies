import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';
import type { AnnouncementStatus } from '@/types';

interface AuthorControlsProps {
  announcementId: string;
  currentStatus: AnnouncementStatus;
  supabaseUrl: string;
  supabaseKey: string;
}

export function AuthorControls({
  announcementId,
  currentStatus,
  supabaseUrl,
  supabaseKey,
}: AuthorControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMarkAsResolved = async () => {
    try {
      setIsLoading(true);

      const client = getOrCreateSupabaseClient(supabaseUrl, supabaseKey);
      if (!client) {
        throw new Error('Brak konfiguracji Supabase');
      }

      const { data: { session }, error: sessionError } = await client.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Musisz być zalogowany');
        return;
      }

      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          status: 'resolved',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Nie udało się zaktualizować statusu');
      }

      toast.success('Ogłoszenie zostało oznaczone jako znalezione');
      setIsDialogOpen(false);
      
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error instanceof Error ? error.message : 'Nie udało się zaktualizować statusu');
    } finally {
      setIsLoading(false);
    }
  };

  const canMarkAsResolved = currentStatus !== 'resolved';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Zarządzanie ogłoszeniem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            asChild
            className="w-full"
          >
            <a href={`/moje-konto/edycja/${announcementId}`}>
              <Edit className="mr-2 size-4" />
              Edytuj ogłoszenie
            </a>
          </Button>

          {canMarkAsResolved && (
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Oznacz jako znalezione</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz oznaczyć to ogłoszenie jako znalezione? 
                    Po oznaczeniu nie będzie można dodawać nowych komentarzy.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading}>Anuluj</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleMarkAsResolved}
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground"
                  >
                    {isLoading ? 'Zapisywanie...' : 'Oznacz jako znalezione'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {canMarkAsResolved && (
            <Button
              variant="secondary"
              onClick={() => setIsDialogOpen(true)}
              disabled={isLoading}
              className="w-full"
            >
              <CheckCircle2 className="mr-2 size-4" />
              Oznacz jako ZNALEZIONE
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

