import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

function checkAdminAuth() {
    if (!authManager.isLoggedIn() || authManager.getUserType() !== 'admin') {
        window.location.href = '/src/html/auth/login.html';
        return false;
    }
    return true;
}

async function loadSuppliers() {
    const tableBody = document.getElementById('suppliers-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="4">Carregando fornecedores...</td></tr>';
    try {
        const suppliers = await fetchWithAuth('/api/fornecedores');
        tableBody.innerHTML = '';

        if (suppliers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">Nenhum fornecedor cadastrado.</td></tr>';
            return;
        }

        suppliers.forEach(supplier => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier.nome}</td>
                <td>${supplier.cnpj || 'N/A'}</td>
                <td>${supplier.contato || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <a href="formulario-fornecedor.html?id=${supplier.id}" class="btn btn-secondary btn-sm">Editar</a>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${supplier.id}">Excluir</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
        tableBody.innerHTML = '<tr><td colspan="4">Erro ao carregar fornecedores.</td></tr>';
    }
}

async function handleDelete(event) {
    if (!event.target.matches('.delete-btn')) return;
    
    const supplierId = event.target.dataset.id;
    if (confirm('Tem certeza que deseja desativar este fornecedor?')) {
        try {
            // No backend, a rota DELETE agora desativa (soft delete)
            await fetchWithAuth(`/api/fornecedores/${supplierId}`, { method: 'DELETE' });
            loadSuppliers(); // Recarrega a lista
        } catch (error) {
            alert(`Erro ao desativar fornecedor: ${error.message}`);
            console.error("Erro ao desativar:", error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        loadSuppliers();
        
        const tableBody = document.getElementById('suppliers-table-body');
        if (tableBody) {
            tableBody.addEventListener('click', handleDelete);
        }
    }
});