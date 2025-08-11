import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

/**
 * Função de segurança que verifica se o utilizador está logado e é um administrador.
 */
function checkAdminAuth() {
    if (!authManager.isLoggedIn() || authManager.getUserType() !== 'admin') {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = '/src/html/auth/login.html';
        return false;
    }
    return true;
}

/**
 * Função principal que inicializa a página do formulário de produto.
 */
async function initProductForm() {
    // --- Seleção de Elementos ---
    const form = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const nameInput = document.getElementById('nome');
    const descriptionInput = document.getElementById('descricao');
    const priceInput = document.getElementById('preco');
    const stockInput = document.getElementById('quantidade_estoque');
    const categoryInput = document.getElementById('categoria_id');
    const fornecedorInput = document.getElementById('fornecedor_id');
    const imageInput = document.getElementById('imagens');
    const imagePreviewContainer = document.getElementById('image-preview');

    // --- Seletores dos Modais ---
    const addFornecedorModal = document.getElementById('add-fornecedor-modal');
    const closeFornecedorModalBtn = document.getElementById('close-fornecedor-modal');
    const newFornecedorForm = document.getElementById('new-fornecedor-form');
    
    const addCategoriaModal = document.getElementById('add-categoria-modal');
    const closeCategoriaModalBtn = document.getElementById('close-categoria-modal');
    const newCategoriaForm = document.getElementById('new-categoria-form');

    // --- Detecção de Modo ---
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const isEditMode = !!productId;

    // --- Funções de Carregamento de Dados ---
    async function loadCategories() {
        if (!categoryInput) return;
        try {
            const categories = await fetchWithAuth('/api/categoria');
            const currentValue = categoryInput.value;
            categoryInput.innerHTML = '<option value="">Selecione uma categoria</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.nome;
                categoryInput.appendChild(option);
            });
            categoryInput.value = currentValue;
        } catch (error) { console.error('Erro ao carregar categorias:', error); }
    }

    async function loadFornecedores() {
        if (!fornecedorInput) return;
        try {
            const fornecedores = await fetchWithAuth('/api/fornecedores');
            const currentValue = fornecedorInput.value;
            fornecedorInput.innerHTML = '<option value="">Nenhum</option>';
            fornecedores.forEach(fornecedor => {
                const option = document.createElement('option');
                option.value = fornecedor.id;
                option.textContent = fornecedor.nome;
                fornecedorInput.appendChild(option);
            });
            fornecedorInput.value = currentValue;
        } catch (error) { console.error('Erro ao carregar fornecedores:', error); }
    }

    /**
     * ⭐ MELHORIA: Função genérica para configurar qualquer modal com um botão "Novo" ⭐
     * @param {object} config - Objeto de configuração para o modal.
     */
    function setupModal(config) {
        const { triggerInput, modalElement, closeBtn, formElement, newButtonText, submitHandler } = config;
        
        if (!triggerInput || !modalElement) return;

        const openBtn = document.createElement('button');
        openBtn.textContent = newButtonText;
        openBtn.type = 'button';
        openBtn.className = 'add-new-btn';
        triggerInput.parentElement.appendChild(openBtn);

        openBtn.addEventListener('click', () => modalElement.classList.remove('hidden'));
        if (closeBtn) closeBtn.addEventListener('click', () => modalElement.classList.add('hidden'));
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) modalElement.classList.add('hidden');
        });
        if (formElement) formElement.addEventListener('submit', submitHandler);
    }

    // --- Funções de Submissão dos Modais ---
    async function handleNewFornecedorSubmit(event) {
        event.preventDefault();
        const errorMessage = document.getElementById('modal-error-message');
        if (errorMessage) errorMessage.textContent = '';
        const payload = {
            nome: document.getElementById('fornecedor-nome').value,
            cnpj: document.getElementById('fornecedor-cnpj').value,
            contato: document.getElementById('fornecedor-contato').value,
            endereco: document.getElementById('fornecedor-endereco').value,
        };
        try {
            const newFornecedor = await fetchWithAuth('/api/fornecedores', { method: 'POST', body: payload });
            addFornecedorModal.classList.add('hidden');
            newFornecedorForm.reset();
            await loadFornecedores();
            fornecedorInput.value = newFornecedor.id;
        } catch (error) {
            if (errorMessage) errorMessage.textContent = error.message;
            console.error('Erro ao criar fornecedor:', error);
        }
    }

    async function handleNewCategoriaSubmit(event) {
        event.preventDefault();
        const errorMessage = document.getElementById('modal-categoria-error');
        if (errorMessage) errorMessage.textContent = '';
        const payload = {
            nome: document.getElementById('categoria-nome').value,
        };
        try {
            const newCategoria = await fetchWithAuth('/api/categoria', { method: 'POST', body: payload });
            addCategoriaModal.classList.add('hidden');
            newCategoriaForm.reset();
            await loadCategories();
            categoryInput.value = newCategoria.id;
        } catch (error) {
            if (errorMessage) errorMessage.textContent = error.message;
            console.error('Erro ao criar categoria:', error);
        }
    }

    // --- Lógica Principal de Inicialização ---
    await Promise.all([loadCategories(), loadFornecedores()]);
    
    // ⭐ MELHORIA: Usa a função genérica para configurar os dois modais ⭐
    setupModal({
        triggerInput: fornecedorInput,
        modalElement: addFornecedorModal,
        closeBtn: closeFornecedorModalBtn,
        formElement: newFornecedorForm,
        newButtonText: 'Novo',
        submitHandler: handleNewFornecedorSubmit
    });

    setupModal({
        triggerInput: categoryInput,
        modalElement: addCategoriaModal,
        closeBtn: closeCategoriaModalBtn,
        formElement: newCategoriaForm,
        newButtonText: 'Nova',
        submitHandler: handleNewCategoriaSubmit
    });


    // --- Preenche o Formulário (Modo Edição) ---
    if (isEditMode) {
        if (formTitle) formTitle.textContent = 'Editar Produto';
        try {
            const product = await fetchWithAuth(`/api/produtos/${productId}`);
            if (nameInput) nameInput.value = product.nome;
            if (descriptionInput) descriptionInput.value = product.descricao;
            if (priceInput) priceInput.value = product.preco;
            if (stockInput) stockInput.value = product.quantidade_estoque;
            if (categoryInput) categoryInput.value = product.categoria_id;
            if (fornecedorInput) fornecedorInput.value = product.fornecedor_id;

            if (imagePreviewContainer && product.imagens?.length) {
                imagePreviewContainer.innerHTML = '<p class="form-hint">Imagens Atuais:</p>';
                product.imagens.forEach(img => {
                    const imgEl = document.createElement('img');
                    imgEl.src = img.url;
                    imgEl.style.cssText = 'max-width: 100px; border-radius: 6px; margin-top: 5px;';
                    imagePreviewContainer.appendChild(imgEl);
                });
            }
        } catch (error) {
            alert('Erro ao carregar dados do produto.');
            console.error(error);
        }
    } else {
        if (formTitle) formTitle.textContent = 'Criar Novo Produto';
    }
    
    // --- Lida com o Envio do Formulário Principal ---
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData();
            formData.append('nome', nameInput.value);
            formData.append('descricao', descriptionInput.value);
            formData.append('preco', priceInput.value);
            formData.append('quantidade_estoque', stockInput.value);
            formData.append('categoria_id', categoryInput.value);
            formData.append('fornecedor_id', fornecedorInput.value || '');

            if (imageInput.files.length > 0) {
                for (const file of imageInput.files) {
                    formData.append('imagens', file);
                }
            }

            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode ? `/api/produtos/${productId}` : '/api/produtos';

            try {
                await fetchWithAuth(url, { method: method, body: formData });
                alert(`Produto ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
                window.location.href = 'produtos.html';
            } catch (error) {
                console.error('Erro ao enviar formulário:', error);
                alert(error.message);
            }
        });
    }
}

// Roda a inicialização da página apenas se o utilizador for um admin
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        initProductForm();
    }
});