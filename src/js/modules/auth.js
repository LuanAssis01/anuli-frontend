// src/js/modules/auth.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';
import { ADMIN_DASHBOARD_URL, USER_ACCOUNT_URL } from '../apiConfig.js';

// Pega os elementos do formulário da página de login
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const submitButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

// Garante que o código só rode se o formulário de login existir na página
if (loginForm && submitButton) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    // Limpa mensagens de erro antigas e reseta o estilo
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.className = '';
    }

    // Pega os valores dos campos de email e senha
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // --- Validação no Frontend ---
    if (!email || !password) {
        if (errorMessage) {
            errorMessage.textContent = 'Por favor, preencha o e-mail e a senha.';
            errorMessage.className = 'error-text'; // Adiciona uma classe para estilização
        }
        return;
    }

    // --- Gestão do Estado do Botão ---
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';

    try {
      // Faz a chamada para a API de login
      const responseData = await fetchWithAuth('/api/users/login', {
        method: 'POST',
        body: {
          email_usuario: email,
          senha_usuario: password,
        },
      });

      const user = responseData.user;

      // Usa o authManager para salvar os dados do usuário no sessionStorage
      authManager.login(user);

      // Redireciona o usuário com base no seu tipo de cadastro
      if (user.tipo_cadastro === 'admin') {
        window.location.href = ADMIN_DASHBOARD_URL;
      } else {
        window.location.href = USER_ACCOUNT_URL;
      }

    } catch (error) {
      // Exibe a mensagem de erro da API no formulário
      if (errorMessage) {
          errorMessage.textContent = error.message;
          errorMessage.className = 'error-text';
      }
      console.error('Erro no login:', error);
    } finally {
        // --- Garante que o botão seja reativado ---
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
  });
}
