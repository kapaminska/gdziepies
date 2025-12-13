const resolveSupabaseUrl = () =>
  import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;

const resolveSupabaseKey = () =>
  import.meta.env.SUPABASE_KEY ?? import.meta.env.PUBLIC_SUPABASE_KEY;

export function getSupabaseConfig() {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseKey();

  if (!url || !key) {
    throw new Error('Supabase configuration is missing. Set the URL and anon key in env.');
  }

  return { url, key };
}

export const SUPABASE_URL = resolveSupabaseUrl();
export const SUPABASE_KEY = resolveSupabaseKey();
