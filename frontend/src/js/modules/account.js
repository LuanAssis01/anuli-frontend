// frontend/src/js/modules/account.js

// Esta função será executada assim que o script for carregado
(function checkAuthentication() {
    // 1. Pega o token do localStorage
    const token = localStorage.getItem('authToken');

    // 2. Se NÃO houver token, redireciona para o login
    if (!token) {
        // O ../auth/login.html é o caminho a partir da pasta /conta/
        window.location.href = '../auth/login.html';
        return; // Para a execução do script
    }

    // 3. Se houver token, pega os dados do usuário
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // 4. Se houver dados do usuário, personaliza a página
    if (userInfo && userInfo.nome_usuario) {
        const welcomeElement = document.getElementById('welcome-message');
        if (welcomeElement) {
            // Pega o primeiro nome para uma saudação mais pessoal
            const firstName = userInfo.nome_usuario.split(' ')[0];
            welcomeElement.textContent = `Olá, ${firstName}!`;
        }
    }
})(); // Os parênteses no final fazem a função ser executada imediatamente

// Função de Logout
function logout() {
    // Limpa os dados do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    // Redireciona para o login
    window.location.href = '../auth/login.html';
}

// Adiciona a funcionalidade de logout ao botão "Sair"
// Precisamos dar um id para o botão primeiro
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault(); // Impede o link de seguir o href="#"
            logout();
        });
    }
});