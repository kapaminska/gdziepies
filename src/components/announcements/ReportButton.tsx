import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';

interface ReportButtonProps {
  announcementId: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export function ReportButton({ announcementId, supabaseUrl, supabaseKey }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Proszę podać powód zgłoszenia');
      return;
    }

    try {
      setIsSubmitting(true);

      const client = getOrCreateSupabaseClient(supabaseUrl, supabaseKey);
      if (!client) {
        throw new Error('Brak konfiguracji Supabase');
      }

      const { data: { session } } = await client.auth.getSession();
      if (!session) {
        toast.error('Musisz być zalogowany, aby zgłosić ogłoszenie');
        setIsOpen(false);
        return;
      }

      const response = await fetch(`/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          announcement_id: announcementId,
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          toast.error(errorData.error?.message || 'Już zgłosiłeś to ogłoszenie');
        } else if (response.status === 404) {
          toast.error(errorData.error?.message || 'Ogłoszenie nie zostało znalezione');
        } else {
          throw new Error(errorData.error?.message || 'Nie udało się zgłosić ogłoszenia');
        }
        return;
      } else {
        toast.success('Ogłoszenie zostało zgłoszone');
        setReason('');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error reporting announcement:', error);
      toast.error(error instanceof Error ? error.message : 'Nie udało się zgłosić ogłoszenia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Zgłoś ogłoszenie"
        >
          <Flag className="size-4" />
          Zgłoś
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zgłoś ogłoszenie</AlertDialogTitle>
          <AlertDialogDescription>
            Podaj powód zgłoszenia tego ogłoszenia. Twoje zgłoszenie zostanie przejrzane przez moderatorów.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-reason">Powód zgłoszenia</Label>
            <Textarea
              id="report-reason"
              placeholder="Opisz powód zgłoszenia..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

