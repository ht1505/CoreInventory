const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveries');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, deliveryController.getAllDeliveries);
router.post('/', authMiddleware, deliveryController.createDelivery);
router.patch('/:id/validate', authMiddleware, deliveryController.validateDelivery);
router.patch('/:id/cancel', authMiddleware, deliveryController.cancelDelivery);

module.exports = router;
