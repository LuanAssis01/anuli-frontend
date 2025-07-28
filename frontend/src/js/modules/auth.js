const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://127.0.0.1:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email_usuario: email,
                senha_usuario: password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            errorMessage.textContent = data.message || 'Erro ao fazer login.';
            return;
        }

        console.log('Login bem-sucedido:', data);

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));

        if (data.user && data.user.tipo_cadastro === 'admin') {
            window.location.href = '../admin/dashboard.html';
        } else {
            window.location.href = '../conta/minha_conta.html';
        }

    } catch (error) {
        console.error('Erro na requisição:', error);
        errorMessage.textContent = 'Não foi possível conectar ao servidor. Tente novamente.';
    }
});