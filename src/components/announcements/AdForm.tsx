import { useEffect, useState } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import type { Database } from '@/db/database.types';
import { getOrCreateSupabaseClient } from '@/lib/supabase-client-factory';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ImageUploader } from './ImageUploader';
import { LocationCascader } from './LocationCascader';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
} from '@/lib/validators/announcements';
import type { AnnouncementDto } from '@/types';

interface AdFormProps {
  mode: 'create' | 'edit';
  initialData?: AnnouncementDto;
  userId?: string; // Optional - will be fetched client-side if not provided
  initialUserId?: string; // Initial user ID from server (may be null if not authenticated)
  supabaseUrl?: string;
  supabaseKey?: string;
  onSuccess?: (announcementId: string) => void;
}

type FormValues = CreateAnnouncementInput;

const STEPS = [
  { id: 1, title: 'Podstawowe informacje' },
  { id: 2, title: 'Lokalizacja i zdjęcie' },
  { id: 3, title: 'Szczegóły zwierzęcia' },
];

export function AdForm({
  mode,
  initialData,
  userId: propUserId,
  initialUserId,
  supabaseUrl,
  supabaseKey,
  onSuccess,
}: AdFormProps) {
  const [userId, setUserId] = useState<string | null>(propUserId || initialUserId || null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(!propUserId && !initialUserId);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Create Supabase client for auth checking (using singleton to prevent multiple instances)
  const supabaseClient = React.useMemo(() => {
    return getOrCreateSupabaseClient(supabaseUrl, supabaseKey);
  }, [supabaseUrl, supabaseKey]);

  // Check authentication on mount if userId not provided
  useEffect(() => {
    if (!supabaseClient || userId) return;

    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error || !session?.user) {
          // Not authenticated - redirect to login
          const returnUrl = window.location.pathname + window.location.search;
          window.location.href = `/logowanie?redirectTo=${encodeURIComponent(returnUrl)}`;
          return;
        }

        setUserId(session.user.id);
      } catch (error) {
        console.error('Error checking auth:', error);
        const returnUrl = window.location.pathname + window.location.search;
        window.location.href = `/logowanie?redirectTo=${encodeURIComponent(returnUrl)}`;
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [supabaseClient, userId]);

  const schema = mode === 'create' ? createAnnouncementSchema : updateAnnouncementSchema;

  // Read type from URL query parameter if available (for create mode)
  const getInitialType = (): 'lost' | 'found' => {
    if (initialData) {
      return initialData.type;
    }
    if (mode === 'create' && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const typeParam = searchParams.get('type');
      if (typeParam === 'lost' || typeParam === 'found') {
        console.log('Setting initial type from URL:', typeParam);
        return typeParam;
      }
    }
    return 'lost';
  };

  // Schema union type causes type mismatch, but works correctly at runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({
    // @ts-expect-error - Conditional schema type causes resolver type mismatch, but works at runtime
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          type: initialData.type,
          species: initialData.species,
          voivodeship: initialData.voivodeship,
          poviat: initialData.poviat,
          event_date: initialData.event_date,
          image_url: initialData.image_url,
          location_details: initialData.location_details || undefined,
          size: initialData.size || undefined,
          color: initialData.color || undefined,
          age_range: initialData.age_range || undefined,
          description: initialData.description || undefined,
          special_marks: initialData.special_marks || undefined,
          is_aggressive: initialData.is_aggressive,
          is_fearful: initialData.is_fearful,
        }
      : {
          type: getInitialType(),
          species: 'dog',
          is_aggressive: false,
          is_fearful: false,
        },
    mode: 'onBlur',
  });

  const isDirty = form.formState.isDirty;

  // Prevent data loss on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSubmitting]);

  const nextStep = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent form submission
    e?.preventDefault();
    e?.stopPropagation();
    
    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(currentStep);
    console.log('Validating step', currentStep, 'fields:', fieldsToValidate);
    
    // Log current form values for debugging
    const formValues = form.getValues();
    console.log('Current form values:', {
      voivodeship: formValues.voivodeship,
      poviat: formValues.poviat,
      image_url: formValues.image_url,
    });
    
    // If no fields to validate (step 3), skip validation
    let isValid = true;
    if (fieldsToValidate.length > 0) {
      isValid = await form.trigger(fieldsToValidate as any);
      console.log('Validation result:', isValid);
    } else {
      console.log('Step 3 - no fields to validate, skipping validation');
    }
    
    if (!isValid) {
      // Log validation errors
      const errors = form.formState.errors;
      console.log('Validation errors:', errors);
      
      // Show first error message
      const firstErrorField = fieldsToValidate.find(field => errors[field as keyof typeof errors]);
      if (firstErrorField) {
        const error = errors[firstErrorField as keyof typeof errors];
        if (error?.message) {
          setApiError(`Błąd walidacji: ${error.message}`);
        } else {
          setApiError(`Błąd walidacji pola: ${firstErrorField}`);
        }
      } else {
        setApiError('Wypełnij wszystkie wymagane pola');
      }
      return; // Don't proceed if validation failed
    }
    
    setApiError(null);

    // Move to next step if validation passed and not on last step
    if (currentStep < STEPS.length) {
      console.log('Moving from step', currentStep, 'to step', currentStep + 1);
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Already on last step, cannot go further');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setApiError(null);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const url =
        mode === 'create'
          ? '/api/announcements'
          : `/api/announcements/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      if (!supabaseClient) {
        throw new Error('Brak konfiguracji Supabase. Ustaw zmienne środowiskowe.');
      }

      // Get current session
      let {
        data: { session },
        error: sessionError,
      } = await supabaseClient.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Błąd podczas pobierania sesji. Zaloguj się ponownie.');
      }

      if (!session) {
        throw new Error('Brak sesji. Zaloguj się ponownie.');
      }

      // Check if token is expired and refresh if needed
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now + 60) {
        // Token expires in less than 60 seconds, refresh it
        console.log('Token expires soon, refreshing...');
        const { data: refreshData, error: refreshError } = await supabaseClient.auth.refreshSession();
        
        if (refreshError) {
          console.error('Refresh error:', refreshError);
          throw new Error('Nie udało się odświeżyć sesji. Zaloguj się ponownie.');
        }
        
        if (refreshData?.session) {
          session = refreshData.session;
        }
      }

      if (!session.access_token) {
        throw new Error('Brak tokenu dostępu. Zaloguj się ponownie.');
      }

      console.log('Sending request to:', url);
      console.log('Form data type:', data.type);
      console.log('Token length:', session.access_token.length);
      console.log('Token preview:', session.access_token.substring(0, 20) + '...');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Błąd ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      const announcementId = result.data?.id || initialData?.id;

      if (announcementId && onSuccess) {
        onSuccess(announcementId);
      } else {
        // Redirect to announcement page or account page
        window.location.href = announcementId
          ? `/ogloszenia/${announcementId}`
          : '/moje-konto';
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania ogłoszenia';
      setApiError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Don't render form if no userId
  if (!userId) {
    return null;
  }

  if (!supabaseClient) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Brak konfiguracji Supabase</CardTitle>
          <CardDescription>
            Uzupełnij zmienne środowiskowe `SUPABASE_URL` oraz `SUPABASE_KEY`, aby korzystać z
            formularza.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Dodaj nowe ogłoszenie' : 'Edytuj ogłoszenie'}
        </CardTitle>
        <CardDescription>
          Wypełnij formularz, aby {mode === 'create' ? 'dodać' : 'zaktualizować'} ogłoszenie
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                      ${
                        currentStep > step.id
                          ? 'bg-primary border-primary text-primary-foreground'
                          : currentStep === step.id
                            ? 'border-primary text-primary'
                            : 'border-muted-foreground/25 text-muted-foreground'
                      }
                    `}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <p
                    className={`mt-2 text-xs text-center ${
                      currentStep === step.id
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      h-0.5 flex-1 mx-2 transition-colors
                      ${currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/25'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form 
            // @ts-expect-error - Conditional schema type causes submit handler type mismatch, but works at runtime
            onSubmit={form.handleSubmit(onSubmit)} 
            onKeyDown={(e) => {
              // Prevent form submission on Enter key when not on last step
              if (e.key === 'Enter' && currentStep < STEPS.length) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            className="space-y-6"
          >
            {apiError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Błąd</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* @ts-ignore */}
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Typ ogłoszenia <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="lost" id="lost" />
                            <label htmlFor="lost" className="cursor-pointer">
                              Zgubione
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="found" id="found" />
                            <label htmlFor="found" className="cursor-pointer">
                              Znalezione
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tytuł <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="np. Zgubiony pies rasy labrador"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>Krótki, opisowy tytuł ogłoszenia</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* @ts-ignore - Conditional schema type causes control type mismatch, but works at runtime */}
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Gatunek <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz gatunek" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dog">Pies</SelectItem>
                          <SelectItem value="cat">Kot</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* @ts-ignore - Conditional schema type causes control type mismatch, but works at runtime */}
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="event_date"
                  render={({ field }) => {
                    // Get today's date in YYYY-MM-DD format
                    const today = new Date().toISOString().split('T')[0];
                    return (
                      <FormItem>
                        <FormLabel>
                          Data zdarzenia <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value ?? ''} 
                            max={today}
                          />
                        </FormControl>
                        <FormDescription>
                          Data, kiedy zwierzę zostało zgubione/znalezione
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            )}

            {/* Step 2: Location and Image */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {/* @ts-ignore - Conditional schema type causes control type mismatch, but works at runtime */}
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="voivodeship"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <LocationCascader
                        voivodeship={field.value}
                        poviat={form.watch('poviat')}
                        onVoivodeshipChange={field.onChange}
                        onPoviatChange={(value) => form.setValue('poviat', value)}
                        voivodeshipError={fieldState.error?.message}
                        poviatError={form.formState.errors.poviat?.message}
                        disabled={isSubmitting}
                      />
                    </FormItem>
                  )}
                />

                {/* @ts-ignore - Conditional schema type causes control type mismatch, but works at runtime */}
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="location_details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Szczegóły lokalizacji</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="np. Park Oliwski, przy stawie"
                          rows={3}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Opcjonalne dodatkowe informacje o miejscu zdarzenia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* @ts-ignore - Conditional schema type causes control type mismatch, but works at runtime */}
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="image_url"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Zdjęcie <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <ImageUploader
                          value={field.value}
                          onChange={field.onChange}
                          onError={(error) => {
                            form.setError('image_url', { message: error });
                          }}
                          userId={userId}
                          announcementId={initialData?.id}
                          disabled={isSubmitting}
                          supabaseClient={supabaseClient}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <p className="text-sm text-destructive" role="alert">
                          {fieldState.error.message}
                        </p>
                      )}
                      <FormDescription>
                        Dodaj zdjęcie zwierzęcia (JPG, PNG, max. 5MB)
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Animal Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* @ts-ignore - Conditional schema type causes control type mismatch, but works at runtime */}
                  <FormField
                    // @ts-ignore
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rozmiar</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz rozmiar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small">Mały</SelectItem>
                            <SelectItem value="medium">Średni</SelectItem>
                            <SelectItem value="large">Duży</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                {/* @ts-ignore - Conditional schema type causes control type mismatch, but works at runtime */}
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="age_range"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Przedział wiekowy</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz wiek" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="young">Młody</SelectItem>
                            <SelectItem value="adult">Dorosły</SelectItem>
                            <SelectItem value="senior">Starszy</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                  {/* @ts-ignore - Conditional schema type causes control type mismatch, but works at runtime */}
                  {/* @ts-ignore */}
                  <FormField
                    // @ts-ignore
                    control={form.control}
                    name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kolor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="np. czarny, biały"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Szczegółowy opis zwierzęcia..."
                          rows={5}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                    {/* @ts-ignore - Conditional schema type causes control type mismatch, but works at runtime */}
                    <FormField
                      // @ts-ignore
                      control={form.control}
                      name="special_marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Znaki szczególne</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="np. obroża, chip, blizny..."
                          rows={3}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Temperament</FormLabel>
                  <div className="space-y-2">
                {/* @ts-ignore - Conditional schema type causes control type mismatch, but works at runtime */}
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="is_aggressive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer">
                              Zwierzę może być agresywne
                            </FormLabel>
                            <FormDescription>
                              Zaznacz, jeśli zwierzę może wykazywać agresywne zachowania
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                {/* @ts-ignore - Conditional schema type causes control type mismatch, but works at runtime */}
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="is_fearful"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer">
                              Zwierzę jest lękliwe
                            </FormLabel>
                            <FormDescription>
                              Zaznacz, jeśli zwierzę może być lękliwe i uciekać
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Wstecz
              </Button>

              {currentStep < STEPS.length ? (
                <Button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextStep(e);
                  }} 
                  disabled={isSubmitting}
                >
                  Dalej
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : mode === 'create' ? (
                    'Opublikuj ogłoszenie'
                  ) : (
                    'Zapisz zmiany'
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function getFieldsForStep(step: number): (keyof FormValues)[] {
  switch (step) {
    case 1:
      return ['type', 'title', 'species', 'event_date'];
    case 2:
      return ['voivodeship', 'poviat', 'image_url'];
    case 3:
      return [];
    default:
      return [];
  }
}

