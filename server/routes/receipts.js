const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipts');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, receiptController.getAllReceipts);
router.post('/', authMiddleware, receiptController.createReceipt);
router.patch('/:id/validate', authMiddleware, receiptController.validateReceipt);
router.patch('/:id/cancel', authMiddleware, receiptController.cancelReceipt);

module.exports = router;
