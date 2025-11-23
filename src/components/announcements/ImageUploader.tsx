import { useCallback, useEffect, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { supabaseClient } from '@/db/supabase.client';
import { StorageService } from '@/lib/services/storage.service';

interface ImageUploaderProps {
  value?: string; // Current image URL (for edit mode)
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  userId: string;
  announcementId?: string; // For edit mode
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  onError,
  userId,
  announcementId,
  disabled = false,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update preview when value changes (for edit mode)
  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const handleFile = useCallback(
    async (file: File) => {
      if (disabled || isUploading) return;

      setError(null);
      setIsUploading(true);

      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Plik musi być obrazem');
        }

        // Compress image before upload
        const compressedFile = await StorageService.compressImage(file);

        // Upload to Supabase Storage
        const imageUrl = await StorageService.uploadImage(
          compressedFile,
          userId,
          supabaseClient,
          announcementId
        );

        // Create preview
        const previewUrl = URL.createObjectURL(compressedFile);
        setPreview(previewUrl);
        onChange(imageUrl);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Błąd podczas przesyłania pliku';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [disabled, isUploading, userId, announcementId, onChange, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, isUploading, handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    onChange('');
    setError(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <img
              src={preview}
              alt="Podgląd"
              className="h-full w-full object-cover"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-primary/50'}
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileInput}
            disabled={disabled || isUploading}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Wybierz zdjęcie"
          />
          {isUploading ? (
            <>
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Przesyłanie...</p>
            </>
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="mb-1 text-sm font-medium">
                Kliknij lub przeciągnij zdjęcie tutaj
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG (max. 5MB)
              </p>
            </>
          )}
        </div>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

