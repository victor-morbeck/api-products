# Product API

A Node.js API to manage products with input validation, modular structure and in-memory storage.

## How to Run

```bash
npm install
npm start
```

## API Endpoints

- **GET** `/products` — List all products
- **GET** `/products/:id` — Get a product by ID
- **POST** `/products` — Create product  
  Body example:
  ```json
  {
    "name": "Headphone",
    "price": 299.90
  }
  ```
- **PUT** `/products/:id` — Update product  
  Body example:
  ```json
  {
    "name": "Wireless Headphone"
  }
  ```
- **DELETE** `/products/:id` — Delete product

## Validation

- On create: `name` (non-empty string) and `price` (non-negative number) are required.
- On update: at least one field (`name` or `price`) is required.
- Returns meaningful errors for invalid or missing fields.

## Testing with Insomnia

1. Create requests for each endpoint above.
2. Use JSON for POST/PUT requests.
3. Observe responses for both success and error cases.