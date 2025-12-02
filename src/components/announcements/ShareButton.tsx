import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

export function ShareButton() {
  const [isCopying, setIsCopying] = useState(false);

  const handleShare = async () => {
    try {
      setIsCopying(true);
      const url = window.location.href;
      
      // Try to use Web Share API if available (mobile)
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: url,
        });
        toast.success('Udostępniono');
      } else {
        // Fallback to clipboard API
        await navigator.clipboard.writeText(url);
        toast.success('Skopiowano link');
      }
    } catch (error) {
      // User cancelled share or clipboard failed
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('Nie udało się skopiować linku');
      }
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={isCopying}
      aria-label="Udostępnij ogłoszenie"
    >
      <Share2 className="size-4" />
      {isCopying ? 'Kopiowanie...' : 'Udostępnij'}
    </Button>
  );
}

