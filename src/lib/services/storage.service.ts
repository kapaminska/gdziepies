import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../db/database.types';

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Service for handling file uploads to Supabase Storage.
 */
export class StorageService {
  private static readonly BUCKET_NAME = 'announcements';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

  /**
   * Uploads an image file to Supabase Storage.
   * @param file - The image file to upload
   * @param userId - The ID of the user uploading the file
   * @param announcementId - Optional announcement ID (for edit mode). If not provided, uses 'temp' folder
   * @param supabaseClient - Supabase client instance
   * @returns The public URL of the uploaded image
   * @throws Error if upload fails
   */
  static async uploadImage(
    file: File,
    userId: string,
    supabaseClient: SupabaseClientType,
    announcementId?: string
  ): Promise<string> {
    // Validate file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error('Nieprawidłowy typ pliku. Dozwolone formaty: JPG, PNG');
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('Plik jest zbyt duży. Maksymalny rozmiar: 5MB');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Determine file path
    const folder = announcementId ? announcementId : 'temp';
    const filePath = `${userId}/${folder}/${fileName}`;

    // Upload file
    const { data, error } = await supabaseClient.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Błąd podczas przesyłania pliku: ${error.message}`);
    }

    if (!data) {
      throw new Error('Nie udało się przesłać pliku');
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from(this.BUCKET_NAME).getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Nie udało się pobrać publicznego URL pliku');
    }

    return publicUrl;
  }

  /**
   * Deletes an image file from Supabase Storage.
   * @param filePath - The path to the file to delete (relative to bucket)
   * @param supabaseClient - Supabase client instance
   * @throws Error if deletion fails
   */
  static async deleteImage(
    filePath: string,
    supabaseClient: SupabaseClientType
  ): Promise<void> {
    const { error } = await supabaseClient.storage.from(this.BUCKET_NAME).remove([filePath]);

    if (error) {
      throw new Error(`Błąd podczas usuwania pliku: ${error.message}`);
    }
  }

  /**
   * Compresses an image file on the client side before upload.
   * @param file - The image file to compress
   * @param maxWidth - Maximum width in pixels (default: 1920)
   * @param maxHeight - Maximum height in pixels (default: 1920)
   * @param quality - JPEG quality (0-1, default: 0.8)
   * @returns A Promise resolving to a compressed File
   */
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1920,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Nie udało się utworzyć kontekstu canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Nie udało się skompresować obrazu'));
                return;
              }

              // Create new File from blob
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };

        img.onerror = () => {
          reject(new Error('Błąd podczas ładowania obrazu'));
        };

        if (event.target?.result) {
          img.src = event.target.result as string;
        } else {
          reject(new Error('Błąd podczas odczytu pliku'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Błąd podczas odczytu pliku'));
      };

      reader.readAsDataURL(file);
    });
  }
}

