document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isLoginPage = path.endsWith('login.html');
  const isListaPage = path.endsWith('lista.html');
  const isIndexPage = path.endsWith('index.html');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

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
  } else {
    handleLogoutBtn();
    if (isIndexPage) {
      initProductScreen();
      handleStockQueryBtn();
    } else if (isListaPage) {
      initListaScreen();
      handleVoltarBtn();
    }
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

// --- PRODUTOS (INDEX.HTML) ---
function initProductScreen() {
  const apiUrl = 'http://localhost:3000/products';
  const productForm = document.getElementById('productForm');
  const nameInput = document.getElementById('name');
  const priceInput = document.getElementById('price');
  const messageDiv = document.getElementById('message');
  let editingId = null;

  if (!productForm) return;

  const editingProduct = localStorage.getItem('editingProduct');
  if (editingProduct) {
    const { id, name, price } = JSON.parse(editingProduct);
    nameInput.value = name;
    priceInput.value = price;
    editingId = id;
    productForm.querySelector('button[type="submit"]').textContent = 'Atualizar';
    localStorage.removeItem('editingProduct');
  }

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
        const data = await res.json();
        if (res.ok) {
          showMessage(editingId ? 'Produto atualizado!' : 'Produto adicionado!');
          productForm.reset();
          editingId = null;
          productForm.querySelector('button[type="submit"]').textContent = 'Add Product';
          window.location.href = 'lista.html';
        } else {
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

// --- LISTA (LISTA.HTML) ---
function initListaScreen() {
  const apiUrl = 'http://localhost:3000/products';
  const productTable = document.getElementById('productTable');
  if (!productTable) return;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((products) => {
      const grouped = {};
      products.forEach(product => {
        const key = product.name;
        if (grouped[key]) {
          grouped[key].quantity += product.quantity || 1;
        } else {
          grouped[key] = {
            ...product,
            quantity: product.quantity || 1
          };
        }
      });

      productTable.innerHTML = Object.values(grouped).map(product => `
        <tr>
          <td>${product.id}</td>
          <td>${product.name}</td>
          <td>R$ ${product.price.toFixed(2)}</td>
          <td>${product.quantity}</td>
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

// --- BOTÃO CONSULTAR (INDEX) ---
function handleStockQueryBtn() {
  const btn = document.getElementById('stockQueryBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      window.location.href = 'lista.html';
    });
  }
}

// --- BOTÃO VOLTAR (LISTA) ---
function handleVoltarBtn() {
  const btn = document.getElementById('voltar-para-add');
  if (btn) {
    btn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

// --- BOTÃO LOGOUT (AMBOS) ---
function handleLogoutBtn() {
  const btn = document.getElementById('logoutButton');
  if (btn) {
    btn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }
}

// --- FUNÇÕES GLOBAIS (EDITAR/EXCLUIR) ---
window.deleteProduct = function (id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;

  const apiUrl = 'http://localhost:3000/products';
  fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
    .then(res => {
      if (res.status === 204) {
        if (window.location.pathname.endsWith('lista.html')) {
          initListaScreen(); // atualiza lista
        }
      } else {
        res.json().then(data => alert(data.error || 'Erro ao excluir produto.'));
      }
    });
};

window.editProduct = function (id, name, price) {
  localStorage.setItem('editingProduct', JSON.stringify({ id, name, price }));
  window.location.href = 'index.html';
};
// 