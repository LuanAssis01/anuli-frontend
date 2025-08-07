import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

/**
 * Função principal que inicializa a página de edição de endereço.
 */
async function initEditAddressPage() {
    // 1. --- Validação e Seleção de Elementos ---
    if (!authManager.isLoggedIn()) {
        window.location.href = '/src/html/auth/login.html';
        return;
    }

    const form = document.getElementById('edit-address-form');
    const formMessage = document.getElementById('form-message');
    const pageTitle = document.querySelector('.account-content h2');

    // Seleciona todos os campos do formulário
    const inputFields = {
        titulo: document.getElementById('titulo'),
        cep: document.getElementById('cep'),
        rua: document.getElementById('rua'),
        numero: document.getElementById('numero'),
        complemento: document.getElementById('complemento'),
        bairro: document.getElementById('bairro'),
        cidade: document.getElementById('cidade'),
        estado: document.getElementById('estado'),
    };
    
    // 2. --- Buscar o ID do Endereço na URL ---
    const params = new URLSearchParams(window.location.search);
    const addressId = params.get('id');

    if (!addressId) {
        if (pageTitle) pageTitle.textContent = 'Endereço não encontrado';
        if (form) form.style.display = 'none'; // Esconde o formulário se não houver ID
        return;
    }

    // 3. --- Carregar Dados e Preencher o Formulário ---
    try {
        const address = await fetchWithAuth(`/api/enderecos/${addressId}`);
        
        // Preenche cada campo com os dados vindos da API
        for (const key in inputFields) {
            if (inputFields[key] && address[key]) {
                inputFields[key].value = address[key];
            }
        }

    } catch (error) {
        console.error('Erro ao carregar endereço:', error);
        if (pageTitle) pageTitle.textContent = 'Erro ao carregar endereço';
        if (form) form.style.display = 'none';
        if (formMessage) formMessage.textContent = 'Não foi possível carregar os dados do endereço. Tente novamente mais tarde.';
    }

    // 4. --- Lidar com o Envio do Formulário ---
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Salvando...';
            if (formMessage) formMessage.textContent = '';

            // Monta o payload com os novos valores dos campos
            const payload = {};
            for (const key in inputFields) {
                payload[key] = inputFields[key].value;
            }

            try {
                // Envia a requisição PUT para atualizar o endereço
                await fetchWithAuth(`/api/enderecos/${addressId}`, {
                    method: 'PUT',
                    body: payload
                });

                // Redireciona para a página de endereços com mensagem de sucesso
                alert('Endereço atualizado com sucesso!');
                window.location.href = 'meus_enderecos.html';

            } catch (error) {
                console.error('Erro ao atualizar endereço:', error);
                if (formMessage) formMessage.textContent = error.message || 'Ocorreu um erro. Tente novamente.';
                submitButton.disabled = false;
                submitButton.textContent = 'Salvar Alterações';
            }
        });
    }
}

// Executa a função principal quando a página for carregada
document.addEventListener('DOMContentLoaded', initEditAddressPage);