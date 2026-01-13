import pg from 'pg';
const { Client } = pg;

const c = new Client('postgresql://postgres:ZGBTeEyOBSnEAZbgxkmYbAXLNzNhlqtB@turntable.proxy.rlwy.net:16265/railway');

async function createStore() {
  try {
    await c.connect();
    
    // Create user with profile JSONB
    const profile = { businessName: 'Jari Ecomm Store' };
    const userResult = await c.query(`
      INSERT INTO users (email, password_hash, profile)
      VALUES ('jariecomm@jari.store', '$2b$10$dummyhashfordemopurposesonly123456789', $1)
      RETURNING id
    `, [JSON.stringify(profile)]);
    const userId = userResult.rows[0].id;
    console.log('Created user:', userId);
    
    // Create store with config JSONB
    const config = {
      name: 'Jari Ecomm Store',
      tagline: 'Premium products delivered fast',
      theme: {
        primaryColor: "#11998e",
        gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
      }
    };
    
    const storeResult = await c.query(`
      INSERT INTO stores (user_id, slug, config)
      VALUES ($1, 'jariecommstore', $2)
      RETURNING id, slug
    `, [userId, JSON.stringify(config)]);
    
    console.log('Created store:', storeResult.rows[0]);
    const storeId = storeResult.rows[0].id;
    
    // Create sample product with V2 structure
    const productData = {
      name: 'Premium Wireless Earbuds',
      price: 4500,
      description: 'High-quality wireless earbuds with noise cancellation',
      headline: '🔥 Premium Wireless Earbuds',
      urgency_text: 'Only 5 left in stock!',
      benefits: ['Crystal clear sound', '24-hour battery', 'Noise cancellation'],
      testimonials: [
        { name: 'John K.', text: 'Best earbuds I have ever owned!', rating: 5 }
      ]
    };
    
    const media = {
      featured: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
      gallery: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600']
    };
    
    const productResult = await c.query(`
      INSERT INTO products (store_id, template, data, media, status, sort_order)
      VALUES ($1, 'quick-decision', $2, $3, 'active', 0)
      RETURNING id
    `, [storeId, JSON.stringify(productData), JSON.stringify(media)]);
    
    console.log('Created product:', productResult.rows[0]);
    
    await c.end();
    console.log('\n✅ Store jariecommstore created successfully!');
    console.log('🔗 Visit: https://jariecommstore.netlify.app');
    
  } catch (error) {
    console.error('Error:', error.message);
    await c.end();
  }
}

createStore();
