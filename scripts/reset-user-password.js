#!/usr/bin/env node

/**
 * Skrypt do resetowania hasła użytkownika w Supabase
 * 
 * Użycie:
 *   node scripts/reset-user-password.js <email> <nowe-haslo>
 * 
 * Przykład:
 *   node scripts/reset-user-password.js test@example.com nowehaslo123
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables should be set in your shell or .env file
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
// Use service_role key for admin operations (bypasses RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Błąd: Brak SUPABASE_SERVICE_ROLE_KEY lub SUPABASE_KEY w zmiennych środowiskowych');
  console.error('   Użyj service_role key (nie anon key) do resetowania hasła');
  process.exit(1);
}

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('❌ Błąd: Podaj email i nowe hasło');
  console.error('\nUżycie:');
  console.error('  node scripts/reset-user-password.js <email> <nowe-haslo>');
  console.error('\nPrzykład:');
  console.error('  node scripts/reset-user-password.js test@example.com nowehaslo123');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error('❌ Błąd: Hasło musi mieć minimum 6 znaków');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function resetPassword() {
  console.log('\n🔐 Resetowanie hasła użytkownika...\n');
  console.log(`Email: ${email}`);
  console.log(`Nowe hasło: ${'*'.repeat(newPassword.length)} znaków\n`);

  try {
    // 1. Znajdź użytkownika
    console.log('🔍 Szukanie użytkownika...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Błąd podczas pobierania listy użytkowników:', listError.message);
      process.exit(1);
    }

    const user = users?.users?.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ Użytkownik o adresie ${email} nie został znaleziony`);
      console.error('\nDostępni użytkownicy:');
      users?.users?.forEach(u => {
        console.error(`  - ${u.email} (ID: ${u.id})`);
      });
      process.exit(1);
    }

    console.log(`✅ Znaleziono użytkownika: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email potwierdzony: ${user.email_confirmed_at ? 'Tak' : 'Nie'}`);
    console.log(`   Utworzony: ${user.created_at}\n`);

    // 2. Zaktualizuj hasło
    console.log('🔑 Aktualizowanie hasła...');
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
        email_confirm: true, // Upewnij się, że email jest potwierdzony
      }
    );

    if (updateError) {
      console.error('❌ Błąd podczas aktualizacji hasła:', updateError.message);
      process.exit(1);
    }

    if (!updatedUser || !updatedUser.user) {
      console.error('❌ Nie udało się zaktualizować hasła - brak danych w odpowiedzi');
      process.exit(1);
    }

    console.log('✅ Hasło zostało zaktualizowane pomyślnie!');
    console.log('\n📋 Szczegóły użytkownika:');
    console.log(`   ID: ${updatedUser.user.id}`);
    console.log(`   Email: ${updatedUser.user.email}`);
    console.log(`   Email potwierdzony: ${updatedUser.user.email_confirmed_at ? 'Tak' : 'Nie'}`);
    console.log(`   Ostatnia aktualizacja: ${updatedUser.user.updated_at || 'teraz'}`);

    console.log('\n✅ Gotowe! Możesz teraz zalogować się używając nowego hasła.\n');
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error);
    process.exit(1);
  }
}

resetPassword();

