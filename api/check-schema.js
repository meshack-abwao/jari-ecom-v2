import pg from 'pg';
const { Client } = pg;

const c = new Client('postgresql://postgres:ZGBTeEyOBSnEAZbgxkmYbAXLNzNhlqtB@turntable.proxy.rlwy.net:16265/railway');

async function checkSchema() {
  try {
    await c.connect();
    
    const users = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
    console.log('Users columns:', users.rows.map(r => r.column_name));
    
    const stores = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'stores'`);
    console.log('Stores columns:', stores.rows.map(r => r.column_name));
    
    const products = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'products'`);
    console.log('Products columns:', products.rows.map(r => r.column_name));
    
    await c.end();
  } catch (error) {
    console.error('Error:', error.message);
    await c.end();
  }
}

checkSchema();
