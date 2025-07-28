// frontend/src/js/modules/dashboard.js
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

// Função para buscar os dados e preencher os cards
async function populateDashboard() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
        // Seleciona os elementos onde os números serão exibidos
        const totalProductsEl = document.getElementById('total-products');
        const pendingOrdersEl = document.getElementById('pending-orders');
        const lowStockEl = document.getElementById('low-stock-items');
        const totalSalesEl = document.getElementById('total-sales');

        // Faz as chamadas à API para produtos e pedidos em paralelo para ser mais rápido
        const [productsResponse, ordersResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/produtos`, { headers }),
            fetch(`${API_BASE_URL}/api/pedidos`, { headers })
        ]);

        if (!productsResponse.ok || !ordersResponse.ok) {
            throw new Error('Falha ao buscar dados do servidor.');
        }

        const products = await productsResponse.json();
        const orders = await ordersResponse.json();

        // 1. Calcula e exibe o Total de Produtos
        totalProductsEl.textContent = products.length;

        // 2. Calcula e exibe os Pedidos Pendentes
        const pendingOrdersCount = orders.filter(order => order.status && order.status.toLowerCase() === 'pendente').length;
        pendingOrdersEl.textContent = pendingOrdersCount;

        // 3. Calcula e exibe os Itens com Baixo Estoque (ex: 5 ou menos)
        const lowStockCount = products.filter(product => product.quantidade_estoque <= 5).length;
        lowStockEl.textContent = lowStockCount;
        
        // 4. Calcula e exibe o Total de Vendas
        const totalSales = orders.reduce((sum, order) => {
            // Soma apenas se o pedido não foi cancelado
            return (order.status && order.status.toLowerCase() !== 'cancelado') ? sum + parseFloat(order.valor_total) : sum;
        }, 0);
        totalSalesEl.textContent = totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    } catch (error) {
        console.error("Erro ao popular o dashboard:", error);
        // Coloca uma mensagem de erro nos cards se a busca falhar
        document.querySelectorAll('.stat-number').forEach(el => el.textContent = 'Erro!');
    }
}

// Roda tudo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        populateDashboard();
    }
});