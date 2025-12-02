import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';

interface ContactRevealProps {
  announcementId: string;
  supabaseUrl: string;
  supabaseKey: string;
}

interface ContactData {
  phone_number: string | null;
  email: string | null;
}

export function ContactReveal({ announcementId, supabaseUrl, supabaseKey }: ContactRevealProps) {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRevealContact = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const client = getOrCreateSupabaseClient(supabaseUrl, supabaseKey);
      if (!client) {
        throw new Error('Brak konfiguracji Supabase');
      }

      // Check if user is logged in
      const { data: { session }, error: sessionError } = await client.auth.getSession();
      
      if (sessionError || !session) {
        // Not logged in - redirect to login
        const redirectTo = encodeURIComponent(window.location.pathname);
        window.location.href = `/logowanie?redirectTo=${redirectTo}`;
        return;
      }

      // User is logged in - fetch contact details via RPC
      const { data, error: rpcError } = await client.rpc('get_contact_details', {
        p_announcement_id: announcementId,
      });

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        throw new Error(rpcError.message || 'Nie udało się pobrać danych kontaktowych');
      }

      // RPC returns array (table function), get first element
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Brak dostępnych danych kontaktowych');
      }

      // Get first result from table function
      const contact = data[0] as ContactData | undefined;
      if (!contact) {
        throw new Error('Brak dostępnych danych kontaktowych');
      }

      // Both fields can be null, but at least one should exist
      if (!contact.phone_number && !contact.email) {
        throw new Error('Brak dostępnych danych kontaktowych');
      }

      setContactData({
        phone_number: contact.phone_number ?? null,
        email: contact.email ?? null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się pobrać danych kontaktowych';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dane kontaktowe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!contactData ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Zaloguj się, aby zobaczyć dane kontaktowe autora ogłoszenia.
            </p>
            <Button
              onClick={handleRevealContact}
              disabled={isLoading}
              className="w-full"
              aria-label="Pokaż dane kontaktowe"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Ładowanie...
                </>
              ) : (
                <>
                  <Phone className="mr-2 size-4" />
                  Pokaż numer telefonu
                </>
              )}
            </Button>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {contactData.phone_number && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Numer telefonu:</p>
                <a
                  href={`tel:${contactData.phone_number}`}
                  className="flex items-center gap-2 text-lg font-semibold text-primary hover:underline"
                >
                  <Phone className="size-4" />
                  {contactData.phone_number}
                </a>
              </div>
            )}
            {contactData.email && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Adres e-mail:</p>
                <a
                  href={`mailto:${contactData.email}`}
                  className="flex items-center gap-2 text-lg font-semibold text-primary hover:underline"
                >
                  <Mail className="size-4" />
                  {contactData.email}
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

