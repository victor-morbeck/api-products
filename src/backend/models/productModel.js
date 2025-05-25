// In-memory artificial storage for products

let products = [];
let nextId = 1;

function getAllProducts() {
  return products;
}

function getProductById(id) {
  return products.find(product => product.id === id);
}

function createProduct(data) {
  const product = { id: nextId++, ...data };
  products.push(product);
  return product;
}

function updateProduct(id, data) {
  const product = products.find(p => p.id === id);
  if (product) {
    if (data.name !== undefined) product.name = data.name;
    if (data.price !== undefined) product.price = data.price;
    return product;
  }
  return null;
}

function deleteProduct(id) {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products.splice(index, 1);
    return true;
  }
  return false;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};