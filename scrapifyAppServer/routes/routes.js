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
router.post('/book-service', authenticate, upload.array('images', 10), (req, res) => {
  const userId = req.user.id;
  const { serviceId, serviceTitle, selectedItems, description, street, area, city, pincode } = req.body;
  const images = req.files || [];

  // Validate required fields
  if (!serviceId || !serviceTitle || !selectedItems) {
    return res.status(400).json({ error: 'Service details and selected items are required.' });
  }

  // Parse selected items
  let parsedItems;
  try {
    parsedItems = JSON.parse(selectedItems);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid selected items format.' });
  }

  if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
    return res.status(400).json({ error: 'At least one item must be selected.' });
  }

  // Check if user has address or if new address is provided
  let addressId = null;
  let newAddressData = null;

  if (street && area && city && pincode) {
    // New address provided, create it
    newAddressData = { street, area, city, pincode };
  } else {
    // Check if user has existing address
    con.query(
      'SELECT id FROM user_addresses WHERE user_id = ?',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Error checking user address:', err);
          return res.status(500).json({ error: 'Server error' });
        }
        if (results.length === 0) {
          return res.status(400).json({ error: 'Address is required for booking.' });
        }
        addressId = results[0].id;
      }
    );
  }

  // Create booking record
  const bookingData = {
    user_id: userId,
    service_id: serviceId,
    service_title: serviceTitle,
    selected_items: JSON.stringify(parsedItems),
    description: description || '',
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date()
  };

  // If new address, create it first
  if (newAddressData) {
    con.query(
      'INSERT INTO user_addresses (user_id, street, area, city, pincode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [userId, newAddressData.street, newAddressData.area, newAddressData.city, newAddressData.pincode],
      (err, result) => {
        if (err) {
          console.error('Error creating address:', err);
          return res.status(500).json({ error: 'Server error' });
        }
        addressId = result.insertId;
        createBooking();
      }
    );
  } else {
    createBooking();
  }

  function createBooking() {
    con.query(
      'INSERT INTO service_bookings (user_id, service_id, service_title, selected_items, description, address_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [userId, serviceId, serviceTitle, bookingData.selected_items, bookingData.description, addressId, 'pending'],
      (err, result) => {
        if (err) {
          console.error('Error creating booking:', err);
          return res.status(500).json({ error: 'Server error' });
        }

        const bookingId = result.insertId;

        // Save image references
        if (images.length > 0) {
          const imageValues = images.map(image => [bookingId, image.filename, image.path]);
          con.query(
            'INSERT INTO booking_images (booking_id, filename, file_path) VALUES ?',
            [imageValues],
            (err, imageResult) => {
              if (err) {
                console.error('Error saving image references:', err);
                // Don't fail the booking if image saving fails
              }
            }
          );
        }

        // Send confirmation email to user
        const transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
        });

        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
            <div style="background-color: #4CAF50; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">✅ Service Booking Confirmed</h1>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 0 0 10px 10px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>${req.user.name}</strong>,</p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Your service booking has been confirmed! Here are the details:</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Booking Details:</h3>
                <p style="margin: 0 0 5px 0; color: #666;"><strong>Service:</strong> ${serviceTitle}</p>
                <p style="margin: 0 0 5px 0; color: #666;"><strong>Booking ID:</strong> #${bookingId}</p>
                <p style="margin: 0 0 5px 0; color: #666;"><strong>Items:</strong> ${parsedItems.length} items selected</p>
                <p style="margin: 0 0 5px 0; color: #666;"><strong>Status:</strong> Pending</p>
                ${description ? `<p style="margin: 0; color: #666;"><strong>Description:</strong> ${description}</p>` : ''}
              </div>

              <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                <p style="margin: 0; color: #2E7D32; font-weight: bold;">Our team will contact you within 24 hours to schedule the pickup!</p>
              </div>

              <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
                Thank you for choosing Scrapify!<br>
                Best regards,<br>
                The Scrapify Team
              </p>
            </div>
          </div>
        `;

        const mailOptions = {
          from: `"Scrapify" <${process.env.MAIL_USER}>`,
          to: req.user.email,
          subject: `Service Booking Confirmed - #${bookingId}`,
          html: emailContent
        };

        transporter.sendMail(mailOptions, (mailErr, info) => {
          if (mailErr) {
            console.error('Error sending confirmation email:', mailErr);
            // Don't fail the booking if email fails
          }

          res.json({ 
            success: true, 
            message: 'Service booked successfully! You will receive a confirmation email shortly.',
            bookingId: bookingId
          });
        });
      }
    );
  }
});

module.exports = router;