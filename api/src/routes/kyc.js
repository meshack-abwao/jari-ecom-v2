import express from 'express';
import { auth } from '../middleware/auth.js';
import db from '../config/database.js';
import intaSendService from '../services/intasend.js';

const router = express.Router();

/**
 * Get KYC status for current user's store
 * GET /api/kyc/status
 */
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get store_id from user
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Get KYC status
    const kycResult = await db.query(
      'SELECT * FROM merchant_kyc WHERE store_id = $1',
      [storeId]
    );
    
    if (kycResult.rows.length === 0) {
      return res.json({
        exists: false,
        status: null,
        message: 'KYC not started'
      });
    }
    
    const kyc = kycResult.rows[0];
    
    res.json({
      exists: true,
      status: kyc.status,
      business_type: kyc.business_type,
      submitted_at: kyc.submitted_at,
      approved_at: kyc.approved_at,
      rejected_at: kyc.rejected_at,
      rejection_reason: kyc.rejection_reason,
      resubmission_count: kyc.resubmission_count,
      intasend_wallet_id: kyc.intasend_wallet_id,
      kyc_data: {
        business_type: kyc.business_type,
        national_id_front: kyc.national_id_front,
        national_id_back: kyc.national_id_back,
        kra_pin_cert: kyc.kra_pin_cert,
        owner_full_name: kyc.owner_full_name,
        owner_id_number: kyc.owner_id_number,
        owner_kra_pin: kyc.owner_kra_pin,
        business_registration_cert: kyc.business_registration_cert,
        business_name: kyc.business_name,
        physical_address: kyc.physical_address,
        city: kyc.city,
        county: kyc.county,
        postal_code: kyc.postal_code,
        directors_list: kyc.directors_list,
        board_resolution_letter: kyc.board_resolution_letter
      }
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
});

/**
 * Submit KYC documents
 * POST /api/kyc/submit
 */
router.post('/submit', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      business_type,
      national_id_front,
      national_id_back,
      kra_pin_cert,
      owner_full_name,
      owner_id_number,
      owner_kra_pin,
      business_registration_cert,
      business_name,
      physical_address,
      city,
      county,
      postal_code,
      directors_list,
      board_resolution_letter
    } = req.body;
    
    // Get store_id
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Validate required fields based on business type
    const requiredPersonal = [national_id_front, national_id_back, kra_pin_cert, owner_full_name, owner_id_number, owner_kra_pin, physical_address, city, county];
    
    if (requiredPersonal.some(field => !field)) {
      return res.status(400).json({ error: 'Missing required personal documents' });
    }
    
    if (business_type === 'limited_company') {
      if (!business_registration_cert || !business_name || !directors_list || !board_resolution_letter) {
        return res.status(400).json({ error: 'Missing required business documents for limited company' });
      }
    }
    
    // Insert or update KYC
    const kycResult = await db.query(
      `INSERT INTO merchant_kyc (
        store_id, business_type, status,
        national_id_front, national_id_back, kra_pin_cert,
        owner_full_name, owner_id_number, owner_kra_pin,
        business_registration_cert, business_name,
        physical_address, city, county, postal_code,
        directors_list, board_resolution_letter,
        docs_completed_at
      ) VALUES ($1, $2, 'docs_uploaded', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      ON CONFLICT (store_id) DO UPDATE SET
        business_type = $2,
        status = 'docs_uploaded',
        national_id_front = $3,
        national_id_back = $4,
        kra_pin_cert = $5,
        owner_full_name = $6,
        owner_id_number = $7,
        owner_kra_pin = $8,
        business_registration_cert = $9,
        business_name = $10,
        physical_address = $11,
        city = $12,
        county = $13,
        postal_code = $14,
        directors_list = $15,
        board_resolution_letter = $16,
        docs_completed_at = NOW(),
        updated_at = NOW()
      RETURNING id`,
      [
        storeId, business_type,
        national_id_front, national_id_back, kra_pin_cert,
        owner_full_name, owner_id_number, owner_kra_pin,
        business_registration_cert, business_name,
        physical_address, city, county, postal_code,
        directors_list, board_resolution_letter
      ]
    );
    
    const kycId = kycResult.rows[0].id;
    
    // Log submission (optional - removed for now to prevent timeout)
    try {
      await db.query(
        `INSERT INTO kyc_submissions (kyc_id, submission_type, submitted_by, documents_submitted)
         VALUES ($1, 'initial', $2, $3)`,
        [kycId, req.user.email || 'unknown', JSON.stringify({
          national_id_front, national_id_back, kra_pin_cert,
          business_registration_cert, directors_list, board_resolution_letter
        })]
      );
    } catch (logError) {
      console.error('KYC submission logging failed (non-critical):', logError);
      // Continue anyway - logging is not critical
    }
    
    res.json({
      success: true,
      status: 'docs_uploaded',
      message: 'KYC documents submitted successfully'
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({ error: 'Failed to submit KYC documents' });
  }
});

