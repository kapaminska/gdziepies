#!/usr/bin/env node
/**
 * Script to create user directly via SQL (bypasses auth API issues)
 * 
 * Usage:
 *   npm run create:user:sql
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

async function createUserViaSQL() {
  log('\n👤 Tworzenie użytkownika przez SQL...\n', 'blue');

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
  const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    logError('Brak SUPABASE_SERVICE_ROLE_KEY!');
    logInfo('Uruchom: supabase status');
    logInfo('Następnie: export SUPABASE_SERVICE_ROLE_KEY=sb_secret_...');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    logInfo(`Email: ${email}`);
    logInfo(`Hasło: ${password.length} znaków`);

    // Generate user ID and encrypted password
    const userId = crypto.randomUUID();
    const username = email.split('@')[0];

    logInfo('\nTworzenie użytkownika w auth.users...');

    // Create user in auth.users using RPC or direct SQL
    // Note: We need to use the auth schema functions
    // For Supabase, we'll use the admin API but with a workaround
    
    // First, try to check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    if (existingUser) {
      logInfo(`Użytkownik już istnieje: ${existingUser.id}`);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', existingUser.id)
        .single();

      if (profile) {
        logSuccess('Użytkownik i profil już istnieją!');
        log(`  ID: ${existingUser.id}`);
        log(`  Username: ${profile.username}`);
        return;
      } else {
        logInfo('Profil nie istnieje, tworzenie...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: existingUser.id,
            username: username,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          logError(`Błąd: ${insertError.message}`);
          process.exit(1);
        } else {
          logSuccess('Profil utworzony!');
          return;
        }
      }
    }

    // Try creating via SQL RPC function
    logInfo('Próba utworzenia przez SQL...');
    
    // Use Supabase's built-in function to create user
    // We'll use a workaround: create via admin API with error handling
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      logError(`Błąd tworzenia użytkownika: ${createError.message}`);
      
      // If it's a database error, the trigger might be the issue
      if (createError.message.includes('Database error')) {
        logInfo('\n🔧 Problem może być w triggerze handle_new_user');
        logInfo('Rozwiązanie:');
        logInfo('1. Otwórz Supabase Studio: http://127.0.0.1:54323');
        logInfo('2. Przejdź do SQL Editor');
        logInfo('3. Wykonaj:');
        log('\n-- Sprawdź czy funkcja istnieje', 'cyan');
        log('SELECT proname FROM pg_proc WHERE proname = \'handle_new_user\';', 'cyan');
        log('\n-- Sprawdź czy trigger istnieje', 'cyan');
        log('SELECT * FROM pg_trigger WHERE tgname = \'on_auth_user_created\';', 'cyan');
        log('\n-- Jeśli trigger nie działa, utwórz profil ręcznie:', 'cyan');
        log(`-- (Najpierw utwórz użytkownika przez Studio, potem wykonaj:)`, 'cyan');
        log(`INSERT INTO public.profiles (id, username, created_at)`, 'cyan');
        log(`VALUES ('USER_ID', '${username}', NOW());`, 'cyan');
      }
      
      process.exit(1);
    }

    if (!newUser || !newUser.user) {
      logError('Nie udało się utworzyć użytkownika');
      process.exit(1);
    }

    logSuccess(`Użytkownik utworzony: ${newUser.user.id}`);

    // Wait for trigger
    logInfo('Oczekiwanie na trigger...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', newUser.user.id)
      .single();

    if (profileError || !profile) {
      logError('Profil nie został utworzony przez trigger');
      logInfo('Tworzenie profilu ręcznie...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.user.id,
          username: username,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        logError(`Błąd: ${insertError.message}`);
        logInfo('\nMożliwe rozwiązanie:');
        logInfo('Wykonaj w SQL Editor:');
        log(`INSERT INTO public.profiles (id, username, created_at)`, 'cyan');
        log(`VALUES ('${newUser.user.id}', '${username}', NOW());`, 'cyan');
        process.exit(1);
      } else {
        logSuccess('Profil utworzony ręcznie!');
      }
    } else {
      logSuccess('Profil utworzony automatycznie!');
      log(`  Username: ${profile.username}`);
    }

    log('\n✅ Gotowe!\n', 'green');
  } catch (error) {
    logError(`Błąd: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
createUserViaSQL();


