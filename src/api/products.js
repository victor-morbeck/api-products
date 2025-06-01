// Armazenamento em memória
let products = [];
let nextId = 1;

// Funções de CRUD (exatamente como você definiu)
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
    Object.assign(product, data);
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

// Handler principal (formato Vercel Serverless)
export default async (req, res) => {
  // Configura CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    let result;
    const { id } = req.query;
    const body = req.body;

    switch (req.method) {
      case 'GET':
        result = id ? getProductById(Number(id)) : getAllProducts();
        return res.json(result || { error: "Product not found" });

      case 'POST':
        if (!body.name || !body.price) {
          return res.status(400).json({ error: "Name and price are required" });
        }
        result = createProduct(body);
        return res.status(201).json(result);

      case 'PUT':
        result = updateProduct(Number(id), body);
        return result 
          ? res.json(result)
          : res.status(404).json({ error: "Product not found" });

      case 'DELETE':
        return deleteProduct(Number(id))
          ? res.status(204).end()
          : res.status(404).json({ error: "Product not found" });

      default:
        return res.status(405).end(); // Método não permitido
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};