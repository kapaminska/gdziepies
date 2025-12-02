import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import type { CommentDto, ProfileDto } from '@/types';

interface CommentsSectionProps {
  announcementId: string;
  isResolved: boolean;
  currentUser: ProfileDto | null;
  supabaseUrl: string;
  supabaseKey: string;
}

export function CommentsSection({
  announcementId,
  isResolved,
  currentUser,
  supabaseUrl,
  supabaseKey,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/comments?announcement_id=${announcementId}&order=asc`
      );

      if (!response.ok) {
        throw new Error('Nie udało się pobrać komentarzy');
      }

      const result = await response.json();
      setComments(result.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Nie udało się pobrać komentarzy');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [announcementId]);

  const handleCommentAdded = (newComment: CommentDto) => {
    // Add new comment to the list
    setComments((prev) => [...prev, newComment]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Komentarze</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
            <button
              onClick={fetchComments}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : (
          <>
            <CommentList comments={comments} />
            <CommentForm
              announcementId={announcementId}
              isResolved={isResolved}
              onCommentAdded={handleCommentAdded}
              supabaseUrl={supabaseUrl}
              supabaseKey={supabaseKey}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

