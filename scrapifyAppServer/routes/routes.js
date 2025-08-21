const express=require('express');
const router=express.Router();
const con=require('../db/config');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();
const validator = require('validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');


function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null,uniqueSuffix + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });


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



router.get('/profile', authenticate, (req, res) => {
  const userId = req.user.id;
  // console.log(userId);
  
  // Get user profile and address in parallel
  con.query(
    `SELECT 
        id, 
        name, 
        email, 
        phone, 
        profile_pic,
        DATE_FORMAT(created_at, '%d/%m/%Y') AS memberSince
     FROM users 
     WHERE id = ?`,
    [userId],
    (err, userResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
      if (userResults.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user address
      con.query(
        'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId],
        (err, addressResults) => {
          if (err) {
            console.error('Error fetching address:', err);
            // Return user data even if address fetch fails
            return res.json({ user: userResults[0] });
          }

          const user = userResults[0];
          if (addressResults.length > 0) {
            // Combine address fields into a single string for backward compatibility
            const address = addressResults[0];
            user.address = `${address.street}, ${address.area}, ${address.city}, ${address.pincode}`;
            user.addressData = address; // Include full address object
          } else {
            user.address = '';
            user.addressData = null;
          }

          res.json({ user });
        }
      );
    }
  );
});




router.post('/upload-profile-pic',authenticate, upload.single('profilePic'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }


  const profilePicPath = req.file.filename;

  // Update the user's profile_pic in the database
  const sql = 'UPDATE users SET profile_pic = ? WHERE id = ?';
  con.query(sql, [profilePicPath, userId], (err, result) => {
    if (err) {
      console.error('Error updating user profile picture:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      message: 'Profile picture uploaded and user updated successfully',
      profilePicUrl: profilePicPath
    });
  });
});



router.put('/profile', authenticate, async (req, res) => {

  const userId = req.user.id;
  let { name, phone, password } = req.body;

 
  name = validator.trim(name || '');
  phone = validator.trim(phone || '');

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  let sql = 'UPDATE users SET name = ?, phone = ?';
  let params = [name, phone];

  if (password) {
    password = validator.trim(password);
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    sql += ', password = ?';
    params.push(hashedPassword);
  }

  sql += ' WHERE id = ?';
  params.push(userId);

  con.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, message: 'Profile updated successfully.' });
  });
});

// Get user address
router.get('/address', authenticate, (req, res) => {
  const userId = req.user.id;
  
  con.query(
    'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching address:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.json({ address: null });
      }
      
      res.json({ address: results[0] });
    }
  );
});

// Create or update user address
router.post('/address', authenticate, (req, res) => {
  const userId = req.user.id;
  let { street, area, city, pincode } = req.body;

  // Sanitize inputs
  street = validator.trim(street || '');
  area = validator.trim(area || '');
  city = validator.trim(city || '');
  pincode = validator.trim(pincode || '');

  // Validate inputs
  if (!street || !area || !city || !pincode) {
    return res.status(400).json({ error: 'All address fields are required.' });
  }

  if (street.length < 3) {
    return res.status(400).json({ error: 'Street address must be at least 3 characters.' });
  }

  if (area.length < 2) {
    return res.status(400).json({ error: 'Area must be at least 2 characters.' });
  }

  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ error: 'Pincode must be exactly 6 digits.' });
  }

  // Check if user already has an address
  con.query(
    'SELECT id FROM user_addresses WHERE user_id = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error checking existing address:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (results.length > 0) {
        // Update existing address
        const addressId = results[0].id;
        con.query(
          'UPDATE user_addresses SET street = ?, area = ?, city = ?, pincode = ?, updated_at = NOW() WHERE id = ?',
          [street, area, city, pincode, addressId],
          (err, result) => {
            if (err) {
              console.error('Error updating address:', err);
              return res.status(500).json({ error: 'Server error' });
            }
            res.json({ 
              success: true, 
              message: 'Address updated successfully.',
              address: { id: addressId, user_id: userId, street, area, city, pincode }
            });
          }
        );
      } else {
        // Create new address
        con.query(
          'INSERT INTO user_addresses (user_id, street, area, city, pincode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
          [userId, street, area, city, pincode],
          (err, result) => {
            if (err) {
              console.error('Error creating address:', err);
              return res.status(500).json({ error: 'Server error' });
            }
            res.json({ 
              success: true, 
              message: 'Address created successfully.',
              address: { id: result.insertId, user_id: userId, street, area, city, pincode }
            });
          }
        );
      }
    }
  );
});

