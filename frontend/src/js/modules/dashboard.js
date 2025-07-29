import { fetchWithAuth } from '../apiService.js';

// Função de segurança atualizada para a lógica de cookies
function checkAdminAuth() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // A verificação agora é baseada apenas nas informações do usuário
    if (!userInfo || userInfo.tipo_cadastro !== 'admin') {
        // Não usamos mais alert, apenas redirecionamos
        window.location.href = '../auth/login.html'; 
        return false;
    }
    return true;
}

// Função para buscar os dados e preencher os cards
async function populateDashboard() {
    try {
        // Seleciona os elementos onde os números serão exibidos
        const totalProductsEl = document.getElementById('total-products');
        const pendingOrdersEl = document.getElementById('pending-orders');
        const lowStockEl = document.getElementById('low-stock-items');
        const totalSalesEl = document.getElementById('total-sales');

        // Usa o fetchWithAuth, que envia os cookies de autenticação automaticamente
        const [products, orders] = await Promise.all([
            fetchWithAuth('/api/produtos'),
            fetchWithAuth('/api/pedidos')
        ]);

        // 1. Calcula e exibe o Total de Produtos
        totalProductsEl.textContent = products.length;

        // 2. Calcula e exibe os Pedidos Pendentes
        const pendingOrdersCount = orders.filter(order => order.status && order.status.toLowerCase() === 'aguardando_pagamento').length;
        pendingOrdersEl.textContent = pendingOrdersCount;

        // 3. Calcula e exibe os Itens com Baixo Estoque (ex: 5 ou menos)
        const lowStockCount = products.filter(product => product.quantidade_estoque <= 5).length;
        lowStockEl.textContent = lowStockCount;
        
        // 4. Calcula e exibe o Total de Vendas
        const totalSales = orders.reduce((sum, order) => {
            return (order.status && order.status.toLowerCase() !== 'cancelado') ? sum + parseFloat(order.valor_total) : sum;
        }, 0);
        totalSalesEl.textContent = totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    } catch (error) {
        console.error("Erro ao popular o dashboard:", error);
        document.querySelectorAll('.stat-number').forEach(el => el.textContent = 'Erro!');
    }
}

// Roda tudo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        populateDashboard();
    }
});
