// src/js/modules/profile.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos do formulário
    const accountForm = document.getElementById('account-form');
    if (!accountForm) return; // Se o formulário não estiver na página, para a execução

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const formMessage = document.getElementById('form-message');
    
    // Elementos específicos para o administrador
    const whatsappLinkGroup = document.getElementById('whatsapp-link-group');
    const whatsappLinkInput = document.getElementById('whatsapp-link');
    
    // Elementos de senha
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    // 1. Pega os dados do utilizador do nosso authManager seguro
    const user = authManager.getUser();

    // Se não houver dados de utilizador, não faz nada (a página da conta já deve ter redirecionado)
    if (!user) return;

    // 2. Preenche o formulário com os dados atuais do utilizador
    nameInput.value = user.nome_usuario;
    emailInput.value = user.email_usuario;
    emailInput.disabled = true; // O e-mail não deve ser editável

    // Mostra o campo de link do WhatsApp apenas se o utilizador for admin
    if (user.tipo_cadastro === 'admin' && whatsappLinkGroup) {
        whatsappLinkGroup.style.display = 'block';
        if (whatsappLinkInput && user.whatsapp_link) {
            whatsappLinkInput.value = user.whatsapp_link;
        }
    }

    // 3. Escuta o evento de submit do formulário
    accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (formMessage) {
            formMessage.textContent = '';
            formMessage.className = '';
        }

        // Coleta os dados do formulário que são permitidos pelo backend
        const updatedData = {
            nome_usuario: nameInput.value,
        };

        // Adiciona o link do WhatsApp ao payload apenas se o utilizador for admin
        if (user.tipo_cadastro === 'admin' && whatsappLinkInput) {
            updatedData.whatsapp_link = whatsappLinkInput.value;
        }
        
        // ⭐ LÓGICA DE SENHA ATUALIZADA ⭐
        // Adiciona os campos de senha ao payload apenas se uma nova senha for inserida
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                formMessage.textContent = 'A nova senha e a confirmação não coincidem.';
                formMessage.className = 'error-text';
                return;
            }
            updatedData.senha_atual = currentPasswordInput.value;
            updatedData.nova_senha = newPassword;
        }

        try {
            // 4. Envia a requisição para a API usando a nossa função segura
            const result = await fetchWithAuth(`/api/users/${user.id}`, {
                method: 'PUT',
                body: updatedData // Passa o objeto JavaScript diretamente
            });

            // 5. Sucesso!
            formMessage.textContent = 'Dados atualizados com sucesso!';
            formMessage.className = 'success-text';

            // Limpa os campos de senha após o sucesso
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';

            // 6. Atualiza os dados do utilizador no sessionStorage para refletir a mudança
            authManager.login(result);

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            formMessage.textContent = error.message;
            formMessage.className = 'error-text';
        }
    });
});
