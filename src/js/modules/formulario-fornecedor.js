import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

function checkAdminAuth() {
    if (!authManager.isLoggedIn() || authManager.getUserType() !== 'admin') {
        window.location.href = '/src/html/auth/login.html';
        return false;
    }
    return true;
}

async function initForm() {
    const form = document.getElementById('supplier-form');
    const formTitle = document.getElementById('form-title');
    const nameInput = document.getElementById('nome');
    const cnpjInput = document.getElementById('cnpj');
    const contactInput = document.getElementById('contato');
    const addressInput = document.getElementById('endereco');

    const params = new URLSearchParams(window.location.search);
    const supplierId = params.get('id');
    const isEditMode = !!supplierId;

    if (isEditMode) {
        formTitle.textContent = 'Editar Fornecedor';
        try {
            const supplier = await fetchWithAuth(`/api/fornecedores/${supplierId}`);
            nameInput.value = supplier.nome;
            cnpjInput.value = supplier.cnpj;
            contactInput.value = supplier.contato;
            addressInput.value = supplier.endereco;
        } catch (error) {
            alert('Erro ao carregar dados do fornecedor.');
            console.error("Erro ao buscar fornecedor:", error);
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const payload = {
            nome: nameInput.value,
            cnpj: cnpjInput.value,
            contato: contactInput.value,
            endereco: addressInput.value,
        };
        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode ? `/api/fornecedores/${supplierId}` : '/api/fornecedores';

        try {
            await fetchWithAuth(url, { method, body: payload });
            alert(`Fornecedor ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
            window.location.href = 'fornecedores.html';
        } catch (error) {
            alert(`Erro ao salvar fornecedor: ${error.message}`);
            console.error("Erro ao salvar:", error);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        initForm();
    }
});