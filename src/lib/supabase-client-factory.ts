import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton pattern to prevent multiple GoTrueClient instances
let clientInstance: SupabaseClient<Database> | null = null;
let clientUrl: string | null = null;
let clientKey: string | null = null;

/**
 * Creates or returns an existing Supabase client instance.
 * This prevents multiple GoTrueClient instances in the same browser context.
 */
export function getSupabaseClient(
  url: string,
  key: string
): SupabaseClient<Database> {
  // Return existing instance if URL and key match
  if (clientInstance && clientUrl === url && clientKey === key) {
    return clientInstance;
  }

  // Create new instance if it doesn't exist or config changed
  clientInstance = createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  clientUrl = url;
  clientKey = key;

  return clientInstance;
}

/**
 * Gets Supabase config from window object (injected by Astro pages)
 */
export function getSupabaseConfigFromWindow(): { url: string; key: string } | null {
  if (typeof window === 'undefined') return null;
  
  const url = (window as any).__SUPABASE_URL__;
  const key = (window as any).__SUPABASE_KEY__;
  
  if (!url || !key) return null;
  
  return { url, key };
}

/**
 * Gets or creates a Supabase client using props or window config
 */
export function getOrCreateSupabaseClient(
  supabaseUrl?: string,
  supabaseKey?: string
): SupabaseClient<Database> | null {
  // Try props first
  if (supabaseUrl && supabaseKey) {
    return getSupabaseClient(supabaseUrl, supabaseKey);
  }

  // Fall back to window config
  const config = getSupabaseConfigFromWindow();
  if (config) {
    return getSupabaseClient(config.url, config.key);
  }

  return null;
}

