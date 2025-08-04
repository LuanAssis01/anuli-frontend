import { API_BASE_URL } from '../apiConfig.js';

// Objeto para manter o estado atual dos filtros e ordenação
let currentQuery = {};

/**
 * Constrói a URL da API com os filtros atuais.
 */
function buildApiUrl() {
    // Transforma o objeto {chave: valor} em uma string de busca "chave=valor&outra=valor"
    const params = new URLSearchParams(currentQuery);
    return `${API_BASE_URL}/api/produtos?${params.toString()}`;
}

/**
 * Busca os produtos na API e os renderiza na tela.
 */
async function fetchAndRenderProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = '<p>A carregar produtos...</p>'; // Mostra feedback de carregamento

    try {
        const apiUrl = buildApiUrl();
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erro de rede! Status: ${response.status}`);

        const products = await response.json();
        productGrid.innerHTML = ''; // Limpa a grade antes de adicionar novos produtos

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
 * (Esta função já corrigimos antes, continua igual)
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
 * Configura todos os event listeners para os filtros e ordenação.
 */
function setupFiltersAndSorting() {
    const categoryLinks = document.querySelectorAll('#category-filter-list a');
    const priceFilterBtn = document.querySelector('#price-filter-btn');
    const sortSelect = document.getElementById('sort');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    // Função que aplica os filtros e atualiza a interface
    function applyFilters() {
        fetchAndRenderProducts(); // Busca e renderiza os produtos com a nova query
        updateActiveCategory();   // Atualiza qual categoria está com a classe 'active'
    }

    // Adiciona a classe 'active' no link da categoria selecionada
    function updateActiveCategory() {
        categoryLinks.forEach(link => {
            // Compara o data-id do link com o valor na nossa query
            if (link.dataset.categoryId === currentQuery.categoria_id) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 1. FILTRO DE CATEGORIA
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Impede que o link recarregue a página
            currentQuery.categoria_id = link.dataset.categoryId; // Atualiza o ID da categoria na query
            applyFilters();
        });
    });

    // 2. FILTRO DE PREÇO
    if (priceFilterBtn) {
        priceFilterBtn.addEventListener('click', () => {
            const minPrice = document.getElementById('min-price').value;
            const maxPrice = document.getElementById('max-price').value;
            // Adiciona na query apenas se os valores foram preenchidos
            if (minPrice) currentQuery.preco_min = minPrice;
            if (maxPrice) currentQuery.preco_max = maxPrice;
            applyFilters();
        });
    }

    // 3. ORDENAÇÃO
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentQuery.ordenar_por = sortSelect.value; // Adiciona o critério de ordenação
            applyFilters();
        });
    }

    // 4. LIMPAR FILTROS
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            currentQuery = {}; // Reseta o objeto de query
            // Limpa os campos de input do formulário
            document.getElementById('min-price').value = '';
            document.getElementById('max-price').value = '';
            sortSelect.value = 'relevance';
            applyFilters();
        });
    }
}

// Roda tudo quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderProducts();  // Carga inicial dos produtos
    setupFiltersAndSorting();  // Configura os botões e links dos filtros
});