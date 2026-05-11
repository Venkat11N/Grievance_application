interface OTPEntry {
  otp: string;
  expiresAt: Date;
}

const otpStore = new Map<string, OTPEntry>();

const isDevelopment = process.env.NODE_ENV !== 'production';
const MAGIC_OTP = '123456';

export const generateOTP = (email: string): string => {
  // In development, we still generate a real OTP for the console fallback,
  // but ensure it's not the same as our magic OTP.
  let otp = '';
  do {
    otp = Math.floor(100000 + Math.random() * 900000).toString();
  } while (isDevelopment && otp === MAGIC_OTP);

  otpStore.set(email, { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  return otp;
};

export const verifyOTP = (email: string, otp: string): boolean => {
  // 🚀 DEV SHORTCUT: Allow a magic OTP for easy testing in non-production environments
  if (isDevelopment && otp === MAGIC_OTP) {
    console.log(`[OTP] Development shortcut: Used magic OTP for ${email}.`);
    otpStore.delete(email); // Clean up any real OTP for this user
    return true;
  }

  const entry = otpStore.get(email);
  if (!entry) {
    console.log(`[OTP] Verification failed for ${email}: No OTP found in store.`);
    return false;
  }
  if (entry.expiresAt < new Date()) {
    console.log(`[OTP] Verification failed for ${email}: OTP expired.`);
    otpStore.delete(email);
    return false;
  }
  if (entry.otp === otp) {
    console.log(`[OTP] Verification successful for ${email}.`);
    otpStore.delete(email);
    return true;
  }

  console.log(`[OTP] Verification failed for ${email}: Invalid OTP provided.`);
  return false;
};