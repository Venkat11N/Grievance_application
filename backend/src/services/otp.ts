interface OTPEntry {
  otp: string;
  expiresAt: Date;
}

const otpStore = new Map<string, OTPEntry>();

export const generateOTP = (email: string): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  return otp;
};

export const verifyOTP = (email: string, otp: string): boolean => {
  const entry = otpStore.get(email);
  if (!entry) return false;
  if (entry.expiresAt < new Date()) {
    otpStore.delete(email);
    return false;
  }
  if (entry.otp === otp) {
    otpStore.delete(email);
    return true;
  }
  return false;
};