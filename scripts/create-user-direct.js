#!/usr/bin/env node
/**
 * Alternative script to create user directly in database
 * This bypasses the auth API and creates user + profile directly
 * 
 * Usage:
 *   npm run create:user:direct
 */

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

async function createUserDirect() {
  log('\n👤 Tworzenie użytkownika (bezpośrednio w bazie)...\n', 'blue');

  // Get email and password from command line args or use defaults
  const args = process.argv.slice(2);
  let email = 'test@example.com';
  let password = 'test123456';

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      email = args[i + 1];
      i++;
    } else if (args[i] === '--password' && args[i + 1]) {
      password = args[i + 1];
      i++;
    }
  }

  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    logError('Brak wymaganych zmiennych środowiskowych!');
    logError('Ustaw SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    logInfo(`Email: ${email}`);
    logInfo(`Hasło: ${password.length} znaków`);

    // Try method 1: Using Admin API with better error handling
    logInfo('\nPróba 1: Tworzenie przez Admin API...');
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: email.split('@')[0],
      },
    });

    if (authError) {
      logError(`Błąd Admin API: ${authError.message}`);
      
      // If user already exists, try to get it
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        logInfo('Użytkownik już istnieje, próba pobrania...');
        
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);
        
        if (existingUser) {
          logSuccess(`Znaleziono istniejącego użytkownika: ${existingUser.id}`);
          
          // Check profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', existingUser.id)
            .single();
          
          if (profile) {
            logSuccess('Profil istnieje!');
            log(`  Username: ${profile.username}`);
            return;
          } else {
            logInfo('Profil nie istnieje, tworzenie...');
            // Create profile manually
            const username = email.split('@')[0];
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: existingUser.id,
                username: username,
                created_at: new Date().toISOString(),
              });
            
            if (profileError) {
              logError(`Błąd tworzenia profilu: ${profileError.message}`);
            } else {
              logSuccess('Profil utworzony ręcznie!');
            }
            return;
          }
        }
      }
      
      // Try alternative: create via SQL RPC if available
      logInfo('\nPróba 2: Sprawdzanie czy można użyć Supabase Studio...');
      logInfo('Otwórz: http://127.0.0.1:54323');
      logInfo('Przejdź do: Authentication > Users > Add User');
      
      process.exit(1);
    }

    if (!authData || !authData.user) {
      logError('Nie udało się utworzyć użytkownika - brak danych');
      process.exit(1);
    }

    logSuccess(`Użytkownik utworzony: ${authData.user.id}`);

    // Wait a bit for trigger to execute
    logInfo('Oczekiwanie na wykonanie triggera...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      logError('Profil nie został utworzony automatycznie przez trigger');
      logInfo('Tworzenie profilu ręcznie...');
      
      const username = email.split('@')[0];
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: username,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        logError(`Błąd tworzenia profilu: ${insertError.message}`);
        logInfo('Możliwe przyczyny:');
        logInfo('1. Trigger nie działa poprawnie');
        logInfo('2. Problem z uprawnieniami');
        logInfo('3. Sprawdź logi Supabase');
        process.exit(1);
      } else {
        logSuccess('Profil utworzony ręcznie!');
      }
    } else {
      logSuccess('Profil utworzony automatycznie przez trigger!');
      log(`  Username: ${profile.username}`);
    }

    log('\n✅ Gotowe! Użytkownik i profil utworzone.\n', 'green');
  } catch (error) {
    logError(`Błąd: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
createUserDirect();

