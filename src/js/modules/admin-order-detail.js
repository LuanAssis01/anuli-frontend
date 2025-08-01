// frontend/src/js/modules/admin-order-detail.js
import { API_BASE_URL } from '../apiConfig.js';

function checkAdminAuth() { /* Cole a função checkAdminAuth aqui */ }

async function fetchAndRenderOrderDetail() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    if (!orderId) {
        document.querySelector('.admin-content').innerHTML = '<h1>ID do pedido não encontrado.</h1>';
        return;
    }

    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/pedidos/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Pedido não encontrado.');

        const order = await response.json();

        // Preenche os cards de informação
        document.getElementById('order-details-title').textContent = `Detalhes do Pedido #${order.id}`;
        document.getElementById('customer-name').textContent = order.usuario.nome_usuario;
        document.getElementById('customer-email').textContent = order.usuario.email_usuario;
        document.getElementById('order-date').textContent = new Date(order.data_pedido).toLocaleDateString('pt-BR');
        document.getElementById('order-total').textContent = parseFloat(order.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('order-status').textContent = order.status;

        const address = order.enderecoEntrega;
        document.getElementById('shipping-address').innerHTML = `
            ${address.rua}, ${address.numero}, ${address.complemento || ''}<br>
            ${address.bairro}<br>
            ${address.cidade} - ${address.estado}<br>
            CEP: ${address.cep}
        `;

        // Preenche a tabela de itens
        const itemsTbody = document.getElementById('order-items-tbody');
        itemsTbody.innerHTML = '';
        order.itens.forEach(item => {
            const subtotal = item.quantidade * item.preco_unitario;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.produto.nome}</td>
                <td style="text-align: center;">${item.quantidade}</td>
                <td style="text-align: right;">${parseFloat(item.preco_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td style="text-align: right;">${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            `;
            itemsTbody.appendChild(row);
        });

    } catch (error) {
        console.error('Erro ao buscar detalhes do pedido:', error);
        document.querySelector('.admin-content').innerHTML = `<h1>Erro ao carregar pedido.</h1><p>${error.message}</p>`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        fetchAndRenderOrderDetail();
    }
});
