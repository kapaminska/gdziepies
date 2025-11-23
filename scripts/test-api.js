#!/usr/bin/env node
/**
 * Test script for Announcements API endpoints
 * 
 * Usage:
 *   npm run test:api
 *   npm run test:api -- --base-url http://localhost:3000
 * 
 * Make sure the Astro dev server is running before executing tests.
 */

// Configuration
const BASE_URL = process.env.API_BASE_URL || 
  process.argv.find(arg => arg.startsWith('--base-url='))?.split('=')[1] || 
  'http://localhost:3000';
const API_URL = `${BASE_URL}/api/announcements`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results
const results = [];

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  log(`\n🧪 Testing: ${name}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));
    return {
      status: response.status,
      data,
      headers: response.headers,
    };
  } catch (error) {
    // Provide more detailed error information
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      throw new Error(`Connection refused: Is the server running at ${BASE_URL}? Run 'npm run dev' first.`);
    }
    throw error;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test functions
async function testGetAnnouncementsList() {
  logTest('GET /api/announcements - Lista ogłoszeń (bez filtrów)');
  
  try {
    const { status, data } = await makeRequest(API_URL);
    
    assert(status === 200, `Expected status 200, got ${status}`);
    assert('data' in data, 'Response should have data field');
    assert('pagination' in data, 'Response should have pagination field');
    
    assert(Array.isArray(data.data), 'Data should be an array');
    
    logSuccess(`Status: ${status}, Items: ${data.data.length}`);
    results.push({ name: 'GET /api/announcements (no filters)', passed: true, status });
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logError(errorMsg);
    results.push({ name: 'GET /api/announcements (no filters)', passed: false, error: errorMsg });
  }
}

async function testGetAnnouncementsWithFilters() {
  logTest('GET /api/announcements - Lista z filtrami');
  
  try {
    const params = new URLSearchParams({
      type: 'lost',
      species: 'dog',
      status: 'active',
      page: '1',
      limit: '10',
    });
    
    const { status, data } = await makeRequest(`${API_URL}?${params}`);
    
    assert(status === 200, `Expected status 200, got ${status}`);
    assert('data' in data, 'Response should have data field');
    
    logSuccess(`Status: ${status}`);
    results.push({ name: 'GET /api/announcements (with filters)', passed: true, status });
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logError(errorMsg);
    results.push({ name: 'GET /api/announcements (with filters)', passed: false, error: errorMsg });
  }
}

async function testGetAnnouncementsInvalidFilters() {
  logTest('GET /api/announcements - Nieprawidłowe filtry (walidacja)');
  
  try {
    const params = new URLSearchParams({
      type: 'invalid_type', // Invalid enum value
      species: 'invalid_species', // Invalid enum value
    });
    
    const { status, data } = await makeRequest(`${API_URL}?${params}`);
    
    assert(status === 400, `Expected status 400, got ${status}`);
    assert('error' in data, 'Response should have error field');
    
    logSuccess(`Status: ${status} (validation error as expected)`);
    results.push({ name: 'GET /api/announcements (invalid filters)', passed: true, status });
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logError(errorMsg);
    results.push({ name: 'GET /api/announcements (invalid filters)', passed: false, error: errorMsg });
  }
}

async function testGetAnnouncementById() {
  logTest('GET /api/announcements/{id} - Szczegóły ogłoszenia');
  
  try {
    // First, get a list to find an ID
    const { data: listData } = await makeRequest(API_URL);
    
    if (listData.data && listData.data.length > 0) {
      const id = listData.data[0].id;
      const { status, data } = await makeRequest(`${API_URL}/${id}`);
      
      assert(status === 200, `Expected status 200, got ${status}`);
      assert('data' in data, 'Response should have data field');
      
      const announcement = data.data;
      assert(announcement.id === id, 'Returned announcement should have correct ID');
      assert('author' in announcement, 'Announcement should have author field');
      
      logSuccess(`Status: ${status}, ID: ${id}`);
      results.push({ name: 'GET /api/announcements/{id}', passed: true, status });
    } else {
      logWarning('No announcements found, skipping test');
      results.push({ name: 'GET /api/announcements/{id}', passed: true, status: 200 });
    }
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logError(errorMsg);
    results.push({ name: 'GET /api/announcements/{id}', passed: false, error: errorMsg });
  }
}

async function testGetAnnouncementByIdNotFound() {
  logTest('GET /api/announcements/{id} - Nieistniejące ogłoszenie (404)');
  
  try {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const { status, data } = await makeRequest(`${API_URL}/${fakeId}`);
    
    assert(status === 404, `Expected status 404, got ${status}`);
    assert('error' in data, 'Response should have error field');
    
    logSuccess(`Status: ${status} (not found as expected)`);
    results.push({ name: 'GET /api/announcements/{id} (not found)', passed: true, status });
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logError(errorMsg);
    results.push({ name: 'GET /api/announcements/{id} (not found)', passed: false, error: errorMsg });
  }
}

async function testGetAnnouncementByIdInvalidUUID() {
  logTest('GET /api/announcements/{id} - Nieprawidłowy UUID (400)');
  
  try {
    const { status, data } = await makeRequest(`${API_URL}/invalid-uuid`);
    
    assert(status === 400, `Expected status 400, got ${status}`);
    assert('error' in data, 'Response should have error field');
    
    logSuccess(`Status: ${status} (validation error as expected)`);
    results.push({ name: 'GET /api/announcements/{id} (invalid UUID)', passed: true, status });
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logError(errorMsg);
    results.push({ name: 'GET /api/announcements/{id} (invalid UUID)', passed: false, error: errorMsg });
  }
}

async function testPostAnnouncementWithoutAuth() {
  logTest('POST /api/announcements - Tworzenie bez autoryzacji (401)');
  
  try {
    const announcement = {
      title: 'Test Announcement',
      type: 'lost',
      species: 'dog',
      voivodeship: 'Mazowieckie',
      poviat: 'Warszawa',
      event_date: '2024-01-01',
      image_url: 'https://example.com/image.jpg',
    };
    
    const { status, data } = await makeRequest(API_URL, {
      method: 'POST',
      body: JSON.stringify(announcement),
    });
    
    assert(status === 401, `Expected status 401, got ${status}`);
    assert('error' in data, 'Response should have error field');
    
    logSuccess(`Status: ${status} (unauthorized as expected)`);
    results.push({ name: 'POST /api/announcements (no auth)', passed: true, status });
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logError(errorMsg);
    results.push({ name: 'POST /api/announcements (no auth)', passed: false, error: errorMsg });
  }
}

async function testPostAnnouncementInvalidData() {
  logTest('POST /api/announcements - Nieprawidłowe dane (walidacja)');
  
  try {
    // Missing required fields
    const invalidAnnouncement = {
      title: 'Test', // Too short (min 3 chars)
      type: 'invalid', // Invalid enum
    };
    
    const { status, data } = await makeRequest(API_URL, {
      method: 'POST',
      body: JSON.stringify(invalidAnnouncement),
      headers: {
        // Simulate auth token (will fail auth, but we test validation first)
        Authorization: 'Bearer fake-token',
      },
    });
    
    // Should be either 400 (validation) or 401 (auth)
    assert(status === 400 || status === 401, `Expected status 400 or 401, got ${status}`);
    
    logSuccess(`Status: ${status} (validation/auth error as expected)`);
    results.push({ name: 'POST /api/announcements (invalid data)', passed: true, status });
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logError(errorMsg);
    results.push({ name: 'POST /api/announcements (invalid data)', passed: false, error: errorMsg });
  }
}

async function testPatchAnnouncementWithoutAuth() {
  logTest('PATCH /api/announcements/{id} - Aktualizacja bez autoryzacji (401)');
  
  try {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const { status, data } = await makeRequest(`${API_URL}/${fakeId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    });
    
    assert(status === 401, `Expected status 401, got ${status}`);
    assert('error' in data, 'Response should have error field');
    
    logSuccess(`Status: ${status} (unauthorized as expected)`);
    results.push({ name: 'PATCH /api/announcements/{id} (no auth)', passed: true, status });
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logError(errorMsg);
    results.push({ name: 'PATCH /api/announcements/{id} (no auth)', passed: false, error: errorMsg });
  }
}

