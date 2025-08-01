// src/js/modules/auth.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

// Pega os elementos do formulário da página de login
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

// Garante que o código só rode se o formulário de login existir na página
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    // Limpa mensagens de erro antigas
    if (errorMessage) errorMessage.textContent = '';

    // Pega os valores dos campos de email e senha
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      // ⭐ CORREÇÃO AQUI ⭐
      // Passamos um objeto JavaScript puro para o fetchWithAuth.
      // A função fetchWithAuth em apiService.js já cuida do JSON.stringify.
      const responseData = await fetchWithAuth('/api/users/login', {
        method: 'POST',
        body: {
          email_usuario: email,
          senha_usuario: password,
        },
      });

      // A API agora retorna um objeto { user: { ... } }
      const user = responseData.user;

      // Usa o authManager para salvar os dados do usuário no sessionStorage
      authManager.login(user);

      // Redireciona o usuário com base no seu tipo de cadastro
      if (user.tipo_cadastro === 'admin') {
        window.location.href = '../admin/dashboard.html';
      } else {
        window.location.href = '../conta/minha_conta.html';
      }

    } catch (error) {
      // Exibe a mensagem de erro da API no formulário
      if (errorMessage) errorMessage.textContent = error.message;
      console.error('Erro no login:', error);
    }
  });
}
