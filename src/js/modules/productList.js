import { API_BASE_URL } from '../apiConfig.js';
import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

// Objeto para guardar o estado atual dos filtros e da ordenação
let currentQuery = {};

/**
 * Constrói a URL da API com base nos filtros atuais.
 * @returns {string} A URL completa para a requisição.
 */
function buildApiUrl() {
    const params = new URLSearchParams(currentQuery);
    return `${API_BASE_URL}/api/produtos?${params.toString()}`;
}

/**
 * Cria o HTML de um único card de produto.
 * Esta é a função corrigida que adiciona a lógica de "Esgotado".
 * @param {object} product - O objeto do produto vindo da API.
 * @returns {HTMLElement} O elemento do card do produto.
 */
function createProductCard(product) {
    const card = document.createElement('div');

    // 1. Verifica se o produto está esgotado
    const isSoldOut = product.quantidade_estoque === 0;

    // Adiciona uma classe CSS ao card se o produto estiver esgotado
    card.className = isSoldOut ? 'product-card is-sold-out' : 'product-card';

    const imageUrl = product.imagens && product.imagens.length > 0
        ? product.imagens[0].url
        : 'https://placehold.co/300x300/eee/ccc?text=Sem+Imagem';

    const price = parseFloat(product.preco).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    // 2. Define a sobreposição "Esgotado" e o estado do botão
    const soldOutOverlayHTML = isSoldOut ? '<div class="sold-out-overlay">Esgotado</div>' : '';

    const cartButtonHTML = isSoldOut
        ? `<button type="button" class="btn btn-primary full-width add-to-cart-btn" disabled>Produto Esgotado</button>`
        : `<button type="button" class="btn btn-primary full-width add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>`;

    // 3. Monta o HTML final do card
    card.innerHTML = `
        <div class="card-image">
            <a href="/src/html/detalhes_produto.html?id=${product.id}">
                <img src="${imageUrl}" alt="${product.nome}">
            </a>
            ${soldOutOverlayHTML}
        </div>
        <div class="card-content">
            <div class="card-info-wrapper">
                <span class="card-category">${product.categoria?.nome || 'Sem Categoria'}</span>
                <h4 class="card-title"><a href="/src/html/detalhes_produto.html?id=${product.id}">${product.nome}</a></h4>
                <p class="card-price">${price}</p>
            </div>
            ${cartButtonHTML}
        </div>
    `;

    return card;
}

/**
 * Busca os produtos na API e os renderiza na página.
 */
export async function fetchAndRenderProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = '<p>A carregar produtos...</p>'; // Mostra mensagem de carregamento

    try {
        const apiUrl = buildApiUrl();
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro de rede! Status: ${response.status}`);
        }
        const products = await response.json();

        productGrid.innerHTML = ''; // Limpa a mensagem de carregamento

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
        productGrid.innerHTML = '<p>Não foi possível carregar os produtos. Tente novamente mais tarde.</p>';
    }
}

/**
 * Lida com o clique no botão "Adicionar ao Carrinho".
 * @param {Event} event - O evento de clique.
 */
async function handleAddToCart(event) {
    if (!event.target.matches('.add-to-cart-btn')) return;
    
    if (!authManager.isLoggedIn()) {
        alert('Você precisa estar logado para adicionar produtos ao carrinho.');
        window.location.href = '/src/html/auth/login.html';
        return;
    }

    const button = event.target;
    const productId = parseInt(button.dataset.productId);

    button.textContent = 'A adicionar...';
    button.disabled = true;

    try {
        await fetchWithAuth('/api/carrinho/items', {
            method: 'POST',
            body: { produto_id: productId, quantidade: 1 }
        });
        
        button.textContent = 'Adicionado!';
        setTimeout(() => {
            button.textContent = 'Adicionar ao Carrinho';
            button.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        alert(error.message || 'Não foi possível adicionar o produto ao carrinho.');
        button.textContent = 'Adicionar ao Carrinho';
        button.disabled = false;
    }
}

/**
 * Verifica se a URL contém filtros (ex: vindo da página inicial).
 */
function checkUrlForFilters() {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoria_id');
    if (categoryId) {
        currentQuery.categoria_id = categoryId;
    }
    // Pode ser estendido para outros filtros (ex: ?q=anel)
}

/**
 * Marca a categoria ativa na lista de filtros.
 */
function updateActiveCategory() {
    const categoryLinks = document.querySelectorAll('#category-filter-list a');
    categoryLinks.forEach(link => {
        link.parentElement.classList.remove('active'); // Remove de todos os <li>
        if (link.dataset.categoryId === currentQuery.categoria_id) {
            link.parentElement.classList.add('active'); // Adiciona no <li> correto
        }
    });
}

/**
 * Configura todos os eventos de clique e mudança para os filtros e ordenação.
 */
function setupFiltersAndSorting() {
    const categoryLinks = document.querySelectorAll('#category-filter-list a');
    const priceFilterBtn = document.querySelector('#price-filter-btn');
    const sortSelect = document.getElementById('sort');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const productGrid = document.querySelector('.product-grid');

    // Função auxiliar para aplicar os filtros e atualizar a interface
    function applyFilters() {
        fetchAndRenderProducts();
        updateActiveCategory();
    }

    // Filtro de Categoria
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentQuery.categoria_id = link.dataset.categoryId;
            applyFilters();
        });
    });

    // Filtro de Preço
    if (priceFilterBtn) {
        priceFilterBtn.addEventListener('click', () => {
            const minPrice = document.getElementById('min-price').value;
            const maxPrice = document.getElementById('max-price').value;
            delete currentQuery.preco_min;
            delete currentQuery.preco_max;
            if (minPrice) currentQuery.preco_min = minPrice;
            if (maxPrice) currentQuery.preco_max = maxPrice;
            applyFilters();
        });
    }

    // Ordenação
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentQuery.ordenar_por = sortSelect.value;
            applyFilters();
        });
    }

    // Limpar Filtros
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            // Limpa o objeto de query e os campos de input
            currentQuery = {};
            document.getElementById('min-price').value = '';
            document.getElementById('max-price').value = '';
            if (sortSelect) sortSelect.value = 'relevance';
            
            // Remove os parâmetros da URL e recarrega os produtos
            window.history.pushState({}, '', window.location.pathname);
            applyFilters();
        });
    }
     
    // Adiciona o listener para o clique do carrinho na grade de produtos
    if (productGrid) {
        productGrid.addEventListener('click', handleAddToCart);
    }
}

/**
 * Função principal que inicializa a página de listagem de produtos.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Garante que o código só rode na página de listagem
    if (document.querySelector('.product-listing')) { 
        checkUrlForFilters();
        fetchAndRenderProducts();
        setupFiltersAndSorting();
        updateActiveCategory();
    }
});