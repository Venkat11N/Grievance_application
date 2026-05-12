interface OTPEntry {
  otp: string;
  expiresAt: Date;
}

const otpStore = new Map<string, OTPEntry>();

const isDevelopment = process.env.NODE_ENV !== 'production';
const magicOtpEnabled = process.env.ENABLE_MAGIC_OTP === 'true';
const MAGIC_OTP = '123456';

export const generateOTP = (email: string): string => {
  let otp = '';
  do {
    otp = Math.floor(100000 + Math.random() * 900000).toString();
  } while (isDevelopment && magicOtpEnabled && otp === MAGIC_OTP);

  otpStore.set(email, { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  return otp;
};

export const verifyOTP = (email: string, otp: string): boolean => {
  const entry = otpStore.get(email);

  if (isDevelopment && magicOtpEnabled && otp === MAGIC_OTP) {
    if (!entry) {
      console.log(`[OTP] Magic OTP rejected for ${email}: no prior OTP request found.`);
      return false;
    }
    if (entry.expiresAt <= new Date()) {
      console.log(`[OTP] Magic OTP rejected for ${email}: OTP expired.`);
      otpStore.delete(email);
      return false;
    }
    console.log(`[OTP] Development shortcut: Used magic OTP for ${email}.`);
    otpStore.delete(email);
    return true;
  }

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
