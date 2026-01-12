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
    
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Jari.Ecom API v2 running on port ${config.port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
}

start();