// Update user address (alternative route)
router.put('/address', authenticate, (req, res) => {
  const userId = req.user.id;
  let { street, area, city, pincode } = req.body;

  // Sanitize inputs
  street = validator.trim(street || '');
  area = validator.trim(area || '');
  city = validator.trim(city || '');
  pincode = validator.trim(pincode || '');

  // Validate inputs
  if (!street || !area || !city || !pincode) {
    return res.status(400).json({ error: 'All address fields are required.' });
  }

  if (street.length < 3) {
    return res.status(400).json({ error: 'Street address must be at least 3 characters.' });
  }

  if (area.length < 2) {
    return res.status(400).json({ error: 'Area must be at least 2 characters.' });
  }

  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ error: 'Pincode must be exactly 6 digits.' });
  }

  // Check if user has an address to update
  con.query(
    'SELECT id FROM user_addresses WHERE user_id = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error checking existing address:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'No address found for this user. Please create one first.' });
      }

      // Update existing address
      const addressId = results[0].id;
      con.query(
        'UPDATE user_addresses SET street = ?, area = ?, city = ?, pincode = ?, updated_at = NOW() WHERE id = ?',
        [street, area, city, pincode, addressId],
        (err, result) => {
          if (err) {
            console.error('Error updating address:', err);
            return res.status(500).json({ error: 'Server error' });
          }
          res.json({ 
            success: true, 
            message: 'Address updated successfully.',
            address: { id: addressId, user_id: userId, street, area, city, pincode }
          });
        }
      );
    }
  );
});

// Contact Support Route
router.post('/contact-support', authenticate, (req, res) => {
  const userId = req.user.id;
  let { name, email, subject, message } = req.body;

  // Sanitize inputs
  name = validator.trim(name || '');
  email = validator.trim(email || '');
  email = validator.normalizeEmail(email, { gmail_remove_dots: false });
  subject = validator.trim(subject || '');
  message = validator.trim(message || '');

  // Validate inputs
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (name.length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters long.' });
  }

  if (subject.length < 5) {
    return res.status(400).json({ error: 'Subject must be at least 5 characters long.' });
  }

  if (message.length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters long.' });
  }

  // Get user details for the email
  con.query(
    'SELECT name as user_name, phone FROM users WHERE id = ?',
    [userId],
    (err, userResults) => {
      if (err) {
        console.error('Error fetching user details:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const user = userResults[0];

      // Create transporter for sending email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
          user: process.env.MAIL_USER, 
          pass: process.env.MAIL_PASS 
        }
      });

      // Email content for support team
      const supportEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🛠️ New Support Request</h1>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2E7D32; margin-top: 0;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Name:</td>
                <td style="padding: 8px 0; color: #666;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
                <td style="padding: 8px 0; color: #666;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">User ID:</td>
                <td style="padding: 8px 0; color: #666;">${userId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Registered Name:</td>
                <td style="padding: 8px 0; color: #666;">${user.user_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Phone:</td>
                <td style="padding: 8px 0; color: #666;">${user.phone || 'Not provided'}</td>
              </tr>
            </table>

            <h2 style="color: #2E7D32;">Issue Details</h2>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Subject: ${subject}</h3>
              <p style="margin: 0; color: #666; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>

            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50;">
              <p style="margin: 0; color: #2E7D32; font-weight: bold;">📧 Reply to: ${email}</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Please respond to this customer within 24 hours.</p>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #666; font-size: 12px;">
              <p>This message was sent from the Scrapify App Support System</p>
              <p>Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>
          </div>
        </div>
      `;

      // Send email to support team
      const mailOptions = {
        from: `"Scrapify App Support" <${process.env.MAIL_USER}>`,
        to: 'bhavishya.sense@gmail.com',
        subject: `[Scrapify App Support] ${subject} - ${name}`,
        html: supportEmailContent
      };

      transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
          console.error('Error sending support email:', mailErr);
          return res.status(500).json({ error: 'Failed to send support request. Please try again.' });
        }

        // Send confirmation email to user
        const userEmailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
            <div style="background-color: #4CAF50; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">✅ Support Request Received</h1>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 0 0 10px 10px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for contacting Scrapify Support. We have received your message and our team will get back to you within 24 hours.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Your Message Details:</h3>
                <p style="margin: 0 0 5px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
                <p style="margin: 0; color: #666;"><strong>Message:</strong> ${message}</p>
              </div>

              <p style="color: #333; font-size: 16px; line-height: 1.6;">If you have any urgent concerns, you can also reach us at:</p>
              <ul style="color: #333; font-size: 16px; line-height: 1.6;">
                <li>📞 Phone: +91 98765 43210</li>
                <li>💬 Live Chat: Available in the app (9 AM - 6 PM)</li>
              </ul>

              <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                <p style="margin: 0; color: #2E7D32; font-weight: bold;">We appreciate your patience and look forward to helping you!</p>
              </div>

              <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
                Best regards,<br>
                The Scrapify Support Team
              </p>
            </div>
          </div>
        `;

        const userMailOptions = {
          from: `"Scrapify App Support" <${process.env.MAIL_USER}>`,
          to: email,
          subject: 'Your Support Request - Scrapify',
          html: userEmailContent
        };

        transporter.sendMail(userMailOptions, (userMailErr, userInfo) => {
          if (userMailErr) {
            console.error('Error sending confirmation email:', userMailErr);
            // Don't fail the request if confirmation email fails
          }

          res.json({ 
            success: true, 
            message: 'Support request sent successfully. You will receive a confirmation email shortly.' 
          });
        });
      });
    }
  );
});

