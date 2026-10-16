const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"CoreInventory" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP for CoreInventory Signup',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #111827;">CoreInventory</h2>
        <p style="color: #6b7280;">Use the OTP below to complete your signup:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280;">This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };