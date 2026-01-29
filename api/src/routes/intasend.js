import express from 'express';
import intaSendService from '../services/intasend.js';

const router = express.Router();

/**
 * Test IntaSend connection
 * GET /api/intasend/test
 */
router.get('/test', async (req, res) => {
  try {
    const result = await intaSendService.testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'IntaSend API connected successfully! ✅',
        mode: result.mode,
        wallets_count: result.wallets_count,
        wallets: result.wallets
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'IntaSend connection failed ❌',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing IntaSend connection',
      error: error.message
    });
  }
});

/**
 * Create test wallet
 * POST /api/intasend/test/create-wallet
 */
router.post('/test/create-wallet', async (req, res) => {
  try {
    const testStoreId = 'test-' + Date.now();
    const testStoreName = 'Test Store ' + Date.now();
    
    const result = await intaSendService.createMerchantWallet(testStoreId, testStoreName);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test wallet created! ✅',
        wallet: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Wallet creation failed ❌',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating test wallet',
      error: error.message
    });
  }
});

export default router;
