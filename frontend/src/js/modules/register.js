import { API_BASE_URL } from '../apiConfig.js';

const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('phone').value;
    const senha = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (senha !== confirmPassword) {
        errorMessage.textContent = 'As senhas não coincidem.';
        return;
    }

    try {
        // CORREÇÃO: Removida a barra '/' do final
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_usuario: nome,
                email_usuario: email,
                senha_usuario: senha,
                telefone_usuario: telefone,
                data_cadastro: new Date().toISOString(),
                tipo_cadastro: 'cliente'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorMessage.textContent = data.message || 'Erro ao criar conta.';
            return;
        }

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));

        window.location.href = '../conta/minha_conta.html';

    } catch (error) {
        console.error('Erro na requisição de cadastro:', error);
        errorMessage.textContent = 'Não foi possível conectar ao servidor. Tente novamente.';
    }
});