// Book service with image upload
// router.post(
//   '/book-service',
//   authenticate,
//   upload.array('images', 10),
//   (req, res) => {
//     console.log('Body:', req.body);
//     console.log('Files:', req.files);


   
//     const {
//       serviceId,
//       serviceTitle,
//       selectedItems,
//       description = '',
//       street,
//       area,
//       city,
//       pincode
//     } = req.body;

//     if (!serviceId || !serviceTitle || !selectedItems) {
//       return res
//         .status(400)
//         .json({ error: 'Service details and selected items are required.' });
//     }

//     let parsedItems;
//     try {
//       parsedItems = JSON.parse(selectedItems);
//       if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
//         throw new Error();
//       }
//     } catch {
//       return res
//         .status(400)
//         .json({ error: 'Invalid selected items format.' });
//     }

//     con.query(
//       `INSERT INTO service_bookings 
//        (user_id, service_id, service_title, selected_items, description, status, created_at, updated_at) 
//        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//       [
//         req.user.id,
//         serviceId,
//         serviceTitle,
//         JSON.stringify(parsedItems),
//         description,
//         'pending'
//       ],
//       (err, result) => {
//         if (err) {
//           console.error('DB Error creating booking:', err);
//           return res.status(500).json({ error: 'Server error' });
//         }

//         const bookingId = result.insertId;

//         if (req.files?.length) {
//           const imageValues = req.files.map(file => [
//             bookingId,
//             file.filename,
//             file.path
//           ]);
//           con.query(
//             'INSERT INTO booking_images (booking_id, filename, file_path) VALUES ?',
//             [imageValues],
//             err2 => {
//               if (err2) console.error('Image Save Error:', err2);
//             }
//           );
//         }

//         const transporter = nodemailer.createTransport({
//           service: 'gmail',
//           auth: {
//             user: process.env.MAIL_USER,
//             pass: process.env.MAIL_PASS
//           }
//         });

//         const itemsList = parsedItems
//           .map(i => `${i.name} (${i.price})`)
//           .join(', ');

