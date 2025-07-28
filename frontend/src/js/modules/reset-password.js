// frontend/src/js/modules/reset-password.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const messageElement = document.getElementById('form-message');
    
    // Pega o token da URL da página
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        messageElement.textContent = 'Token de recuperação não encontrado.';
        messageElement.className = 'error-text';
        form.style.display = 'none'; // Esconde o formulário se não houver token
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            messageElement.textContent = 'As senhas não coincidem.';
            messageElement.className = 'error-text';
            return;
        }

        messageElement.textContent = 'Salvando...';

        try {
            const response = await fetch(`http://127.0.0.1:3000/api/users/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nova_senha: newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao redefinir a senha.');
            }

            messageElement.textContent = `${data.message} Você será redirecionado para o login.`;
            messageElement.className = 'success-text';

            // Redireciona para o login após 3 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        } catch (error) {
            messageElement.textContent = error.message;
            messageElement.className = 'error-text';
        }
    });
});