import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

/**
 * Verifica se o usuário é um admin logado.
 */
function checkAdminAuth() {
    if (!authManager.isLoggedIn() || authManager.getUserType() !== 'admin') {
        window.location.href = '/src/html/auth/login.html';
        return false;
    }
    return true;
}

/**
 * Carrega e renderiza a lista de categorias na tabela.
 */
async function loadCategories() {
    const tableBody = document.getElementById('categories-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="2">Carregando categorias...</td></tr>';

    try {
        // A rota agora é '/api/categoria' para ser consistente
        const categories = await fetchWithAuth('/api/categoria');
        tableBody.innerHTML = ''; // Limpa a mensagem de carregamento

        if (categories.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="2">Nenhuma categoria cadastrada.</td></tr>';
            return;
        }

        categories.forEach(cat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cat.nome}</td>
                <td>
                    <div class="action-buttons">
                        <a href="formulario-categoria.html?id=${cat.id}" class="btn btn-secondary btn-sm">Editar</a>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${cat.id}">Excluir</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        tableBody.innerHTML = '<tr><td colspan="2">Erro ao carregar categorias.</td></tr>';
    }
}

/**
 * Lida com o clique no botão de excluir.
 */
async function handleDelete(event) {
    if (!event.target.matches('.delete-btn')) return;
    
    const categoryId = event.target.dataset.id;
    if (confirm('Tem certeza que deseja excluir esta categoria? A ação não pode ser desfeita.')) {
        try {
            await fetchWithAuth(`/api/categoria/${categoryId}`, { method: 'DELETE' });
            loadCategories(); // Recarrega a lista para refletir a exclusão
        } catch (error) {
            alert(`Erro ao excluir categoria: ${error.message}`);
            console.error("Erro ao excluir:", error);
        }
    }
}

// Inicializa a página
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        loadCategories();
        
        const tableBody = document.getElementById('categories-table-body');
        if (tableBody) {
            tableBody.addEventListener('click', handleDelete);
        }
    }
});