//         const salesMail = {
//           from: `"Scrapify" <${process.env.MAIL_USER}>`,
//           to: process.env.SALES_MAIL,
//           subject: `🆕 New Service Booking - #${bookingId}`,
//           html: `
//             <h2>New Booking Received</h2>
//             <p><b>Customer:</b> ${req.user.name} (${req.user.email})</p>
//             <p><b>Service:</b> ${serviceTitle}</p>
//             <p><b>Items:</b> ${itemsList}</p>
//             <p><b>Description:</b> ${description || 'N/A'}</p>
//             <p><b>Address:</b> ${street}, ${area}, ${city} - ${pincode}</p>
//             <p><b>Status:</b> Pending</p>
//           `
//         };

//         const customerMail = {
//           from: `"Scrapify" <${process.env.MAIL_USER}>`,
//           to: req.user.email,
//           subject: `Service Booking Confirmed - #${bookingId}`,
//           html: `
//             <h2>✅ Your booking is confirmed!</h2>
//             <p><b>Service:</b> ${serviceTitle}</p>
//             <p><b>Items:</b> ${parsedItems.length} selected</p>
//             <p><b>Status:</b> Pending</p>
//             <p>Our team will contact you within 24 hours for pickup.</p>
//           `
//         };

//         transporter.sendMail(salesMail, errMail =>
//           errMail && console.error('Sales Mail Error:', errMail)
//         );
//         transporter.sendMail(customerMail, errMail =>
//           errMail && console.error('Customer Mail Error:', errMail)
//         );

//         return res.json({
//           success: true,
//           message:
//             'Service booked successfully. Emails sent to customer and sales team.',
//           bookingId
//         });
//       }
//     );
//   }
// );

