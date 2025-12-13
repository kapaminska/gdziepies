import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '../db/database.types.ts';
import { getSupabaseConfig } from '@/lib/supabase-config';

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

export const onRequest = defineMiddleware(async (context, next) => {
  // Block requests to old SvelteKit paths that don't exist in Astro
  // This is a server-side fallback - client-side interceptors should catch most requests
  const url = new URL(context.request.url);
  const blockedPaths = [
    '/manifest.json',
    '/api/config',
    '/_app/version.json',
  ];
  
  // Block exact matches and paths starting with /_app/immutable/
  if (
    blockedPaths.some(path => url.pathname === path) || 
    url.pathname.startsWith('/_app/immutable/') ||
    url.pathname.startsWith('/_app/')
  ) {
    return new Response('Not Found', { 
      status: 404,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
  
  // Get cookies from request
  const cookieHeader = context.request.headers.get('cookie') || '';
  
  // Create a new Supabase client for this request
  const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Don't persist session in middleware
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {},
    },
  });

  // Check for Authorization header first (for API calls)
  const authHeader = context.request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token) {
      // Set the auth token for database queries (RLS)
      await supabaseClient.auth.setSession({
        access_token: token,
        refresh_token: '',
      } as any);
    }
  } else if (cookieHeader) {
    // Try to extract access token from Supabase auth cookie
    // Supabase stores session in cookies like: sb-<project-ref>-auth-token
    // The cookie value can be base64-encoded JSON or plain JSON
    const cookieMatch = cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/);
    
    if (cookieMatch) {
      try {
        let cookieValue = cookieMatch[1];
        
        // Handle base64-encoded cookies (format: "base64-...")
        if (cookieValue.startsWith('base64-')) {
          // Remove "base64-" prefix and decode
          const base64Value = cookieValue.substring(7);
          try {
            // Decode base64 to string
            const decoded = Buffer.from(base64Value, 'base64').toString('utf-8');
            cookieValue = decoded;
          } catch (base64Error) {
            if (import.meta.env.DEV) {
              console.error('Failed to decode base64 cookie:', base64Error);
            }
            throw base64Error;
          }
        }
        
        // Handle URL encoding
        try {
          cookieValue = decodeURIComponent(cookieValue);
        } catch {
          // If decode fails, use as-is
        }
        
        // Parse JSON
        const sessionData = JSON.parse(cookieValue);
        
        if (sessionData?.access_token) {
          // Set the session from cookie
          await supabaseClient.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token || '',
          } as any);
        }
      } catch (error) {
        // If cookie parsing fails, try to find the session cookie differently
        // Supabase might store it in a different cookie name
        if (import.meta.env.DEV) {
          console.error('Failed to parse Supabase auth cookie:', error);
        }
        
        // Try to find all Supabase cookies and check for session data
        const allSupabaseCookies = cookieHeader.match(/sb-[^-]+-[^=]+=([^;]+)/g);
        if (allSupabaseCookies) {
          for (const cookie of allSupabaseCookies) {
            try {
              const [, value] = cookie.split('=');
              let decodedValue = value;
              
              // Try base64 decode
              if (value.startsWith('base64-')) {
                try {
                  decodedValue = Buffer.from(value.substring(7), 'base64').toString('utf-8');
                } catch {
                  continue;
                }
              }
              
              // Try URL decode
              try {
                decodedValue = decodeURIComponent(decodedValue);
              } catch {
                // Continue with current value
              }
              
              // Try to parse as JSON
              const parsed = JSON.parse(decodedValue);
              if (parsed?.access_token) {
                await supabaseClient.auth.setSession({
                  access_token: parsed.access_token,
                  refresh_token: parsed.refresh_token || '',
                } as any);
                break;
              }
            } catch {
              // Continue to next cookie
              continue;
            }
          }
        }
      }
    }
  }

  // Try to get session - this will work if token was set from cookie/header
  // If no session is available, the client will still work but getUser() will return null
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      // No session available - this is fine, pages will handle auth client-side
      if (import.meta.env.DEV) {
        console.log('No session found in middleware - client-side auth will be used');
      }
    }
  } catch (error) {
    // If getSession fails, continue anyway - pages will handle auth
    if (import.meta.env.DEV) {
      console.error('Error getting session in middleware:', error);
    }
  }

  context.locals.supabase = supabaseClient;
  return next();
});
