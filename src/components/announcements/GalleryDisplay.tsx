import { Card, CardContent } from '@/components/ui/card';

interface GalleryDisplayProps {
  imageUrl: string | null;
  title: string;
}

export function GalleryDisplay({ imageUrl, title }: GalleryDisplayProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              Brak zdjęcia
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

