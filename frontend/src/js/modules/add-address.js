// src/js/modules/add-address.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js'; // Importa o authManager para a verificação

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário está logado antes de adicionar listeners
    if (!authManager.isLoggedIn()) {
        // Se a página for acessada diretamente, redireciona
        window.location.href = '/frontend/src/html/auth/login.html';
        return;
    }

    const addAddressForm = document.getElementById('add-address-form');
    const errorMessageElement = document.getElementById('error-message');

    if (addAddressForm) {
        addAddressForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorMessageElement) errorMessageElement.textContent = ''; // Limpa erros antigos

            // --- COLETA DE DADOS DO FORMULÁRIO ---
            const formData = {
                titulo: document.getElementById('titulo').value,
                cep: document.getElementById('cep').value.replace(/\D/g, ''), // Remove não-números
                rua: document.getElementById('rua').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value,
                endereco_principal: document.getElementById('endereco_principal')?.checked || false
            };

            // --- VALIDAÇÃO SIMPLES NO FRONTEND ---
            if (!/^\d{8}$/.test(formData.cep)) {
                if (errorMessageElement) errorMessageElement.textContent = 'CEP inválido. Deve conter 8 números.';
                return;
            }
            if (!formData.rua || !formData.cidade || !formData.estado) {
                if (errorMessageElement) errorMessageElement.textContent = 'Rua, cidade e estado são obrigatórios.';
                return;
            }

            // --- LÓGICA DE ENVIO SEGURA ---
            const payload = { ...formData, pais: 'Brasil' };

            try {
                // ⭐ CORREÇÃO: Passa o objeto JavaScript diretamente. O apiService cuidará do resto.
                await fetchWithAuth('/api/enderecos', {
                    method: 'POST',
                    body: payload
                });
                
                // Redireciona para a lista de endereços em caso de sucesso
                window.location.href = 'meus_enderecos.html'; 

            } catch (error) {
                console.error('Erro no formulário de endereço:', error);
                if (errorMessageElement) errorMessageElement.textContent = error.message;
            }
        });
    }
});
