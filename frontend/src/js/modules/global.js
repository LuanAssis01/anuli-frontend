// frontend/src/js/global.js

function updateHeaderBasedOnLogin() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const accountLink = document.getElementById('account-link');

    if (accountLink) {
        if (userInfo) {
            // Se o usuário está logado, o link leva para "Minha Conta"
            // Usamos um caminho absoluto a partir da raiz do site
            accountLink.href = '/src/html/conta/minha_conta.html';
        } else {
            // Se não está logado, o link leva para "Login"
            accountLink.href = '/src/html/auth/login.html';
        }
    }
}

// Lógica da Barra de Busca
function setupSearch() {
    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = e.target.elements.q.value;
            if (query.trim()) {
                window.location.href = `/src/html/resultados-busca.html?q=${encodeURIComponent(query)}`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderBasedOnLogin();
    setupSearch();
});
