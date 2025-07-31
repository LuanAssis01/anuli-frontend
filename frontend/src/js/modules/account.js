// src/js/modules/account.js

import { authManager } from './authManager.js';
import { fetchWithAuth } from '../apiService.js';

/**
 * Verifica se o usuário está logado. Se não estiver, redireciona para a página de login.
 * Esta função age como uma "guarda de rota".
 * @returns {boolean} - Retorna false se o usuário for redirecionado.
 */
function checkAuthAndRedirect() {
    if (!authManager.isLoggedIn()) {
        // Caminho absoluto para a página de login para evitar erros de navegação
        window.location.href = '/src/html/auth/login.html';
        return false;
    }
    return true;
}

/**
 * Lida com o processo de logout, limpando a sessão no backend e no frontend.
 */
async function handleLogout() {
    try {
        // 1. Chama a API para que o backend limpe o cookie HttpOnly
        await fetchWithAuth('/api/users/logout', { method: 'POST' });
    } catch (error) {
        // Mesmo que a chamada de API falhe, o logout no frontend deve continuar
        console.error('Erro no logout do servidor, limpando dados locais:', error);
    } finally {
        // 2. Limpa os dados do usuário do sessionStorage
        authManager.logout();
        // 3. Redireciona para a página de login
        window.location.href = '/src/html/auth/login.html';
    }
}

/**
 * Função principal que inicializa todas as páginas dentro da área da conta.
 */
function initAccountPage() {
    // 1. Roda a verificação de autenticação. Se o usuário não estiver logado, o script para aqui.
    if (!checkAuthAndRedirect()) {
        return;
    }

    // 2. Pega os dados do usuário do nosso authManager
    const user = authManager.getUser();
    const welcomeElement = document.getElementById('welcome-message'); // Ex: em minha_conta.html
    
    // Exibe a mensagem de boas-vindas
    if (welcomeElement && user?.nome_usuario) {
        const firstName = user.nome_usuario.split(' ')[0];
        welcomeElement.textContent = `Olá, ${firstName}!`;
    }

    // 3. Ativa o botão de logout em qualquer página da conta que o tenha
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault(); // Impede que o link siga para href="#"
            handleLogout();
        });
    }
}

// Roda a função de inicialização assim que o conteúdo da página for carregado
document.addEventListener('DOMContentLoaded', initAccountPage);
