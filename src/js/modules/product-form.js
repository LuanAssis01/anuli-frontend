// src/js/modules/product-form.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';
import { API_BASE_URL } from '../apiConfig.js';

/**
 * Função de segurança que verifica se o usuário está logado e é um administrador.
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
    const skuInput = document.getElementById('sku');
    const imageInput = document.getElementById('imagens');
    const imagePreviewContainer = document.getElementById('image-preview');

    // --- Detecção de Modo ---
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const isEditMode = !!productId;

    /**
     * Carrega as categorias no select.
     */
    async function loadCategories() {
        // ⭐ CORREÇÃO: Adiciona uma verificação para garantir que o elemento existe.
        if (!categoryInput) {
            console.error("Elemento <select> com id 'categoria_id' não foi encontrado no HTML.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/categoria`);
            if (!response.ok) throw new Error('Falha ao carregar categorias');
            const categories = await response.json();

            categoryInput.innerHTML = '<option value="">Selecione uma categoria</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.nome;
                categoryInput.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            categoryInput.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    // Carrega as categorias primeiro
    await loadCategories();

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

            // Mostra as imagens atuais
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

    // --- Lógica de Pré-visualização de Novas Imagens ---
    if (imageInput) {
        imageInput.addEventListener('change', () => {
            if (!imagePreviewContainer) return;
            const newPreviews = imagePreviewContainer.querySelectorAll('.new-preview');
            newPreviews.forEach(el => el.remove());

            Array.from(imageInput.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'new-preview';
                    img.style.cssText = 'max-width: 100px; border-radius: 6px; margin: 5px;';
                    imagePreviewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // --- Lógica de Envio do Formulário ---
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData();
            // Adiciona verificações para garantir que os inputs existem antes de pegar o valor
            if (nameInput) formData.append('nome', nameInput.value);
            if (descriptionInput) formData.append('descricao', descriptionInput.value);
            if (priceInput) formData.append('preco', priceInput.value);
            if (stockInput) formData.append('quantidade_estoque', stockInput.value);
            if (categoryInput) formData.append('categoria_id', categoryInput.value);
            if (skuInput) formData.append('sku', skuInput.value);

            if (imageInput && imageInput.files.length > 0) {
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

// Roda a inicialização da página apenas se o usuário for um admin
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        initProductForm();
    }
});
