// frontend/src/js/modules/homepage.js
import { API_BASE_URL } from '../apiConfig.js';

async function fetchFeaturedProducts() {
    const featuredGrid = document.querySelector('.featured-products-section .product-grid');
    if (!featuredGrid) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/api/produtos?limit=4`);
        if (!response.ok) throw new Error('Falha ao buscar produtos em destaque');

        const products = await response.json();
        featuredGrid.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const imageUrl = product.imagens && product.imagens.length > 0
                ? `${API_BASE_URL}/${product.imagens[0].url}`
                : 'https://via.placeholder.com/300x300.png?text=Sem+Imagem';
            
            const price = parseFloat(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            card.innerHTML = `
                <div class="card-image">
                    <a href="detalhes_produto.html?id=${product.id}">
                        <img src="${imageUrl}" alt="${product.nome}">
                    </a>
                </div>
                <div class="card-content">
                    <div class="card-info-wrapper">
                        <span class="card-category">${product.categoria?.nome || 'Categoria'}</span>
                        <h4 class="card-title"><a href="detalhes_produto.html?id=${product.id}">${product.nome}</a></h4>
                        <p class="card-price">${price}</p>
                    </div>
                    <button class="btn btn-primary full-width add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>
                </div>
            `;
            // ==========================================

            featuredGrid.appendChild(card);
        });
        
        return products;

    } catch (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
        featuredGrid.innerHTML = '<p>Não foi possível carregar os produtos em destaque.</p>';
        return null;
    }
}

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
    
    const productToAdd = products.find(p => p.id === productId);
    if (!productToAdd) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === productId);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity++;
    } else {
        cart.push({
            id: productToAdd.id,
            name: productToAdd.nome,
            price: productToAdd.preco,
            quantity: 1,
            image: (productToAdd.imagens && productToAdd.imagens.length > 0) ? productToAdd.imagens[0].url : ''
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    button.textContent = 'Adicionado!';
    setTimeout(() => {
        button.textContent = 'Adicionar ao Carrinho';
    }, 2000);
}

async function initHomepage() {
    const featuredGrid = document.querySelector('.featured-products-section .product-grid');
    if (!featuredGrid) return;
    
    const products = await fetchFeaturedProducts();

    if (products) {
        featuredGrid.addEventListener('click', (event) => {
            handleAddToCart(event, products);
        });
    }
}

document.addEventListener('DOMContentLoaded', initHomepage);