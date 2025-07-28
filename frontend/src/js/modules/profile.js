// frontend/src/js/modules/profile.js
import { API_BASE_URL } from '../apiConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    const accountForm = document.getElementById('account-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const formMessage = document.getElementById('form-message');

    // Pega os dados do usuário do localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = localStorage.getItem('authToken');

    // Se não houver dados, não faz nada (o account.js já vai redirecionar)
    if (!userInfo) return;

    // 1. Preenche o formulário com os dados atuais do usuário
    nameInput.value = userInfo.nome_usuario;
    emailInput.value = userInfo.email_usuario;

    // 2. Escuta o evento de submit do formulário
    accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formMessage.textContent = ''; // Limpa mensagens antigas

        // Coleta os dados do formulário
        const updatedData = {
            nome_usuario: nameInput.value,
            email_usuario: emailInput.value
        };

        // Lógica para alteração de senha
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword) {
            if (newPassword !== confirmPassword) {
                formMessage.textContent = 'A nova senha e a confirmação não coincidem.';
                formMessage.className = 'error-text';
                return;
            }
            // Adiciona senhas ao payload se forem preenchidas
            updatedData.senha_atual = currentPassword;
            updatedData.nova_senha = newPassword;
        }

        try {
            // 3. Envia a requisição para a API
            const response = await fetch(`${API_BASE_URL}/api/users/${userInfo.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro ao atualizar dados.');
            }

            // 4. Sucesso!
            formMessage.textContent = 'Dados atualizados com sucesso!';
            formMessage.className = 'success-text';

            // Atualiza os dados no localStorage para refletir a mudança
            const updatedUserInfo = { ...userInfo, ...result };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            formMessage.textContent = error.message;
            formMessage.className = 'error-text';
        }
    });
});