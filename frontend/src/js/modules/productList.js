// frontend/src/js/modules/productList.js

import { API_BASE_URL } from '../apiConfig.js'; // 1. Importa a URL do nosso novo arquivo

async function fetchAndRenderProducts(apiUrl = `${API_BASE_URL}/api/produtos`) { // 2. Usa a variável
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return null;

    productGrid.innerHTML = '<p>Carregando produtos...</p>';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erro de rede! Status: ${response.status}`);

        const products = await response.json();
        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = '<p>Nenhum produto encontrado com estes filtros.</p>';
            return null;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            // 3. Usa a variável para as imagens também
            const imageUrl = product.imagens && product.imagens.length > 0
                ? `${API_BASE_URL}/${product.imagens[0].url}`
                : 'https://via.placeholder.com/300x300.png?text=Sem+Imagem';

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
            productGrid.appendChild(card);
        });
        
        return products;

    } catch (error) {
        console.error('Erro ao buscar e renderizar produtos:', error);
        productGrid.innerHTML = '<p>Não foi possível carregar os produtos.</p>';
        return null;
    }
}


// Lógica de adicionar ao carrinho
function handleAddToCart(event, products) {
    if (!event.target.matches('.add-to-cart-btn')) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Você precisa estar logado para adicionar produtos ao carrinho.');
        window.location.href = 'auth/login.html';
        return;
    }

    const button = event.target;
    const productId = parseInt(button.dataset.productId);
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === productId);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity++;
    } else {
        const productToAdd = products.find(p => p.id === productId);
        if (productToAdd) {
            cart.push({
                id: productToAdd.id, name: productToAdd.nome, price: productToAdd.preco, quantity: 1, 
                image: (productToAdd.imagens && productToAdd.imagens.length > 0) ? productToAdd.imagens[0].url : ''
            });
        }
    }
    localStorage.setItem('cart', JSON.stringify(cart));

    button.textContent = 'Adicionado!';
    setTimeout(() => { button.textContent = 'Adicionar ao Carrinho'; }, 2000);
}

// UMA ÚNICA FUNÇÃO para cuidar de TODOS os filtros e ordenação
function setupFiltersAndSorting() {
    const categoryLinks = document.querySelectorAll('.filters-sidebar .filter-group ul li a');
    const priceFilterBtn = document.querySelector('#price-filter-btn'); // Damos um ID ao botão
    const sortSelect = document.getElementById('sort');

    // Filtro de categoria
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryId = link.dataset.categoryId;
            const url = `http://127.0.0.1:3000/api/produtos?categoria_id=${categoryId}`;
            fetchAndRenderProducts(url);
        });
    });

    // Filtro de preço
    if (priceFilterBtn) {
        priceFilterBtn.addEventListener('click', () => {
            const minPrice = document.getElementById('min-price').value;
            const maxPrice = document.getElementById('max-price').value;
            if (minPrice && maxPrice) {
                const url = `http://127.0.0.1:3000/api/produtos?preco_min=${minPrice}&preco_max=${maxPrice}`;
                fetchAndRenderProducts(url);
            }
        });
    }

    // Ordenação
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const sortValue = sortSelect.value;
            // No futuro, podemos adicionar a lógica para manter os filtros atuais
            const url = `http://127.0.0.1:3000/api/produtos?ordenar_por=${sortValue}`;
            fetchAndRenderProducts(url);
        });
    }
}

// Função principal que inicializa a página
async function initProductListPage() {
    const products = await fetchAndRenderProducts();
    if (products) {
        const productGrid = document.querySelector('.product-grid');
        productGrid.addEventListener('click', (event) => {
            handleAddToCart(event, products);
        });
    }
    setupFiltersAndSorting(); // Ativa os filtros e a ordenação
}

document.addEventListener('DOMContentLoaded', initProductListPage);