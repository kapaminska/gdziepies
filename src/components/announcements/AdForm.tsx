import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

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
  userId: string;
  onSuccess?: (announcementId: string) => void;
}

type FormValues = CreateAnnouncementInput;

const STEPS = [
  { id: 1, title: 'Podstawowe informacje' },
  { id: 2, title: 'Lokalizacja i zdjęcie' },
  { id: 3, title: 'Szczegóły zwierzęcia' },
];

export function AdForm({ mode, initialData, userId, onSuccess }: AdFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const schema = mode === 'create' ? createAnnouncementSchema : updateAnnouncementSchema;

  const form = useForm<FormValues>({
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
          type: 'lost',
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

  const nextStep = async () => {
    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      setApiError(null);
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

      // Get auth token
      const {
        data: { session },
      } = await import('@/db/supabase.client').then((m) => m.supabaseClient.auth.getSession());

      if (!session) {
        throw new Error('Brak sesji. Zaloguj się ponownie.');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FormField
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
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tytuł <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="np. Zgubiony pies rasy labrador" {...field} />
                      </FormControl>
                      <FormDescription>Krótki, opisowy tytuł ogłoszenia</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
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

                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Data zdarzenia <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Data, kiedy zwierzę zostało zgubione/znalezione
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Location and Image */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField
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

                <FormField
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
                        />
                      </FormControl>
                      <FormDescription>
                        Opcjonalne dodatkowe informacje o miejscu zdarzenia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
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
                  <FormField
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

                  <FormField
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

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kolor</FormLabel>
                      <FormControl>
                        <Input placeholder="np. czarny, biały" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Temperament</FormLabel>
                  <div className="space-y-2">
                    <FormField
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
                    <FormField
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
                <Button type="button" onClick={nextStep} disabled={isSubmitting}>
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

