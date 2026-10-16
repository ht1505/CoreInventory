const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, productController.getAllProducts);
router.get('/low-stock', authMiddleware, productController.getLowStockProducts);
router.get('/:id', authMiddleware, productController.getProductById);
router.post('/', authMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, productController.updateProduct);

module.exports = router;
