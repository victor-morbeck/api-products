const ProductModel = require('../models/productModel');
const { 
  validateProductInput, 
  validateProductUpdateInput 
} = require('../validators/productValidator');

// Get all products
function getAll(req, res) {
  return res.json(ProductModel.getAllProducts());
}

// Get product by ID
function getById(req, res) {
  const id = Number(req.params.id);
  const product = ProductModel.getProductById(id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  return res.json(product);
}

// Create product with validation
function create(req, res) {
  const errors = validateProductInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const product = ProductModel.createProduct(req.body);
  return res.status(201).json(product);
}

// Update product with validation
function update(req, res) {
  const id = Number(req.params.id);
  const errors = validateProductUpdateInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const updated = ProductModel.updateProduct(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  return res.json(updated);
}

// Delete product
function remove(req, res) {
  const id = Number(req.params.id);
  const deleted = ProductModel.deleteProduct(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  return res.status(204).send();
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};