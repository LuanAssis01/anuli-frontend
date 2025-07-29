import { fetchWithAuth } from '../apiService.js';

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = await fetchWithAuth('/api/users/login', {
                method: 'POST',
                body: JSON.stringify({
                    email_usuario: email,
                    senha_usuario: password,
                }),
            });

            // O token não vem mais aqui, ele está no cookie!
            // Salvamos apenas as informações do usuário.
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Redireciona com base no tipo de usuário
            if (data.tipo_cadastro === 'admin') {
                window.location.href = '../admin/dashboard.html';
            } else {
                window.location.href = '../conta/minha_conta.html';
            }

        } catch (error) {
            if (errorMessage) errorMessage.textContent = error.message;
            console.error('Erro no login:', error);
        }
    });
}