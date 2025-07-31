// src/js/modules/cart.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';
import { API_BASE_URL } from '../apiConfig.js';

const cartItemsContainer = document.getElementById('cart-items-container');
const subtotalElement = document.getElementById('subtotal-value');
const totalElement = document.getElementById('total-value');
const checkoutButton = document.getElementById('checkout-btn');

/**
 * Função principal que busca os dados do carrinho da API e renderiza a página.
 */
async function loadCart() {
    // Verifica se o usuário está logado antes de qualquer coisa
    if (!authManager.isLoggedIn()) {
        window.location.href = '/frontend/src/html/auth/login.html';
        return;
    }

    // Mostra uma mensagem de carregamento
    if (cartItemsContainer) cartItemsContainer.innerHTML = '<p>Carregando seu carrinho...</p>';

    try {
        const cartData = await fetchWithAuth('/api/carrinho');

        if (!cartItemsContainer || !subtotalElement || !totalElement) return;

        cartItemsContainer.innerHTML = ''; // Limpa a mensagem de carregamento

        if (!cartData || cartData.itens.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho de compras está vazio.</p>';
            subtotalElement.textContent = 'R$ 0,00';
            totalElement.textContent = 'R$ 0,00';
            if (checkoutButton) checkoutButton.disabled = true; // Desabilita o botão de checkout
            return;
        }
        
        if (checkoutButton) checkoutButton.disabled = false; // Habilita o botão de checkout

        cartData.itens.forEach(item => {
            const cartItemElement = createCartItemElement(item);
            cartItemsContainer.appendChild(cartItemElement);
        });

        subtotalElement.textContent = cartData.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        totalElement.textContent = cartData.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    } catch (error) {
        console.error('Erro ao carregar o carrinho:', error);
        if (cartItemsContainer) cartItemsContainer.innerHTML = '<p>Não foi possível carregar seu carrinho. Tente recarregar a página.</p>';
    }
}

/**
 * Cria o elemento HTML para um único item do carrinho.
 * @param {object} item - O objeto do item do carrinho vindo da API.
 * @returns {HTMLElement}
 */
function createCartItemElement(item) {
    const produto = item.produto;
    const itemTotalPrice = item.preco_unitario * item.quantidade;
    const imageUrl = produto.imagens && produto.imagens.length > 0
        ? `${API_BASE_URL}/${produto.imagens[0].url}`
        : 'https://placehold.co/80x80/eee/ccc?text=Produto';

    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
        <div class="item-product">
            <img src="${imageUrl}" alt="${produto.name}">
            <div class="item-details">
                <p class="item-title">${produto.nome}</p>
                <p class="item-price">${parseFloat(item.preco_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
        </div>
        <div class="item-quantity">
            <div class="quantity-selector">
                <button class="quantity-btn" data-action="decrease">-</button>
                <input type="number" value="${item.quantidade}" readonly>
                <button class="quantity-btn" data-action="increase">+</button>
            </div>
        </div>
        <div class="item-total-price">
            <p>${itemTotalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div class="item-remove">
            <button class="remove-btn" aria-label="Remover item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </div>
    `;

    // Adiciona os event listeners para os botões deste item específico
    itemElement.querySelector('[data-action="increase"]').addEventListener('click', () => handleUpdateQuantity(item.id, item.quantidade + 1));
    itemElement.querySelector('[data-action="decrease"]').addEventListener('click', () => handleUpdateQuantity(item.id, item.quantidade - 1));
    itemElement.querySelector('.remove-btn').addEventListener('click', () => handleRemoveItem(item.id));

    return itemElement;
}

/**
 * Lida com a atualização da quantidade de um item.
 * @param {number} itemId - O ID do item no carrinho.
 * @param {number} newQuantity - A nova quantidade desejada.
 */
async function handleUpdateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
        // Se a quantidade for 0 ou menos, remove o item
        await handleRemoveItem(itemId);
        return;
    }

    try {
        await fetchWithAuth(`/api/carrinho/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantidade: newQuantity })
        });
        loadCart(); // Recarrega o carrinho para refletir a mudança
    } catch (error) {
        alert('Não foi possível atualizar a quantidade do item.');
        console.error('Erro ao atualizar quantidade:', error);
    }
}

/**
 * Lida com a remoção de um item do carrinho.
 * @param {number} itemId - O ID do item no carrinho.
 */
async function handleRemoveItem(itemId) {
    if (confirm('Tem certeza que deseja remover este item do carrinho?')) {
        try {
            await fetchWithAuth(`/api/carrinho/items/${itemId}`, { method: 'DELETE' });
            loadCart(); // Recarrega o carrinho
        } catch (error) {
            alert('Não foi possível remover o item.');
            console.error('Erro ao remover item:', error);
        }
    }
}

// Inicia o carregamento do carrinho quando a página estiver pronta.
document.addEventListener('DOMContentLoaded', loadCart);