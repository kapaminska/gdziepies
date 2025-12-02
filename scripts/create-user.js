#!/usr/bin/env node
/**
 * Script to create a test user in Supabase
 * 
 * Usage:
 *   npm run create:user
 *   npm run create:user -- --email test@example.com --password test123456
 * 
 * Requires environment variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (bypasses RLS)
 */

import { createClient } from '@supabase/supabase-js';

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

async function createUser() {
  log('\n👤 Tworzenie użytkownika testowego...\n', 'blue');

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
    logError('Ustaw SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY w pliku .env');
    logError('Lub uruchom: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-user.js');
    process.exit(1);
  }

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    logInfo(`Email: ${email}`);
    logInfo(`Hasło: ${password.length} znaków`);

    // Create user using admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for local development
    });

    if (error) {
      logError(`Błąd podczas tworzenia użytkownika: ${error.message}`);
      
      if (error.message.includes('already registered')) {
        logInfo('Użytkownik o tym adresie email już istnieje.');
        logInfo('Sprawdź Supabase Studio: http://127.0.0.1:54323');
      }
      
      console.error(error);
      process.exit(1);
    }

    if (!data || !data.user) {
      logError('Nie udało się utworzyć użytkownika - brak danych w odpowiedzi');
      process.exit(1);
    }

    logSuccess(`Użytkownik utworzony pomyślnie!`);
    log('\n📋 Szczegóły użytkownika:', 'cyan');
    log(`  ID: ${data.user.id}`, 'cyan');
    log(`  Email: ${data.user.email}`, 'cyan');
    log(`  Email potwierdzony: ${data.user.email_confirmed_at ? 'Tak' : 'Nie'}`, 'cyan');
    log(`  Utworzony: ${data.user.created_at}`, 'cyan');

    // Check if profile was created automatically
    logInfo('\nSprawdzanie profilu użytkownika...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, created_at')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      logError(`Błąd podczas sprawdzania profilu: ${profileError.message}`);
    } else if (profile) {
      logSuccess(`Profil utworzony automatycznie!`);
      log(`  Username: ${profile.username}`, 'cyan');
    } else {
      logError('Profil nie został utworzony automatycznie. Sprawdź trigger w bazie danych.');
    }

    log('\n✅ Gotowe! Możesz teraz użyć tego użytkownika do logowania.\n', 'green');
    logInfo('Możesz również użyć Supabase Studio do zarządzania użytkownikami:');
    logInfo('http://127.0.0.1:54323');
  } catch (error) {
    logError(`Błąd: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
createUser();


