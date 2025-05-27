const apiUrl = "http://localhost:3000/products";
    const productTable = document.getElementById("productTable");
    const productForm = document.getElementById("productForm");
    const nameInput = document.getElementById("name");
    const priceInput = document.getElementById("price");
    const messageDiv = document.getElementById("message");
    let editingId = null;

    function showMessage(msg, type = "success") {
      messageDiv.innerHTML = `<div class="${type}">${msg}</div>`;
      setTimeout(() => messageDiv.innerHTML = "", 2500);
    }

    function fetchProducts() {
      fetch(apiUrl)
        .then(res => res.json())
        .then(products => {
          productTable.innerHTML = products.map(product => `
            <tr>
              <td>${product.id}</td>
              <td>${product.name}</td>
              <td>R$ ${product.price.toFixed(2)}</td>
              <td>
                <button class="edit" onclick="editProduct(${product.id}, '${product.name}', ${product.price})">Edit</button>
                <button class="delete" onclick="deleteProduct(${product.id})">Delete</button>
              </td>
            </tr>
          `).join('');
        });
    }

    window.editProduct = function(id, name, price) {
      nameInput.value = name;
      priceInput.value = price;
      editingId = id;
      productForm.querySelector('button[type="submit"]').textContent = "Update";
    }

    window.deleteProduct = function(id) {
      if (!confirm('Are you sure you want to delete this product?')) return;
      fetch(`${apiUrl}/${id}`, { method: "DELETE" })
        .then(res => {
          if (res.status === 204) {
            showMessage("Product deleted!");
            fetchProducts();
          } else {
            res.json().then(data => showMessage(data.error, "error"));
          }
        });
    }

    productForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const name = nameInput.value.trim();
      const price = parseFloat(priceInput.value);

      if (!name || isNaN(price)) {
        showMessage("Fill in all fields correctly.", "error");
        return;
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${apiUrl}/${editingId}` : apiUrl;
      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price })
      })
      .then(async res => {
        if (res.ok) {
          productForm.reset();
          showMessage(editingId ? "Product updated!" : "Product added!");
          editingId = null;
          productForm.querySelector('button[type="submit"]').textContent = "Add Product";
          fetchProducts();
        } else {
          const data = await res.json();
          showMessage((data.errors && data.errors.join(", ")) || data.error, "error");
        }
      });
    });

    fetchProducts();