const express = require('express');
const path = require('path'); // Você vai precisar disso para caminhos de arquivo
const app = express();
const port = 3000;

// OBRIGATÓRIO: Se sua API espera JSON no corpo das requisições (POST, PUT)
app.use(express.json());

// --- PARTE NOVA: Configurar o Express para servir o frontend ---

// 1. Configurar para servir arquivos estáticos (CSS, JS, imagens, etc.)
// Isso diz ao Express: "Qualquer arquivo na pasta 'public' pode ser acessado diretamente pelo navegador."
// Ex: Se tiver 'public/styles.css', o navegador pode ir em http://localhost:3000/styles.css
// '__dirname' é o diretório do arquivo atual (app.js). '../public' vai um nível acima e entra em 'public'.
app.use(express.static(path.join(__dirname, '../frontend')));

// 2. Definir a rota principal (/) para enviar o index.html
// Quando alguém acessa http://localhost:3000/, esta função será executada e enviará o index.html.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

// --- FIM DA PARTE NOVA ---


// --- SUAS ROTAS DA API (exemplo de /products) ---
// O restante do seu código Express para lidar com a lógica dos produtos

// Apenas um exemplo de produtos (simulando um banco de dados)
let products = [
    { id: 1, name: 'Laptop', price: 1200.00 },
    { id: 2, name: 'Mouse', price: 25.00 }
];
let nextId = 3; // Para gerar IDs únicos

// Rota para obter todos os produtos
app.get('/products', (req, res) => {
    res.json(products);
});

// Rota para adicionar um novo produto
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    if (!name || typeof price !== 'number') {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios e preço deve ser um número.' });
    }
    const newProduct = { id: nextId++, name, price: parseFloat(price) };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Rota para atualizar um produto
app.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const { name, price } = req.body;
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    if (!name || typeof price !== 'number') {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios e preço deve ser um número.' });
    }

    products[productIndex] = { id: productId, name, price: parseFloat(price) };
    res.json(products[productIndex]);
});

// Rota para deletar um produto
app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const initialLength = products.length;
    products = products.filter(p => p.id !== productId);

    if (products.length === initialLength) {
        return res.status(404).json({ error: 'Produto não encontrado para deletar.' });
    }
    res.status(204).send(); // 204 No Content para deleção bem-sucedida
});

// --- FIM DAS SUAS ROTAS DA API ---


// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});