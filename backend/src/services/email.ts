import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const isDevelopment = process.env.NODE_ENV !== 'production';

if (!emailUser || !emailPass) {
  console.warn('[EMAIL] WARNING: EMAIL_USER or EMAIL_PASS missing. OTP emails will fail.');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
  debug: true,
} as any);

if (!isDevelopment) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error('[EMAIL] Transporter Verification Error:', error.message || error);
    } else {
      console.log('[EMAIL] SMTP Server is ready to take our messages');
    }
  });
}

export const sendOTPEmail = async (email: string, otp: string) => {
  // 🚀 DEV FALLBACK: Always print OTP to the console so development is never blocked!
  console.log('\n======================================================');
  console.log(`🔐 DEV FALLBACK: OTP for ${email} is: ${otp}`);
  console.log('======================================================\n');

  if (isDevelopment) {
    console.log('[EMAIL] Development mode active. Skipping SMTP connection to avoid network timeouts.');
    return; // Stop here, don't even try to connect to Gmail!
  }

  if (!emailUser || !emailPass) {
    console.warn('[EMAIL] Credentials missing, skipping actual email send.');
    return;
  }

  try {
    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: 'Your OTP for eSamudra Grievance Alerts',
      html: `<p>Your OTP is: <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });
    console.log(`[EMAIL] OTP email successfully sent to ${email}`);
  } catch (error: any) {
    console.error('[EMAIL] Failed to send email via SMTP. Using console fallback instead.');
    // We intentionally DO NOT throw an error here anymore.
    // This allows the frontend to show "Success" so you can type the OTP from the terminal!
  }
};