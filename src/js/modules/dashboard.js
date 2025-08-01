// src/js/modules/dashboard.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

/**
 * Função de segurança que verifica se o usuário está logado e é um administrador.
 * Redireciona para o login caso não seja.
 * @returns {boolean} - True se o usuário for um admin autenticado.
 */
function checkAdminAuth() {
    // A verificação agora é baseada no nosso authManager seguro
    if (!authManager.isLoggedIn() || authManager.getUserType() !== 'admin') {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = '/frontend/src/html/auth/login.html'; 
        return false;
    }
    return true;
}

/**
 * Função para buscar os dados e preencher os cards do dashboard.
 */
async function populateDashboard() {
    try {
        // Seleciona os elementos onde os números serão exibidos
        const totalProductsEl = document.getElementById('total-products');
        const pendingOrdersEl = document.getElementById('pending-orders');
        const lowStockEl = document.getElementById('low-stock-items');
        const totalSalesEl = document.getElementById('total-sales');

        // Usa o fetchWithAuth, que envia os cookies de autenticação automaticamente
        // Promise.all faz as duas chamadas de API em paralelo, o que é mais rápido
        const [products, orders] = await Promise.all([
            fetchWithAuth('/api/produtos'),
            fetchWithAuth('/api/pedidos')
        ]);

        // 1. Calcula e exibe o Total de Produtos
        if (totalProductsEl) totalProductsEl.textContent = products.length;

        // 2. Calcula e exibe os Pedidos Pendentes
        if (pendingOrdersEl) {
            const pendingOrdersCount = orders.filter(order => order.status && order.status.toLowerCase() === 'processando').length;
            pendingOrdersEl.textContent = pendingOrdersCount;
        }

        // 3. Calcula e exibe os Itens com Baixo Estoque (ex: 5 ou menos)
        if (lowStockEl) {
            const lowStockCount = products.filter(product => product.quantidade_estoque <= 5).length;
            lowStockEl.textContent = lowStockCount;
        }
        
        // 4. Calcula e exibe o Total de Vendas (considerando apenas pedidos não cancelados)
        if (totalSalesEl) {
            const totalSales = orders.reduce((sum, order) => {
                return (order.status && order.status.toLowerCase() !== 'cancelado') ? sum + parseFloat(order.valor_total) : sum;
            }, 0);
            totalSalesEl.textContent = totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

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