import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for eSamudra Grievance Alerts',
    html: `<p>Your OTP is: <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });
};