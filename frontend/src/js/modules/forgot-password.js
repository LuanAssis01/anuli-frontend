// frontend/src/js/modules/forgot-password.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const messageElement = document.getElementById('form-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        messageElement.textContent = 'Enviando...';

        try {
            const response = await fetch('http://127.0.0.1:3000/api/users/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email_usuario: email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao enviar o e-mail.');
            }

            messageElement.textContent = data.message;
            messageElement.className = 'success-text';
        } catch (error) {
            messageElement.textContent = error.message;
            messageElement.className = 'error-text';
        }
    });
});