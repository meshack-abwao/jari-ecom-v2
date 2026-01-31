import axios from 'axios';

/**
 * IntaSend Wallet-as-a-Service Integration
 * Docs: https://developers.intasend.com/docs/wallets
 */
class IntaSendService {
  constructor() {
    this.isTest = process.env.INTASEND_TEST === 'true';
    this.baseURL = process.env.INTASEND_BASE_URL || 'https://sandbox.intasend.com/api/v1';
    this.secretKey = process.env.INTASEND_SECRET_KEY;
    this.publishableKey = process.env.INTASEND_PUBLISHABLE_KEY;
    
    if (!this.secretKey || !this.publishableKey) {
      console.warn('⚠️  IntaSend credentials not configured');
    } else {
      console.log(`✅ IntaSend initialized (${this.isTest ? 'TEST' : 'LIVE'} mode)`);
    }
  }
  
  /**
   * Test connection to IntaSend API
   * @returns {Promise<Object>} Connection status
   */
  async testConnection() {
    try {
      // Try to list wallets (simplest read-only operation)
      const response = await axios.get(
        `${this.baseURL}/wallets/`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        success: true,
        message: 'IntaSend connection successful',
        mode: this.isTest ? 'TEST' : 'LIVE',
        wallets_count: response.data.length,
        wallets: response.data
      };
    } catch (error) {
      console.error('IntaSend connection failed:', error.response?.data || error.message);
      return {
        success: false,
        message: 'IntaSend connection failed',
        error: error.response?.data || error.message
      };
    }
  }
  
  /**
   * Create a new working wallet for a merchant
   * @param {string} storeId - Store UUID
   * @param {string} storeName - Store name for label
   * @returns {Promise<Object>} Wallet creation result
   */
  async createMerchantWallet(storeId, storeName) {
    try {
      const label = `JARI_${storeId.substring(0, 8)}`; // Unique short label
      
      const response = await axios.post(
        `${this.baseURL}/wallets/`,
        {
          currency: 'KES',
          label: label,
          can_disburse: true, // Allow merchant to withdraw funds
          wallet_type: 'WORKING' // Sub-account (not settlement)
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Wallet created for ${storeName}:`, response.data.wallet_id);
      
      return {
        success: true,
        wallet_id: response.data.wallet_id,
        label: response.data.label,
        currency: response.data.currency,
        balance: response.data.current_balance,
        can_disburse: response.data.can_disburse
      };
    } catch (error) {
      console.error('Wallet creation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
  
  /**
   * Get wallet balance and details
   * @param {string} walletId - IntaSend wallet ID
   * @returns {Promise<Object>} Wallet details
   */
  async getWalletBalance(walletId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/wallets/${walletId}/`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );
      
      return {
        success: true,
        wallet_id: response.data.wallet_id || response.data.id,
        currency: response.data.currency,
        current_balance: response.data.current_balance,
        available_balance: response.data.available_balance,
        wallet_type: response.data.wallet_type
      };
    } catch (error) {
      console.error('Get wallet balance failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
  
  /**
   * Format phone number to 254XXXXXXXXX format
   */
  formatPhone(phone) {
    if (!phone) return phone;
    let cleaned = phone.toString().replace(/[\s\-\+]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      cleaned = '254' + cleaned;
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  }

  /**
   * Initiate M-Pesa STK Push to merchant wallet
   * @param {Object} params - Payment parameters
   * @returns {Promise<Object>} Payment initiation result
   */
  async mpesaStkPush({ wallet_id, phone_number, email, amount, api_ref, narrative = 'Purchase' }) {
    try {
      const formattedPhone = this.formatPhone(phone_number);
      
      // IntaSend Collection API uses public_key in body, not Bearer token
      const payload = {
        public_key: this.publishableKey,
        phone_number: formattedPhone,
        email: email || 'customer@jari.eco',
        amount: Math.round(amount),
        currency: 'KES',
        api_ref: api_ref,
        narrative: narrative.substring(0, 20),
        method: 'M-PESA'
      };
      
      // Only add wallet_id if provided (for merchant payments)
      if (wallet_id) {
        payload.wallet_id = wallet_id;
      }
      
      console.log('[IntaSend] STK Push request:', {
        url: `${this.baseURL}/payment/collection/`,
        phone: formattedPhone,
        amount,
        api_ref
      });

      const response = await axios.post(
        `${this.baseURL}/payment/collection/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ STK Push initiated: ${api_ref}`, response.data);
      
      return {
        success: true,
        invoice_id: response.data.invoice?.id || response.data.id,
        state: response.data.invoice?.state || response.data.state,
        amount: response.data.invoice?.value || response.data.value,
        phone_number: response.data.invoice?.account || formattedPhone
      };
    } catch (error) {
      console.error('[IntaSend] STK Push failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Query payment/invoice status
   * @param {string} invoiceId - IntaSend invoice ID
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(invoiceId) {
    try {
      // IntaSend status API uses POST with public_key and invoice_id in body
      const response = await axios.post(
        `${this.baseURL}/payment/status/`,
        {
          public_key: this.publishableKey,
          invoice_id: invoiceId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const invoice = response.data.invoice || response.data;
      const state = invoice.state || invoice.status;
      
      console.log('[IntaSend] Payment status:', { invoiceId, state });
      
      // IntaSend states: PENDING, PROCESSING, COMPLETE, FAILED, CANCELLED
      return {
        success: state === 'COMPLETE',
        pending: state === 'PENDING' || state === 'PROCESSING',
        state: state,
        mpesa_reference: invoice.mpesa_reference || invoice.provider_reference,
        amount: invoice.value || invoice.amount
      };
    } catch (error) {
      console.error('[IntaSend] Get payment status failed:', {
        invoiceId,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return {
        success: false,
        pending: false,
        error: error.response?.data || error.message
      };
    }
  }
}

export default new IntaSendService();
