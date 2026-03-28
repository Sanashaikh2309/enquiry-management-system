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

