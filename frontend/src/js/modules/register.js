// src/js/modules/register.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js'; // Importa o authManager

const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (errorMessage) errorMessage.textContent = ''; // Limpa erros antigos

        // Coleta os dados do formulário
        const nome = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('phone').value;
        const senha = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validação simples no frontend
        if (senha !== confirmPassword) {
            if (errorMessage) errorMessage.textContent = 'As senhas não coincidem.';
            return;
        }

        try {
            // A rota de criação de usuário é pública. O backend criará o usuário
            // e retornará os dados junto com o cookie de autenticação.
            const responseData = await fetchWithAuth('/api/users', {
                method: 'POST',
                body: JSON.stringify({
                    nome_usuario: nome,
                    email_usuario: email,
                    senha_usuario: senha,
                    telefone_usuario: telefone,
                })
            });

            // A API retorna um objeto { user: { ... } }
            const user = responseData.user;

            // ⭐ CORREÇÃO: Usa o authManager para salvar a sessão do usuário
            authManager.login(user);
            
            // Redireciona para a página da conta, pois o usuário já está logado.
            window.location.href = '../conta/minha_conta.html';

        } catch (error) {
            if (errorMessage) errorMessage.textContent = error.message;
            console.error('Erro no cadastro:', error);
        }
    });
}
