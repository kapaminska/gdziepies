import type { AnnouncementDto } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AdCardProps {
  announcement: AnnouncementDto;
}

/**
 * Format date to Polish locale format.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get badge variant based on announcement type.
 */
function getBadgeVariant(type: AnnouncementDto['type']): 'default' | 'secondary' | 'destructive' | 'outline' {
  return type === 'lost' ? 'destructive' : 'secondary';
}

/**
 * Get badge text based on announcement type.
 */
function getBadgeText(type: AnnouncementDto['type']): string {
  return type === 'lost' ? 'Zaginiony' : 'Znaleziony';
}

export function AdCard({ announcement }: AdCardProps) {
  const badgeVariant = getBadgeVariant(announcement.type);
  const badgeText = getBadgeText(announcement.type);
  const location = `${announcement.poviat}, ${announcement.voivodeship}`;
  const formattedDate = formatDate(announcement.event_date);
  const detailUrl = `/ogloszenia/${announcement.id}`;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <a href={detailUrl} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {announcement.image_url ? (
            <img
              src={announcement.image_url}
              alt={announcement.title}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to placeholder on error
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EBrak zdj%c4%99cia%3C/text%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              Brak zdjęcia
            </div>
          )}
          <div className="absolute right-2 top-2">
            <Badge variant={badgeVariant}>{badgeText}</Badge>
          </div>
        </div>
        <CardHeader>
          <h3 className="line-clamp-2 font-semibold">{announcement.title}</h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Lokalizacja:</span> {location}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Data:</span> {formattedDate}
          </p>
        </CardContent>
      </a>
    </Card>
  );
}

