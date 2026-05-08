import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import dns from 'dns';

// Fix for Node 17+ DNS resolution issues with Gmail
// This forces Node to use IPv4, which resolves the ETIMEOUT error on Windows.
dns.setDefaultResultOrder('ipv4first');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.warn('[EMAIL] WARNING: EMAIL_USER or EMAIL_PASS is missing. OTP emails will fail.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4,
} as any);

export const sendOTPEmail = async (email: string, otp: string) => {
  if (!emailUser || !emailPass) {
    throw new Error('Email credentials are not configured. Set EMAIL_USER and EMAIL_PASS in your .env file.');
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
    console.error('[EMAIL] Gmail send failed:', error?.message || error);
    console.error('[EMAIL] Common causes: wrong App Password, 2FA not enabled, or Gmail security settings.');

    try {
      console.log('[EMAIL] Falling back to Ethereal test email...');
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });

      const info = await testTransporter.sendMail({
        from: '"eSamudra Test" <test@esamudra.dev>',
        to: email,
        subject: 'Your OTP for eSamudra Grievance Alerts',
        html: `<p>Your OTP is: <b>${otp}</b>. It expires in 10 minutes.</p>`,
      });

      console.log("\n=========================================");
      console.log("📨 TEST EMAIL GENERATED SUCCESSFULLY!");
      console.log("Click this link to view your email in the browser: " + nodemailer.getTestMessageUrl(info));
      console.log("=========================================\n");
    } catch (fallbackError: any) {
      console.error('[EMAIL] Even the test email failed:', fallbackError?.message || fallbackError);
      throw new Error('Failed to send OTP email via both Gmail and fallback.');
    }
  }
};