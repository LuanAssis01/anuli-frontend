// src/js/modules/dashboard.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';
import { LOGIN_PAGE_URL } from '../apiConfig.js';

/**
 * Função de segurança que verifica se o utilizador está logado e é um administrador.
 * Agora, ela dá um feedback mais claro no console.
 */
function checkAdminAuth() {
    const isLoggedIn = authManager.isLoggedIn();
    const userType = authManager.getUserType();

    // Debugging: mostra o que o authManager está a ver.
    console.log('Verificando autenticação do admin...');
    console.log('Está logado?', isLoggedIn);
    console.log('Tipo de utilizador?', userType);

    if (!isLoggedIn || userType !== 'admin') {
        // Usa a constante para o redirecionamento
        window.location.href = LOGIN_PAGE_URL;
        // Lança um erro para parar a execução do resto do script.
        throw new Error('Acesso negado. Apenas para administradores.');
    }
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

        const [products, orders] = await Promise.all([
            fetchWithAuth('/api/produtos'),
            fetchWithAuth('/api/pedidos')
        ]);

        // Calcula e exibe os dados
        if (totalProductsEl) totalProductsEl.textContent = products.length;
        if (pendingOrdersEl) {
            const pendingOrdersCount = orders.filter(order => order.status && order.status.toLowerCase() === 'processando').length;
            pendingOrdersEl.textContent = pendingOrdersCount;
        }
        if (lowStockEl) {
            const lowStockCount = products.filter(product => product.quantidade_estoque <= 5).length;
            lowStockEl.textContent = lowStockCount;
        }
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

/**
 * Função principal que inicializa a página.
 */
function initDashboard() {
    try {
        checkAdminAuth();
        populateDashboard();
    } catch (error) {
        // Se o checkAdminAuth falhar, o erro será capturado aqui e a página não tentará carregar os dados.
        console.error(error.message);
        // Opcional: mostrar uma mensagem na página
        const contentArea = document.querySelector('.admin-content');
        if (contentArea) {
            contentArea.innerHTML = `<h1>Acesso Negado</h1><p>Você será redirecionado para a página de login.</p>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);
