import { useEffect, useState } from 'react';
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';
import { AccountTabs } from './AccountTabs';

interface DashboardGuardProps {
  supabaseUrl: string;
  supabaseKey: string;
}

export function DashboardGuard({ supabaseUrl, supabaseKey }: DashboardGuardProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const client = getOrCreateSupabaseClient(supabaseUrl, supabaseKey);
        if (!client) {
          throw new Error('Missing Supabase configuration');
        }

        const { data: { session }, error } = await client.auth.getSession();
        
        if (error || !session?.user) {
          // Redirect to login with redirectTo parameter
          const redirectTo = encodeURIComponent(window.location.pathname);
          window.location.href = `/logowanie?redirectTo=${redirectTo}`;
          return;
        }

        setUserId(session.user.id);
      } catch (error) {
        console.error('Auth check error:', error);
        const redirectTo = encodeURIComponent(window.location.pathname);
        window.location.href = `/logowanie?redirectTo=${redirectTo}`;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const client = getOrCreateSupabaseClient(supabaseUrl, supabaseKey);
    if (client) {
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
          const redirectTo = encodeURIComponent(window.location.pathname);
          window.location.href = `/logowanie?redirectTo=${redirectTo}`;
        } else {
          setUserId(session.user.id);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [supabaseUrl, supabaseKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return <AccountTabs userId={userId} supabaseUrl={supabaseUrl} supabaseKey={supabaseKey} />;
}

