import type { CommentDto } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentListProps {
  comments: CommentDto[];
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(username: string | null | undefined): string {
  if (!username) return 'A';
  return username.charAt(0).toUpperCase();
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Brak komentarzy. Bądź pierwszy!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="size-8 shrink-0">
                {comment.author?.avatar_url && (
                  <AvatarImage src={comment.author.avatar_url} alt={comment.author.username || ''} />
                )}
                <AvatarFallback>
                  {getInitials(comment.author?.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">
                      {comment.author?.username || 'Anonimowy'}
                    </p>
                    {comment.is_sighting && (
                      <Badge variant="secondary" className="text-xs">
                        Widziano
                      </Badge>
                    )}
                  </div>
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={comment.created_at || undefined}
                  >
                    {formatDate(comment.created_at)}
                  </time>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

