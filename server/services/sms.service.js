// server/services/sms.service.js
const config = require('../config/config');

// In a real application, you would integrate with an SMS provider like Twilio, MSG91, etc.
// For now, we'll simulate sending SMS by logging to the console

/**
 * Send OTP via SMS
 * @param {string} phoneNumber - The recipient's phone number
 * @param {string} otp - The OTP to send
 * @returns {Promise<boolean>} - Whether the SMS was sent successfully
 */
    const accountsid="AC1b7c59e53957affa57a95e391bca3df6";
    const authtoken ="8c3129c10becee1dca5e101e968c5a26";
    const client = require("twilio")(accountsid,authtoken)
    
exports.sendOTP = async (phoneNumber, otp) => {
  try {
    const body="Hello User this is verification SMS from PropertyPredictionApp \n Do NOT SHARE with Other.\n Your OTP Is  "+otp
    // In a real application, you would call the SMS provider's API here
    ////console.log(`[SMS Service] Sending OTP ${otp} to ${phoneNumber}`);
    
    // Simulate API call
    //await new Promise(resolve => setTimeout(resolve, 500));
    let msgOption={
      from:"+15344449871",
      to:"+91"+phoneNumber,
      body,
    };
    const message = await client.messages.create(msgOption)
    
    console.log(`[SMS Service] OTP sent successfully to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error(`[SMS Service] Error sending OTP to ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Send notification via SMS
 * @param {string} phoneNumber - The recipient's phone number
 * @param {string} message - The message to send
 * @returns {Promise<boolean>} - Whether the SMS was sent successfully
 */
exports.sendNotification = async (phoneNumber, message) => {
  try {
    // In a real application, you would call the SMS provider's API here
    //console.log(`[SMS Service] Sending notification to ${phoneNumber}: ${message}`);
    
    // Simulate API call
    //await new Promise(resolve => setTimeout(resolve, 500));
    
   // console.log(`[SMS Service] Notification sent successfully to ${phoneNumber}`);
   let msgOption={
    from:"+15344449871",
    to:phoneNumber,
    message,
  };
  const message = await client.messages.create(msgOption)
  
  console.log(`[SMS Service] OTP sent successfully to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error(`[SMS Service] Error sending notification to ${phoneNumber}:`, error);
    throw error;
  }
};