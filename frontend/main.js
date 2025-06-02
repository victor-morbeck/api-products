const BASE_BACKEND_URL = 'http://api-products-backend-production.up.railway.app';

// --- Funções de UI para Modals (Substituindo alert/confirm) ---
function showCustomMessage(message, type = 'success') {
    const messageDiv = document.getElementById('globalMessage'); // Certifique-se de ter uma div com id="globalMessage" no seu HTML
    if (!messageDiv) {
        console.warn('Elemento #globalMessage não encontrado para exibir a mensagem.');
        return;
    }
    messageDiv.innerHTML = `<div class="custom-message ${type}">${message}</div>`;
    messageDiv.style.display = 'block'; // Mostra o modal
    setTimeout(() => {
        messageDiv.style.display = 'none'; // Esconde o modal após um tempo
        messageDiv.innerHTML = '';
    }, 3000); // Mensagem visível por 3 segundos
}

function showCustomConfirm(message, callback) {
    const confirmModal = document.getElementById('customConfirmModal'); // Certifique-se de ter um modal com id="customConfirmModal" no seu HTML
    const confirmMessage = document.getElementById('customConfirmMessage');
    const confirmYesBtn = document.getElementById('customConfirmYes');
    const confirmNoBtn = document.getElementById('customConfirmNo');

    if (!confirmModal || !confirmMessage || !confirmYesBtn || !confirmNoBtn) {
        console.error('Elementos do modal de confirmação não encontrados.');
        // Fallback para confirm() se os elementos não existirem, embora não seja o ideal
        if (window.confirm(message)) {
            callback(true);
        } else {
            callback(false);
        }
        return;
    }

    confirmMessage.textContent = message;
    confirmModal.style.display = 'block';

    const handleYes = () => {
        confirmModal.style.display = 'none';
        confirmYesBtn.removeEventListener('click', handleYes);
        confirmNoBtn.removeEventListener('click', handleNo);
        callback(true);
    };

    const handleNo = () => {
        confirmModal.style.display = 'none';
        confirmYesBtn.removeEventListener('click', handleYes);
        confirmNoBtn.removeEventListener('click', handleNo);
        callback(false);
    };

    confirmYesBtn.addEventListener('click', handleYes);
    confirmNoBtn.addEventListener('click', handleNo);
}

// --- Lógica Principal de Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('login.html');
    const isListaPage = path.endsWith('lista.html');
    const isIndexPage = path.endsWith('index.html');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Redirecionamento para login se não estiver logado e não for a página de login
    if (!isLoginPage && !isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Redirecionamento para index se já estiver logado e tentar acessar a página de login
    if (isLoginPage && isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Inicialização das funções específicas de cada página
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

    // Limpa mensagens de erro ao digitar
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

        // Validação de campos vazios
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

        // Lógica de login hardcoded para 'admin' e '1234' (para fins de demonstração)
        // Esta lógica deve corresponder ao seu backend.
        if (username === 'admin' && password === '1234') {
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'index.html';
            return;
        }

        // Requisição ao backend para login
        fetch(`${BASE_BACKEND_URL}/login`, { // Endpoint de login ajustado
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
            errorDiv.textContent = 'Erro ao conectar ao servidor. Verifique a URL do backend ou sua conexão.';
        });
    });
}

