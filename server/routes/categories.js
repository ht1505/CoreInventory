const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, categoryController.getAllCategories);

module.exports = router;
