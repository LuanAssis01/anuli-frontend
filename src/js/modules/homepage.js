// src/js/modules/homepage.js

import { API_BASE_URL } from '../apiConfig.js';
import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

/**
 * Busca e renderiza os produtos em destaque na página inicial.
 */
async function fetchFeaturedProducts() {
    const featuredGrid = document.querySelector('.featured-products-section .product-grid');
    if (!featuredGrid) return;

    try {
        // Esta é uma rota pública, então o fetch simples é aceitável.
        const response = await fetch(`${API_BASE_URL}/api/produtos?limit=4`);
        if (!response.ok) throw new Error('Falha ao buscar produtos em destaque');

        const products = await response.json();
        featuredGrid.innerHTML = ''; // Limpa o conteúdo estático

        products.forEach(product => {
            const card = createProductCard(product);
            featuredGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
        featuredGrid.innerHTML = '<p>Não foi possível carregar os produtos em destaque.</p>';
    }
}

/**
 * Cria o elemento HTML para um único card de produto.
 * @param {object} product - O objeto do produto.
 * @returns {HTMLElement}
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageUrl = product.imagens && product.imagens.length > 0
        ? `${API_BASE_URL}/${product.imagens[0].url}`
        : 'https://placehold.co/300x300/eee/ccc?text=Sem+Imagem';
    
    const price = parseFloat(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    card.innerHTML = `
        <div class="card-image">
            <a href="src/html/detalhes_produto.html?id=${product.id}">
                <img src="${imageUrl}" alt="${product.nome}">
            </a>
        </div>
        <div class="card-content">
            <div class="card-info-wrapper">
                <span class="card-category">${product.categoria?.nome || 'Categoria'}</span>
                <h4 class="card-title"><a href="src/html/detalhes_produto.html?id=${product.id}">${product.nome}</a></h4>
                <p class="card-price">${price}</p>
            </div>
            <button class="btn btn-primary full-width add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>
        </div>
    `;
    return card;
}

/**
 * Lida com o clique no botão "Adicionar ao Carrinho".
 * @param {Event} event - O evento de clique.
 */
async function handleAddToCart(event) {
    // Delegação de evento: só continua se o clique foi no botão correto
    if (!event.target.matches('.add-to-cart-btn')) return;

    // 1. Verifica se o utilizador está logado usando o authManager
    if (!authManager.isLoggedIn()) {
        alert('Você precisa estar logado para adicionar produtos ao carrinho.');
        window.location.href = 'src/html/auth/login.html';
        return;
    }

    const button = event.target;
    const productId = parseInt(button.dataset.productId);
    
    button.textContent = 'Adicionando...';
    button.disabled = true;

    try {
        // ⭐ CORREÇÃO AQUI ⭐
        // Passamos um objeto JavaScript puro. O apiService.js cuidará do JSON.stringify.
        await fetchWithAuth('/api/carrinho/items', {
            method: 'POST',
            body: {
                produto_id: productId,
                quantidade: 1
            }
        });

        // Feedback visual de sucesso
        button.textContent = 'Adicionado!';
        setTimeout(() => {
            button.textContent = 'Adicionar ao Carrinho';
            button.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        alert(error.message);
        // Restaura o botão em caso de erro
        button.textContent = 'Adicionar ao Carrinho';
        button.disabled = false;
    }
}

/**
 * Função principal que inicializa a página inicial.
 */
async function initHomepage() {
    const featuredGrid = document.querySelector('.featured-products-section .product-grid');
    if (!featuredGrid) return;
    
    await fetchFeaturedProducts();

    // Adiciona um único event listener ao container dos produtos
    featuredGrid.addEventListener('click', handleAddToCart);
}

document.addEventListener('DOMContentLoaded', initHomepage);
