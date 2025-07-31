// src/js/modules/global.js

import { authManager } from './authManager.js';
import { fetchWithAuth } from '../apiService.js';

/**
 * Atualiza os links no cabeçalho com base no estado de login do usuário.
 */
function updateHeader() {
  const userActionsLoggedOut = document.getElementById('user-actions-logged-out');
  const userActionsLoggedIn = document.getElementById('user-actions-logged-in');
  const logoutButton = document.getElementById('logout-button');

  // Se os elementos não existirem na página, não faz nada.
  if (!userActionsLoggedOut || !userActionsLoggedIn) return;

  if (authManager.isLoggedIn()) {
    // Usuário está logado: mostra as ações de logado e esconde as de deslogado.
    userActionsLoggedOut.style.display = 'none';
    userActionsLoggedIn.style.display = 'flex'; // ou 'block', dependendo do seu CSS

    // Adiciona o evento de clique ao botão de sair, se ele existir
    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }
  } else {
    // Usuário não está logado: faz o oposto.
    userActionsLoggedOut.style.display = 'flex';
    userActionsLoggedIn.style.display = 'none';
  }
}

/**
 * Lida com o processo de logout do usuário.
 */
async function handleLogout(event) {
  event.preventDefault();
  try {
    // Chama a API para que o backend limpe o cookie HttpOnly
    await fetchWithAuth('/api/users/logout', { method: 'POST' });
  } catch (error) {
    console.error('Erro ao fazer logout no backend:', error);
  } finally {
    // Limpa os dados do usuário do sessionStorage
    authManager.logout();
    // ⭐ CAMINHO CORRIGIDO POR VOCÊ ⭐
    // Redireciona para o caminho correto da página de login
    window.location.href = '/frontend/src/html/auth/login.html';
  }
}

// Executa a função para atualizar o cabeçalho assim que o conteúdo da página for carregado
document.addEventListener('DOMContentLoaded', updateHeader);
