// src/js/modules/admin-orders.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

/**
 * Função de segurança que verifica se o usuário está logado e é um administrador.
 */
function checkAdminAuth() {
    if (!authManager.isLoggedIn() || authManager.getUserType() !== 'admin') {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = '/frontend/src/html/auth/login.html';
        return false;
    }
    return true;
}

/**
 * Busca e renderiza os pedidos na tabela do painel de administração.
 */
async function fetchAndRenderAdminOrders() {
    const tableBody = document.getElementById('admin-orders-tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5">Carregando pedidos...</td></tr>';

    try {
        // Usa a função segura para buscar todos os pedidos.
        const orders = await fetchWithAuth('/api/pedidos');
        tableBody.innerHTML = '';

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">Nenhum pedido encontrado.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = createOrderRow(order);
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        tableBody.innerHTML = `<tr><td colspan="5">Erro ao carregar pedidos: ${error.message}</td></tr>`;
    }
}

/**
 * Cria uma linha da tabela (tr) para um único pedido.
 * @param {object} order - O objeto do pedido.
 * @returns {HTMLElement}
 */
function createOrderRow(order) {
    const row = document.createElement('tr');

    const formattedDate = new Date(order.data_pedido).toLocaleDateString('pt-BR');
    const formattedTotal = parseFloat(order.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const customerName = order.usuario ? order.usuario.nome_usuario : 'Cliente Deletado';
    const orderStatus = order.status || 'indefinido';

    // Mapeamento de status para exibição
    const statusMap = {
        'processando': 'Processando',
        'aguardando_pagamento': 'Aguardando Pagamento',
        'enviado': 'Enviado',
        'entregue': 'Entregue',
        'cancelado': 'Cancelado'
    };

    // Gera as opções do select dinamicamente
    const optionsHTML = Object.entries(statusMap).map(([key, value]) => 
        `<option value="${key}" ${orderStatus === key ? 'selected' : ''}>${value}</option>`
    ).join('');

    row.innerHTML = `
        <td data-label="Pedido #"><a href="detalhes-pedido.html?id=${order.id}">#${order.id}</a></td>
        <td data-label="Data">${formattedDate}</td>
        <td data-label="Cliente">${customerName}</td>
        <td data-label="Total">${formattedTotal}</td>
        <td data-label="Status">
            <select class="status-select" data-order-id="${order.id}">
                ${optionsHTML}
            </select>
        </td>
    `;
    return row;
}

/**
 * Lida com a mudança de status de um pedido.
 * @param {Event} event - O evento de mudança.
 */
async function handleStatusChange(event) {
    if (!event.target.matches('.status-select')) return;

    const selectElement = event.target;
    const orderId = selectElement.dataset.orderId;
    const newStatus = selectElement.value;

    try {
        // Usa a rota segura e o método PATCH para atualizar apenas o status
        await fetchWithAuth(`/api/pedidos/${orderId}/status`, {
            method: 'PATCH',
            body: { status: newStatus }
        });

        // Feedback sutil, pode ser um toast ou simplesmente logar
        console.log(`Status do pedido #${orderId} atualizado para ${newStatus}`);

    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Não foi possível atualizar o status do pedido.');
        // Recarrega a lista para reverter a mudança visual em caso de erro
        fetchAndRenderAdminOrders();
    }
}

/**
 * Função principal que inicializa a página.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        fetchAndRenderAdminOrders();
        const tableBody = document.getElementById('admin-orders-tbody');
        if (tableBody) {
            tableBody.addEventListener('change', handleStatusChange);
        }
    }
});
