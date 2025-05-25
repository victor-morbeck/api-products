const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// List all products
router.get('/', productController.getAll);

// Get product by ID
router.get('/:id', productController.getById);

// Create a new product
router.post('/', productController.create);

// Update a product
router.put('/:id', productController.update);

// Delete a product
router.delete('/:id', productController.remove);

module.exports = router;