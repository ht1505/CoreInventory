const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chat');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, chat);

module.exports = router;