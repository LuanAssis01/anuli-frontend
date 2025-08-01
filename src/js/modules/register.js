// src/js/modules/register.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';
import { USER_ACCOUNT_URL } from '../apiConfig.js';

const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');
const submitButton = registerForm ? registerForm.querySelector('button[type="submit"]') : null;

if (registerForm && submitButton) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.className = '';
        }

        // Coleta os dados do formulário
        const nome = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('phone').value;
        const senha = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validação no frontend
        if (senha !== confirmPassword) {
            if (errorMessage) {
                errorMessage.textContent = 'As senhas não coincidem.';
                errorMessage.className = 'error-text';
            }
            return;
        }

        // Gestão do estado do botão
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Criando conta...';

        try {
            // ⭐ CORREÇÃO AQUI ⭐
            // Passamos um objeto JavaScript puro. O apiService.js cuidará do JSON.stringify.
            const responseData = await fetchWithAuth('/api/users', {
                method: 'POST',
                body: {
                    nome_usuario: nome,
                    email_usuario: email,
                    senha_usuario: senha,
                    telefone_usuario: telefone,
                    tipo_cadastro: 'cliente'
                }
            });

            const user = responseData.user;

            // Faz o login automático do utilizador após o cadastro
            authManager.login(user);
            
            // Redireciona para a página da conta
            window.location.href = USER_ACCOUNT_URL;

        } catch (error) {
            if (errorMessage) {
                errorMessage.textContent = error.message;
                errorMessage.className = 'error-text';
            }
            console.error('Erro no cadastro:', error);
        } finally {
            // Garante que o botão seja reativado
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}
