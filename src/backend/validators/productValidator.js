// Validates input data for product creation and update

function validateProductInput(data) {
  const errors = [];
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Product name is required and must be a non-empty string.');
  }
  if (typeof data.price !== 'number' || data.price < 0) {
    errors.push('Product price is required and must be a non-negative number.');
  }
  return errors;
}

function validateProductUpdateInput(data) {
  const errors = [];
  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim() === '')) {
    errors.push('Product name, if provided, must be a non-empty string.');
  }
  if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
    errors.push('Product price, if provided, must be a non-negative number.');
  }
  if (data.name === undefined && data.price === undefined) {
    errors.push('At least one field (name or price) must be provided for update.');
  }
  return errors;
}

module.exports = {
  validateProductInput,
  validateProductUpdateInput,
};