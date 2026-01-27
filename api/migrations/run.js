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
    // First, ensure migration tracking table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get already executed migrations
    const executedResult = await pool.query('SELECT name FROM _migrations');
    const executedMigrations = new Set(executedResult.rows.map(r => r.name));
    
    // Get all .sql files and sort them
    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    let migrationsRun = 0;
    
    for (const file of files) {
      // Skip if already executed
      if (executedMigrations.has(file)) {
        console.log(`  ⏭️  ${file} (already executed)`);
        continue;
      }
      
      console.log(`  Running ${file}...`);
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      
      // Run migration in a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✅ ${file} complete`);
        migrationsRun++;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
    
    if (migrationsRun === 0) {
      console.log('✅ All migrations already up to date!');
    } else {
      console.log(`✅ ${migrationsRun} migration(s) complete!`);
    }
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
