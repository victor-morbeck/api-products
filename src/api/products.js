// src/api/products.js
export default async (req, res) => {
  // Simulando seu array de produtos
  const products = [
    { id: 1, name: 'laptop', price: 1200.00 },
    { id: 2, name: 'Mouse', price: 25.00 }
  ];
  
  // Configura o CORS para permitir seu frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json(products);
};