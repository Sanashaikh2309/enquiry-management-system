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
