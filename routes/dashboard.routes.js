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