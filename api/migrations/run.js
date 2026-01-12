import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  console.log('🔧 Running migrations...');
  
  try {
    // Read and execute migration file
    const sql = fs.readFileSync(
      path.join(__dirname, '001_initial.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    console.log('✅ Migrations complete!');
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
