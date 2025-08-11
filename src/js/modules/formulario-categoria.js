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
    const form = document.getElementById('category-form');
    const formTitle = document.getElementById('form-title');
    const nameInput = document.getElementById('nome');
    // ⭐ 1. SELECIONA O NOVO CAMPO ⭐
    const descriptionInput = document.getElementById('descricao');

    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('id');
    const isEditMode = !!categoryId;

    if (isEditMode) {
        formTitle.textContent = 'Editar Categoria';
        try {
            const category = await fetchWithAuth(`/api/categoria/${categoryId}`);
            nameInput.value = category.nome;
            // ⭐ 2. PREENCHE O CAMPO DE DESCRIÇÃO NO MODO DE EDIÇÃO ⭐
            descriptionInput.value = category.descricao || '';
        } catch (error) {
            alert('Erro ao carregar dados da categoria.');
            console.error("Erro ao buscar categoria:", error);
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // ⭐ 3. ADICIONA A DESCRIÇÃO AO OBJETO ENVIADO PARA A API ⭐
        const payload = { 
            nome: nameInput.value,
            descricao: descriptionInput.value
        };

        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode ? `/api/categoria/${categoryId}` : '/api/categoria';

        try {
            await fetchWithAuth(url, { method, body: payload });
            alert(`Categoria ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`);
            window.location.href = 'categorias.html';
        } catch (error) {
            alert(`Erro ao salvar categoria: ${error.message}`);
            console.error("Erro ao salvar:", error);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        initForm();
    }
});