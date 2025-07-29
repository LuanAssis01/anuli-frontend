import { fetchWithAuth } from '../apiService.js';


function checkAuth() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
        window.location.href = '../auth/login.html';
        return false;
    }
    return true;
}


async function logout() {
    try {
        // Chama o endpoint de logout no backend para limpar o cookie HttpOnly
        await fetchWithAuth('/api/users/logout', { method: 'POST' });
    } catch (error) {
        // Mesmo que a chamada à API falhe, o logout no frontend deve continuar
        console.error('Erro no logout do servidor, limpando dados locais:', error);
    } finally {
        // Limpa as informações do usuário do localStorage e redireciona para o login
        localStorage.removeItem('userInfo');
        window.location.href = '../auth/login.html';
    }
}

function initAccountPage() {

    if (!checkAuth()) {
        return;
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const welcomeElement = document.getElementById('welcome-message'); // Presente em minha_conta.html
    
    if (welcomeElement && userInfo?.nome_usuario) {
        const firstName = userInfo.nome_usuario.split(' ')[0];
        welcomeElement.textContent = `Olá, ${firstName}!`;
    }

    // 3. Ativa o botão de logout em todas as páginas da conta
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault(); // Impede que o link siga o href="#"
            logout();
        });
    }
}

// Roda a função de inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initAccountPage);
