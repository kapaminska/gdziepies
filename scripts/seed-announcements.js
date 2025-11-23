#!/usr/bin/env node
/**
 * Script to seed the database with 10 sample lost dog announcements
 * 
 * Usage:
 *   npm run seed:announcements
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

// Sample dog announcements data
const sampleAnnouncements = [
  {
    title: 'Zaginął pies rasy Golden Retriever - Max',
    type: 'lost',
    species: 'dog',
    voivodeship: 'Mazowieckie',
    poviat: 'Warszawa',
    location_details: 'Okolice Parku Łazienkowskiego',
    event_date: '2024-12-15',
    image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    size: 'large',
    color: 'Złoty',
    age_range: 'adult',
    description: 'Max to przyjazny, 3-letni Golden Retriever. Zaginął podczas spaceru w Parku Łazienkowskim. Ma na szyi niebieską obrożę z adresatką. Jest bardzo przyjazny i nie boi się ludzi.',
    special_marks: 'Biała plama na klatce piersiowej, niebieska obroża',
    is_aggressive: false,
    is_fearful: false,
  },
  {
    title: 'Zaginął mały piesek rasy York - Bella',
    type: 'lost',
    species: 'dog',
    voivodeship: 'Małopolskie',
    poviat: 'Kraków',
    location_details: 'Dzielnica Kazimierz, ul. Krakowska',
    event_date: '2024-12-18',
    image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
    size: 'small',
    color: 'Brązowo-szary',
    age_range: 'adult',
    description: 'Bella to mała, 2-letnia suczka rasy Yorkshire Terrier. Zaginęła podczas spaceru w centrum Krakowa. Ma długie, jedwabiste futerko i jest bardzo przyjazna.',
    special_marks: 'Długa sierść, różowa kokardka na głowie',
    is_aggressive: false,
    is_fearful: true,
  },
  {
    title: 'Zaginął pies rasy Husky - Luna',
    type: 'lost',
    species: 'dog',
    voivodeship: 'Pomorskie',
    poviat: 'Gdańsk',
    location_details: 'Dzielnica Oliwa, okolice lasu',
    event_date: '2024-12-20',
    image_url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800',
    size: 'large',
    color: 'Biało-szary',
    age_range: 'adult',
    description: 'Luna to energiczna, 4-letnia suczka rasy Husky syberyjski. Zaginęła podczas spaceru w lesie. Ma charakterystyczne niebieskie oczy i jest bardzo aktywna.',
    special_marks: 'Niebieskie oczy, biała plama na czole',
    is_aggressive: false,
    is_fearful: false,
  },
  {
    title: 'Zaginął pies rasy Beagle - Rocky',
    type: 'lost',
    species: 'dog',
    voivodeship: 'Wielkopolskie',
    poviat: 'Poznań',
    location_details: 'Park Cytadela',
    event_date: '2024-12-22',
    image_url: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800',
    size: 'medium',
    color: 'Trójkolorowy (biały, brązowy, czarny)',
    age_range: 'young',
    description: 'Rocky to młody, 1,5-roczny Beagle. Zaginął podczas zabawy w Parku Cytadela. Jest bardzo ciekawski i może podążać za zapachami. Ma długie, opadające uszy.',
    special_marks: 'Długie uszy, biały koniuszek ogona',
    is_aggressive: false,
    is_fearful: false,
  },
  {
    title: 'Zaginął pies rasy Border Collie - Charlie',
    type: 'lost',
    species: 'dog',
    voivodeship: 'Dolnośląskie',
    poviat: 'Wrocław',
    location_details: 'Dzielnica Krzyki, okolice parku',
    event_date: '2024-12-10',
    image_url: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800',
    size: 'medium',
    color: 'Czarno-biały',
    age_range: 'adult',
    description: 'Charlie to inteligentny, 5-letni Border Collie. Zaginął podczas treningu w parku. Jest bardzo posłuszny i reaguje na komendy. Ma charakterystyczne białe znaczenia.',
    special_marks: 'Biała plama na klatce piersiowej, biały koniuszek ogona',
    is_aggressive: false,
    is_fearful: false,
  },
  {
    title: 'Zaginął pies rasy Labrador - Daisy',
    type: 'lost',
    species: 'dog',
    voivodeship: 'Śląskie',
    poviat: 'Katowice',
    location_details: 'Dzielnica Śródmieście, okolice rynku',
    event_date: '2024-12-25',
    image_url: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800',
    size: 'large',
    color: 'Czarny',
    age_range: 'adult',
    description: 'Daisy to przyjazna, 3-letnia suczka rasy Labrador Retriever. Zaginęła podczas spaceru w centrum Katowic. Jest bardzo towarzyska i lubi dzieci.',
    special_marks: 'Czarny kolor, biała plamka na klatce piersiowej',
    is_aggressive: false,
    is_fearful: false,
  },
  {
    title: 'Zaginął pies rasy Chihuahua - Coco',
    type: 'lost',
    species: 'dog',
    voivodeship: 'Łódzkie',
    poviat: 'Łódź',
    location_details: 'Dzielnica Śródmieście, ul. Piotrkowska',
    event_date: '2024-12-28',
    image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
    size: 'small',
    color: 'Brązowy',
    age_range: 'senior',
    description: 'Coco to mała, 8-letnia suczka rasy Chihuahua. Zaginęła podczas spaceru na ulicy Piotrkowskiej. Jest bardzo mała i może być przestraszona. Ma krótką sierść.',
    special_marks: 'Bardzo mały rozmiar, brązowa sierść, duże uszy',
    is_aggressive: false,
    is_fearful: true,
  },
  {
    title: 'Zaginął pies rasy German Shepherd - Rex',
    type: 'lost',
    species: 'dog',
    voivodeship: 'Mazowieckie',
    poviat: 'Warszawski Zachodni',
    location_details: 'Miejscowość Ożarów Mazowiecki, okolice lasu',
    event_date: '2024-12-12',
    image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    size: 'large',
    color: 'Czarno-brązowy',
    age_range: 'adult',
    description: 'Rex to duży, 4-letni owczarek niemiecki. Zaginął podczas spaceru w lesie. Jest dobrze wyszkolony i posłuszny, ale może być nieufny wobec obcych. Ma charakterystyczne stojące uszy.',
    special_marks: 'Stojące uszy, czarno-brązowa sierść, duży rozmiar',
    is_aggressive: false,
    is_fearful: false,
  },
  {
    title: 'Zaginął pies rasy Cocker Spaniel - Molly',
    type: 'lost',
    species: 'dog',
    voivodeship: 'Pomorskie',
    poviat: 'Gdynia',
    location_details: 'Bulwar Nadmorski',
    event_date: '2024-12-30',
    image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
    size: 'medium',
    color: 'Złoty',
    age_range: 'adult',
    description: 'Molly to przyjazna, 3-letnia suczka rasy Cocker Spaniel. Zaginęła podczas spaceru nad morzem. Ma długie, jedwabiste futerko i opadające uszy. Jest bardzo towarzyska.',
    special_marks: 'Długa, jedwabista sierść, opadające uszy, złoty kolor',
    is_aggressive: false,
    is_fearful: false,
  },
  {
    title: 'Zaginął pies rasy Shih Tzu - Teddy',
    type: 'lost',
    species: 'dog',
    voivodeship: 'Małopolskie',
    poviat: 'Krakowski',
    location_details: 'Miejscowość Wieliczka, okolice centrum',
    event_date: '2024-12-14',
    image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
    size: 'small',
    color: 'Biało-brązowy',
    age_range: 'adult',
    description: 'Teddy to mały, 2-letni piesek rasy Shih Tzu. Zaginął podczas spaceru w centrum Wieliczki. Ma długą, puszystą sierść i płaski pyszczek. Jest bardzo przyjazny i lubi być noszony.',
    special_marks: 'Długa, puszysta sierść, płaski pyszczek, mały rozmiar',
    is_aggressive: false,
    is_fearful: true,
  },
];

async function getOrCreateTestUser(supabase) {
  logInfo('Sprawdzanie użytkownika testowego...');
  
  // First, try to find any existing user
  const { data: existingUsers, error: selectError } = await supabase
    .from('profiles')
    .select('id, username')
    .limit(1);

  if (selectError) {
    logError(`Błąd podczas sprawdzania użytkowników: ${selectError.message}`);
    throw selectError;
  }

  if (existingUsers && existingUsers.length > 0) {
    const user = existingUsers[0];
    logSuccess(`Znaleziono użytkownika: ${user.username} (ID: ${user.id})`);
    return user.id;
  }

  // No users found - need to create one
  // For local development with Supabase CLI, we can try to create via auth admin
  // But for simplicity, we'll just inform the user
  logError('Brak użytkowników w bazie danych!');
  logInfo('Aby utworzyć użytkownika testowego:');
  logInfo('1. Użyj Supabase Dashboard: Authentication > Users > Add User');
  logInfo('2. Lub użyj Supabase CLI: supabase auth users create --email test@example.com --password test123');
  logInfo('3. Profil zostanie utworzony automatycznie przez trigger');
  logInfo('4. Następnie uruchom ten skrypt ponownie');
  
  throw new Error('Brak użytkowników w bazie danych. Utwórz użytkownika przed uruchomieniem skryptu.');
}

async function seedAnnouncements() {
  log('\n🌱 Rozpoczynam dodawanie przykładowych ogłoszeń...\n', 'blue');

  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    logError('Brak wymaganych zmiennych środowiskowych!');
    logError('Ustaw SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY w pliku .env');
    logError('Lub uruchom: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-announcements.js');
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
    // Get or use existing user
    const userId = await getOrCreateTestUser(supabase);

    // Insert announcements
    logInfo(`Dodawanie ${sampleAnnouncements.length} ogłoszeń...`);
    
    const announcementsToInsert = sampleAnnouncements.map((announcement) => ({
      ...announcement,
      author_id: userId,
      status: 'active',
    }));

    const { data, error } = await supabase
      .from('announcements')
      .insert(announcementsToInsert)
      .select('id, title');

    if (error) {
      logError(`Błąd podczas dodawania ogłoszeń: ${error.message}`);
      console.error(error);
      process.exit(1);
    }

    logSuccess(`Pomyślnie dodano ${data.length} ogłoszeń!`);
    log('\n📋 Dodane ogłoszenia:', 'cyan');
    data.forEach((announcement, index) => {
      log(`  ${index + 1}. ${announcement.title} (ID: ${announcement.id})`, 'cyan');
    });

    log('\n✅ Zakończono pomyślnie!\n', 'green');
  } catch (error) {
    logError(`Błąd: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
seedAnnouncements();

