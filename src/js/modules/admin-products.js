// src/js/modules/admin-products.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';
import { API_BASE_URL } from '../apiConfig.js';

/**
 * Função de segurança que verifica se o usuário está logado e é um administrador.
 * Redireciona para o login caso não seja.
 * @returns {boolean} - True se o usuário for um admin autenticado.
 */
function checkAdminAuth() {
    if (!authManager.isLoggedIn() || authManager.getUserType() !== 'admin') {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = '/src/html/auth/login.html'; 
        return false;
    }
    return true;
}

/**
 * Busca e renderiza os produtos na tabela do painel de administração.
 */
async function fetchAndRenderAdminProducts() {
    const tableBody = document.getElementById('admin-products-tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5">Carregando produtos...</td></tr>';

    try {
        // Usa a função segura para buscar os produtos. A rota já é protegida no backend.
        const products = await fetchWithAuth('/api/produtos');
        
        tableBody.innerHTML = ''; // Limpa o conteúdo de "carregando"

        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = createProductRow(product);
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Erro ao carregar produtos no painel:', error);
        tableBody.innerHTML = `<tr><td colspan="5">Erro ao carregar produtos: ${error.message}</td></tr>`;
    }
}

/**
 * Cria uma linha (tr) da tabela para um único produto.
 * @param {object} product - O objeto do produto.
 * @returns {HTMLElement} - O elemento <tr>.
 */
function createProductRow(product) {
    const row = document.createElement('tr');
            
    let stockStatusClass = 'stock-ok';
    if (product.quantidade_estoque <= 5 && product.quantidade_estoque > 0) {
        stockStatusClass = 'stock-low';
    } else if (product.quantidade_estoque === 0) {
        stockStatusClass = 'stock-out';
    }

    const imageUrl = product.imagens && product.imagens.length > 0
        ? `${API_BASE_URL}/${product.imagens[0].url}`
        : 'https://placehold.co/60x60/eee/ccc?text=N/A';

    row.innerHTML = `
        <td>
            <div class="product-cell">
                <img src="${imageUrl}" alt="${product.nome}">
                <span>${product.nome}</span>
            </div>
        </td>
        <td>${product.sku || 'N/A'}</td>
        <td><span class="stock ${stockStatusClass}">${product.quantidade_estoque} em estoque</span></td>
        <td>${parseFloat(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
        <td>
            <div class="action-buttons">
                <a href="formulario-produto.html?id=${product.id}" class="btn btn-secondary btn-sm">Editar</a>
                <button class="btn btn-danger btn-sm" data-product-id="${product.id}">Desativar</button>
            </div>
        </td>
    `;
    return row;
}


/**
 * Lida com a desativação de um produto.
 * @param {Event} event - O evento de clique.
 */
async function handleDeleteProduct(event) {
    // Delegação de evento: só age se o clique foi no botão de desativar
    if (!event.target.matches('.btn-danger')) {
        return;
    }

    const button = event.target;
    const productId = button.dataset.productId;

    if (confirm('Tem certeza de que deseja DESATIVAR este produto? Ele não aparecerá mais para os clientes.')) {
        try {
            // Usa a função segura e a rota de delete. O backend agora faz "soft delete".
            const response = await fetchWithAuth(`/api/produtos/${productId}`, {
                method: 'DELETE'
            });

            // O backend agora retorna uma mensagem de sucesso, não um 204.
            alert(response.message);
            
            // Remove a linha da tabela para feedback visual imediato.
            const row = button.closest('tr');
            row.remove();

        } catch (error) {
            console.error('Erro ao desativar produto:', error);
            alert(error.message);
        }
    }
}

/**
 * Função principal que inicializa a página.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        fetchAndRenderAdminProducts();

        const tableBody = document.getElementById('admin-products-tbody');
        if (tableBody) {
            tableBody.addEventListener('click', handleDeleteProduct);
        }
    }
});
