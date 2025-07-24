const express=require('express');
const router=express.Router();
const con=require('../db/config');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();
const validator = require('validator');
const jwt = require('jsonwebtoken');

router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
}); 



router.post('/send-otp', (req, res) => {
  let { email } = req.body;
  email = validator.trim(email || '');
  email = validator.normalizeEmail(email, { gmail_remove_dots: false });
  if (!email || !validator.isEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
  const otp = crypto.randomInt(1000, 10000).toString();
  con.query(
    "INSERT INTO otp_verification (email, otp, purpose) VALUES (?, ?, ?)",
    [email, otp, 'signup'],
    (err, result) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Failed to save OTP' });
      }
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
      });
      transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`
      }, (mailErr, info) => {
        if (mailErr) {
          console.error('Mail error:', mailErr);
          return res.status(500).json({ error: 'Failed to send OTP email' });
        }
        res.json({ message: 'OTP sent successfully' });
      });
    }
  );
});


router.post('/verify-otp', (req, res) => {
  let { email, otp } = req.body;
  email = validator.trim(email || '');
  email = validator.normalizeEmail(email, { gmail_remove_dots: false });
  otp = validator.trim(otp || '');
  if (!email || !validator.isEmail(email) || !otp || !validator.isNumeric(otp)) return res.status(400).json({ error: 'Valid email and OTP are required' });
  con.query(
    "SELECT otp FROM otp_verification WHERE email = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1",
    [email, 'signup'],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
      if (results.length === 0 || results[0].otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
      res.json({ message: 'OTP verified' });
    }
  );
});


router.post('/forgot-password/send-otp', (req, res) => {
  let { email } = req.body;
  email = validator.trim(email || '');
  email = validator.normalizeEmail(email, { gmail_remove_dots: false });
  if (!email || !validator.isEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
  // Check if email exists in users table
  con.query(
    'SELECT id FROM users WHERE email = ?',
    [email],
    (err, results) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Email not found' });
      }
      // Email exists, proceed to send OTP
      const otp = crypto.randomInt(1000, 10000).toString();
      con.query(
        "INSERT INTO otp_verification (email, otp, purpose) VALUES (?, ?, ?)",
        [email, otp, 'forgot_password'],
        (err, result) => {
          if (err) {
            console.error('DB error:', err);
            return res.status(500).json({ error: 'Failed to save OTP' });
          }
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
          });
          transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Your Password Reset OTP',
            text: `Your OTP code for password reset is: ${otp}`
          }, (mailErr, info) => {
            if (mailErr) {
              console.error('Mail error:', mailErr);
              return res.status(500).json({ error: 'Failed to send OTP email' });
            }
            res.json({ message: 'OTP sent successfully' });
          });
        }
      );
    }
  );
});


router.post('/forgot-password/verify-otp', (req, res) => {
  let { email, otp } = req.body;
  email = validator.trim(email || '');
  email = validator.normalizeEmail(email, { gmail_remove_dots: false });
  otp = validator.trim(otp || '');
  if (!email || !validator.isEmail(email) || !otp || !validator.isNumeric(otp)) return res.status(400).json({ error: 'Valid email and OTP are required' });
  con.query(
    "SELECT otp FROM otp_verification WHERE email = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1",
    [email, 'forgot_password'],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
      if (results.length === 0 || results[0].otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
      res.json({ message: 'OTP verified' });
    }
  );
});


router.post('/forgot-password/reset', async (req, res) => {
  let { email, otp, newPassword } = req.body;
  email = validator.trim(email || '');
  email = validator.normalizeEmail(email, { gmail_remove_dots: false });
  otp = validator.trim(otp || '');
  newPassword = validator.trim(newPassword || '');
  if (!email || !validator.isEmail(email) || !otp || !validator.isNumeric(otp) || !newPassword) {
    return res.status(400).json({ error: 'All fields are required and must be valid' });
  }
 
  con.query(
    "SELECT otp FROM otp_verification WHERE email = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1",
    [email, 'forgot_password'],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
      if (results.length === 0 || results[0].otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
      // OTP is valid, update password
      const hashed = await bcrypt.hash(newPassword, 10);
      con.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashed, email],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update password' });
          }
          res.json({ message: 'Password reset successful' });
        }
      );
    }
  );
});


router.post('/signup', async (req, res) => {
  let { name, email, phone, password } = req.body;
  name = validator.trim(name || '');
  name = validator.escape(name);
  email = validator.trim(email || '');
  email = validator.normalizeEmail(email, { gmail_remove_dots: false });
  phone = validator.trim(phone || '');
  password = validator.trim(password || '');
  if (!name || !email || !phone || !password || !validator.isEmail(email) || !validator.isMobilePhone(phone, 'any')) {
    return res.status(400).json({ error: 'All fields are required and must be valid' });
  }

  con.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    async (err, userRows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
      if (userRows.length > 0) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      const hashed = await bcrypt.hash(password, 10);
      con.query(
        "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
        [name, email, phone, hashed],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error' });
          }
          res.json({ message: 'User registered successfully' });
        }
      );
    }
  );
});

router.post('/login', (req, res) => {
  let { email, password } = req.body;
  email = validator.trim(email || '');
  email = validator.normalizeEmail(email, { gmail_remove_dots: false });
  password = validator.trim(password || '');
  if (!email || !password || !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  con.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, phone: user.phone }, token });
    }
  );
});

module.exports = router;