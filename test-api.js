// Jari.Ecom V2 - API Test Script
// Run with: node test-api.js

const API_URL = 'http://localhost:3001';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  pass: (msg) => console.log(`${colors.green}✅ PASS${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}❌ FAIL${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  INFO${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  WARN${colors.reset} ${msg}`)
};

// Generate unique identifiers for this test run
const testId = Date.now().toString(36);
const testEmail = `test${testId}@jari.test`;
const testSlug = `teststore${testId}`;

let authToken = null;
let testProduct = null;
let deleteTestProduct = null;

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers
    }
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function test(name, fn) {
  try {
    await fn();
    log.pass(name);
    return true;
  } catch (err) {
    log.fail(`${name}: ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('   JARI.ECOM V2 - API TEST SUITE');
  console.log('========================================');
  console.log(`Test ID: ${testId}`);
  console.log(`Test Email: ${testEmail}`);
  console.log(`Test Slug: ${testSlug}\n`);
  
  let passed = 0;
  let failed = 0;
  
  // 1. Health Check
  if (await test('Health endpoint', async () => {
    const { status, data } = await request('/health');
    if (status !== 200) throw new Error(`Status ${status}`);
    if (data.status !== 'ok') throw new Error('Health not ok');
  })) passed++; else failed++;

  // 2. Register
  if (await test('Register new user', async () => {
    const { status, data } = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'test123456',
        businessName: 'Test Store',
        instagram: `@${testSlug}`
      })
    });
    if (status !== 201) throw new Error(`Status ${status}: ${data.error || JSON.stringify(data)}`);
    if (!data.token) throw new Error('No token returned');
    authToken = data.token;
  })) passed++; else failed++;

  // 3. Login
  if (await test('Login existing user', async () => {
    const { status, data } = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'test123456'
      })
    });
    if (status !== 200) throw new Error(`Status ${status}: ${data.error || 'Unknown'}`);
    if (!data.token) throw new Error('No token returned');
    authToken = data.token;
  })) passed++; else failed++;

  // 4. Get Me
  if (await test('Get current user', async () => {
    const { status, data } = await request('/api/auth/me');
    if (status !== 200) throw new Error(`Status ${status}: ${data.error || 'Unknown'}`);
    if (!data.id) throw new Error('No user ID');
  })) passed++; else failed++;

  // 5. Get Store
  if (await test('Get store config', async () => {
    const { status, data } = await request('/api/store');
    if (status !== 200) throw new Error(`Status ${status}: ${data.error || 'Unknown'}`);
    if (!data.slug) throw new Error('No slug');
  })) passed++; else failed++;

  // 6. Update Store
  if (await test('Update store config', async () => {
    const { status, data } = await request('/api/store', {
      method: 'PUT',
      body: JSON.stringify({
        config: { name: 'Updated Test Store', tagline: 'Test Tagline' }
      })
    });
    if (status !== 200) throw new Error(`Status ${status}: ${data.error || 'Unknown'}`);
  })) passed++; else failed++;

  // 7. Get Themes
  if (await test('Get themes list', async () => {
    const { status, data } = await request('/api/store/themes');
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!Array.isArray(data)) throw new Error('Not an array');
    if (data.length === 0) throw new Error('No themes');
  })) passed++; else failed++;

  // 8. Get Templates
  if (await test('Get templates list', async () => {
    const { status, data } = await request('/api/store/templates');
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!Array.isArray(data)) throw new Error('Not an array');
  })) passed++; else failed++;

  // 9. Create Product (for orders)
  if (await test('Create product', async () => {
    const { status, data } = await request('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        template: 'quick-decision',
        data: { name: 'Test Product', price: 1500, description: 'Test desc' },
        media: [{ url: 'https://example.com/image.jpg' }]
      })
    });
    if (status !== 201) throw new Error(`Status ${status}: ${data.error || JSON.stringify(data)}`);
    if (!data.id) throw new Error('No product ID');
    testProduct = data;
  })) passed++; else failed++;

  // 10. Create second product (for delete test)
  if (await test('Create product for delete test', async () => {
    const { status, data } = await request('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        template: 'quick-decision',
        data: { name: 'Delete Me', price: 500 },
        media: []
      })
    });
    if (status !== 201) throw new Error(`Status ${status}: ${data.error || JSON.stringify(data)}`);
    deleteTestProduct = data;
  })) passed++; else failed++;

  // 11. Get Products
  if (await test('Get products list', async () => {
    const { status, data } = await request('/api/products');
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!Array.isArray(data)) throw new Error('Not an array');
    if (data.length < 2) throw new Error('Expected at least 2 products');
  })) passed++; else failed++;

  // 12. Update Product
  if (await test('Update product', async () => {
    if (!testProduct) throw new Error('No test product created');
    const { status, data } = await request(`/api/products/${testProduct.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: { name: 'Updated Product', price: 2000 }
      })
    });
    if (status !== 200) throw new Error(`Status ${status}: ${data.error || 'Unknown'}`);
  })) passed++; else failed++;

  // 13. Get Single Product
  if (await test('Get single product', async () => {
    if (!testProduct) throw new Error('No test product created');
    const { status, data } = await request(`/api/products/${testProduct.id}`);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.id) throw new Error('No product ID');
  })) passed++; else failed++;

  // 14. Delete Product (before order is created)
  if (await test('Delete product', async () => {
    if (!deleteTestProduct) throw new Error('No delete test product created');
    const { status, data } = await request(`/api/products/${deleteTestProduct.id}`, {
      method: 'DELETE'
    });
    if (status !== 200) throw new Error(`Status ${status}: ${data.error || 'Unknown'}`);
    if (!data.deleted) throw new Error('Not deleted');
  })) passed++; else failed++;

  // 15. Create Order (Public)
  const savedToken = authToken;
  authToken = null;
  if (await test('Create order (public)', async () => {
    if (!testProduct) throw new Error('No test product created');
    const { status, data } = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        slug: testSlug,
        productId: testProduct.id,
        customer: { name: 'John Doe', phone: '0712345678', location: 'Nairobi' },
        items: [{ product_id: testProduct.id, name: 'Test Product', price: 2000, qty: 1, total: 2000 }],
        payment: { method: 'mpesa' }
      })
    });
    if (status !== 201) throw new Error(`Status ${status}: ${data.error || JSON.stringify(data)}`);
    if (!data.order_number) throw new Error('No order number');
  })) passed++; else failed++;
  authToken = savedToken;

  // 16. Get Orders
  if (await test('Get orders list', async () => {
    const { status, data } = await request('/api/orders');
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!Array.isArray(data)) throw new Error('Not an array');
  })) passed++; else failed++;

  // 17. Get Order Stats
  if (await test('Get order stats', async () => {
    const { status, data } = await request('/api/orders/stats');
    if (status !== 200) throw new Error(`Status ${status}`);
    if (typeof data.total === 'undefined') throw new Error('No total');
  })) passed++; else failed++;

  // 18. Public Store Endpoint
  authToken = null;
  if (await test('Get public store', async () => {
    const { status, data } = await request(`/s/${testSlug}`);
    if (status !== 200) throw new Error(`Status ${status}: ${data.error || 'Unknown'}`);
    if (!data.store) throw new Error('No store data');
    if (!data.products) throw new Error('No products');
  })) passed++; else failed++;

  // 19. Public Product Endpoint
  if (await test('Get public product', async () => {
    if (!testProduct) throw new Error('No test product created');
    const { status, data } = await request(`/s/${testSlug}/products/${testProduct.id}`);
    if (status !== 200) throw new Error(`Status ${status}: ${data.error || 'Unknown'}`);
    if (!data.id) throw new Error('No product ID');
  })) passed++; else failed++;

  // Summary
  console.log('\n========================================');
  console.log('   TEST RESULTS');
  console.log('========================================');
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total:  ${passed + failed}`);
  console.log('========================================\n');
  
  if (failed > 0) {
    log.warn('Some tests failed! Check the errors above.');
    process.exit(1);
  } else {
    log.info('All tests passed! API is working correctly.');
    process.exit(0);
  }
}

// Run
runTests().catch(err => {
  log.fail(`Test suite crashed: ${err.message}`);
  process.exit(1);
});
