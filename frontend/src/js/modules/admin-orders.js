// frontend/src/js/modules/admin-orders.js
import { API_BASE_URL } from '../apiConfig.js';

// Função de segurança para verificar se o usuário é admin
function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!token || userInfo?.tipo_cadastro !== 'admin') {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = '../auth/login.html';
        return false;
    }
    return true;
}

// Função para buscar e renderizar os pedidos na tabela
async function fetchAndRenderAdminOrders() {
    const tableBody = document.getElementById('admin-orders-tbody');
    if (!tableBody) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar pedidos.');

        const orders = await response.json();
        tableBody.innerHTML = '';

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">Nenhum pedido encontrado.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');

            // Define as variáveis de forma segura antes de usá-las
            const formattedDate = new Date(order.data_pedido).toLocaleDateString('pt-BR');
            const formattedTotal = parseFloat(order.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const customerName = order.usuario ? order.usuario.nome_usuario : 'Cliente Deletado';
            const orderStatus = order.status || 'indefinido';

            // Monta o HTML da linha da tabela com as correções
            row.innerHTML = `
                <td data-label="Pedido #"><a href="detalhes-pedido.html?id=${order.id}">#${order.id}</a></td>
                <td data-label="Data">${formattedDate}</td>
                <td data-label="Cliente">${customerName}</td>
                <td data-label="Total">${formattedTotal}</td>
                <td data-label="Status">
                    <select class="status-select" data-order-id="${order.id}">
                        <option value="aguardando_pagamento" ${orderStatus === 'aguardando_pagamento' ? 'selected' : ''}>Aguardando Pagamento</option>
                        <option value="pago" ${orderStatus === 'pago' ? 'selected' : ''}>Pago</option>
                        <option value="enviado" ${orderStatus === 'enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="entregue" ${orderStatus === 'entregue' ? 'selected' : ''}>Entregue</option>
                        <option value="cancelado" ${orderStatus === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        tableBody.innerHTML = '<tr><td colspan="5">Erro ao carregar pedidos.</td></tr>';
    }
}

// Função para atualizar o status do pedido
async function handleStatusChange(event) {
    if (!event.target.matches('.status-select')) return;

    const selectElement = event.target;
    const orderId = selectElement.dataset.orderId;
    const newStatus = selectElement.value;
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`${API_BASE_URL}/api/pedidos/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Falha ao atualizar o status.');

        console.log(`Status do pedido #${orderId} atualizado para ${newStatus}`);

    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Não foi possível atualizar o status do pedido.');
        fetchAndRenderAdminOrders();
    }
}

// Função principal que roda quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        fetchAndRenderAdminOrders();
        const tableBody = document.getElementById('admin-orders-tbody');
        if (tableBody) {
            tableBody.addEventListener('change', handleStatusChange);
        }
    }
});