import { useState } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Database } from '@/db/database.types';
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from './auth-schema';

export interface AuthFormProps {
  mode: 'login' | 'register';
  supabaseUrl?: string;
  supabaseKey?: string;
  redirectTo?: string; // URL to redirect to after successful login/register
}

const mapSupabaseError = (error: { message?: string } | null): string => {
  if (!error) {
    return 'Wystąpił nieoczekiwany błąd';
  }

  const message = error.message?.toLowerCase() || '';

  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Nieprawidłowy adres e-mail lub hasło';
  }

  if (message.includes('user already registered') || message.includes('already registered')) {
    return 'Użytkownik o tym adresie e-mail już istnieje';
  }

  if (message.includes('email not confirmed')) {
    return 'Adres e-mail nie został potwierdzony. Sprawdź swoją skrzynkę pocztową.';
  }

  if (message.includes('email not found') || message.includes('user not found')) {
    return 'Nie znaleziono użytkownika o podanym adresie e-mail';
  }

  if (message.includes('token expired') || message.includes('expired')) {
    return 'Link resetujący hasło wygasł. Wyślij nowy link.';
  }

  if (message.includes('invalid token') || (message.includes('invalid') && message.includes('token'))) {
    return 'Nieprawidłowy link resetujący hasło.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Wystąpił problem z połączeniem. Spróbuj ponownie później.';
  }

  return error.message || 'Wystąpił błąd podczas uwierzytelniania';
};

export function AuthForm({ mode, supabaseUrl, supabaseKey, redirectTo }: AuthFormProps) {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create Supabase client for browser-side use (using singleton to prevent multiple instances)
  const client = React.useMemo(() => {
    const clientInstance = getOrCreateSupabaseClient(supabaseUrl, supabaseKey);
    
    if (!clientInstance) {
      console.error('Missing Supabase configuration:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
      throw new Error(
        'Missing Supabase configuration. Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_KEY in your .env file, or pass them as props.'
      );
    }
    
    return clientInstance;
  }, [supabaseUrl, supabaseKey]);

  const schema = mode === 'login' ? loginSchema : registerSchema;
  const form = useForm<LoginFormValues | RegisterFormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues:
      mode === 'login'
        ? {
            email: '',
            password: '',
          }
        : {
            email: '',
            password: '',
            confirmPassword: '',
          },
  });

  const onSubmit = async (data: LoginFormValues | RegisterFormValues) => {
    setIsLoading(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      let session;
      
      if (mode === 'login') {
        const { email, password } = data as LoginFormValues;
        const { data: authData, error } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setGlobalError(mapSupabaseError(error));
          setIsLoading(false);
          return;
        }

        if (!authData.user || !authData.session) {
          setGlobalError('Nie udało się zalogować. Spróbuj ponownie.');
          setIsLoading(false);
          return;
        }

        session = authData.session;
      } else {
        const { email, password } = data as RegisterFormValues;
        const { data: authData, error } = await client.auth.signUp({
          email,
          password,
        });

        if (error) {
          setGlobalError(mapSupabaseError(error));
          setIsLoading(false);
          return;
        }

        if (!authData.user) {
          setGlobalError('Nie udało się zarejestrować. Spróbuj ponownie.');
          setIsLoading(false);
          return;
        }

        // Check if email confirmation is required
        // If user doesn't have email_confirmed_at and no session, they need to confirm email
        const needsEmailConfirmation = !authData.user.email_confirmed_at && !authData.session;
        
        if (needsEmailConfirmation) {
          // User needs to confirm email - show success message
          setIsLoading(false);
          setSuccessMessage(
            'Rejestracja zakończona pomyślnie! Sprawdź swoją skrzynkę pocztową i kliknij w link weryfikacyjny, aby potwierdzić adres e-mail.'
          );
          // Reset form
          form.reset();
          return;
        }

        // For signUp, session might not be immediately available
        // Wait a moment for session to be established
        await new Promise((resolve) => setTimeout(resolve, 300));
        const { data: sessionData } = await client.auth.getSession();
        session = sessionData.session;
      }

      // Success - redirect based on context
      // Supabase saves session to localStorage automatically
      setIsLoading(false);
      
      // Redirect to specified URL or default to home page
      // Decode redirectTo in case it's URL encoded
      let redirectUrl = redirectTo || '/';
      try {
        redirectUrl = decodeURIComponent(redirectUrl);
      } catch (e) {
        // If decoding fails, use original value
        console.warn('Failed to decode redirectTo:', redirectUrl);
      }
      
      // Small delay to ensure session is saved
      await new Promise((resolve) => setTimeout(resolve, 100));
      window.location.href = redirectUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Wystąpił problem z połączeniem. Spróbuj ponownie później.';
      setGlobalError(errorMessage);
      setIsLoading(false);
    }
  };

  const isSubmitting = form.formState.isSubmitting || isLoading;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Logowanie' : 'Rejestracja'}</CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Zaloguj się, aby uzyskać dostęp do pełnej funkcjonalności'
            : 'Utwórz nowe konto, aby dodawać ogłoszenia i komentować'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {globalError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Błąd</AlertTitle>
                <AlertDescription>{globalError}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200">Sukces</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Adres e-mail <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="twoj@email.pl"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hasło <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={mode === 'login' ? 'Wprowadź hasło' : 'Minimum 6 znaków'}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'register' && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Potwierdź hasło <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Powtórz hasło"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'login' ? 'Logowanie...' : 'Rejestracja...'}
                </>
              ) : mode === 'login' ? (
                'Zaloguj się'
              ) : (
                'Zarejestruj się'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {mode === 'login' ? (
          <>
            <p className="text-sm text-muted-foreground text-center">
              Nie masz konta?{' '}
              <a href="/rejestracja" className="text-primary hover:underline">
                Zarejestruj się
              </a>
            </p>
            <p className="text-sm text-muted-foreground text-center">
              <a href="/odzyskiwanie-hasla" className="text-primary hover:underline">
                Zapomniałeś hasła?
              </a>
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Masz już konto?{' '}
            <a href="/logowanie" className="text-primary hover:underline">
              Zaloguj się
            </a>
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

