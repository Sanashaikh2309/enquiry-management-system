Backend files
Server.js
const db = require('./config/db');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ===== CREATE USERS TABLE IF NOT EXISTS =====
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    phone VARCHAR(20) UNIQUE,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

db.query(createUsersTable, (err) => {
  if (err) {
    console.log('Error creating users table:', err);
  } else {
    console.log('Users table created or already exists');
  }
});

// ===== ADD PHONE COLUMN IF IT DOESN'T EXIST =====
const addPhoneColumn = `
  ALTER TABLE users ADD COLUMN phone VARCHAR(20) UNIQUE 
  AFTER password
`;

db.query(addPhoneColumn, (err) => {
  if (err && err.errno === 1060) {
    // Column already exists, no error
    console.log('Phone column already exists');
  } else if (err) {
    console.log('Error adding phone column:', err);
  } else {
    console.log('Phone column added successfully');
  }
});

app.get('/', (req, res) => {
  res.send('Backend is running successfully');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const masterRoutes = require('./routes/master.routes');

app.use('/api/master', masterRoutes);

const enquiryRoutes = require('./routes/enquiry.routes');

app.use('/api/enquiry', enquiryRoutes);

app.use('/api/auth', require('./routes/auth.routes'));

const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

--------------------------------------------------------------------------------------
db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'enquiry_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.connect((err) => {
  if (err) {
    console.log('Database connection failed', err);
  } else {
    console.log('MySQL Connected Successfully');
  }
});

module.exports = db;
--------------------------------------------------------------------------------------------------------
enquiry.controller.js
const db = require('../config/db');

exports.createEnquiry = (req, res) => {
  const sql = `
    INSERT INTO enquiries
    (customerName, customerEmail, customerPhone, message, categoryId, statusId, enquiryType, isConverted, feedback, createdBy)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `;

  const data = [
    req.body.customerName,
    req.body.customerEmail,
    req.body.customerPhone,
    req.body.message,
    Number(req.body.categoryId),
    Number(req.body.statusId),
    req.body.enquiryType,
    false,
    req.body.feedback || null,
    Number(req.body.createdBy || req.body.userId) // ✅ FIXED: ensure logged-in userId is stored instead of 0
  ];

  db.query(sql, data, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
};

exports.getAllEnquiries = (req, res) => {
  db.query('SELECT * FROM enquiries', (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: rows });
  });
};
exports.getUserEnquiries = (req, res) => {
  const userId = req.params.userId;
  db.query(
    'SELECT * FROM enquiries WHERE createdBy=?',
    [userId],
    (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true, data: rows });
    }
  );
};
exports.updateConverted = (req, res) => {
  const { id } = req.params;
  const { isConverted } = req.body;

  db.query(
    'UPDATE enquiries SET isConverted=? WHERE enquiryId=?',
    [isConverted, id],
    err => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
};

exports.getSingleEnquiry = (req, res) => {
  db.query(
    'SELECT * FROM enquiries WHERE enquiryId=?',
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, data: rows[0] });
    }
  );
};

exports.updateEnquiry = (req, res) => {
  const { id } = req.params;
  db.query(
    'UPDATE enquiries SET feedback=?, statusId=? WHERE enquiryId=?',
    [req.body.feedback, req.body.statusId, id],
    err => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
};

exports.deleteEnquiry = (req, res) => {
  db.query(
    'DELETE FROM enquiries WHERE enquiryId=?',
    [req.params.id],
    err => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
};

-------------------------------------------------------------------------------
master.controller.js
//for catergories dropdown
const db = require('../config/db');

exports.getCategories = (req, res) => {
  const sql = `
    SELECT 
      categoryId,
      categoryName,
      isActive
    FROM categories
    WHERE isActive = true
  `;

  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: 'Error fetching categories'
      });
    } else {
      res.json({
        success: true,
        data: result
      });
    }
  });
};


// for statuses dropdown
exports.getStatuses = (req, res) => {
  const sql = `
    SELECT statusId, statusName, isActive
    FROM statuses
    WHERE isActive = true
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'DB Error'
      });
    }

    res.json({
      success: true,
      data: rows
    });
  });
};


------------------------------------------------------------------------------------------------
auth.route.js
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

-----------------------------------------------------------------------------------------------------
dashboard.routes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // since your db is in config folder
// ADMIN DASHBOARD
router.get('/admin', (req, res) => {
  const queries = {
    total: 'SELECT COUNT(*) AS total FROM enquiries',
    new: 'SELECT COUNT(*) AS newCount FROM enquiries WHERE isConverted = 0',
    converted: 'SELECT COUNT(*) AS converted FROM enquiries WHERE isConverted = 1',
    users: 'SELECT COUNT(*) AS users FROM users',
    recent: 'SELECT * FROM enquiries ORDER BY enquiryDate DESC LIMIT 5'
  };
  const result = {};
  db.query(queries.total, (e, r) => {
    result.total = r[0].total;
    db.query(queries.new, (e, r) => {
      result.new = r[0].newCount;
      db.query(queries.converted, (e, r) => {
        result.converted = r[0].converted;
        db.query(queries.users, (e, r) => {
          result.users = r[0].users;
          db.query(queries.recent, (e, r) => {
            result.recent = r;
            res.json({ success: true, data: result });
          });
        });
      });
    });
  });
});
// USER DASHBOARD
router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;
  const summaryQuery = `
    SELECT 
      COUNT(*) AS total,
      SUM(isConverted = 0) AS pending,
      SUM(isConverted = 1) AS converted
    FROM enquiries
    WHERE createdBy = ?
  `;
  const recentQuery = `
    SELECT * FROM enquiries
    WHERE createdBy = ?
    ORDER BY enquiryDate DESC
    LIMIT 5
  `;
  const result = {};
  db.query(summaryQuery, [userId], (err, summary) => {
    if (err) return res.status(500).json({ success: false, err });
    result.total = summary[0].total;
    result.pending = summary[0].pending;
    result.converted = summary[0].converted;
    db.query(recentQuery, [userId], (err, recent) => {
      if (err) return res.status(500).json({ success: false, err });
      result.recent = recent;
      res.json({ success: true, data: result });
    });
  });
});
module.exports = router;
-------------------------------------------------------------------------------------

enquiry.routes.js
const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiry.controller');

router.post('/create', enquiryController.createEnquiry);  
router.get('/all', enquiryController.getAllEnquiries);    
router.patch('/:id/convert', enquiryController.updateConverted);
router.get('/:id', enquiryController.getSingleEnquiry);
router.get('/user/:userId', enquiryController.getUserEnquiries);
router.put('/:id', enquiryController.updateEnquiry);
router.delete('/:id', enquiryController.deleteEnquiry);

module.exports = router;

--------------------------------------------------------------------------------------------------------
master.routes.js
const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');

router.get('/categories', masterController.getCategories);
router.get('/statuses', masterController.getStatuses);


module.exports = router;

----------------------------------------------------------------------------------------------------

