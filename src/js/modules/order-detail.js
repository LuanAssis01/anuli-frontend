// src/js/modules/order-detail.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';
import { API_BASE_URL } from '../apiConfig.js';

/**
 * Função principal para carregar os detalhes de um pedido específico.
 */
async function loadOrderDetails() {
    if (!authManager.isLoggedIn()) {
        window.location.href = '/frontend/src/html/auth/login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    const contentArea = document.getElementById('order-details-content');

    if (!orderId) {
        if (contentArea) contentArea.innerHTML = '<h2>ID do pedido não encontrado.</h2>';
        return;
    }

    try {
        const order = await fetchWithAuth(`/api/pedidos/${orderId}`);
        
        // --- Preenche os elementos da página ---
        document.getElementById('order-title').textContent = `Detalhes do Pedido #${order.id}`;
        document.getElementById('order-status').textContent = order.status.replace('_', ' ').toUpperCase();
        
        // Preenche o endereço
        const address = order.endereco_entrega;
        const addressContainer = document.getElementById('shipping-address');
        if (address) {
            addressContainer.innerHTML = `
                ${address.rua}, ${address.numero}<br>
                ${address.complemento ? address.complemento + '<br>' : ''}
                ${address.bairro}<br>
                ${address.cidade}, ${address.estado}<br>
                CEP: ${address.cep}
            `;
        }

        // Preenche os itens do pedido
        const itemsContainer = document.getElementById('order-summary-items');
        itemsContainer.innerHTML = '';
        order.itens.forEach(item => {
            const produto = item.produto;
            const imageUrl = produto.imagens && produto.imagens.length > 0
                ? `${API_BASE_URL}/${produto.imagens[0].url}`
                : 'https://placehold.co/64x64/eee/ccc?text=N/A';
            
            const itemHTML = `
                <div class="summary-item">
                    <img src="${imageUrl}" alt="${produto.nome}">
                    <div class="summary-item-details">
                        <div>
                            <p class="item-title">${produto.nome}</p>
                            <p>Qtd: ${item.quantidade}</p>
                        </div>
                        <p class="item-price">${parseFloat(item.preco_unitario * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>
            `;
            itemsContainer.innerHTML += itemHTML;
        });

        // Preenche os totais
        const total = parseFloat(order.valor_total);
        document.getElementById('summary-subtotal').textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('summary-total').textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        if (contentArea) contentArea.innerHTML = `<h2>Erro ao carregar pedido.</h2><p>${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadOrderDetails);
