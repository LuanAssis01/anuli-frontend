// frontend/src/js/global.js

function updateHeaderBasedOnLogin() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const accountLink = document.getElementById('account-link'); // Daremos este ID ao link

    if (accountLink) {
        if (userInfo) {
            // Se o usuário está logado, o link leva para "Minha Conta"
            // O caminho precisa ser ajustado dependendo de onde a página está
            const pathPrefix = window.location.pathname.includes('/auth/') || window.location.pathname.includes('/conta/') || window.location.pathname.includes('/compra/') ? '../' : '';
            accountLink.href = `${pathPrefix}conta/minha_conta.html`;
        } else {
            // Se não está logado, o link leva para "Login"
            const pathPrefix = window.location.pathname.includes('/auth/') || window.location.pathname.includes('/conta/') || window.location.pathname.includes('/compra/') ? '../' : '';
            accountLink.href = `${pathPrefix}auth/login.html`;
        }
    }
}

document.addEventListener('DOMContentLoaded', updateHeaderBasedOnLogin);