import { useState, useEffect } from 'react';
import * as React from 'react';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';

import { Button } from '@/components/ui/button';

interface HeroButtonsProps {
  supabaseUrl: string;
  supabaseKey: string;
  initialUser?: User | null;
}

export function HeroButtons({ supabaseUrl, supabaseKey, initialUser }: HeroButtonsProps) {
  const [user, setUser] = useState<User | null>(initialUser || null);

  // Use singleton client to prevent multiple GoTrueClient instances
  const client = React.useMemo(() => {
    const clientInstance = getOrCreateSupabaseClient(supabaseUrl, supabaseKey);
    if (!clientInstance) {
      throw new Error('Missing Supabase configuration');
    }
    return clientInstance;
  }, [supabaseUrl, supabaseKey]);

  useEffect(() => {
    // Check initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  const handleButtonClick = (type: 'lost' | 'found') => {
    if (user) {
      // User is logged in - go directly to add announcement
      window.location.href = `/dodaj-ogloszenie?type=${type}`;
    } else {
      // User is not logged in - redirect to login with return URL
      const redirectTo = `/dodaj-ogloszenie?type=${type}`;
      window.location.href = `/logowanie?redirectTo=${encodeURIComponent(redirectTo)}`;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
      <Button
        size="lg"
        onClick={() => handleButtonClick('lost')}
        className="w-full sm:w-auto min-w-[200px] text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:ring-offset-2 transition-all shadow-lg hover:shadow-xl"
        aria-label="Zgubiłem zwierzę - dodaj ogłoszenie"
      >
        Zgubiłem
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => handleButtonClick('found')}
        className="w-full sm:w-auto min-w-[200px] text-base font-semibold border-2 border-foreground/20 hover:bg-accent hover:border-foreground/30 focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:ring-offset-2 transition-all"
        aria-label="Znalazłem zwierzę - dodaj ogłoszenie"
      >
        Znalazłem
      </Button>
    </div>
  );
}

