import { useMemo } from 'react';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from 'lucide-react';

import type { AnnouncementDto, AnnouncementStatus } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdStatusBadge } from './AdStatusBadge';

interface DashboardAdCardProps {
  ad: AnnouncementDto;
  onStatusChange: (id: string, status: AnnouncementStatus) => void;
  onDelete: (id: string) => void;
  isUpdatingStatus?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function DashboardAdCard({
  ad,
  onStatusChange,
  onDelete,
  isUpdatingStatus = false,
}: DashboardAdCardProps) {
  const isResolved = ad.status === 'resolved';
  const editUrl = `/moje-konto/edycja/${ad.id}`;
  const detailsUrl = `/ogloszenia/${ad.id}`;

  const location = useMemo(() => {
    const parts = [ad.poviat, ad.voivodeship].filter(Boolean);
    return parts.join(', ');
  }, [ad.poviat, ad.voivodeship]);

  const handleMarkResolved = () => {
    if (isResolved) {
      return;
    }
    onStatusChange(ad.id, 'resolved');
  };

  const handleDelete = () => {
    onDelete(ad.id);
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {ad.image_url ? (
          <img
            src={ad.image_url}
            alt={ad.title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(event) => {
              const target = event.target as HTMLImageElement;
              target.src =
                'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"300\"%3E%3Crect fill=\"%23ddd\" width=\"400\" height=\"300\"/%3E%3Ctext fill=\"%23999\" font-family=\"sans-serif\" font-size=\"18\" x=\"50%25\" y=\"50%25\" text-anchor=\"middle\" dy=\".3em\"%3EBrak zdjecia%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Brak zdjęcia
          </div>
        )}
        <div className="absolute left-3 top-3">
          <AdStatusBadge status={ad.status} />
        </div>
      </div>

      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <h3 className="line-clamp-2 text-base font-semibold">{ad.title}</h3>
          <p className="text-sm text-muted-foreground">{formatDate(ad.event_date)}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Więcej akcji">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Akcje</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <a href={editUrl} className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edytuj
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isResolved || isUpdatingStatus}
              onSelect={(event) => {
                event.preventDefault();
                handleMarkResolved();
              }}
              className="flex items-center gap-2"
            >
              {isUpdatingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {isResolved ? 'Status: znalezione' : 'Oznacz jako znalezione'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Typ:</span>{' '}
          {ad.type === 'lost' ? 'Zaginione' : 'Znalezione'}
        </p>
        {location && (
          <p>
            <span className="font-medium text-foreground">Lokalizacja:</span> {location}
          </p>
        )}
        {ad.species && (
          <p>
            <span className="font-medium text-foreground">Gatunek:</span>{' '}
            {ad.species === 'dog' ? 'Pies' : 'Kot'}
          </p>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex justify-between gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={detailsUrl} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Szczegóły
          </a>
        </Button>
        <Button size="sm" variant="secondary" asChild>
          <a href={editUrl} className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edytuj
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

