import AfricasTalking from 'africastalking';

// Initialize Africa's Talking
const africasTalking = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME // Usually 'sandbox' for testing, your username for production
});

const sms = africasTalking.SMS;

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number in format +254712345678
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise} - Africa's Talking API response
 */
export const sendOTP = async (phone, otp) => {
  try {
    const message = `Your Jari.Ecom verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    
    const result = await sms.send({
      to: [phone],
      message,
      from: process.env.AFRICASTALKING_SHORTCODE || null // Optional sender ID
    });
    
    console.log('OTP sent:', result);
    return result;
    
  } catch (error) {
    console.error('Africa\'s Talking SMS error:', error);
    throw error;
  }
};

/**
 * Send order confirmation SMS
 * @param {string} phone - Customer phone
 * @param {string} storeName - Merchant store name
 * @param {string} orderRef - Order reference
 * @param {number} amount - Order amount
 */
export const sendOrderConfirmation = async (phone, storeName, orderRef, amount) => {
  try {
    const message = `Order confirmed! ${storeName} received your KES ${amount} order (Ref: ${orderRef}). Track status at jarisolutionsecom.store`;
    
    const result = await sms.send({
      to: [phone],
      message,
      from: process.env.AFRICASTALKING_SHORTCODE || null
    });
    
    return result;
    
  } catch (error) {
    console.error('Order confirmation SMS error:', error);
    throw error;
  }
};

/**
 * Send booking confirmation SMS
 * @param {string} phone - Customer phone
 * @param {string} storeName - Merchant name
 * @param {string} serviceNa - Service name
 * @param {string} dateTime - Booking date/time
 */
export const sendBookingConfirmation = async (phone, storeName, serviceName, dateTime) => {
  try {
    const message = `Booking confirmed! ${storeName} - ${serviceName} on ${dateTime}. We'll send a reminder 24hrs before.`;
    
    const result = await sms.send({
      to: [phone],
      message,
      from: process.env.AFRICASTALKING_SHORTCODE || null
    });
    
    return result;
    
  } catch (error) {
    console.error('Booking confirmation SMS error:', error);
    throw error;
  }
};

/**
 * Send booking reminder SMS
 * @param {string} phone - Customer phone
 * @param {string} storeName - Merchant name
 * @param {string} serviceName - Service name
 * @param {string} timeUntil - e.g., "5 hours", "2 hours", "30 minutes"
 */
export const sendBookingReminder = async (phone, storeName, serviceName, timeUntil) => {
  try {
    const message = `Reminder: Your ${serviceName} booking with ${storeName} is in ${timeUntil}. See you soon!`;
    
    const result = await sms.send({
      to: [phone],
      message,
      from: process.env.AFRICASTALKING_SHORTCODE || null
    });
    
    return result;
    
  } catch (error) {
    console.error('Booking reminder SMS error:', error);
    throw error;
  }
};

/**
 * Send complaint link SMS (from order confirmation)
 * @param {string} phone - Customer phone
 * @param {string} complaintLink - Unique complaint link
 */
export const sendComplaintLink = async (phone, complaintLink) => {
  try {
    const message = `Have an issue with your order? File a complaint: ${complaintLink}`;
    
    const result = await sms.send({
      to: [phone],
      message,
      from: process.env.AFRICASTALKING_SHORTCODE || null
    });
    
    return result;
    
  } catch (error) {
    console.error('Complaint link SMS error:', error);
    throw error;
  }
};

export default {
  sendOTP,
  sendOrderConfirmation,
  sendBookingConfirmation,
  sendBookingReminder,
  sendComplaintLink
};
