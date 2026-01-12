import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { config } from '../config/env.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, businessName, instagram } = req.body;
    
    if (!email || !password || !businessName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const slug = (instagram?.replace('@', '') || businessName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
    
    // Create user and store in transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, profile)
         VALUES ($1, $2, $3) RETURNING id, email, profile`,
        [email, hash, { business_name: businessName, instagram }]
      );
      
      const user = userResult.rows[0];
      
      await client.query(
        `INSERT INTO stores (user_id, slug, config)
         VALUES ($1, $2, $3)`,
        [user.id, slug, { name: businessName, tagline: '', theme: 'warm-sunset' }]
      );
      
      await client.query('COMMIT');
      
      const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiry });
      
      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, ...user.profile }
      });
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email or store URL already exists' });
    }
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const result = await db.query(
      'SELECT id, email, password_hash, profile FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiry });
    
    res.json({
      token,
      user: { id: user.id, email: user.email, ...user.profile }
    });
    
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/me', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, email, profile FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({ id: user.id, email: user.email, ...user.profile });
    
  } catch (err) {
    next(err);
  }
});

export default router;
