// src/js/modules/product-form.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';
import { API_BASE_URL } from '../apiConfig.js';

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
    const skuInput = document.getElementById('sku');
    const imageInput = document.getElementById('imagens');
    const imagePreviewContainer = document.getElementById('image-preview');

    // --- Seletores para o Modal de Fornecedor ---
    const addFornecedorModal = document.getElementById('add-fornecedor-modal');
    const openFornecedorModalBtn = document.createElement('button');
    const closeFornecedorModalBtn = document.getElementById('close-fornecedor-modal');
    const newFornecedorForm = document.getElementById('new-fornecedor-form');

    // --- Detecção de Modo ---
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const isEditMode = !!productId;

    /**
     * Carrega as categorias no select.
     */
    async function loadCategories() {
        if (!categoryInput) return;
        try {
            const categories = await fetchWithAuth('/api/categoria');
            categoryInput.innerHTML = '<option value="">Selecione uma categoria</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.nome;
                categoryInput.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    /**
     * Carrega os fornecedores no select.
     */
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
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
        }
    }

    /**
     * Configura toda a lógica do modal de fornecedor.
     */
    function setupFornecedorModal() {
        if (!fornecedorInput || !addFornecedorModal) return;
        
        // Adiciona o botão "Novo" ao lado do select de fornecedor
        openFornecedorModalBtn.textContent = 'Novo';
        openFornecedorModalBtn.type = 'button';
        openFornecedorModalBtn.className = 'add-new-btn';
        fornecedorInput.parentElement.style.display = 'flex';
        fornecedorInput.parentElement.style.alignItems = 'center';
        fornecedorInput.parentElement.appendChild(openFornecedorModalBtn);
        
        openFornecedorModalBtn.addEventListener('click', () => addFornecedorModal.classList.remove('hidden'));
        closeFornecedorModalBtn.addEventListener('click', () => addFornecedorModal.classList.add('hidden'));
        addFornecedorModal.addEventListener('click', (e) => {
            if (e.target === addFornecedorModal) {
                addFornecedorModal.classList.add('hidden');
            }
        });

        newFornecedorForm.addEventListener('submit', handleNewFornecedorSubmit);
    }

    /**
     * Lida com o envio do formulário do novo fornecedor.
     */
    async function handleNewFornecedorSubmit(event) {
        event.preventDefault();
        const errorMessage = document.getElementById('modal-error-message');
        errorMessage.textContent = '';

        const payload = {
            nome: document.getElementById('fornecedor-nome').value,
            cnpj: document.getElementById('fornecedor-cnpj').value,
            contato: document.getElementById('fornecedor-contato').value,
            endereco: document.getElementById('fornecedor-endereco').value,
        };

        try {
            const newFornecedor = await fetchWithAuth('/api/fornecedores', {
                method: 'POST',
                body: payload
            });

            addFornecedorModal.classList.add('hidden');
            newFornecedorForm.reset();
            await loadFornecedores(); // Recarrega a lista
            fornecedorInput.value = newFornecedor.id; // Seleciona o novo fornecedor

        } catch (error) {
            errorMessage.textContent = error.message;
            console.error('Erro ao criar fornecedor:', error);
        }
    }

    // Carrega categorias e fornecedores em paralelo
    await Promise.all([loadCategories(), loadFornecedores()]);
    
    // Configura o modal depois de tudo carregado
    setupFornecedorModal();

    // --- Preenche o formulário em modo de edição ---
    if (isEditMode) {
        if (formTitle) formTitle.textContent = 'Editar Produto';
        try {
            const product = await fetchWithAuth(`/api/produtos/${productId}`);
            if (nameInput) nameInput.value = product.nome;
            if (descriptionInput) descriptionInput.value = product.descricao;
            if (priceInput) priceInput.value = product.preco;
            if (stockInput) stockInput.value = product.quantidade_estoque;
            if (skuInput) skuInput.value = product.sku;
            if (categoryInput) categoryInput.value = product.categoria_id;
            if (fornecedorInput) fornecedorInput.value = product.fornecedor_id;

            if (imagePreviewContainer && product.imagens?.length) {
                const currentImagesHeader = document.createElement('p');
                currentImagesHeader.textContent = 'Imagens Atuais:';
                imagePreviewContainer.appendChild(currentImagesHeader);
                product.imagens.forEach(img => {
                    const imgEl = document.createElement('img');
                    imgEl.src = `${API_BASE_URL}/${img.url}`;
                    imgEl.style.cssText = 'max-width: 100px; border-radius: 6px; margin: 5px;';
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

    // --- Lógica de Envio do Formulário Principal ---
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData();
            formData.append('nome', nameInput.value);
            formData.append('descricao', descriptionInput.value);
            formData.append('preco', priceInput.value);
            formData.append('quantidade_estoque', stockInput.value);
            formData.append('categoria_id', categoryInput.value);
            formData.append('sku', skuInput.value);
            formData.append('fornecedor_id', fornecedorInput.value);

            if (imageInput.files.length > 0) {
                // ... (sua lógica de conversão de HEIC, se aplicável)
                for (const file of imageInput.files) {
                    formData.append('imagens', file);
                }
            }

            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode ? `/api/produtos/${productId}` : '/api/produtos';

            try {
                await fetchWithAuth(url, {
                    method: method,
                    body: formData
                });

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
