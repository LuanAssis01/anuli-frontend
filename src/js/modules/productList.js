import { API_BASE_URL } from '../apiConfig.js';
import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

let currentQuery = {};

function buildApiUrl() {
    const params = new URLSearchParams(currentQuery);
    return `${API_BASE_URL}/api/produtos?${params.toString()}`;
}

export async function fetchAndRenderProducts() {
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

function createProductCard(product) {
    const card = document.createElement('div');
    
    // ⭐ 1. Verifica se o produto está esgotado
    const isSoldOut = product.estoque === 0;

    // Adiciona uma classe ao card principal se estiver esgotado
    card.className = isSoldOut ? 'product-card is-sold-out' : 'product-card';

    const imageUrl = product.imagens && product.imagens.length > 0 ? product.imagens[0].url : 'https://placehold.co/300x300/eee/ccc?text=Sem+Imagem';
    const price = parseFloat(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // ⭐ 2. Cria a tag "Esgotado" e o botão dinamicamente
    const soldOutOverlay = isSoldOut ? '<div class="sold-out-overlay">Esgotado</div>' : '';
    
    const cartButton = isSoldOut 
        ? '<button type="button" class="btn btn-primary full-width add-to-cart-btn" disabled>Produto Esgotado</button>'
        : `<button type="button" class="btn btn-primary full-width add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>`;

    // ⭐ 3. Monta o HTML do card com as novas condições
    card.innerHTML = `
        <div class="card-image">
            <a href="/src/html/detalhes_produto.html?id=${product.id}">
                <img src="${imageUrl}" alt="${product.nome}">
            </a>
            ${soldOutOverlay} {/* Insere a tag "Esgotado" aqui */}
        </div>
        <div class="card-content">
            <div class="card-info-wrapper">
                <span class="card-category">${product.categoria?.nome || 'Categoria'}</span>
                <h4 class="card-title"><a href="/src/html/detalhes_produto.html?id=${product.id}">${product.nome}</a></h4>
                <p class="card-price">${price}</p>
            </div>
            ${cartButton} {/* Insere o botão (habilitado ou desabilitado) aqui */}
        </div>`;

    return card;
}

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
        alert(error.message);
        button.textContent = 'Adicionar ao Carrinho';
        button.disabled = false;
    }
}

/**
 * ⭐ NOVA FUNÇÃO: Verifica a URL em busca de filtros pré-definidos.
 */
function checkUrlForFilters() {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoria_id');
    if (categoryId) {
        currentQuery.categoria_id = categoryId;
    }
    // Pode ser estendido para outros filtros no futuro (ex: ?q=anel)
}

/**
 * Adiciona a classe 'active' no link da categoria selecionada.
 */
function updateActiveCategory() {
    const categoryLinks = document.querySelectorAll('#category-filter-list a');
    categoryLinks.forEach(link => {
        if (link.dataset.categoryId === currentQuery.categoria_id) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupFiltersAndSorting() {
    const categoryLinks = document.querySelectorAll('#category-filter-list a');
    const priceFilterBtn = document.querySelector('#price-filter-btn');
    const sortSelect = document.getElementById('sort');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const productGrid = document.querySelector('.product-grid');

    function applyFilters() {
        fetchAndRenderProducts();
        updateActiveCategory();
    }

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentQuery.categoria_id = link.dataset.categoryId;
            applyFilters();
        });
    });

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

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentQuery.ordenar_por = sortSelect.value;
            applyFilters();
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            currentQuery = {};
            document.getElementById('min-price').value = '';
            document.getElementById('max-price').value = '';
            if (sortSelect) sortSelect.value = 'relevance';
            // Redireciona para a página sem parâmetros para limpar a URL também
            window.location.href = window.location.pathname; 
        });
    }
    
    if (productGrid) {
        productGrid.addEventListener('click', handleAddToCart);
    }
}

/**
 * ⭐ ATUALIZAÇÃO: A inicialização da página agora verifica a URL primeiro.
 */
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) { 
        checkUrlForFilters(); // 1. Verifica a URL por filtros
        fetchAndRenderProducts(); // 2. Busca os produtos (já com o filtro, se houver)
        setupFiltersAndSorting(); // 3. Configura os botões
        updateActiveCategory(); // 4. Atualiza o estado visual do filtro de categoria
    }
});