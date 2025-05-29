document.addEventListener('DOMContentLoaded', () => {
  const isLoginPage = window.location.pathname.endsWith('login.html');
  const isListaPage = window.location.pathname.endsWith('lista.html');
  const isIndexPage = window.location.pathname.endsWith('index.html');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // Redirecionamento de autenticação
  if (!isLoginPage && !isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }
  if (isLoginPage && isLoggedIn) {
    window.location.href = 'index.html';
    return;
  }

  if (isLoginPage) {
    handleLogin();
  } else if (isIndexPage) {
    initProductScreen();
    handleStockQueryBtn();
    handleLogoutBtn();
  } else if (isListaPage) {
    initListaScreen();
    handleVoltarBtn();
    handleLogoutBtn();
  }
});

// --- LOGIN ---
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

// --- INDEX (ADICIONAR PRODUTO) ---
function initProductScreen() {
  const apiUrl = 'http://localhost:3000/products';
  const productForm = document.getElementById('productForm');
  const nameInput = document.getElementById('name');
  const priceInput = document.getElementById('price');
  const messageDiv = document.getElementById('message');
  let editingId = null;

  if (!productForm) return;

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
          editingId = null;
          productForm.querySelector('button[type="submit"]').textContent = 'Add Product';
          // Redireciona para lista.html após adicionar
         // window.location.href = 'lista.html';
        } else {
          const data = await res.json();
          showMessage((data.errors && data.errors.join(', ')) || data.error, 'error');
        }
      });
  });

  function showMessage(msg, type = 'success') {
    if (!messageDiv) return;
    messageDiv.innerHTML = `<div class="${type}">${msg}</div>`;
    setTimeout(() => messageDiv.innerHTML = '', 2500);
  }
}

// --- LISTA (MOSTRAR PRODUTOS) ---
function initListaScreen() {
  const apiUrl = 'http://localhost:3000/products';
  const productTable = document.getElementById('productTable');
  if (!productTable) return;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((products) => {
      productTable.innerHTML = products.map(product => `
        <tr>
          <td>${product.id}</td>
          <td>${product.name}</td>
          <td>R$ ${product.price.toFixed(2)}</td>
          <td>${product.quantity !== undefined ? product.quantity : '-'}</td>
          <td>
            <!-- Ações podem ser adicionadas aqui -->
          </td>
        </tr>
      `).join('');
    });
}

// --- BOTÃO STOCK QUERY ---
function handleStockQueryBtn() {
  const stockQueryBtn = document.getElementById('stockQueryBtn');
  if (stockQueryBtn) {
    stockQueryBtn.addEventListener('click', () => {
      window.location.href = 'lista.html';
    });
  }
}

// --- BOTÃO VOLTAR ---
function handleVoltarBtn() {
  const voltarBtn = document.getElementById('voltar-para-add');
  if (voltarBtn) {
    voltarBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

// --- BOTÃO LOGOUT ---
function handleLogoutBtn() {
  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'login.html';
    });
  }

  fetchProducts();
}
