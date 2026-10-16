const express = require('express');
const router = express.Router();
const adjustmentController = require('../controllers/adjustments');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, adjustmentController.getAllAdjustments);
router.post('/', authMiddleware, adjustmentController.createAdjustment);
router.patch('/:id/validate', authMiddleware, adjustmentController.validateAdjustment);

module.exports = router;
