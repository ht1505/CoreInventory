const express = require('express');
const router = express.Router();
const { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = require('../controllers/warehouses');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getWarehouses);
router.post('/', authMiddleware, createWarehouse);
router.put('/:id', authMiddleware, updateWarehouse);
router.delete('/:id', authMiddleware, deleteWarehouse);

module.exports = router;