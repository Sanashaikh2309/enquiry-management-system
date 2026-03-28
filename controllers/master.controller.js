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


