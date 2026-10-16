const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/suppliers');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, supplierController.getAllSuppliers);
router.post('/', authMiddleware, supplierController.createSupplier);
router.put('/:id', authMiddleware, supplierController.updateSupplier);
router.delete('/:id', authMiddleware, supplierController.deleteSupplier);

module.exports = router;
