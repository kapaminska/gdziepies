import { createClient } from '@supabase/supabase-js';

import type { Database } from '../db/database.types.ts';
import { getSupabaseConfig } from '@/lib/supabase-config';

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
