import { Router } from 'express';
import crypto from 'crypto';
import { auth } from '../middleware/auth.js';
import { sendOTP } from '../config/africastalking.js';
import db from '../config/database.js';

const router = Router();

// In-memory OTP storage (for production, use Redis)
const otpStore = new Map();

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP to phone number
 * POST /api/otp/send
 * Body: { phone: "+254712345678" }
 */
router.post('/send', async (req, res, next) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }
    
    // Validate phone format (Kenyan numbers)
    const phoneRegex = /^\+254[17]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        error: 'Invalid phone format. Use +254712345678' 
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
    
    // Store OTP (with rate limiting - max 3 attempts per phone per hour)
    const attempts = otpStore.get(`attempts:${phone}`) || [];
    const recentAttempts = attempts.filter(t => t > Date.now() - (60 * 60 * 1000));
    
    if (recentAttempts.length >= 3) {
      return res.status(429).json({ 
        error: 'Too many OTP requests. Try again in 1 hour.' 
      });
    }
    
    // Save OTP
    otpStore.set(phone, { otp, expiresAt });
    otpStore.set(`attempts:${phone}`, [...recentAttempts, Date.now()]);
    
    // Send via Africa's Talking
    await sendOTP(phone, otp);
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600 // seconds
    });
    
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

/**
 * Verify OTP
 * POST /api/otp/verify
 * Body: { phone: "+254712345678", otp: "123456" }
 */
router.post('/verify', async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }
    
    // Get stored OTP
    const stored = otpStore.get(phone);
    
    if (!stored) {
      return res.status(400).json({ error: 'No OTP found. Request a new one.' });
    }
    
    // Check expiration
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'OTP expired. Request a new one.' });
    }
    
    // Verify OTP
    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // OTP valid! Clean up
    otpStore.delete(phone);
    otpStore.delete(`attempts:${phone}`);
    
    res.json({
      success: true,
      message: 'Phone verified successfully'
    });
    
  } catch (err) {
    next(err);
  }
});

/**
 * Verify OTP and update merchant verification status
 * POST /api/otp/verify-merchant
 * Body: { phone: "+254712345678", otp: "123456" }
 * Headers: Authorization: Bearer <token>
 */
router.post('/verify-merchant', auth, async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }
    
    // Verify OTP first
    const stored = otpStore.get(phone);
    
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    // Get store ID
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Update merchant verification
    await db.query(
      `UPDATE merchant_verification 
       SET phone_verified = true, phone_verified_at = NOW()
       WHERE store_id = $1`,
      [storeId]
    );
    
    // Clean up OTP
    otpStore.delete(phone);
    otpStore.delete(`attempts:${phone}`);
    
    res.json({
      success: true,
      message: 'Phone verified and merchant verification updated'
    });
    
  } catch (err) {
    next(err);
  }
});

export default router;
