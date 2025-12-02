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
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';
import {
  passwordResetSchema,
  type PasswordResetFormValues,
} from './auth-schema';

export interface PasswordResetFormProps {
  supabaseUrl?: string;
  supabaseKey?: string;
}

const mapSupabaseError = (error: { message?: string } | null): string => {
  if (!error) {
    return 'Wystąpił nieoczekiwany błąd';
  }

  const message = error.message?.toLowerCase() || '';

  if (message.includes('email not found') || message.includes('user not found')) {
    return 'Nie znaleziono użytkownika o podanym adresie e-mail';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Wystąpił problem z połączeniem. Spróbuj ponownie później.';
  }

  return error.message || 'Wystąpił błąd podczas wysyłania linku resetującego hasło';
};

export function PasswordResetForm({ supabaseUrl, supabaseKey }: PasswordResetFormProps) {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: PasswordResetFormValues) => {
    setIsLoading(true);
    setGlobalError(null);
    setIsSuccess(false);

    try {
      const { email } = data;
      
      // Get the current URL origin for redirectTo
      const redirectTo = `${window.location.origin}/reset-hasla`;
      
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        setGlobalError(mapSupabaseError(error));
        setIsLoading(false);
        return;
      }

      // Success - show success message
      setIsLoading(false);
      setIsSuccess(true);
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

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>E-mail wysłany</CardTitle>
          <CardDescription>
            Sprawdź swoją skrzynkę pocztową
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Sukces</AlertTitle>
            <AlertDescription>
              Jeśli podany adres e-mail istnieje w systemie, otrzymasz wiadomość z linkiem do resetowania hasła.
              Sprawdź swoją skrzynkę pocztową (również folder spam).
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSuccess(false);
              form.reset();
            }}
          >
            Wyślij ponownie
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            <a href="/logowanie" className="text-primary hover:underline">
              Powrót do logowania
            </a>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Odzyskiwanie hasła</CardTitle>
        <CardDescription>
          Wprowadź adres e-mail powiązany z Twoim kontem, a wyślemy Ci link do resetowania hasła
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                'Wyślij link resetujący'
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



