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
    // Get all .sql files and sort them
    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    for (const file of files) {
      console.log(`  Running ${file}...`);
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      await pool.query(sql);
      console.log(`  ✅ ${file} complete`);
    }
    
    console.log('✅ All migrations complete!');
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