/**
 * Submit KYC for IntaSend review
 * POST /api/kyc/submit-for-review
 * Changes status from 'docs_uploaded' to 'submitted_to_intasend'
 */
router.post('/submit-for-review', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get store_id
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Check if KYC exists and is in docs_uploaded status
    const kycResult = await db.query(
      'SELECT id, status FROM merchant_kyc WHERE store_id = $1',
      [storeId]
    );
    
    if (kycResult.rows.length === 0) {
      return res.status(404).json({ error: 'No KYC record found. Please upload documents first.' });
    }
    
    const kyc = kycResult.rows[0];
    
    if (kyc.status !== 'docs_uploaded') {
      return res.status(400).json({ 
        error: `Cannot submit from status '${kyc.status}'. Must be 'docs_uploaded'.` 
      });
    }
    
    // Update status to submitted_to_intasend
    await db.query(
      `UPDATE merchant_kyc SET
        status = 'submitted_to_intasend',
        submitted_at = NOW(),
        updated_at = NOW()
      WHERE id = $1`,
      [kyc.id]
    );
    
    res.json({
      success: true,
      status: 'submitted_to_intasend',
      message: 'KYC submitted for IntaSend review'
    });
  } catch (error) {
    console.error('Submit for review error:', error);
    res.status(500).json({ error: 'Failed to submit for review' });
  }
});

/**
 * Resubmit KYC (after rejection)
 * POST /api/kyc/resubmit
 */
router.post('/resubmit', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const documentsData = req.body;
    
    // Get store_id
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Check if KYC exists and is rejected
    const kycResult = await db.query(
      'SELECT id, status FROM merchant_kyc WHERE store_id = $1',
      [storeId]
    );
    
    if (kycResult.rows.length === 0) {
      return res.status(404).json({ error: 'No KYC record found' });
    }
    
    const kyc = kycResult.rows[0];
    
    if (kyc.status !== 'rejected') {
      return res.status(400).json({ error: 'Can only resubmit rejected KYC' });
    }
    
    // Update KYC with new documents
    await db.query(
      `UPDATE merchant_kyc SET
        status = 'docs_uploaded',
        resubmission_count = resubmission_count + 1,
        rejection_reason = NULL,
        rejected_at = NULL,
        updated_at = NOW()
      WHERE id = $1`,
      [kyc.id]
    );
    
    // Log resubmission
    await db.query(
      `INSERT INTO kyc_submissions (kyc_id, submission_type, submitted_by, documents_submitted)
       VALUES ($1, 'resubmission', $2, $3)`,
      [kyc.id, req.user.email, JSON.stringify(documentsData)]
    );
    
    res.json({
      success: true,
      status: 'docs_uploaded',
      message: 'KYC resubmitted successfully'
    });
  } catch (error) {
    console.error('Resubmit KYC error:', error);
    res.status(500).json({ error: 'Failed to resubmit KYC' });
  }
});

/**
 * Approve KYC and create IntaSend wallet (Admin only - placeholder)
 * POST /api/kyc/approve/:kycId
 */
router.post('/approve/:kycId', auth, async (req, res) => {
  try {
    // TODO: Add admin auth check
    const { kycId } = req.params;
    
    // Get KYC details
    const kycResult = await db.query(
      `SELECT k.*, s.name as store_name, s.id as store_id
       FROM merchant_kyc k
       JOIN stores s ON k.store_id = s.id
       WHERE k.id = $1`,
      [kycId]
    );
    
    if (kycResult.rows.length === 0) {
      return res.status(404).json({ error: 'KYC not found' });
    }
    
    const kyc = kycResult.rows[0];
    
    // Create IntaSend wallet
    const walletResult = await intaSendService.createMerchantWallet(
      kyc.store_id,
      kyc.store_name
    );
    
    if (!walletResult.success) {
      return res.status(500).json({
        error: 'Failed to create IntaSend wallet',
        details: walletResult.error
      });
    }
    
    // Update KYC status
    await db.query(
      `UPDATE merchant_kyc SET
        status = 'approved',
        intasend_wallet_id = $1,
        intasend_wallet_label = $2,
        approved_at = NOW()
      WHERE id = $3`,
      [walletResult.wallet_id, walletResult.label, kycId]
    );
    
    // Activate M-Pesa STK addon
    await db.query(
      `INSERT INTO store_addons (store_id, addon_name, active, activated_at)
       VALUES ($1, 'mpesa_stk', true, NOW())
       ON CONFLICT (store_id, addon_name) DO UPDATE SET
         active = true,
         activated_at = NOW()`,
      [kyc.store_id]
    );
    
    res.json({
      success: true,
      wallet_id: walletResult.wallet_id,
      message: 'KYC approved and wallet created'
    });
  } catch (error) {
    console.error('Approve KYC error:', error);
    res.status(500).json({ error: 'Failed to approve KYC' });
  }
});

