import { useState, useEffect } from 'react';
import * as React from 'react';
import { LogIn, LogOut, User, Menu } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthForm } from './auth/AuthForm';

interface HeaderProps {
  supabaseUrl: string;
  supabaseKey: string;
  initialUser?: SupabaseUser | null;
}

export function Header({ supabaseUrl, supabaseKey, initialUser }: HeaderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(initialUser || null);
  const [isLoginDrawerOpen, setIsLoginDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      if (session?.user) {
        setIsLoginDrawerOpen(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  const handleLogout = async () => {
    setIsLoading(true);
    await client.auth.signOut();
    setUser(null);
    setIsLoading(false);
    window.location.href = '/';
  };

  const getUserInitials = (email: string | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">GdziePies</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/ogloszenia" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Ogłoszenia
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <a href="/dodaj-ogloszenie">
                <Button size="sm">Dodaj ogłoszenie</Button>
              </a>
              <a href="/moje-konto">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Moje konto
                </Button>
              </a>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials(user.email)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-sm text-left">
                      <div className="font-medium">{user.email}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/moje-konto" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Panel użytkownika
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Wyloguj się
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Drawer open={isLoginDrawerOpen} onOpenChange={setIsLoginDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Zaloguj się
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Logowanie</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <AuthForm
                    mode="login"
                    supabaseUrl={supabaseUrl}
                    supabaseKey={supabaseKey}
                    redirectTo="/"
                  />
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </header>
  );
}