router.post('/book-service', authenticate, upload.array('images', 10), (req, res) => {
  console.log('Body:', req.body);
  console.log('Files:', req.files);

  const {
    serviceId,
    serviceTitle,
    selectedItems,
    description = '',
    street = '',
    area = '',
    city = '',
    pincode = ''
  } = req.body;

  if (!serviceId || !selectedItems) {
    return res.status(400).json({ error: 'Service ID and selected items are required.' });
  }

  let parsedItems;
  try {
    parsedItems = JSON.parse(selectedItems);
    if (!Array.isArray(parsedItems) || parsedItems.length === 0) throw new Error();
  } catch {
    return res.status(400).json({ error: 'Invalid selected items format.' });
  }

  const bookingDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const bookingTime = new Date().toTimeString().split(' ')[0]; // HH:MM:SS
  const fullAddress = `${street}, ${area}, ${city} - ${pincode}`;

  // First save address if provided
  let addressId = null;
  if (street && area && city && pincode) {
    con.query(
      'INSERT INTO user_addresses (user_id, street, area, city, pincode) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, street, area, city, pincode],
      (err, result) => {
        if (err) {
          console.error('Address Save Error:', err);
        } else {
          addressId = result.insertId;
        }
      }
    );
  }

  con.query(
    `INSERT INTO service_bookings 
     (user_id, service_id, service_title, selected_items, description, booking_date, booking_time, address_id, status, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      req.user.id,
      serviceId,
      serviceTitle || `Service #${serviceId}`,
      JSON.stringify(parsedItems),
      description,
      bookingDate,
      bookingTime,
      addressId,
      'pending'
    ],
    (err, result) => {
      if (err) {
        console.error('DB Error creating booking:', err);
        return res.status(500).json({ error: 'Server error while creating booking.' });
      }

      const bookingId = result.insertId;

      // Save images if any
      if (req.files?.length) {
        const imageValues = req.files.map(file => [
          bookingId, 
          file.filename, 
          `uploads/${file.filename}`,
          new Date()
        ]);
        con.query(
          'INSERT INTO booking_images (booking_id, image_url, file_path, uploaded_at) VALUES ?',
          [imageValues],
          err2 => {
            if (err2) console.error('Image Save Error:', err2);
          }
        );
      }

      // Fetch complete user details from database
      con.query(
        'SELECT id, name, email, phone, profile_pic FROM users WHERE id = ?',
        [req.user.id],
        (err, userResults) => {
          if (err || userResults.length === 0) {
            console.error('Error fetching user details:', err);
            return res.status(500).json({ error: 'Error fetching user details.' });
          }

          const user = userResults[0];

          // Prepare mailer
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS
            }
          });

          const itemsList = parsedItems.map(i => `${i.name} (${i.price})`).join(', ');
          const totalItems = parsedItems.length;

          // Generate image HTML for email
          let imagesHTML = '';
          if (req.files && req.files.length > 0) {
            imagesHTML = `
              <tr>
                <td valign="top" style="padding-top:20px;padding-right:50px;padding-bottom:20px;padding-left:50px">
                  <span style="color:#202020;font-family:helvetica;font-size:16px;line-height:24px;font-weight:bold">Uploaded Images (${req.files.length}):</span>
                  <br><br>
                  ${req.files.map(file => `
                    <img src="cid:${file.filename}" alt="Uploaded Image" style="max-width:200px;height:auto;border:1px solid #e4e4e4;margin:5px;border-radius:4px;">
                  `).join('')}
                </td>
              </tr>
            `;
          }

          // Professional Monochrome Email to Sales with Accept/Reject buttons
          const salesMail = {
            from: `"Scrapify" <${process.env.MAIL_USER}>`,
            to: 'bhavishya.sense@gmail.com',
            subject: `New Service Booking - #${bookingId}`,
            html: `
              <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
                <tr>
                  <td align="center" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" width="600" style="border:1px solid #e4e4e4">
                      <tr>
                        <td valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                            <tr>
                              <td valign="top" style="text-align:center;padding-top:20px;padding-bottom:20px;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif">
                                <table align="center" border="0" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="border-bottom:2px solid #202020">
                                      <h1 style="text-align:center;margin:0;font-size:24px;font-weight:bold;color:#202020">
                                        New Service Booking
                                      </h1>
                                    </td>
                                  </tr>
                                </table>
                                <p style="margin:10px 0 0 0;color:#666;font-size:14px">Booking ID: #${bookingId}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                            <tr>
                              <td valign="top" style="padding-top:30px;padding-right:50px;padding-bottom:30px;padding-left:50px">
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px;font-weight:bold">Customer Details:</span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                  <strong>Name:</strong> ${user.name}<br>
                                  <strong>Email:</strong> ${user.email}<br>
                                  <strong>Phone:</strong> ${user.phone}
                                </span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px;font-weight:bold">Service Information:</span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                  <strong>Service:</strong> ${serviceTitle || `Service #${serviceId}`}<br>
                                  <strong>Total Items:</strong> ${totalItems} items<br>
                                  <strong>Description:</strong> ${description || 'No description provided'}
                                </span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px;font-weight:bold">Selected Items:</span>
                                <br><br>
                                ${parsedItems.map((item, index) => `
                                  <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                    ${index + 1}. <strong>${item.name}</strong> - ${item.price}
                                    ${item.quantity ? ` (Qty: ${item.quantity})` : ''}
                                    ${item.category ? ` - Category: ${item.category}` : ''}
                                  </span><br>
                                `).join('')}
                                <br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px;font-weight:bold">Pickup Address:</span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                  ${fullAddress}
                                </span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px;font-weight:bold">Action Required:</span>
                                <br><br>
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                  <tr>
                                    <td align="center">
                                      <a href="${process.env.URL}/admin/accept-booking/${bookingId}" style="background-color:#28a745;color:white;padding:12px 30px;text-decoration:none;border-radius:4px;margin:0 10px;display:inline-block;font-family:helvetica;font-size:14px;font-weight:bold">Accept Order</a>
                                      <a href="${process.env.URL}/admin/reject-booking/${bookingId}" style="background-color:#dc3545;color:white;padding:12px 30px;text-decoration:none;border-radius:4px;margin:0 10px;display:inline-block;font-family:helvetica;font-size:14px;font-weight:bold">Reject Order</a>
                                    </td>
                                  </tr>
                                </table>
                                <br><br>
                                <span style="color:#666;font-family:helvetica;font-size:13px;line-height:20px">
                                  Click the buttons above to accept or reject this booking.<br>
                                  Booking received on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ${imagesHTML}
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="600">
                      <tr>
                        <td>
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                            <tr>
                              <td valign="top" style="padding-top:20px;text-align:center">
                                <span style="color:#666;font-family:helvetica;font-size:12px;line-height:18px">
                                  Scrapify - Professional Scrap Management Services
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            `,
            attachments: req.files ? req.files.map(file => ({
              filename: file.originalname,
              path: file.path,
              cid: file.filename
            })) : []
          };

          // Professional Monochrome Email to Customer
          const customerMail = {
            from: `"Scrapify" <${process.env.MAIL_USER}>`,
            to: user.email,
            subject: `Booking Confirmed - #${bookingId}`,
            html: `
              <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
                <tr>
                  <td align="center" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" width="600" style="border:1px solid #e4e4e4">
                      <tr>
                        <td valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                            <tr>
                              <td valign="top" style="text-align:center;padding-top:20px;padding-bottom:20px;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif">
                                <table align="center" border="0" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="border-bottom:2px solid #202020">
                                      <h1 style="text-align:center;margin:0;font-size:24px;font-weight:bold;color:#202020">
                                        Booking Confirmed
                                      </h1>
                                    </td>
                                  </tr>
                                </table>
                                <p style="margin:10px 0 0 0;color:#666;font-size:14px">Booking ID: #${bookingId}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                            <tr>
                              <td valign="top" style="padding-top:30px;padding-right:50px;padding-bottom:30px;padding-left:50px">
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">Dear ${user.name},</span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                  Your booking has been successfully confirmed. We have received your request and our team will process it shortly.
                                </span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px;font-weight:bold">Booking Summary:</span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                  <br>
                                  <strong>Items Selected:</strong> ${totalItems} items<br>
                                  <strong>Status:</strong> <span style="background-color:#f8f9fa;padding:4px 8px;border-radius:3px;border:1px solid #e4e4e4">Pending</span>
                                </span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px;font-weight:bold">Selected Items:</span>
                                <br><br>
                                ${parsedItems.map((item, index) => `
                                  <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                    ${index + 1}. <strong>${item.name}</strong> - ${item.price}
                                    ${item.quantity ? ` (Qty: ${item.quantity})` : ''}
                                  </span><br>
                                `).join('')}
                                <br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px;font-weight:bold">Pickup Address:</span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                  ${fullAddress}
                                </span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px;font-weight:bold">Next Steps:</span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                  • Our team will review your booking within 24 hours<br>
                                  • You'll receive a confirmation call from our pickup team<br>
                                  • We'll schedule a convenient pickup time<br>
                                  • Payment will be processed after pickup completion
                                </span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                  <strong>Booking Date:</strong> ${new Date().toLocaleDateString()}
                                </span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                  Thank you for choosing Scrapify. If you have any questions, please contact our support team.
                                </span>
                                <br><br>
                                <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                  Best regards,<br>
                                  The Scrapify Team
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="600">
                      <tr>
                        <td>
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                            <tr>
                              <td valign="top" style="padding-top:20px;text-align:center">
                                <span style="color:#666;font-family:helvetica;font-size:12px;line-height:18px">
                                  For support, contact us at support@scrapify.com
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            `
          };

          transporter.sendMail(salesMail, errMail =>
            errMail && console.error('Sales Mail Error:', errMail)
          );
          transporter.sendMail(customerMail, errMail =>
            errMail && console.error('Customer Mail Error:', errMail)
          );

          return res.json({
            success: true,
            message: 'Booking successful. Emails sent.',
            bookingId
          });
        }
      );
    }
  );
});

