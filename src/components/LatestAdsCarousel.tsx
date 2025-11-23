import { useEffect, useState } from 'react';
import type { AnnouncementDto } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface ApiResponse {
  data: AnnouncementDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function AdCard({ announcement }: { announcement: AnnouncementDto }) {
  const typeLabel = announcement.type === 'lost' ? 'Zgubione' : 'Znalezione';
  const typeColor = announcement.type === 'lost' 
    ? 'bg-orange-500 text-white' 
    : 'bg-green-500 text-white';

  return (
    <article className="flex-shrink-0 w-[280px] sm:w-[320px]">
      <a 
        href={`/ogloszenia/${announcement.id}`}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
        aria-label={`Zobacz szczegóły ogłoszenia: ${announcement.title} - ${typeLabel} w ${announcement.voivodeship}`}
      >
        <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {announcement.image_url ? (
              <img
                src={announcement.image_url}
                alt={`${announcement.title} - ${announcement.species === 'dog' ? 'Pies' : 'Kot'}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="16"%3EBrak zdj%26%23181%3Bcia%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                <span className="text-sm">Brak zdjęcia</span>
              </div>
            )}
            <span 
              className={`absolute top-2 right-2 px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm ${typeColor}`}
              aria-label={`Typ ogłoszenia: ${typeLabel}`}
            >
              {typeLabel}
            </span>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
              {announcement.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {announcement.voivodeship}
              {announcement.poviat && `, ${announcement.poviat}`}
            </p>
            {announcement.species && (
              <p className="text-xs text-muted-foreground mt-1">
                {announcement.species === 'dog' ? 'Pies' : 'Kot'}
              </p>
            )}
          </CardContent>
        </Card>
      </a>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[320px]">
      <Card className="h-full overflow-hidden">
        <div className="aspect-[4/3] bg-muted animate-pulse" />
        <CardContent className="p-4 space-y-2">
          <div className="h-5 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LatestAdsCarousel() {
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: '10',
          order_by: 'created_at',
          order: 'desc',
          status: 'active',
        });

        const response = await fetch(`/api/announcements?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Błąd HTTP: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (!Array.isArray(result.data)) {
          throw new Error('Nieprawidłowy format odpowiedzi API');
        }

        setAnnouncements(result.data);
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Nie udało się pobrać ogłoszeń';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  return (
    <section 
      className="w-full py-8 px-4 sm:px-6 lg:px-8"
      aria-label="Najnowsze ogłoszenia"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
          Najnowsze ogłoszenia
        </h2>

        {loading && (
          <div 
            className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
            aria-label="Ładowanie ogłoszeń"
          >
            <div className="flex gap-4">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive font-medium mb-4">
              Nie udało się pobrać ogłoszeń. Spróbuj ponownie.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Odśwież
            </button>
          </div>
        )}

        {!loading && !error && announcements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Brak najnowszych ogłoszeń
            </p>
          </div>
        )}

        {!loading && !error && announcements.length > 0 && (
          <div 
            className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--muted)) transparent',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div 
              className="flex gap-4"
              role="list"
              aria-label="Lista najnowszych ogłoszeń"
            >
              {announcements.map((announcement) => (
                <div key={announcement.id} role="listitem">
                  <AdCard announcement={announcement} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

