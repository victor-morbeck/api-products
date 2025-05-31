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
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  if (!loginForm) return;

  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        input.classList.remove('invalid-input');
        errorDiv.textContent = '';
      }
    });
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    if (!usernameInput.value.trim()) {
      usernameInput.classList.add('invalid-input');
      isValid = false;
    }

    if (!passwordInput.value.trim()) {
      passwordInput.classList.add('invalid-input');
      isValid = false;
    }

    if (!isValid) {
      errorDiv.textContent = 'Preencha todos os campos!';
      return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === 'admin' && password === '1234') {
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = 'index.html';
      return;
    }

    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(async (res) => {
        if (res.ok) {
          localStorage.setItem('isLoggedIn', 'true');
          window.location.href = 'index.html';
        } else {
          const data = await res.json();
          errorDiv.textContent = data.error || 'Usuário ou senha inválidos.';
        }
      })
      .catch(() => {
        errorDiv.textContent = 'Erro ao conectar ao servidor.';
      });
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

  [nameInput, priceInput].forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        input.classList.remove('invalid-input', 'invalid-format', 'invalid-length', 'invalid-range');
        if (messageDiv) messageDiv.innerHTML = '';
      }
    });
  });

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
    let isValid = true;
    const name = nameInput.value.trim();
    const priceStr = priceInput.value.trim();
    const price = parseFloat(priceStr);

    // Reset de estilos
    nameInput.classList.remove('invalid-input', 'invalid-format', 'invalid-length');
    priceInput.classList.remove('invalid-input', 'invalid-format', 'invalid-range');

    // Validação do nome
    if (!name) {
      nameInput.classList.add('invalid-input');
      showMessage('O nome do produto é obrigatório.', 'error');
      isValid = false;
    } else if (name.length < 3) {
      nameInput.classList.add('invalid-length');
      showMessage('O nome deve ter pelo menos 3 caracteres.', 'error');
      isValid = false;
    } else if (name.length > 50) {
      nameInput.classList.add('invalid-length');
      showMessage('O nome não pode exceder 50 caracteres.', 'error');
      isValid = false;
    } else if (/^\d+$/.test(name)) {
      nameInput.classList.add('invalid-format');
      showMessage('O nome não pode conter apenas números.', 'error');
      isValid = false;
    }

    // Validação do preço
    if (!priceStr) {
      priceInput.classList.add('invalid-input');
      showMessage('O preço é obrigatório.', 'error');
      isValid = false;
    } else if (isNaN(price)) {
      priceInput.classList.add('invalid-format');
      showMessage('Digite um valor numérico válido.', 'error');
      isValid = false;
    } else if (price < 0.1) {
      priceInput.classList.add('invalid-range');
      showMessage('O valor mínimo é R$ 0,10.', 'error');
      isValid = false;
    } else if (price > 10000) {
      priceInput.classList.add('invalid-range');
      showMessage('O valor máximo é R$ 10.000,00.', 'error');
      isValid = false;
    } else if (!/^\d+(\.\d{1,2})?$/.test(priceStr)) {
      priceInput.classList.add('invalid-format');
      showMessage('Use no máximo 2 casas decimais.', 'error');
      isValid = false;
    }

    if (!isValid) return;

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${apiUrl}/${editingId}` : apiUrl;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price })
    })
      .then(async (res) => {
        let data = {};
        try {
          data = await res.json();
        } catch (e) {}
        
        if (res.ok) {
          showMessage(editingId ? 'Produto atualizado!' : 'Produto adicionado!');
          productForm.reset();
          editingId = null;
          productForm.querySelector('button[type="submit"]').textContent = 'Add Product';
        } else {
          showMessage((data.errors && data.errors.join(', ')) || data.error || 'Erro ao adicionar produto.', 'error');
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
          initListaScreen();
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

// --- INFO ICON ---
const infoIcon = document.getElementById('infoIcon');
if (infoIcon) {
  infoIcon.addEventListener('mouseenter', () => {
    alert('Usuário: admin\nSenha: 1234');
  });
}