// main.js - Frontend JavaScript (Autônomo)

// --- Funções Auxiliares para LocalStorage ---
const STORAGE_KEY_PRODUCTS = 'products';
const STORAGE_KEY_NEXT_ID = 'nextProductId';

function getProductsFromLocalStorage() {
    const productsJson = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return productsJson ? JSON.parse(productsJson) : [];
}

function saveProductsToLocalStorage(products) {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
}

function getNextProductId() {
    let nextId = parseInt(localStorage.getItem(STORAGE_KEY_NEXT_ID) || '1');
    localStorage.setItem(STORAGE_KEY_NEXT_ID, (nextId + 1).toString());
    return nextId;
}

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

        // Lógica de login AUTÔNOMA (sem backend)
        // Apenas para fins de demonstração na faculdade
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

        // Lógica de manipulação de produtos com localStorage
        let products = getProductsFromLocalStorage();
        let product;

        if (editingId) {
            // Atualizar produto existente
            product = products.find(p => p.id === editingId);
            if (product) {
                product.name = name;
                product.price = price;
                showMessage('Produto atualizado com sucesso!');
            } else {
                showMessage('Erro: Produto não encontrado para atualização.', 'error');
                return;
            }
        } else {
            // Adicionar novo produto
            product = { id: getNextProductId(), name, price, quantity: 1 }; // Assume quantidade 1 para novos produtos
            products.push(product);
            showMessage('Produto adicionado com sucesso!');
        }

        saveProductsToLocalStorage(products); // Salva a lista atualizada
        productForm.reset();
        editingId = null;
        productForm.querySelector('button[type="submit"]').textContent = 'Adicionar Produto';
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

    const products = getProductsFromLocalStorage(); // Obtém os produtos do localStorage

    const grouped = {};
    products.forEach(product => {
        const key = product.name; // Agrupa por nome
        if (grouped[key]) {
            grouped[key].quantity = (grouped[key].quantity || 1) + (product.quantity || 1);
        } else {
            grouped[key] = {
                ...product,
                quantity: product.quantity || 1 // Define a quantidade inicial como 1 se não for fornecida
            };
        }
    });

    // Constrói a tabela com os produtos agrupados
    if (Object.values(grouped).length === 0) {
        productTable.innerHTML = `<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>`;
    } else {
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
    }
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
            // Você pode limpar outros dados do localStorage aqui, se desejar
            // localStorage.removeItem(STORAGE_KEY_PRODUCTS);
            // localStorage.removeItem(STORAGE_KEY_NEXT_ID);
            window.location.href = 'login.html';
        });
    }
}

// --- FUNÇÕES GLOBAIS (EDITAR/EXCLUIR) ---
window.deleteProduct = function (id) {
    showCustomConfirm('Tem certeza que deseja excluir este produto?', (confirmed) => {
        if (!confirmed) return;

        let products = getProductsFromLocalStorage();
        const initialLength = products.length;
        products = products.filter(p => p.id !== id);

        if (products.length === initialLength) {
            showCustomMessage('Produto não encontrado para deletar.', 'error');
        } else {
            saveProductsToLocalStorage(products); // Salva a lista atualizada
            showCustomMessage('Produto excluído com sucesso!');
            if (window.location.pathname.endsWith('lista.html')) {
                initListaScreen(); // Recarrega a lista após exclusão
            }
        }
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