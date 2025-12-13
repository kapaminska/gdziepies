import { useState, useEffect } from 'react';
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
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';
import {
  passwordResetConfirmSchema,
  type PasswordResetConfirmFormValues,
} from './auth-schema';

export interface PasswordResetConfirmFormProps {
  token?: string;
  type?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

const mapSupabaseError = (error: { message?: string } | null): string => {
  if (!error) {
    return 'Wystąpił nieoczekiwany błąd';
  }

  const message = error.message?.toLowerCase() || '';

  if (message.includes('token expired') || message.includes('expired')) {
    return 'Link resetujący hasło wygasł. Wyślij nowy link.';
  }

  if (message.includes('invalid token') || message.includes('invalid')) {
    return 'Nieprawidłowy link resetujący hasło.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Wystąpił problem z połączeniem. Spróbuj ponownie później.';
  }

  return error.message || 'Wystąpił błąd podczas resetowania hasła';
};

export function PasswordResetConfirmForm({
  token,
  type,
  supabaseUrl,
  supabaseKey,
}: PasswordResetConfirmFormProps) {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);

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

  const form = useForm<PasswordResetConfirmFormValues>({
    resolver: zodResolver(passwordResetConfirmSchema),
    mode: 'onBlur',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !type) {
        setGlobalError('Brakuje wymaganych parametrów w linku resetującym hasło.');
        setIsValidatingToken(false);
        return;
      }

      // Supabase automatically handles token validation when we call updateUser
      // But we can check if the URL has the right parameters
      if (type !== 'recovery') {
        setGlobalError('Nieprawidłowy typ linku resetującego hasło.');
        setIsValidatingToken(false);
        return;
      }

      setIsValidatingToken(false);
    };

    validateToken();
  }, [token, type]);

  const onSubmit = async (data: PasswordResetConfirmFormValues) => {
    setIsLoading(true);
    setGlobalError(null);

    try {
      const { password } = data;
      
      // Update user password - Supabase will validate the token automatically
      const { error } = await client.auth.updateUser({
        password,
      });

      if (error) {
        setGlobalError(mapSupabaseError(error));
        setIsLoading(false);
        return;
      }

      // Success - redirect to login page
      setIsLoading(false);
      setIsSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        window.location.href = '/logowanie';
      }, 2000);
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

  if (isValidatingToken) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Hasło zresetowane</CardTitle>
          <CardDescription>
            Twoje hasło zostało pomyślnie zmienione
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Sukces</AlertTitle>
            <AlertDescription>
              Twoje hasło zostało zmienione. Przekierowujemy Cię do strony logowania...
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = '/logowanie';
            }}
          >
            Przejdź do logowania
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Resetowanie hasła</CardTitle>
        <CardDescription>
          Wprowadź nowe hasło dla swojego konta
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nowe hasło <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Minimum 6 znaków"
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetowanie...
                </>
              ) : (
                'Zresetuj hasło'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground text-center">
          <a href="/logowanie" className="text-primary hover:underline">
            Powrót do logowania
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}




