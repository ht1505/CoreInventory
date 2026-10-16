const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locations');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, locationController.getAllLocations);

module.exports = router;
