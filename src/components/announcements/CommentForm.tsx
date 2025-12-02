import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';
import type { CommentDto } from '@/types';

interface CommentFormProps {
  announcementId: string;
  isResolved: boolean;
  onCommentAdded: (comment: CommentDto) => void;
  supabaseUrl: string;
  supabaseKey: string;
}

export function CommentForm({
  announcementId,
  isResolved,
  onCommentAdded,
  supabaseUrl,
  supabaseKey,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSighting, setIsSighting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (trimmedContent.length < 3) {
      toast.error('Treść komentarza musi mieć co najmniej 3 znaki');
      return;
    }

    if (trimmedContent.length > 5000) {
      toast.error('Treść komentarza nie może przekraczać 5000 znaków');
      return;
    }

    try {
      setIsSubmitting(true);

      const client = getOrCreateSupabaseClient(supabaseUrl, supabaseKey);
      if (!client) {
        throw new Error('Brak konfiguracji Supabase');
      }

      const { data: { session }, error: sessionError } = await client.auth.getSession();
      
      if (sessionError || !session) {
        const redirectTo = encodeURIComponent(window.location.pathname);
        window.location.href = `/logowanie?redirectTo=${redirectTo}`;
        return;
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          announcement_id: announcementId,
          content: trimmedContent,
          is_sighting: isSighting,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Nie udało się dodać komentarza');
      }

      const result = await response.json();
      const newComment = result.data as CommentDto;

      toast.success('Komentarz został dodany');
      setContent('');
      setIsSighting(false);
      onCommentAdded(newComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error instanceof Error ? error.message : 'Nie udało się dodać komentarza');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isResolved) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            To ogłoszenie zostało oznaczone jako znalezione. Nie można już dodawać komentarzy.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dodaj komentarz</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment-content">Treść komentarza</Label>
            <Textarea
              id="comment-content"
              placeholder="Napisz komentarz..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              disabled={isSubmitting}
              required
              minLength={3}
              maxLength={5000}
              aria-describedby="comment-help"
            />
            <p id="comment-help" className="text-xs text-muted-foreground">
              Minimum 3 znaki, maksimum 5000 znaków
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-sighting"
              checked={isSighting}
              onCheckedChange={(checked) => setIsSighting(checked === true)}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="is-sighting"
              className="text-sm font-normal cursor-pointer"
            >
              Widziałem to zwierzę
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || content.trim().length < 3}
            className="w-full"
          >
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij komentarz'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

