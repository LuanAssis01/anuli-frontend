// frontend/src/js/modules/orders.js
import { API_BASE_URL } from '../apiConfig.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const tableBody = document.getElementById('orders-table-body');
    const noOrdersMessage = document.getElementById('no-orders-message');

    // Se não tiver info do usuário ou a tabela não existir, não faz nada
    if (!userInfo || !tableBody) {
        return;
    }

    try {
        // Faz a requisição para a API, passando o ID do usuário na URL
        const response = await fetch(`${API_BASE_URL}/api/pedidos/usuario/${userInfo.id}`, {
            method: 'GET',
            headers: {
                // ESTE É O PASSO CRUCIAL: Envia o token para autorização
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar pedidos.');
        }

        const orders = await response.json();

        // Limpa o conteúdo estático da tabela
        tableBody.innerHTML = ''; 

        if (orders.length === 0) {
            // Mostra a mensagem se não houver pedidos
            noOrdersMessage.style.display = 'block';
        } else {
            // Esconde a mensagem de "sem pedidos"
            noOrdersMessage.style.display = 'none';
            // Preenche a tabela com os pedidos
            orders.forEach(order => {
                const row = document.createElement('tr');
                
                // Formata a data para um formato mais legível
                const formattedDate = new Date(order.data_pedido).toLocaleDateString('pt-BR');
                
                row.innerHTML = `
                    <td data-label="Pedido #">#${order.id}</td>
                    <td data-label="Data">${formattedDate}</td>
                    <td data-label="Status"><span class="status status-${order.status.toLowerCase()}">${order.status}</span></td>
                    <td data-label="Total">R$ ${parseFloat(order.valor_total).toFixed(2).replace('.', ',')}</td>
                    <td data-label="Ações"><a href="#" class="btn btn-secondary btn-sm">Ver Detalhes</a></td>
                `;
                tableBody.appendChild(row);
            });
        }

    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        tableBody.innerHTML = '<tr><td colspan="5">Não foi possível carregar seus pedidos. Tente novamente.</td></tr>';
    }
});