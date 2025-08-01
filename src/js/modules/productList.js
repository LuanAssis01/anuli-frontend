// src/js/modules/productList.js

import { API_BASE_URL } from '../apiConfig.js';
import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

// Objeto para manter o estado atual dos filtros e ordenação
let currentQuery = {
    limit: 12, // Limite padrão de produtos por página
};

/**
 * Constrói a URL da API com base nos filtros e ordenação atuais.
 * @returns {string} A URL completa da API.
 */
function buildApiUrl() {
    const params = new URLSearchParams(currentQuery);
    return `${API_BASE_URL}/api/produtos?${params.toString()}`;
}

/**
 * Busca e renderiza os produtos na página.
 */
async function fetchAndRenderProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = '<p>Carregando produtos...</p>';

    try {
        const apiUrl = buildApiUrl();
        const response = await fetch(apiUrl); // Rota pública, fetch normal
        if (!response.ok) throw new Error(`Erro de rede! Status: ${response.status}`);

        const products = await response.json();
        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = '<p>Nenhum produto encontrado com estes filtros.</p>';
            return;
        }

        products.forEach(product => {
            const card = createProductCard(product);
            productGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao buscar e renderizar produtos:', error);
        productGrid.innerHTML = '<p>Não foi possível carregar os produtos.</p>';
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
        <div class="card-image"><a href="detalhes_produto.html?id=${product.id}"><img src="${imageUrl}" alt="${product.nome}"></a></div>
        <div class="card-content">
            <div class="card-info-wrapper">
                <span class="card-category">${product.categoria?.nome || 'Categoria'}</span>
                <h4 class="card-title"><a href="detalhes_produto.html?id=${product.id}">${product.nome}</a></h4>
                <p class="card-price">${price}</p>
            </div>
            <button type="button" class="btn btn-primary full-width add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>
        </div>`;
    return card;
}

/**
 * Lida com o clique no botão "Adicionar ao Carrinho".
 * @param {Event} event - O evento de clique.
 */
async function handleAddToCart(event) {
    if (!event.target.matches('.add-to-cart-btn')) return;

    if (!authManager.isLoggedIn()) {
        alert('Você precisa estar logado para adicionar produtos ao carrinho.');
        window.location.href = 'auth/login.html';
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

        button.textContent = 'Adicionado!';
        setTimeout(() => {
            button.textContent = 'Adicionar ao Carrinho';
            button.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        alert(error.message);
        button.textContent = 'Adicionar ao Carrinho';
        button.disabled = false;
    }
}

/**
 * Configura os event listeners para os filtros e ordenação.
 */
function setupFiltersAndSorting() {
    const categoryLinks = document.querySelectorAll('.filters-sidebar .filter-group ul li a');
    const priceFilterBtn = document.querySelector('#price-filter-btn');
    const sortSelect = document.getElementById('sort');
    const productGrid = document.querySelector('.product-grid');

    // Filtro de categoria
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentQuery.categoria_id = link.dataset.categoryId;
            fetchAndRenderProducts();
        });
    });

    // Filtro de preço
    if (priceFilterBtn) {
        priceFilterBtn.addEventListener('click', () => {
            currentQuery.preco_min = document.getElementById('min-price').value;
            currentQuery.preco_max = document.getElementById('max-price').value;
            fetchAndRenderProducts();
        });
    }

    // Ordenação
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentQuery.ordenar_por = sortSelect.value;
            fetchAndRenderProducts();
        });
    }

    // Adicionar ao carrinho (usando delegação de evento)
    if (productGrid) {
        productGrid.addEventListener('click', handleAddToCart);
    }
}

// Função principal que inicializa a página
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderProducts();
    setupFiltersAndSorting();
});
