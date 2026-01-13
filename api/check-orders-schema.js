import pg from 'pg';
const { Client } = pg;

const c = new Client('postgresql://postgres:ZGBTeEyOBSnEAZbgxkmYbAXLNzNhlqtB@turntable.proxy.rlwy.net:16265/railway');

async function checkSchema() {
  try {
    await c.connect();
    
    const orders = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position`);
    console.log('ORDERS TABLE:');
    orders.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
    
    await c.end();
  } catch (error) {
    console.error('Error:', error.message);
    await c.end();
  }
}

checkSchema();
