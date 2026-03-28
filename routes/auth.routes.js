const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const db = require('../config/db');

const router = express.Router();
const JWT_SECRET = 'secret123';

// Initialize Resend with your API key
const resend = new Resend('re_iXFCjCub_MSPkHVABhgTPsFdd5Cb95j1K'); // Get free key from resend.com/api-keys

// In-memory storage for OTPs (use Redis in production)
const otpStore = new Map();

// Helper function to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// REGISTER (unchanged)
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, phone],
    (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: 'User exists' });
      }
      res.json({ success: true });
    }
  );
});

// LOGIN - Traditional (unchanged)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, result) => {
      if (err || result.length === 0) {
        return res.status(401).json({ success: false });
      }

      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ success: false });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        success: true,
        token,
        role: user.role,
        name: user.name,
        email: user.email,
        userId: user.id
      });
    }
  );
});

// SEND OTP - Email-based
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Invalid email' });
  }

  // Check if user exists
  db.query(
    'SELECT id, name, email, role FROM users WHERE email = ?',
    [email],
    async (err, result) => {
      if (err || result.length === 0) {
        return res.status(401).json({ success: false, message: 'Email not registered' });
      }

      const otp = generateOTP();
      const expiryTime = Date.now() + 5 * 60 * 1000;

      otpStore.set(email, {
        otp,
        expiryTime,
        userId: result[0].id,
        name: result[0].name,
        email: result[0].email,
        role: result[0].role
      });

      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev', // Resend's test email (use your domain later)
          to: email,
          subject: 'Your Login OTP',
          html: `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for 5 minutes.</p>`
        });

        console.log(`OTP sent to ${email}: ${otp}`);
        res.json({ success: true, message: 'OTP sent to your email' });
      } catch (error) {
        console.log('Email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
      }
    }
  );
});

// VERIFY OTP (unchanged)
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP required' });
  }

  const otpData = otpStore.get(email);

  if (!otpData) {
    return res.status(401).json({ success: false, message: 'OTP not found or expired' });
  }

  if (Date.now() > otpData.expiryTime) {
    otpStore.delete(email);
    return res.status(401).json({ success: false, message: 'OTP expired' });
  }

  if (otpData.otp !== otp) {
    return res.status(401).json({ success: false, message: 'Invalid OTP' });
  }

  const token = jwt.sign(
    { id: otpData.userId, role: otpData.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  otpStore.delete(email);

  res.json({
    success: true,
    token,
    role: otpData.role,
    name: otpData.name,
    email: otpData.email,
    userId: otpData.userId
  });
});

module.exports = router;