// --- PRODUTOS (INDEX.HTML) ---
function initProductScreen() {
    const productForm = document.getElementById('productForm');
    const nameInput = document.getElementById('name');
    const priceInput = document.getElementById('price');
    const messageDiv = document.getElementById('message'); // Div para mensagens específicas do formulário
    let editingId = null;

    if (!productForm) return;

    // Limpa estilos de validação ao digitar
    [nameInput, priceInput].forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim()) {
                input.classList.remove('invalid-input', 'invalid-format', 'invalid-length', 'invalid-range');
                if (messageDiv) messageDiv.innerHTML = '';
            }
        });
    });

    // Carrega produto para edição, se houver
    const editingProduct = localStorage.getItem('editingProduct');
    if (editingProduct) {
        const { id, name, price } = JSON.parse(editingProduct);
        nameInput.value = name;
        priceInput.value = price;
        editingId = id;
        productForm.querySelector('button[type="submit"]').textContent = 'Atualizar Produto';
        localStorage.removeItem('editingProduct');
    }

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        const name = nameInput.value.trim();
        const priceStr = priceInput.value.trim();
        const price = parseFloat(priceStr);

        // Reset de estilos de validação
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
        const url = editingId ? `${BASE_BACKEND_URL}/products/${editingId}` : `${BASE_BACKEND_URL}/products`;

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price })
        })
        .then(async (res) => {
            let data = {};
            try {
                data = await res.json();
            } catch (e) {
                // Ignora erro se a resposta não for JSON (ex: 204 No Content)
            }

            if (res.ok) {
                showMessage(editingId ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
                productForm.reset();
                editingId = null;
                productForm.querySelector('button[type="submit"]').textContent = 'Adicionar Produto';
            } else {
                showMessage((data.errors && data.errors.join(', ')) || data.error || 'Erro ao processar produto.', 'error');
            }
        })
        .catch(() => {
            showMessage('Erro de conexão com o servidor. Verifique a URL do backend.', 'error');
        });
    });

    // Função para exibir mensagens específicas do formulário
    function showMessage(msg, type = 'success') {
        if (!messageDiv) return;
        messageDiv.innerHTML = `<div class="${type}">${msg}</div>`;
        setTimeout(() => messageDiv.innerHTML = '', 2500);
    }
}

// --- LISTA (LISTA.HTML) ---
function initListaScreen() {
    const productTable = document.getElementById('productTable');
    if (!productTable) return;

    fetch(`${BASE_BACKEND_URL}/products`) // URL ajustada
        .then((res) => {
            if (!res.ok) {
                throw new Error('Erro ao carregar produtos.');
            }
            return res.json();
        })
        .then((products) => {
            const grouped = {};
            products.forEach(product => {
                const key = product.name; // Agrupa por nome
                if (grouped[key]) {
                    // Se o produto já existe, incrementa a quantidade.
                    // Se o backend não retornar 'quantity', assume 1 por item.
                    grouped[key].quantity = (grouped[key].quantity || 1) + (product.quantity || 1);
                } else {
                    // Cria uma nova entrada para o produto
                    grouped[key] = {
                        ...product,
                        quantity: product.quantity || 1 // Define a quantidade inicial como 1 se não for fornecida
                    };
                }
            });

            // Constrói a tabela com os produtos agrupados
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
        })
        .catch((error) => {
            showCustomMessage(`Erro ao carregar lista de produtos: ${error.message}`, 'error');
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
            localStorage.removeItem('token'); // Se você usar um token no futuro
            window.location.href = 'login.html';
        });
    }
}

// --- FUNÇÕES GLOBAIS (EDITAR/EXCLUIR) ---
window.deleteProduct = function (id) {
    showCustomConfirm('Tem certeza que deseja excluir este produto?', (confirmed) => {
        if (!confirmed) return;

        fetch(`${BASE_BACKEND_URL}/products/${id}`, { method: 'DELETE' }) // URL ajustada
            .then(res => {
                if (res.status === 204) { // 204 No Content para deleção bem-sucedida
                    showCustomMessage('Produto excluído com sucesso!');
                    if (window.location.pathname.endsWith('lista.html')) {
                        initListaScreen(); // Recarrega a lista após exclusão
                    }
                } else {
                    res.json().then(data => showCustomMessage(data.error || 'Erro ao excluir produto.', 'error'))
                        .catch(() => showCustomMessage('Erro desconhecido ao excluir produto.', 'error'));
                }
            })
            .catch(() => {
                showCustomMessage('Erro de conexão ao excluir produto.', 'error');
            });
    });
};

window.editProduct = function (id, name, price) {
    localStorage.setItem('editingProduct', JSON.stringify({ id, name, price }));
    window.location.href = 'index.html';
};

// --- INFO ICON (Substituindo alert) ---
const infoIcon = document.getElementById('infoIcon');
if (infoIcon) {
    infoIcon.addEventListener('mouseenter', () => {
        showCustomMessage('Usuário: admin<br>Senha: 1234', 'info');
    });
}