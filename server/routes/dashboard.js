const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, dashboardController.getDashboardStats);

module.exports = router;
