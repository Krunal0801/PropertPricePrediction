// Validate email
export const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };
  
  // Validate phone number (Indian format)
  export const validatePhoneNumber = (phoneNumber) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phoneNumber);
  };
  
  // Validate password (at least 6 characters, one uppercase, one lowercase, one number)
  export const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(password);
  };
  
  // Validate OTP (6 digits)
  export const validateOTP = (otp) => {
    const regex = /^\d{6}$/;
    return regex.test(otp);
  };
  