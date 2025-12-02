import { useCallback, useEffect, useState } from 'react';
import { Upload, X, Loader2, User } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StorageService } from '@/lib/services/storage.service';
import type { Database } from '@/db/database.types';

interface AvatarUploaderProps {
  value?: string; // Current avatar URL
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  userId: string;
  disabled?: boolean;
  supabaseClient: SupabaseClient<Database>;
}

export function AvatarUploader({
  value,
  onChange,
  onError,
  userId,
  disabled = false,
  supabaseClient,
}: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update preview when value changes
  useEffect(() => {
    if (value) {
      setPreview(value);
    } else {
      setPreview(null);
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

        // Compress image before upload (smaller size for avatars)
        const compressedFile = await StorageService.compressImage(file, 400, 400, 0.85);

        // Upload to Supabase Storage
        const avatarUrl = await StorageService.uploadAvatar(compressedFile, userId, supabaseClient);

        // Create preview
        const previewUrl = URL.createObjectURL(compressedFile);
        setPreview(previewUrl);
        onChange(avatarUrl);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Błąd podczas przesyłania avatara';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [disabled, isUploading, userId, supabaseClient, onChange, onError]
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
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        {preview ? (
          <Avatar className="h-24 w-24">
            <AvatarImage src={preview} alt="Zdjęcie profilowe" />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-24 w-24">
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 space-y-2">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors
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
              aria-label="Wybierz zdjęcie profilowe"
            />
            {isUploading ? (
              <>
                <Loader2 className="mb-2 h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Przesyłanie...</p>
              </>
            ) : (
              <>
                <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                <p className="mb-1 text-xs font-medium">
                  Kliknij lub przeciągnij zdjęcie tutaj
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG (max. 2MB)
                </p>
              </>
            )}
          </div>
          {preview && !disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Usuń zdjęcie
            </Button>
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}



