#!/usr/bin/env node
/**
 * Script to check Supabase configuration and display URLs and keys
 * 
 * Usage:
 *   npm run check:supabase
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(title, 'blue');
  log('='.repeat(60), 'blue');
}

function logKeyValue(key, value, highlight = false) {
  const color = highlight ? 'cyan' : 'reset';
  log(`  ${key.padEnd(25)} ${value}`, color);
}

async function checkSupabaseConfig() {
  logSection('🔍 Sprawdzanie konfiguracji Supabase');

  // 1. Check if Supabase is running locally
  log('\n📦 Status Supabase (lokalny):', 'yellow');
  try {
    const statusOutput = execSync('supabase status', { 
      encoding: 'utf-8',
      cwd: projectRoot,
      stdio: 'pipe'
    });
    
    const lines = statusOutput.split('\n');
    let apiUrl = null;
    let secretKey = null;
    let studioUrl = null;
    
    for (const line of lines) {
      if (line.includes('API URL:')) {
        apiUrl = line.split('API URL:')[1]?.trim();
      }
      if (line.includes('Secret key:')) {
        secretKey = line.split('Secret key:')[1]?.trim();
      }
      if (line.includes('Studio URL:')) {
        studioUrl = line.split('Studio URL:')[1]?.trim();
      }
    }
    
    if (apiUrl) {
      logKeyValue('API URL:', apiUrl, true);
      logKeyValue('Studio URL:', studioUrl || 'http://127.0.0.1:54323', true);
      logKeyValue('Secret key:', secretKey ? `${secretKey.substring(0, 20)}...` : 'nie znaleziono', true);
      
      log('\n💡 Użyj tych wartości:', 'green');
      log(`  export SUPABASE_URL=${apiUrl}`, 'cyan');
      log(`  export SUPABASE_SERVICE_ROLE_KEY=${secretKey || 'your-secret-key'}`, 'cyan');
    } else {
      log('  Supabase nie jest uruchomiony lokalnie', 'red');
      log('  Uruchom: supabase start', 'yellow');
    }
  } catch (error) {
    log('  Nie można sprawdzić statusu Supabase', 'red');
    log(`  Błąd: ${error.message}`, 'red');
  }

  // 2. Check environment variables
  logSection('🌍 Zmienne środowiskowe');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl) {
    logKeyValue('SUPABASE_URL:', supabaseUrl, true);
  } else {
    logKeyValue('SUPABASE_URL:', 'nie ustawione', 'red');
  }
  
  if (supabaseKey) {
    logKeyValue('SUPABASE_KEY:', `${supabaseKey.substring(0, 20)}...`, true);
  } else {
    logKeyValue('SUPABASE_KEY:', 'nie ustawione', 'red');
  }
  
  if (supabaseServiceKey) {
    logKeyValue('SUPABASE_SERVICE_ROLE_KEY:', `${supabaseServiceKey.substring(0, 20)}...`, true);
  } else {
    logKeyValue('SUPABASE_SERVICE_ROLE_KEY:', 'nie ustawione', 'red');
  }

  // 3. Check .env file
  logSection('📄 Plik .env');
  try {
    const envPath = join(projectRoot, '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const hasSupabaseUrl = envContent.includes('SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('SUPABASE_KEY');
    const hasServiceKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY');
    
    if (hasSupabaseUrl || hasSupabaseKey || hasServiceKey) {
      log('  ✅ Plik .env istnieje i zawiera konfigurację Supabase', 'green');
      if (hasSupabaseUrl) log('  - SUPABASE_URL', 'cyan');
      if (hasSupabaseKey) log('  - SUPABASE_KEY', 'cyan');
      if (hasServiceKey) log('  - SUPABASE_SERVICE_ROLE_KEY', 'cyan');
    } else {
      log('  ⚠️  Plik .env istnieje, ale nie zawiera konfiguracji Supabase', 'yellow');
    }
  } catch (error) {
    log('  ⚠️  Plik .env nie istnieje', 'yellow');
    log('  Utwórz plik .env na podstawie env-template.txt', 'yellow');
  }

  // 4. Check config.toml
  logSection('⚙️  Konfiguracja (supabase/config.toml)');
  try {
    const configPath = join(projectRoot, 'supabase', 'config.toml');
    const configContent = readFileSync(configPath, 'utf-8');
    
    const siteUrlMatch = configContent.match(/site_url\s*=\s*["']([^"']+)["']/);
    if (siteUrlMatch) {
      logKeyValue('site_url:', siteUrlMatch[1]);
    }
    
    const enableSignupMatch = configContent.match(/enable_signup\s*=\s*(\w+)/);
    if (enableSignupMatch) {
      logKeyValue('enable_signup:', enableSignupMatch[1]);
    }
  } catch (error) {
    log('  ⚠️  Nie można odczytać config.toml', 'yellow');
  }

  // 5. Instructions for production
  logSection('🌐 Dla środowiska produkcyjnego');
  log('  1. Otwórz Supabase Dashboard: https://supabase.com/dashboard', 'cyan');
  log('  2. Wybierz swój projekt', 'cyan');
  log('  3. Przejdź do: Project Settings > API', 'cyan');
  log('  4. Skopiuj:', 'cyan');
  log('     - Project URL → SUPABASE_URL', 'cyan');
  log('     - service_role key → SUPABASE_SERVICE_ROLE_KEY', 'cyan');
  log('     - anon key → SUPABASE_KEY', 'cyan');

  log('\n' + '='.repeat(60) + '\n', 'blue');
}

// Run the script
checkSupabaseConfig().catch(error => {
  console.error('Błąd:', error);
  process.exit(1);
});

