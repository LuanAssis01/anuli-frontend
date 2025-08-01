// src/js/modules/global.js

import { authManager } from './authManager.js';
import { fetchWithAuth } from '../apiService.js';
import { LOGIN_PAGE_URL } from '../apiConfig.js'; // 1. Importa a nova constante

/**
 * Atualiza os links no cabeçalho com base no estado de login do usuário.
 */
function updateHeader() {
  const userActionsLoggedOut = document.getElementById('user-actions-logged-out');
  const userActionsLoggedIn = document.getElementById('user-actions-logged-in');
  const logoutButton = document.getElementById('logout-button');

  if (!userActionsLoggedOut || !userActionsLoggedIn) return;

  if (authManager.isLoggedIn()) {
    userActionsLoggedOut.style.display = 'none';
    userActionsLoggedIn.style.display = 'flex';
    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }
  } else {
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
    await fetchWithAuth('/api/users/logout', { method: 'POST' });
  } catch (error) {
    console.error('Erro ao fazer logout no backend:', error);
  } finally {
    authManager.logout();
    // 2. Usa a constante para o redirecionamento
    window.location.href = LOGIN_PAGE_URL;
  }
}

document.addEventListener('DOMContentLoaded', updateHeader);
