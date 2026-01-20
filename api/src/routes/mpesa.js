import { Router } from 'express';
import mpesaService from '../config/mpesa.js';
import { auth } from '../middleware/auth.js';
import db from '../config/database.js';

const router = Router();

// ===========================================
// INITIATE STK PUSH
// ===========================================
router.post('/stk-push', auth, async (req, res, next) => {
  try {
    const { phone, amount, type, itemId, itemName } = req.body;
    
    // Validate required fields
    if (!phone || !amount || !type) {
      return res.status(400).json({ 
        error: 'Missing required fields: phone, amount, type' 
      });
    }

    // Get user's store
    const storeResult = await db.query(
      'SELECT id, name FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    
    // Generate account reference based on payment type
    const accountRef = `JARI-${type.toUpperCase().substring(0, 3)}-${store.id}`;
    
    // Create pending payment record
    const paymentResult = await db.query(
      `INSERT INTO platform_payments 
       (store_id, user_id, amount, type, item_id, item_name, phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING id`,
      [store.id, req.user.userId, amount, type, itemId || null, itemName || null, phone]
    );
    
    const paymentId = paymentResult.rows[0].id;
    
    // Initiate STK Push
    const stkResponse = await mpesaService.stkPush(
      phone,
      amount,
      accountRef,
      `Jari ${type}`
    );
    
    if (!stkResponse.success) {
      // Update payment as failed
      await db.query(
        'UPDATE platform_payments SET status = $1, error_message = $2 WHERE id = $3',
        ['failed', stkResponse.error, paymentId]
      );
      
      return res.status(400).json({ 
        success: false, 
        error: stkResponse.error 
      });
    }
    
    // Update payment with checkout request ID
    await db.query(
      `UPDATE platform_payments 
       SET checkout_request_id = $1, merchant_request_id = $2 
       WHERE id = $3`,
      [stkResponse.checkoutRequestId, stkResponse.merchantRequestId, paymentId]
    );
    
    res.json({
      success: true,
      paymentId,
      checkoutRequestId: stkResponse.checkoutRequestId,
      message: 'STK Push sent. Please check your phone and enter M-Pesa PIN.'
    });
    
  } catch (err) {
    console.error('[Payment] STK Push Error:', err);
    next(err);
  }
});

// ===========================================
// QUERY PAYMENT STATUS
// ===========================================
router.get('/status/:paymentId', auth, async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    
    // Get payment record
    const paymentResult = await db.query(
      `SELECT * FROM platform_payments 
       WHERE id = $1 AND user_id = $2`,
      [paymentId, req.user.userId]
    );
    
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const payment = paymentResult.rows[0];
    
    // If already completed or failed, return stored status
    if (payment.status === 'completed' || payment.status === 'failed') {
      return res.json({
        success: payment.status === 'completed',
        status: payment.status,
        mpesaRef: payment.mpesa_receipt_number,
        amount: payment.amount
      });
    }
    
    // Query M-Pesa for current status
    if (payment.checkout_request_id) {
      const statusResponse = await mpesaService.queryStatus(payment.checkout_request_id);
      
      if (statusResponse.pending) {
        return res.json({
          success: false,
          status: 'pending',
          message: 'Payment is still being processed'
        });
      }
      
      // Update payment status based on query
      const newStatus = statusResponse.success ? 'completed' : 'failed';
      await db.query(
        'UPDATE platform_payments SET status = $1, result_desc = $2 WHERE id = $3',
        [newStatus, statusResponse.resultDesc, paymentId]
      );
      
      // If successful, activate the purchase
      if (statusResponse.success) {
        await activatePurchase(payment);
      }
      
      return res.json({
        success: statusResponse.success,
        status: newStatus,
        message: statusResponse.resultDesc
      });
    }
    
    res.json({
      success: false,
      status: payment.status,
      message: 'Payment status unknown'
    });
    
  } catch (err) {
    console.error('[Payment] Status Query Error:', err);
    next(err);
  }
});

