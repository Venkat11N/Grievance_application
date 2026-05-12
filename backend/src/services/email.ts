import dotenv from 'dotenv';
dotenv.config();
import dns from 'dns';
import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const isProduction = process.env.NODE_ENV === 'production';
const emailDeliveryEnabled = isProduction || process.env.ENABLE_EMAIL_DELIVERY === 'true';
const useDevelopmentFallback = !emailDeliveryEnabled;
const allowInsecureSmtpTls = !isProduction && process.env.ALLOW_INSECURE_SMTP_TLS === 'true';

if (!emailUser || !emailPass) {
  console.warn('[EMAIL] WARNING: EMAIL_USER or EMAIL_PASS missing. OTP emails cannot be sent.');
}

const logDevelopmentOtp = (email: string, otp: string) => {
  console.log('\n======================================================');
  console.log(`DEV FALLBACK: OTP for ${email} is: ${otp}`);
  console.log('======================================================\n');
};

const createTransporter = async () => {
  const smtpHost = 'smtp.gmail.com';
  const resolvedHost = (await dns.promises.lookup(smtpHost, { family: 4 })).address;

  return nodemailer.createTransport({
    host: resolvedHost,
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      servername: smtpHost,
      rejectUnauthorized: !allowInsecureSmtpTls,
    },
  } as any);
};

export const sendOTPEmail = async (email: string, otp: string) => {
  if (useDevelopmentFallback) {
    console.log('[EMAIL] Email delivery disabled. Set ENABLE_EMAIL_DELIVERY=true to send OTP emails.');
    logDevelopmentOtp(email, otp);
    return;
  }

  if (!emailUser || !emailPass) {
    throw new Error('Email credentials missing. Set EMAIL_USER and EMAIL_PASS in your .env file.');
  }

  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: 'Your OTP for Maritime Grievance Portal',
      html: `<p>Your OTP is: <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });
    console.log(`[EMAIL] OTP email successfully sent to ${email}`);
  } catch (error: any) {
    console.error('[EMAIL] Failed to send email via SMTP:', error?.message || error);
    throw new Error(`Failed to send OTP email: ${error?.message || 'SMTP error'}`);
  }
};
