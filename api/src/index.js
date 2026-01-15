import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import db from './config/database.js';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.text()); // For sendBeacon which sends as text/plain

// Routes
setupRoutes(app);

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function start() {
  try {
    // Test database connection
    await db.query('SELECT 1');
    console.log('✅ Database connected');
    
    // Auto-run essential migrations
    await runMigrations();
    
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Jari.Ecom API v2 running on port ${config.port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
}

// Run migrations on startup
async function runMigrations() {
  try {
    // Create pixel_events table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS pixel_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        event VARCHAR(50) NOT NULL,
        data JSONB DEFAULT '{}',
        utm_source VARCHAR(50) DEFAULT 'direct',
        utm_medium VARCHAR(50),
        utm_campaign VARCHAR(100),
        device VARCHAR(20),
        url TEXT,
        referrer TEXT,
        session_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create indexes if not exist
    await db.query(`CREATE INDEX IF NOT EXISTS idx_pixel_store_date ON pixel_events(store_id, created_at DESC)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_pixel_source ON pixel_events(store_id, utm_source)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_pixel_event ON pixel_events(store_id, event)`);
    
    console.log('✅ Migrations verified');
  } catch (err) {
    console.error('⚠️ Migration warning:', err.message);
  }
}

start();
