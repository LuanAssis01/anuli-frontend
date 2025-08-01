// src/js/modules/orders.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

/**
 * Função principal que busca e renderiza o histórico de pedidos do usuário.
 */
async function loadUserOrders() {
    // 1. Verifica se o usuário está logado antes de fazer qualquer coisa
    if (!authManager.isLoggedIn()) {
        window.location.href = '/frontend/src/html/auth/login.html';
        return;
    }

    const tableBody = document.getElementById('orders-table-body');
    const noOrdersMessage = document.getElementById('no-orders-message');

    if (!tableBody || !noOrdersMessage) return;

    tableBody.innerHTML = '<tr><td colspan="5">Carregando seus pedidos...</td></tr>';
    noOrdersMessage.style.display = 'none';

    try {
        // 2. Usa a nova rota segura que já sabe quem é o usuário pelo cookie
        const orders = await fetchWithAuth('/api/pedidos/meus-pedidos');

        tableBody.innerHTML = ''; // Limpa a mensagem de "carregando"

        if (orders.length === 0) {
            noOrdersMessage.style.display = 'block';
        } else {
            orders.forEach(order => {
                const row = createOrderRow(order);
                tableBody.appendChild(row);
            });
        }

    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        tableBody.innerHTML = `<tr><td colspan="5">Não foi possível carregar seus pedidos. Tente novamente.</td></tr>`;
    }
}

/**
 * Cria uma linha da tabela (tr) para um único pedido.
 * @param {object} order - O objeto do pedido vindo da API.
 * @returns {HTMLElement}
 */
function createOrderRow(order) {
    const row = document.createElement('tr');
                
    // Formata a data para um formato mais legível
    const formattedDate = new Date(order.data_pedido).toLocaleDateString('pt-BR');
    
    // Mapeia o status para uma tradução mais amigável
    const statusMap = {
        'processando': 'Processando',
        'aguardando_pagamento': 'Aguardando Pagamento',
        'enviado': 'Enviado',
        'entregue': 'Entregue',
        'cancelado': 'Cancelado'
    };
    const translatedStatus = statusMap[order.status.toLowerCase()] || order.status;

    row.innerHTML = `
        <td data-label="Pedido #">#${order.id}</td>
        <td data-label="Data">${formattedDate}</td>
        <td data-label="Status"><span class="status status-${order.status.toLowerCase()}">${translatedStatus}</span></td>
        <td data-label="Total">${parseFloat(order.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
        <td data-label="Ações"><a href="detalhes-pedido.html?id=${order.id}" class="btn btn-secondary btn-sm">Ver Detalhes</a></td>
    `;
    return row;
}

// Inicia o carregamento dos pedidos quando a página estiver pronta
document.addEventListener('DOMContentLoaded', loadUserOrders);
