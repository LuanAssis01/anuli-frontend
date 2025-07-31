// src/js/modules/product-detail.js

import { API_BASE_URL } from '../apiConfig.js';
import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

/**
 * Função principal que inicializa a página de detalhes do produto.
 */
async function initProductDetailPage() {
    // --- Seleção de Elementos ---
    const container = document.querySelector('.product-page-container');
    const mainImage = document.getElementById('main-product-image');
    const thumbnailsContainer = document.querySelector('.thumbnail-images');
    const categoryElement = document.getElementById('product-category-detail');
    const titleElement = document.getElementById('product-title-detail');
    const priceElement = document.getElementById('product-price-detail');
    const descriptionElement = document.getElementById('product-short-description');
    const addToCartButton = document.querySelector('.btn-add-to-cart');
    const quantityInput = document.querySelector('.quantity-selector input');

    // --- Pega o ID do produto da URL ---
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        if (container) container.innerHTML = '<h1>Produto não encontrado.</h1>';
        return;
    }

    try {
        // --- Busca e Renderiza os Dados do Produto ---
        const response = await fetch(`${API_BASE_URL}/api/produtos/${productId}`);
        if (!response.ok) throw new Error('Produto não encontrado.');
        
        const product = await response.json();

        document.title = `${product.nome} - Anuli Acessórios`;
        if (categoryElement) categoryElement.textContent = product.categoria?.nome || 'Categoria';
        if (titleElement) titleElement.textContent = product.nome;
        if (priceElement) priceElement.textContent = parseFloat(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        if (descriptionElement) descriptionElement.textContent = product.descricao;
        
        // --- Preenche a Galeria de Imagens ---
        if (product.imagens && product.imagens.length > 0) {
            if (mainImage) {
                mainImage.src = `${API_BASE_URL}/${product.imagens[0].url}`;
                mainImage.alt = product.nome;
            }
            if (thumbnailsContainer) {
                thumbnailsContainer.innerHTML = '';
                product.imagens.forEach((image, index) => {
                    const thumb = document.createElement('img');
                    thumb.src = `${API_BASE_URL}/${image.url}`;
                    thumb.alt = `Thumbnail ${index + 1}`;
                    thumb.className = 'thumbnail';
                    if (index === 0) thumb.classList.add('active');
                    
                    thumb.addEventListener('click', () => {
                        if (mainImage) mainImage.src = thumb.src;
                        const currentActive = document.querySelector('.thumbnail.active');
                        if (currentActive) currentActive.classList.remove('active');
                        thumb.classList.add('active');
                    });
                    thumbnailsContainer.appendChild(thumb);
                });
            }
        }

        // --- Lógica Segura de "Adicionar ao Carrinho" ---
        if (addToCartButton) {
            addToCartButton.addEventListener('click', async () => {
                if (!authManager.isLoggedIn()) {
                    alert('Você precisa estar logado para adicionar produtos ao carrinho.');
                    // ⭐ CAMINHO CORRIGIDO POR VOCÊ ⭐
                    window.location.href = '/frontend/src/html/auth/login.html';
                    return;
                }

                const quantity = parseInt(quantityInput.value);
                addToCartButton.textContent = 'Adicionando...';
                addToCartButton.disabled = true;

                try {
                    await fetchWithAuth('/api/carrinho/items', {
                        method: 'POST',
                        body: {
                            produto_id: product.id,
                            quantidade: quantity
                        }
                    });

                    addToCartButton.textContent = 'Adicionado!';
                    setTimeout(() => {
                        addToCartButton.textContent = 'Adicionar ao Carrinho';
                        addToCartButton.disabled = false;
                    }, 2000);

                } catch (error) {
                    console.error('Erro ao adicionar ao carrinho:', error);
                    alert(error.message);
                    addToCartButton.textContent = 'Adicionar ao Carrinho';
                    addToCartButton.disabled = false;
                }
            });
        }

    } catch (error) {
        console.error('Erro ao carregar detalhes do produto:', error);
        if (container) container.innerHTML = `<h1>Erro ao carregar produto.</h1><p>${error.message}</p>`;
    }

    // --- Lógica do Seletor de Quantidade ---
    const minusBtn = document.querySelector('.quantity-selector button:first-child');
    const plusBtn = document.querySelector('.quantity-selector button:last-child');

    if(quantityInput && minusBtn && plusBtn) {
        minusBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) quantityInput.value = currentValue - 1;
        });

        plusBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }
}

document.addEventListener('DOMContentLoaded', initProductDetailPage);
