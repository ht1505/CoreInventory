const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendOTPEmail } = require('../utils/mailer');

const prisma = new PrismaClient();
const otpStore = {};

// ─── SIGNUP: Step 1 — Send OTP ───────────────────────────────────────────────
const sendOtp = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' });

  const validRoles = ['MANAGER', 'STAFF'];
  const userRole = validRoles.includes(role) ? role : 'STAFF';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return res.status(400).json({ error: 'Email already registered' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore[email] = { otp, expiresAt, name, email, password, role: userRole };

  await sendOTPEmail(email, otp);
  res.json({ message: 'OTP sent to your email' });
};

// ─── SIGNUP: Step 2 — Verify OTP and create account ─────────────────────────
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record)
    return res.status(400).json({ error: 'No OTP found for this email' });

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ error: 'OTP expired, please signup again' });
  }

  if (record.otp !== otp.trim())
    return res.status(400).json({ error: 'Invalid OTP' });

  const hashedPassword = await bcrypt.hash(record.password, 10);

  const user = await prisma.user.create({
    data: {
      name: record.name,
      email: record.email,
      passwordHash: hashedPassword,
      role: record.role,
    },
  });

  delete otpStore[email];

  res.json({
    message: 'Account created successfully',
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

// ─── FORGOT PASSWORD: Step 1 — Send OTP ─────────────────────────────────────
const forgotPasswordSendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ error: 'Email is required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return res.status(404).json({ error: 'No account found with this email' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store under a reset-specific key to avoid clash with signup OTPs
  otpStore[`reset_${email}`] = { otp, expiresAt };

  await sendOTPEmail(email, otp);
  res.json({ message: 'Password reset OTP sent to your email' });
};

// ─── FORGOT PASSWORD: Step 2 — Verify OTP and reset password ────────────────
const forgotPasswordVerifyOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ error: 'All fields required' });

  if (newPassword.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const record = otpStore[`reset_${email}`];

  if (!record)
    return res.status(400).json({ error: 'No OTP found. Please request a new one.' });

  if (Date.now() > record.expiresAt) {
    delete otpStore[`reset_${email}`];
    return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
  }

  if (record.otp !== otp.trim())
    return res.status(400).json({ error: 'Invalid OTP' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { passwordHash: hashedPassword },
  });

  delete otpStore[`reset_${email}`];

  res.json({ message: 'Password reset successfully. Please sign in.' });
};

module.exports = {
  sendOtp,
  verifyOtp,
  login,
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
};