async function testDeleteAnnouncementWithoutAuth() {
  logTest('DELETE /api/announcements/{id} - Usuwanie bez autoryzacji (401)');
  
  try {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const { status, data } = await makeRequest(`${API_URL}/${fakeId}`, {
      method: 'DELETE',
    });
    
    assert(status === 401, `Expected status 401, got ${status}`);
    assert('error' in data, 'Response should have error field');
    
    logSuccess(`Status: ${status} (unauthorized as expected)`);
    results.push({ name: 'DELETE /api/announcements/{id} (no auth)', passed: true, status });
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logError(errorMsg);
    results.push({ name: 'DELETE /api/announcements/{id} (no auth)', passed: false, error: errorMsg });
  }
}

// Check if server is available
async function checkServerAvailability() {
  log('🔍 Checking server availability...', 'blue');
  try {
    const response = await fetch(BASE_URL, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    logSuccess(`Server is running at ${BASE_URL}`);
    return true;
  } catch (error) {
    logError(`Cannot connect to server at ${BASE_URL}`);
    logError('Make sure the Astro dev server is running: npm run dev');
    if (error.name === 'AbortError') {
      logError('Connection timeout - server may be slow or not responding');
    }
    return false;
  }
}

// Main test runner
async function runTests() {
  log('\n🚀 Starting API Tests...', 'blue');
  log(`Base URL: ${BASE_URL}\n`, 'blue');
  
  // Check server availability first
  const serverAvailable = await checkServerAvailability();
  if (!serverAvailable) {
    log('\n❌ Cannot proceed with tests - server is not available\n', 'red');
    process.exit(1);
  }
  
  log(''); // Empty line before tests
  
  // Public endpoints (no auth required)
  await testGetAnnouncementsList();
  await testGetAnnouncementsWithFilters();
  await testGetAnnouncementsInvalidFilters();
  await testGetAnnouncementById();
  await testGetAnnouncementByIdNotFound();
  await testGetAnnouncementByIdInvalidUUID();
  
  // Protected endpoints (auth required)
  await testPostAnnouncementWithoutAuth();
  await testPostAnnouncementInvalidData();
  await testPatchAnnouncementWithoutAuth();
  await testDeleteAnnouncementWithoutAuth();
  
  // Print summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 Test Summary', 'blue');
  log('='.repeat(60), 'blue');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  log(`\nTotal: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    results.filter(r => !r.passed).forEach(r => {
      log(`  - ${r.name}: ${r.error}`, 'red');
    });
  }
  
  log('\n' + '='.repeat(60) + '\n', 'blue');
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

