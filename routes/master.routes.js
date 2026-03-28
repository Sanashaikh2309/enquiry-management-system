const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');

router.get('/categories', masterController.getCategories);
router.get('/statuses', masterController.getStatuses);


module.exports = router;
