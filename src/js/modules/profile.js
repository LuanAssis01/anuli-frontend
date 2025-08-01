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

    // 1. Pega os dados do usuário do nosso authManager seguro
    const user = authManager.getUser();

    // Se não houver dados de usuário, não faz nada (a página da conta já deve ter redirecionado)
    if (!user) return;

    // 2. Preenche o formulário com os dados atuais do usuário
    nameInput.value = user.nome_usuario;
    emailInput.value = user.email_usuario;

    // 3. Escuta o evento de submit do formulário
    accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (formMessage) formMessage.textContent = ''; // Limpa mensagens antigas

        // Coleta os dados do formulário
        const updatedData = {
            nome_usuario: nameInput.value,
            email_usuario: emailInput.value
        };

        // Lógica para alteração de senha
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Só adiciona os campos de senha ao payload se uma nova senha for digitada
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                formMessage.textContent = 'A nova senha e a confirmação não coincidem.';
                formMessage.className = 'error-text';
                return;
            }
            updatedData.senha_atual = currentPassword;
            updatedData.nova_senha = newPassword;
        }

        try {
            // 4. Envia a requisição para a API usando nossa função segura
            // O ID do usuário é pego do authManager e a rota do backend já sabe como lidar com isso.
            const result = await fetchWithAuth(`/api/users/${user.id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            });

            // 5. Sucesso!
            formMessage.textContent = 'Dados atualizados com sucesso!';
            formMessage.className = 'success-text';

            // Limpa os campos de senha após o sucesso
            if (document.getElementById('current-password')) document.getElementById('current-password').value = '';
            if (document.getElementById('new-password')) document.getElementById('new-password').value = '';
            if (document.getElementById('confirm-password')) document.getElementById('confirm-password').value = '';

            // 6. Atualiza os dados do usuário no sessionStorage para refletir a mudança
            authManager.login(result);

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            formMessage.textContent = error.message;
            formMessage.className = 'error-text';
        }
    });
});