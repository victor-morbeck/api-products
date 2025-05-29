document.addEventListener('DOMContentLoaded', () => {
  const isLoginPage = window.location.pathname.endsWith('login.html');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // 🔐 Redireciona para login se não estiver autenticado
  if (!isLoginPage && !isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  // 🔁 Redireciona para index se já estiver logado e está na tela de login
  if (isLoginPage && isLoggedIn) {
    window.location.href = 'index.html';
    return;
  }

  if (isLoginPage) {
    handleLogin();
  } else {
    initProductScreen();
  }
});

function handleLogin() {
  const loginForm = document.getElementById('loginForm');
  const errorDiv = document.getElementById('loginError');

  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (username === 'admin' && password === '1234') {
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = 'index.html';
    } else {
      errorDiv.textContent = 'Usuário ou senha inválidos.';
    }
  });
}

function initProductScreen() {
  const apiUrl = 'http://localhost:3000/products';
  const productTable = document.getElementById('productTable');
  const productForm = document.getElementById('productForm');
  const nameInput = document.getElementById('name');
  const priceInput = document.getElementById('price');
  const messageDiv = document.getElementById('message');
  let editingId = null;

  if (!productForm || !productTable) return;

  function showMessage(msg, type = 'success') {
    messageDiv.innerHTML = `<div class="${type}">${msg}</div>`;
    setTimeout(() => messageDiv.innerHTML = '', 2500);
  }

  function fetchProducts() {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((products) => {
        productTable.innerHTML = products.map(product => `
          <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>R$ ${product.price.toFixed(2)}</td>
            <td>
              <div class="action-buttons">
                <button class="edit" onclick="editProduct(${product.id}, '${product.name}', ${product.price})">Editar</button>
                <button class="delete" onclick="deleteProduct(${product.id})">Excluir</button>
              </div>
            </td>
          </tr>
        `).join('');
      });
  }

  window.editProduct = function (id, name, price) {
    nameInput.value = name;
    priceInput.value = price;
    editingId = id;
    productForm.querySelector('button[type="submit"]').textContent = 'Atualizar';
  };

  window.deleteProduct = function (id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.status === 204) {
          showMessage('Produto excluído!');
          fetchProducts();
        } else {
          res.json().then(data => showMessage(data.error || 'Erro ao excluir', 'error'));
        }
      });
  };

  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);

    if (!name || isNaN(price)) {
      showMessage('Preencha todos os campos corretamente.', 'error');
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${apiUrl}/${editingId}` : apiUrl;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price })
    })
      .then(async (res) => {
        if (res.ok) {
          productForm.reset();
          showMessage(editingId ? 'Produto atualizado!' : 'Produto adicionado!');
          editingId = null;
          productForm.querySelector('button[type="submit"]').textContent = 'Adicionar Produto';
          fetchProducts();
        } else {
          const data = await res.json();
          showMessage((data.errors && data.errors.join(', ')) || data.error, 'error');
        }
      });
  });

  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'login.html';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...

    // Lógica para o botão Stock Query
    const stockQueryBtn = document.getElementById('stockQueryBtn');
    if (stockQueryBtn) {
      stockQueryBtn.addEventListener('click', () => {
        window.location.href = 'stock-list.html';
      });
    }

    // ...existing code...
  });

  fetchProducts();
}
