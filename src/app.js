const express = require('express');
const bodyParser = require('body-parser');
const productRoutes = require('./src/backend/routes/productRoutes');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use('/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});