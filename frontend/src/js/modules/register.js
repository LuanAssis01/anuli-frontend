import { fetchWithAuth } from '../apiService.js';

const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const nome = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('phone').value;
        const senha = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (senha !== confirmPassword) {
            if (errorMessage) errorMessage.textContent = 'As senhas não coincidem.';
            return;
        }

        try {
            // A chamada agora usa o fetchWithAuth
            const userData = await fetchWithAuth('/api/users', {
                method: 'POST',
                body: JSON.stringify({
                    nome_usuario: nome,
                    email_usuario: email,
                    senha_usuario: senha,
                    telefone_usuario: telefone,
                })
            });

            localStorage.setItem('userInfo', JSON.stringify(userData));
            

            window.location.href = '../conta/minha_conta.html';

        } catch (error) {
            if (errorMessage) errorMessage.textContent = error.message;
            console.error('Erro no cadastro:', error);
        }
    });
}
