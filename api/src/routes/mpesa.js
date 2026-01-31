import { Router } from 'express';
import intaSendService from '../services/intasend.js';
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
      'SELECT id, config FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    const storeName = store.config?.storeName || store.config?.name || 'Store';
    
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
    
    // Generate API reference for tracking
    const apiRef = `JARI-${type.toUpperCase().substring(0, 3)}-${paymentId}`;
    
    // Initiate STK Push via IntaSend (platform payments go to Jari's master wallet)
    // Note: For platform payments, we don't specify a wallet_id - it goes to Jari's main account
    const stkResponse = await intaSendService.mpesaStkPush({
      phone_number: phone,
      email: `${store.id}@jari.eco`, // Placeholder email
      amount: amount,
      api_ref: apiRef,
      narrative: `Jari ${itemName || type}`
    });
    
    if (!stkResponse.success) {
      // Update payment as failed
      await db.query(
        'UPDATE platform_payments SET status = $1, error_message = $2 WHERE id = $3',
        ['failed', JSON.stringify(stkResponse.error), paymentId]
      );
      
      return res.status(400).json({ 
        success: false, 
        error: stkResponse.error 
      });
    }
    
    // Update payment with IntaSend invoice ID (store in checkout_request_id for now)
    // Note: invoice_id is the IntaSend tracking ID we use for status queries
    console.log('[Payment] Storing invoice_id:', stkResponse.invoice_id, 'for paymentId:', paymentId);
    await db.query(
      `UPDATE platform_payments 
       SET checkout_request_id = $1
       WHERE id = $2`,
      [stkResponse.invoice_id, paymentId]
    );
    
    res.json({
      success: true,
      paymentId,
      invoiceId: stkResponse.invoice_id,
      checkoutRequestId: apiRef,
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
    
    // Query IntaSend for current status using invoice ID (stored in checkout_request_id)
    const invoiceId = payment.checkout_request_id;
    console.log('[Payment] Status check - invoiceId:', invoiceId, 'paymentId:', paymentId);
    
    if (!invoiceId) {
      return res.json({
        success: false,
        status: payment.status || 'pending',
        message: 'No invoice ID stored yet'
      });
    }
    
    try {
      const statusResponse = await intaSendService.getPaymentStatus(invoiceId);
      console.log('[Payment] IntaSend status response:', statusResponse);
      
      if (statusResponse.error) {
        // IntaSend API error - return current DB status
        return res.json({
          success: false,
          status: payment.status || 'pending',
          message: 'Checking payment status...'
        });
      }
      
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
        `UPDATE platform_payments 
         SET status = $1, 
             result_desc = $2,
             mpesa_receipt_number = $3,
             completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE NULL END
         WHERE id = $4`,
        [newStatus, statusResponse.state, statusResponse.mpesa_reference, paymentId]
      );
      
      // If successful, activate the purchase
      if (statusResponse.success) {
        await activatePurchase(payment);
      }
      
      return res.json({
        success: statusResponse.success,
        status: newStatus,
        mpesaRef: statusResponse.mpesa_reference,
        message: statusResponse.state
      });
    } catch (statusErr) {
      console.error('[Payment] Status check error:', statusErr);
      // Return current DB status on error
      return res.json({
        success: false,
        status: payment.status || 'pending',
        message: 'Checking payment status...'
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
// MANUAL VERIFY & ACTIVATE (for debugging/recovery)
// ===========================================
router.post('/verify/:paymentId', auth, async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    
    // Get payment record
    const paymentResult = await db.query(
      `SELECT * FROM platform_payments WHERE id = $1 AND user_id = $2`,
      [paymentId, req.user.userId]
    );
    
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const payment = paymentResult.rows[0];
    
    // If already completed, just return success
    if (payment.status === 'completed') {
      return res.json({ success: true, message: 'Already activated', status: 'completed' });
    }
    
    // Query IntaSend for status
    const invoiceId = payment.checkout_request_id;
    console.log('[Manual Verify] Checking payment:', paymentId, 'invoice:', invoiceId);
    
    if (!invoiceId) {
      return res.status(400).json({ error: 'No invoice ID found for this payment' });
    }
    
    const statusResponse = await intaSendService.getPaymentStatus(invoiceId);
    console.log('[Manual Verify] IntaSend response:', statusResponse);
    
    // If IntaSend shows success (COMPLETE or CLEARING), activate
    if (statusResponse.success) {
      await db.query(
        `UPDATE platform_payments 
         SET status = 'completed', 
             mpesa_receipt_number = $1,
             completed_at = NOW()
         WHERE id = $2`,
        [statusResponse.mpesa_reference, paymentId]
      );
      
      // Activate the purchase
      await activatePurchase(payment);
      
      return res.json({
        success: true,
        message: 'Payment verified and activated!',
        status: 'completed',
        state: statusResponse.state,
        mpesaRef: statusResponse.mpesa_reference
      });
    }
    
    // Still pending
    if (statusResponse.pending) {
      return res.json({
        success: false,
        message: 'Payment still processing',
        status: 'pending',
        state: statusResponse.state
      });
    }
    
    // Failed
    return res.json({
      success: false,
      message: 'Payment verification failed',
      status: 'failed',
      state: statusResponse.state,
      error: statusResponse.error
    });
    
  } catch (err) {
    console.error('[Manual Verify] Error:', err);
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
// INTASEND WEBHOOK (Public endpoint)
// ===========================================
router.post('/intasend-webhook', async (req, res) => {
  try {
    console.log('[IntaSend Webhook] Received:', JSON.stringify(req.body, null, 2));
    
    // IntaSend webhook payload has invoice_id at top level (not nested)
    const { invoice_id, state, api_ref, mpesa_reference, challenge } = req.body;
    
    // Log for debugging
    console.log('[IntaSend Webhook] Parsed:', { invoice_id, state, api_ref, mpesa_reference });
    
    // Find payment by invoice_id (stored in checkout_request_id) or by api_ref
    let paymentResult = await db.query(
      'SELECT * FROM platform_payments WHERE checkout_request_id = $1 OR checkout_request_id = $2',
      [invoice_id, api_ref]
    );
    
    if (paymentResult.rows.length === 0) {
      console.log('[IntaSend Webhook] Payment not found for:', { invoice_id, api_ref });
      return res.json({ status: 'ok' });
    }
    
    const payment = paymentResult.rows[0];
    console.log('[IntaSend Webhook] Found payment:', payment.id, 'current status:', payment.status);
    
    // Skip if already completed
    if (payment.status === 'completed') {
      console.log('[IntaSend Webhook] Payment already completed, skipping');
      return res.json({ status: 'ok' });
    }
    
    // IntaSend states: PENDING, PROCESSING, CLEARING, COMPLETE, FAILED, CANCELLED
    // Treat CLEARING as complete for user experience (money received)
    if (state === 'COMPLETE' || state === 'CLEARING') {
      await db.query(
        `UPDATE platform_payments 
         SET status = 'completed', 
             mpesa_receipt_number = $1, 
             result_desc = $2,
             completed_at = NOW()
         WHERE id = $3`,
        [mpesa_reference, state, payment.id]
      );
      
      console.log('[IntaSend Webhook] Payment completed:', {
        paymentId: payment.id,
        mpesaRef: mpesa_reference,
        amount: payment.amount,
        state
      });
      
      // Activate the purchase
      await activatePurchase(payment);
      
    } else if (state === 'FAILED' || state === 'CANCELLED') {
      await db.query(
        `UPDATE platform_payments 
         SET status = 'failed', result_desc = $1 
         WHERE id = $2`,
        [state, payment.id]
      );
      
      console.log('[IntaSend Webhook] Payment failed:', {
        paymentId: payment.id,
        state
      });
    } else {
      console.log('[IntaSend Webhook] Payment still processing:', state);
    }
    
    res.json({ status: 'ok' });
    
  } catch (err) {
    console.error('[IntaSend Webhook] Error:', err);
    res.json({ status: 'ok' });
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
