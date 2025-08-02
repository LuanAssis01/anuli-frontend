// src/js/modules/register.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';
import { USER_ACCOUNT_URL } from '../apiConfig.js';
// Importa as nossas novas funções de validação
import {
    isNotEmpty,
    isValidEmail,
    isValidPhone,
    isStrongPassword,
    doPasswordsMatch,
    showError,
    clearError
} from '../utils/validation.js';

const registerForm = document.getElementById('register-form');

if (registerForm) {
    // Seleciona todos os inputs para facilitar o uso
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const allInputs = [nameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput];
    const submitButton = registerForm.querySelector('button[type="submit"]');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // 1. Limpa todos os erros antigos
        allInputs.forEach(clearError);

        // 2. Executa a validação campo a campo
        let isValid = true;
        if (!isNotEmpty(nameInput.value)) {
            showError(nameInput, 'O nome é obrigatório.');
            isValid = false;
        }
        if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Por favor, insira um e-mail válido.');
            isValid = false;
        }
        if (!isValidPhone(phoneInput.value)) {
            showError(phoneInput, 'Por favor, insira um telefone válido (10 ou 11 dígitos).');
            isValid = false;
        }
        if (!isStrongPassword(passwordInput.value)) {
            showError(passwordInput, 'A senha deve ter pelo menos 6 caracteres.');
            isValid = false;
        }
        if (!doPasswordsMatch(passwordInput.value, confirmPasswordInput.value)) {
            showError(confirmPasswordInput, 'As senhas não coincidem.');
            isValid = false;
        }

        // 3. Se algum campo for inválido, para a execução
        if (!isValid) {
            return;
        }

        // --- Lógica de submissão (só é executada se a validação passar) ---
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'A criar conta...';

        try {
            const payload = {
                nome_usuario: nameInput.value,
                email_usuario: emailInput.value,
                senha_usuario: passwordInput.value,
                telefone_usuario: phoneInput.value,
            };

            const responseData = await fetchWithAuth('/api/users', {
                method: 'POST',
                body: payload
            });

            const user = responseData.user;
            authManager.login(user);
            window.location.href = USER_ACCOUNT_URL;

        } catch (error) {
            // Mostra o erro da API num local geral do formulário
            showError(submitButton, error.message);
            console.error('Erro no cadastro:', error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}
