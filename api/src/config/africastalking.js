import AfricasTalking from 'africastalking';

// Lazy initialization - only initialize when env vars are present
let sms = null;

const initializeAT = () => {
  if (sms) return sms;
  
  // Check if credentials are available
  if (!process.env.AFRICASTALKING_API_KEY || !process.env.AFRICASTALKING_USERNAME) {
    console.warn('⚠️ Africa\'s Talking credentials not configured. SMS features disabled.');
    return null;
  }
  
  try {
    const africasTalking = AfricasTalking({
      apiKey: process.env.AFRICASTALKING_API_KEY,
      username: process.env.AFRICASTALKING_USERNAME
    });
    
    sms = africasTalking.SMS;
    console.log('✅ Africa\'s Talking initialized');
    return sms;
  } catch (error) {
    console.error('❌ Africa\'s Talking initialization failed:', error.message);
    return null;
  }
};

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number in format +254712345678
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise} - Africa's Talking API response
 */
export const sendOTP = async (phone, otp) => {
  const smsClient = initializeAT();
  
  if (!smsClient) {
    console.warn('SMS not sent - Africa\'s Talking not configured');
    // For development: Return mock success
    return { 
      SMSMessageData: { 
        Message: 'Mock OTP sent (AT not configured)',
        Recipients: [{ status: 'Success', number: phone }]
      }
    };
  }
  
  try {
    const message = `Your Jari.Ecom verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    
    const result = await smsClient.send({
      to: [phone],
      message,
      from: process.env.AFRICASTALKING_SHORTCODE || null
    });
    
    console.log('✅ OTP sent:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Africa\'s Talking SMS error:', error);
    throw error;
  }
};

/**
 * Send order confirmation SMS
 */
export const sendOrderConfirmation = async (phone, storeName, orderRef, amount) => {
  const smsClient = initializeAT();
  if (!smsClient) {
    console.warn('Order confirmation SMS not sent - AT not configured');
    return null;
  }
  
  try {
    const message = `Order confirmed! ${storeName} received your KES ${amount} order (Ref: ${orderRef}). Track status at jarisolutionsecom.store`;
    
    const result = await smsClient.send({
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
 */
export const sendBookingConfirmation = async (phone, storeName, serviceName, dateTime) => {
  const smsClient = initializeAT();
  if (!smsClient) {
    console.warn('Booking confirmation SMS not sent - AT not configured');
    return null;
  }
  
  try {
    const message = `Booking confirmed! ${storeName} - ${serviceName} on ${dateTime}. We'll send a reminder 24hrs before.`;
    
    const result = await smsClient.send({
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
 */
export const sendBookingReminder = async (phone, storeName, serviceName, timeUntil) => {
  const smsClient = initializeAT();
  if (!smsClient) {
    console.warn('Booking reminder SMS not sent - AT not configured');
    return null;
  }
  
  try {
    const message = `Reminder: Your ${serviceName} booking with ${storeName} is in ${timeUntil}. See you soon!`;
    
    const result = await smsClient.send({
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
 * Send complaint link SMS
 */
export const sendComplaintLink = async (phone, complaintLink) => {
  const smsClient = initializeAT();
  if (!smsClient) {
    console.warn('Complaint link SMS not sent - AT not configured');
    return null;
  }
  
  try {
    const message = `Have an issue with your order? File a complaint: ${complaintLink}`;
    
    const result = await smsClient.send({
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