// ===========================================
// M-PESA CALLBACK (Public endpoint)
// ===========================================
router.post('/callback', async (req, res) => {
  try {
    console.log('[M-Pesa Callback] Received:', JSON.stringify(req.body, null, 2));
    
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      console.log('[M-Pesa Callback] Invalid callback format');
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    
    const callback = Body.stkCallback;
    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;
    
    // Find the payment
    const paymentResult = await db.query(
      'SELECT * FROM platform_payments WHERE checkout_request_id = $1',
      [checkoutRequestId]
    );
    
    if (paymentResult.rows.length === 0) {
      console.log('[M-Pesa Callback] Payment not found for:', checkoutRequestId);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    
    const payment = paymentResult.rows[0];
    
    if (resultCode === 0) {
      // Payment successful - extract M-Pesa receipt
      let mpesaReceiptNumber = null;
      let transactionDate = null;
      
      if (callback.CallbackMetadata && callback.CallbackMetadata.Item) {
        for (const item of callback.CallbackMetadata.Item) {
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceiptNumber = item.Value;
          }
          if (item.Name === 'TransactionDate') {
            transactionDate = item.Value;
          }
        }
      }
      
      // Update payment as completed
      await db.query(
        `UPDATE platform_payments 
         SET status = 'completed', 
             mpesa_receipt_number = $1, 
             result_desc = $2,
             completed_at = NOW()
         WHERE id = $3`,
        [mpesaReceiptNumber, resultDesc, payment.id]
      );
      
      console.log('[M-Pesa Callback] Payment completed:', {
        paymentId: payment.id,
        mpesaRef: mpesaReceiptNumber,
        amount: payment.amount
      });
      
      // Activate the purchase
      await activatePurchase(payment);
      
    } else {
      // Payment failed
      await db.query(
        `UPDATE platform_payments 
         SET status = 'failed', result_desc = $1 
         WHERE id = $2`,
        [resultDesc, payment.id]
      );
      
      console.log('[M-Pesa Callback] Payment failed:', {
        paymentId: payment.id,
        reason: resultDesc
      });
    }
    
    // Always respond with success to M-Pesa
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    
  } catch (err) {
    console.error('[M-Pesa Callback] Error:', err);
    // Still respond with success to prevent retries
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

// ===========================================
// GET PAYMENT HISTORY
// ===========================================
router.get('/history', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, amount, type, item_name, status, mpesa_receipt_number, 
              created_at, completed_at
       FROM platform_payments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.userId]
    );
    
    res.json({
      success: true,
      payments: result.rows
    });
  } catch (err) {
    next(err);
  }
});

// ===========================================
// HELPER: Activate purchase based on type
// ===========================================
async function activatePurchase(payment) {
  const { store_id, type, item_id, amount } = payment;
  
  console.log('[Activate] Processing:', { store_id, type, item_id, amount });
  
  try {
    switch (type) {
      case 'subscription':
        // Extend subscription by 1 month
        await db.query(
          `UPDATE stores 
           SET subscription_status = 'active',
               subscription_expires = COALESCE(
                 CASE WHEN subscription_expires > NOW() 
                      THEN subscription_expires + INTERVAL '1 month'
                      ELSE NOW() + INTERVAL '1 month'
                 END,
                 NOW() + INTERVAL '1 month'
               )
           WHERE id = $1`,
          [store_id]
        );
        console.log('[Activate] Subscription extended for store:', store_id);
        break;
        
      case 'addon':
        // Activate add-on
        if (item_id) {
          await db.query(
            `INSERT INTO store_addons (store_id, addon_type, activated_at, expires_at)
             VALUES ($1, $2, NOW(), NOW() + INTERVAL '1 month')
             ON CONFLICT (store_id, addon_type) 
             DO UPDATE SET activated_at = NOW(), expires_at = NOW() + INTERVAL '1 month'`,
            [store_id, item_id]
          );
          console.log('[Activate] Add-on activated:', item_id);
        }
        break;
        
      case 'cards':
        // Add product card slots
        const cardCount = getCardCountFromAmount(amount);
        await db.query(
          `UPDATE stores 
           SET product_card_limit = COALESCE(product_card_limit, 3) + $1
           WHERE id = $2`,
          [cardCount, store_id]
        );
        console.log('[Activate] Added', cardCount, 'cards to store:', store_id);
        break;
        
      case 'theme':
        // Unlock theme
        if (item_id) {
          await db.query(
            `INSERT INTO store_themes (store_id, theme_slug, unlocked_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (store_id, theme_slug) DO NOTHING`,
            [store_id, item_id]
          );
          console.log('[Activate] Theme unlocked:', item_id);
        }
        break;
        
      default:
        console.log('[Activate] Unknown payment type:', type);
    }
  } catch (err) {
    console.error('[Activate] Error:', err);
    // Don't throw - payment is already confirmed, log for manual review
  }
}

// Helper: Get card count from payment amount
function getCardCountFromAmount(amount) {
  if (amount >= 850) return 12;  // Pro Pack (+12 = 15 total)
  if (amount >= 550) return 7;   // Growth Pack (+7 = 10 total)
  if (amount >= 350) return 4;   // Starter Pack (+4 = 7 total)
  return 1; // Single card
}

export default router;
