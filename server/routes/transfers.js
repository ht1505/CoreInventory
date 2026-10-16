const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfers');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, transferController.getAllTransfers);
router.post('/', authMiddleware, transferController.createTransfer);
router.patch('/:id/validate', authMiddleware, transferController.validateTransfer);
router.patch('/:id/cancel', authMiddleware, transferController.cancelTransfer);

module.exports = router;
