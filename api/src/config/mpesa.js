import axios from 'axios';

/**
 * M-Pesa Daraja API Configuration
 * 
 * Required Environment Variables:
 * - MPESA_CONSUMER_KEY
 * - MPESA_CONSUMER_SECRET
 * - MPESA_PASSKEY
 * - MPESA_SHORTCODE (Paybill or Till number)
 * - MPESA_ENV ('sandbox' or 'production')
 * - MPESA_CALLBACK_URL (Your API callback endpoint)
 */

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.env = process.env.MPESA_ENV || 'sandbox';
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    
    // API URLs based on environment
    this.baseUrl = this.env === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
      
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth access token from Daraja
   */
  async getAccessToken() {
    // Return cached token if still valid (with 1 min buffer)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in 3600 seconds (1 hour)
      this.tokenExpiry = Date.now() + (parseInt(response.data.expires_in) * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('[M-Pesa] Failed to get access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  /**
   * Generate password for STK Push
   */
  generatePassword() {
    const timestamp = this.getTimestamp();
    const str = this.shortcode + this.passkey + timestamp;
    return Buffer.from(str).toString('base64');
  }

  /**
   * Get timestamp in format YYYYMMDDHHmmss
   */
  getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Format phone number to 254XXXXXXXXX format
   */
  formatPhone(phone) {
    // Remove any spaces, dashes, or special characters
    let cleaned = phone.replace(/[\s\-\+]/g, '');
    
    // Handle different formats
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
   * Initiate STK Push (Lipa Na M-Pesa Online)
   * 
   * @param {string} phone - Customer phone number
   * @param {number} amount - Amount in KES
   * @param {string} accountRef - Account reference (e.g., "JARI-SUB-123")
   * @param {string} description - Transaction description
   * @returns {object} - STK Push response with CheckoutRequestID
   */
  async stkPush(phone, amount, accountRef, description = 'Jari Payment') {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();
      const formattedPhone = this.formatPhone(phone);

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline', // Use 'CustomerBuyGoodsOnline' for Till
        Amount: Math.round(amount), // Must be integer
        PartyA: formattedPhone, // Customer phone
        PartyB: this.shortcode, // Your shortcode
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountRef.substring(0, 12), // Max 12 chars
        TransactionDesc: description.substring(0, 13) // Max 13 chars
      };

      console.log('[M-Pesa] Initiating STK Push:', {
        phone: formattedPhone,
        amount,
        accountRef,
        shortcode: this.shortcode
      });

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[M-Pesa] STK Push Response:', response.data);

      if (response.data.ResponseCode === '0') {
        return {
          success: true,
          checkoutRequestId: response.data.CheckoutRequestID,
          merchantRequestId: response.data.MerchantRequestID,
          responseDescription: response.data.ResponseDescription
        };
      } else {
        return {
          success: false,
          error: response.data.ResponseDescription || 'STK Push failed'
        };
      }
    } catch (error) {
      console.error('[M-Pesa] STK Push Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment');
    }
  }

  /**
   * Query STK Push status
   * 
   * @param {string} checkoutRequestId - CheckoutRequestID from stkPush response
   * @returns {object} - Payment status
   */
  async queryStatus(checkoutRequestId) {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[M-Pesa] Query Response:', response.data);

      // ResultCode 0 = Success, 1032 = Cancelled, 1037 = Timeout
      const resultCode = response.data.ResultCode;
      
      return {
        success: resultCode === '0' || resultCode === 0,
        resultCode,
        resultDesc: response.data.ResultDesc,
        pending: resultCode === undefined // Still processing
      };
    } catch (error) {
      // Error code 500.001.1001 means transaction is still being processed
      if (error.response?.data?.errorCode === '500.001.1001') {
        return { pending: true, message: 'Transaction still processing' };
      }
      console.error('[M-Pesa] Query Error:', error.response?.data || error.message);
      throw new Error('Failed to query payment status');
    }
  }
}

// Export singleton instance
const mpesaService = new MpesaService();
export default mpesaService;