/**
 * Reject KYC (Admin only - placeholder)
 * POST /api/kyc/reject/:kycId
 */
router.post('/reject/:kycId', auth, async (req, res) => {
  try {
    // TODO: Add admin auth check
    const { kycId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }
    
    await db.query(
      `UPDATE merchant_kyc SET
        status = 'rejected',
        rejection_reason = $1,
        rejected_at = NOW()
      WHERE id = $2`,
      [reason, kycId]
    );
    
    res.json({
      success: true,
      message: 'KYC rejected'
    });
  } catch (error) {
    console.error('Reject KYC error:', error);
    res.status(500).json({ error: 'Failed to reject KYC' });
  }
});

/**
 * MOCK: Approve KYC instantly for testing (DEV/SANDBOX ONLY)
 * POST /api/kyc/mock-approve
 * Bypasses IntaSend wallet creation, sets test wallet ID
 */
router.post('/mock-approve', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log('🧪 [MOCK APPROVE] Starting...', { userId });
    
    // Get store_id
    const storeResult = await db.query(
      'SELECT id, name FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      console.log('❌ [MOCK APPROVE] Store not found');
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    console.log('✅ [MOCK APPROVE] Store found:', { storeId: store.id, storeName: store.name });
    
    // Check if KYC exists
    const kycResult = await db.query(
      'SELECT id, status FROM merchant_kyc WHERE store_id = $1',
      [store.id]
    );
    
    if (kycResult.rows.length === 0) {
      console.log('❌ [MOCK APPROVE] No KYC found');
      return res.status(404).json({ error: 'No KYC found. Please submit KYC documents first.' });
    }
    
    const kyc = kycResult.rows[0];
    console.log('✅ [MOCK APPROVE] KYC found:', { kycId: kyc.id, status: kyc.status });
    
    if (kyc.status === 'approved') {
      console.log('⚠️ [MOCK APPROVE] Already approved');
      return res.json({
        success: true,
        message: '✅ KYC Already Approved',
        wallet_id: kyc.intasend_wallet_id,
        wallet_label: kyc.intasend_wallet_label,
        note: 'KYC was already approved'
      });
    }
    
    // Generate mock wallet ID (safe string manipulation)
    const storeIdShort = store.id.replace(/-/g, '').substring(0, 8);
    const mockWalletId = `MOCK_${storeIdShort}`;
    const mockWalletLabel = `JARI_${store.name.replace(/[^a-zA-Z0-9]/g, '_')}_TEST`;
    
    console.log('🏦 [MOCK APPROVE] Generated wallet:', { mockWalletId, mockWalletLabel });
    
    // Update KYC status to approved with mock wallet
    const updateResult = await db.query(
      `UPDATE merchant_kyc SET
        status = 'approved',
        intasend_wallet_id = $1,
        intasend_wallet_label = $2,
        approved_at = NOW(),
        updated_at = NOW()
      WHERE id = $3
      RETURNING id, status, intasend_wallet_id`,
      [mockWalletId, mockWalletLabel, kyc.id]
    );
    
    console.log('✅ [MOCK APPROVE] KYC updated:', updateResult.rows[0]);
    
    res.json({
      success: true,
      message: '🎉 KYC MOCK APPROVED!',
      wallet_id: mockWalletId,
      wallet_label: mockWalletLabel,
      note: 'This is a MOCK wallet for testing. M-Pesa payments will use sandbox.'
    });
    
    console.log('✅ [MOCK APPROVE] Success response sent');
    
  } catch (error) {
    console.error('❌ [MOCK APPROVE] ERROR:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Failed to mock approve KYC',
      details: error.message 
    });
  }
});

/**
 * Create support ticket
 * POST /api/kyc/support
 */
router.post('/support', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject, message, whatsapp } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message required' });
    }
    
    // Get store_id
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Get KYC id if exists
    const kycResult = await db.query(
      'SELECT id FROM merchant_kyc WHERE store_id = $1',
      [storeId]
    );
    
    const kycId = kycResult.rows.length > 0 ? kycResult.rows[0].id : null;
    
    // Create ticket
    await db.query(
      `INSERT INTO kyc_support_tickets (kyc_id, store_id, subject, message, merchant_email, merchant_whatsapp)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [kycId, storeId, subject, message, req.user.email, whatsapp]
    );
    
    res.json({
      success: true,
      message: 'Support ticket created. We will contact you soon.'
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

export default router;
