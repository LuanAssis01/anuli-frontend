import { API_BASE_URL } from '../apiConfig.js';
// ⭐ 1. IMPORTS ADICIONADOS (Necessários para login e chamadas da API) ⭐
import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

// Objeto para manter o estado atual dos filtros e ordenação
let currentQuery = {};

/**
 * Constrói a URL da API com os filtros atuais.
 */
function buildApiUrl() {
    const params = new URLSearchParams(currentQuery);
    return `${API_BASE_URL}/api/produtos?${params.toString()}`;
}

/**
 * Busca os produtos na API e os renderiza na tela.
 */
async function fetchAndRenderProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = '<p>A carregar produtos...</p>';

    try {
        const apiUrl = buildApiUrl();
        const response = await fetch(apiUrl);
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
 * Cria o HTML para um card de produto.
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageUrl = product.imagens && product.imagens.length > 0
        ? product.imagens[0].url
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
 * ⭐ 2. FUNÇÃO ADICIONADA: Lida com o clique no botão "Adicionar ao Carrinho". ⭐
 */
async function handleAddToCart(event) {
    // Só continua se o elemento clicado for o botão de adicionar ao carrinho
    if (!event.target.matches('.add-to-cart-btn')) return;

    // Verifica se o usuário está logado
    if (!authManager.isLoggedIn()) {
        alert('Você precisa estar logado para adicionar produtos ao carrinho.');
        window.location.href = '/src/html/auth/login.html';
        return;
    }

    const button = event.target;
    const productId = parseInt(button.dataset.productId);
    
    // Feedback visual para o usuário
    button.textContent = 'A adicionar...';
    button.disabled = true;

    try {
        // Envia a requisição para a API
        await fetchWithAuth('/api/carrinho/items', {
            method: 'POST',
            body: {
                produto_id: productId,
                quantidade: 1 // Adiciona sempre 1 unidade pela lista
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
 * Configura todos os event listeners para os filtros e ordenação.
 */
function setupFiltersAndSorting() {
    const categoryLinks = document.querySelectorAll('#category-filter-list a');
    const priceFilterBtn = document.querySelector('#price-filter-btn');
    const sortSelect = document.getElementById('sort');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    // ⭐ 3. SELETOR ADICIONADO: Seleciona o container dos produtos ⭐
    const productGrid = document.querySelector('.product-grid');

    // ... (funções applyFilters e updateActiveCategory continuam iguais) ...
    function applyFilters() { /* ... */ }
    function updateActiveCategory() { /* ... */ }

    // ... (listeners de filtros continuam iguais) ...
    categoryLinks.forEach(link => { /* ... */ });
    if (priceFilterBtn) { /* ... */ }
    if (sortSelect) { /* ... */ }
    if (clearFiltersBtn) { /* ... */ }
    
    // ⭐ 4. LISTENER ADICIONADO: Escuta por cliques no container dos produtos ⭐
    if (productGrid) {
        productGrid.addEventListener('click', handleAddToCart);
    }
}

// Roda tudo quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderProducts();
    setupFiltersAndSorting();
});