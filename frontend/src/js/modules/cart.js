// frontend/src/js/modules/cart.js
import { API_BASE_URL } from '../apiConfig.js';

// ⭐ NOVA FUNÇÃO DE SEGURANÇA ⭐
function checkAuth() {
    const token = localStorage.getItem('authToken');
    // Se não houver token, o usuário não está logado.
    if (!token) {
        alert('Você precisa estar logado para ver seu carrinho.');
        // Redireciona para o login
        window.location.href = '../auth/login.html';
        return false; // Retorna false para indicar que o usuário não está autenticado
    }
    return true; // Retorna true se o usuário estiver autenticado
}

// Função principal para renderizar o carrinho
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalElement = document.getElementById('subtotal-value');
    const totalElement = document.getElementById('total-value');
    
    // Se algum dos elementos essenciais não existir, para a execução.
    if (!cartItemsContainer || !subtotalElement || !totalElement) {
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho de compras está vazio.</p>';
        subtotalElement.textContent = 'R$ 0,00';
        totalElement.textContent = 'R$ 0,00';
        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotalPrice = item.price * item.quantity;
        subtotal += itemTotalPrice;

        const cartItemHTML = `
            <div class="cart-item">
                <div class="item-product">
                    <img src="http://127.0.0.1:3000/${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <p class="item-title">${item.name}</p>
                        <p class="item-price">${parseFloat(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>
                <div class="item-quantity">
                    <div class="quantity-selector">
                        <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
                        <input type="number" value="${item.quantity}" readonly>
                        <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
                    </div>
                </div>
                <div class="item-total-price">
                    <p>${itemTotalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div class="item-remove">
                    <button class="remove-btn" data-index="${index}" aria-label="Remover item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += cartItemHTML;
    });

    subtotalElement.textContent = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalElement.textContent = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    addCartEventListeners();
}

function addCartEventListeners() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = parseInt(event.target.dataset.index);
            const action = event.target.dataset.action;
            if (action === 'increase') {
                cart[index].quantity++;
            } else if (action === 'decrease' && cart[index].quantity > 1) {
                cart[index].quantity--;
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        });
    });

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = parseInt(event.currentTarget.dataset.index);
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        });
    });
}

// Roda a verificação E a função principal quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    // ⭐ VERIFICAÇÃO ADICIONADA AQUI ⭐
    // Só renderiza o carrinho se o usuário estiver autenticado
    if (checkAuth()) {
        renderCart();
    }
});