// Accept booking
router.get('/admin/accept-booking/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  
  // First check if booking exists and its current status
  con.query(
    'SELECT status FROM service_bookings WHERE id = ?',
    [bookingId],
    (err, results) => {
      if (err) {
        console.error('DB Error checking booking status:', err);
        return res.status(500).json({ error: 'Server error while checking booking status.' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Booking not found.' });
      }
      
      const currentStatus = results[0].status;
      
      // Check if already processed
      if (currentStatus === 'confirmed') {
        return res.status(400).json({ error: 'Booking has already been accepted.' });
      }
      
      if (currentStatus === 'cancelled') {
        return res.status(400).json({ error: 'Booking has already been rejected.' });
      }
      
      if (currentStatus === 'completed') {
        return res.status(400).json({ error: 'Cannot modify completed booking.' });
      }
      
      // Proceed with accepting the booking
      con.query(
        'UPDATE service_bookings SET status = "confirmed", updated_at = NOW() WHERE id = ?',
        [bookingId],
        (err, result) => {
          if (err) {
            console.error('DB Error updating booking:', err);
            return res.status(500).json({ error: 'Server error while updating booking.' });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found.' });
          }
          
          // Send confirmation email to customer
          con.query(
            'SELECT sb.*, u.name, u.email FROM service_bookings sb JOIN users u ON sb.user_id = u.id WHERE sb.id = ?',
            [bookingId],
            (err, results) => {
              if (err || results.length === 0) {
                console.error('Error fetching booking details:', err);
                return res.json({ success: true, message: 'Booking accepted successfully.' });
              }
              
              const booking = results[0];
              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.MAIL_USER,
                  pass: process.env.MAIL_PASS
                }
              });
              
              // Accept booking email template
              const customerMail = {
                from: `"Scrapify" <${process.env.MAIL_USER}>`,
                to: booking.email,
                subject: `✅ Order Accepted - #${bookingId}`,
                html: `
                  <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
                    <tbody>
                      <tr>
                        <td align="center" valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" width="600" style="border:1px solid #e4e4e4">
                            <tbody>
                              <tr>
                                <td valign="top">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                                    <tbody>
                                      <tr>
                                        <td valign="top" style="text-align:center;padding-top:20px;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:18px;font-style:normal;font-weight:bold;text-align:justify">
                                          <center>
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <td style="border-bottom:2px solid #4390ef">
                                                    <h1 style="text-align:center;margin:0">
                                                      <span style="font-size:18px;display:inline-block">
                                                        <span style="font-family:arial,helvetica neue,helvetica,sans-serif;color:#000">
                                                          Order Accepted
                                                        </span>
                                                      </span>
                                                    </h1>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </center>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td valign="top">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                                    <tbody>
                                      <tr>
                                        <td valign="top" style="padding-top:40px;padding-right:50px;padding-bottom:50px;padding-left:50px">
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">Hi ${booking.name},</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                            Great news! Your order has been accepted and confirmed by our team.
                                          </span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px"><strong>Booking ID:</strong> #${bookingId}</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px"><strong>Status:</strong> Confirmed ✅</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px"><strong>Next Steps:</strong></span>
                                          <br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">• Our pickup team will contact you within 2 hours</span>
                                          <br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">• We'll schedule a convenient pickup time</span>
                                          <br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">• Please ensure all items are ready for pickup</span>
                                          <br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">• Payment will be processed after pickup completion</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px"><strong>Need Help?</strong></span>
                                          <br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">Call: +91 98765 43210 | Email: support@scrapify.com</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">Thank you for choosing Scrapify!</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">Regards,</span>
                                          <br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">Scrapify Team</span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table border="0" cellpadding="0" cellspacing="0" width="600">
                            <tbody>
                              <tr>
                                <td>
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                                    <tbody>
                                      <tr>
                                        <td valign="top" style="padding-top:10px">
                                          <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" style="min-width:100%">
                                            <tbody>
                                              <tr>
                                                <td valign="top" style="padding-right:0px;padding-left:0px;padding-top:0;padding-bottom:0">
                                                  <img align="left" alt="Scrapify Logo" src="https://via.placeholder.com/65x25/333/fff?text=Scrapify" width="65" style="max-width:65px;padding-bottom:0;display:inline!important;vertical-align:bottom;height:25px">
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                `
              };
              
              transporter.sendMail(customerMail, errMail =>
                errMail && console.error('Customer Mail Error:', errMail)
              );
            }
          );
          
          res.json({ success: true, message: 'Booking accepted successfully.' });
        }
      );
    }
  );
});

