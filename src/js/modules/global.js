// src/js/modules/global.js

import { authManager } from './authManager.js';
import { fetchWithAuth } from '../apiService.js';

/**
 * Atualiza os links no cabeçalho com base no estado de login do usuário.
 */
function updateHeader() {
  const userActionsLoggedOut = document.getElementById('user-actions-logged-out');
  const userActionsLoggedIn = document.getElementById('user-actions-logged-in');

  if (!userActionsLoggedOut || !userActionsLoggedIn) return;

  if (authManager.isLoggedIn()) {
    userActionsLoggedOut.style.display = 'none';
    userActionsLoggedIn.style.display = 'flex';
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
    window.location.href = '/src/html/auth/login.html';
  }
}

/**
 * Configura o menu de navegação mobile.
 */
function setupMobileMenu() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
}

/**
 * Adiciona os event listeners globais que só precisam ser configurados uma vez.
 */
function initializeGlobalListeners() {
    // Delegação de Evento: o listener fica no container pai
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.addEventListener('click', (event) => {
            // Verifica se o elemento clicado (ou um de seus pais) é o botão de logout
            if (event.target.closest('#logout-button')) {
                handleLogout(event);
            }
        });
    }
}

// Executa todas as funções globais necessárias quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
  updateHeader();
  setupMobileMenu();
  initializeGlobalListeners(); // <-- Nova função que cuida dos listeners
});