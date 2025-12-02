import { useEffect, useState } from 'react';
import { Loader2, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { SupabaseClient } from '@supabase/supabase-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarUploader } from './AvatarUploader';
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';
import type { Database, MyProfileDto } from '@/db/database.types';

interface ProfileFormProps {
  userId: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export function ProfileForm({ userId, supabaseUrl, supabaseKey }: ProfileFormProps) {
  const [profile, setProfile] = useState<MyProfileDto | null>(null);
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabaseClient = getOrCreateSupabaseClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    if (!supabaseClient) {
      setError('Brak konfiguracji Supabase');
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user email from session
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user?.email) {
          setEmail(session.user.email);
        }

        // Get profile from database
        const { data, error: profileError } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          throw new Error(profileError.message || 'Nie udało się pobrać profilu');
        }

        if (data) {
          setProfile(data);
          setPhoneNumber(data.phone_number || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Nie udało się pobrać profilu';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, supabaseClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabaseClient) {
      toast.error('Brak konfiguracji Supabase');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Update profile
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          phone_number: phoneNumber || null,
          avatar_url: avatarUrl || null,
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error(updateError.message || 'Nie udało się zaktualizować profilu');
      }

      toast.success('Profil zaktualizowany pomyślnie');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się zaktualizować profilu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="rounded-lg border border-destructive p-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="avatar">Zdjęcie profilowe</Label>
          <div className="mt-2">
            {supabaseClient && (
              <AvatarUploader
                value={avatarUrl}
                onChange={setAvatarUrl}
                userId={userId}
                supabaseClient={supabaseClient}
                disabled={isSaving}
              />
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Adres e-mail</Label>
          <div className="mt-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                readOnly
                className="pl-9"
                aria-label="Adres e-mail (tylko do odczytu)"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Adres e-mail nie może być zmieniony
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="phone_number">Numer telefonu</Label>
          <div className="mt-2">
            <Input
              id="phone_number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+48123456789"
              disabled={isSaving}
              aria-label="Numer telefonu"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Numer telefonu będzie widoczny dla użytkowników przeglądających Twoje ogłoszenia
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive p-4">
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Zapisz zmiany
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