// Reject booking - Change to use query parameters instead of body
router.get('/admin/reject-booking/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  const { reason = 'Order rejected by admin' } = req.query; // Changed from req.body to req.query
  
  // First check if booking exists and its current status
  con.query(
    'SELECT status FROM service_bookings WHERE id = ?',
    [bookingId],
    (err, results) => {
      if (err) {
        console.error('DB Error checking booking status:', err);
        return res.status(500).json({ error: 'Server error while checking booking status.' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Booking not found.' });
      }
      
      const currentStatus = results[0].status;
      
      // Check if already processed
      if (currentStatus === 'confirmed') {
        return res.status(400).json({ error: 'Booking has already been accepted.' });
      }
      
      if (currentStatus === 'cancelled') {
        return res.status(400).json({ error: 'Booking has already been rejected.' });
      }
      
      if (currentStatus === 'completed') {
        return res.status(400).json({ error: 'Cannot modify completed booking.' });
      }
      
      // Proceed with rejecting the booking
      con.query(
        'UPDATE service_bookings SET status = "cancelled", updated_at = NOW() WHERE id = ?',
        [bookingId],
        (err, result) => {
          if (err) {
            console.error('DB Error updating booking:', err);
            return res.status(500).json({ error: 'Server error while updating booking.' });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found.' });
          }
          
          // Send rejection email to customer
          con.query(
            'SELECT sb.*, u.name, u.email FROM service_bookings sb JOIN users u ON sb.user_id = u.id WHERE sb.id = ?',
            [bookingId],
            (err, results) => {
              if (err || results.length === 0) {
                console.error('Error fetching booking details:', err);
                return res.json({ success: true, message: 'Booking rejected successfully.' });
              }
              
              const booking = results[0];
              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.MAIL_USER,
                  pass: process.env.MAIL_PASS
                }
              });
              
              const customerMail = {
                from: `"Scrapify" <${process.env.MAIL_USER}>`,
                to: booking.email,
                subject: `❌ Order Update - #${bookingId}`,
                html: `
                  <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
                    <tbody>
                      <tr>
                        <td align="center" valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" width="600" style="border:1px solid #e4e4e4">
                            <tbody>
                              <tr>
                                <td valign="top">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                                    <tbody>
                                      <tr>
                                        <td valign="top" style="text-align:center;padding-top:20px;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:18px;font-style:normal;font-weight:bold;text-align:justify">
                                          <center>
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <td style="border-bottom:2px solid #4390ef">
                                                    <h1 style="text-align:center;margin:0">
                                                      <span style="font-size:18px;display:inline-block">
                                                        <span style="font-family:arial,helvetica neue,helvetica,sans-serif;color:#000">
                                                          Order Update
                                                        </span>
                                                      </span>
                                                    </h1>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </center>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td valign="top">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                                    <tbody>
                                      <tr>
                                        <td valign="top" style="padding-top:40px;padding-right:50px;padding-bottom:50px;padding-left:50px">
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">Hi ${booking.name},</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                            We regret to inform you that your order has been cancelled.
                                          </span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px"><strong>Booking ID:</strong> #${bookingId}</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px"><strong>Status:</strong> Cancelled ❌</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px"><strong>Reason:</strong> ${reason}</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">
                                            We sincerely apologize for any inconvenience this may have caused. Our team is committed to providing the best service possible.
                                          </span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px"><strong>Need Help?</strong></span>
                                          <br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">Call: +91 98765 43210 | Email: info@scrapify.com</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">Thank you for considering Scrapify!</span>
                                          <br><br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">Regards,</span>
                                          <br>
                                          <span style="color:#202020;font-family:helvetica;font-size:15px;line-height:24px">Scrapify Team</span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table border="0" cellpadding="0" cellspacing="0" width="600">
                            <tbody>
                              <tr>
                                <td>
                                  // <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%">
                                  //   <tbody>
                                  //     <tr>
                                  //       <td valign="top" style="padding-top:10px">
                                  //         <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" style="min-width:100%">
                                  //           <tbody>
                                  //             <tr>
                                  //               <td valign="top" style="padding-right:0px;padding-left:0px;padding-top:0;padding-bottom:0">
                                  //                 <img align="left" alt="Scrapify Logo" src="" width="65" style="max-width:65px;padding-bottom:0;display:inline!important;vertical-align:bottom;height:25px">
                                  //               </td>
                                  //             </tr>
                                  //           </tbody>
                                  //         </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                `
              };
              
              transporter.sendMail(customerMail, errMail =>
                errMail && console.error('Customer Mail Error:', errMail)
              );
            }
          );
          
          res.json({ success: true, message: 'Booking rejected successfully.' });
        }
      );
    }
  );
});


module.exports = router;