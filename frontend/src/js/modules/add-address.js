import { API_BASE_URL } from '../apiConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    const addAddressForm = document.getElementById('add-address-form');

    if (addAddressForm) {
        addAddressForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // --- COLETA DE DADOS ---
            const formData = {
                titulo: document.getElementById('titulo').value,
                cep: document.getElementById('cep').value.replace(/\D/g, ''), // Remove não-números do CEP
                rua: document.getElementById('rua').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value,
            };

            // --- VALIDAÇÃO NO FRONTEND ---
            if (!/^\d{8}$/.test(formData.cep)) {
                alert('CEP inválido. Deve conter 8 números.');
                return;
            }
            if (!/^[a-zA-Z\sÀ-ú]+$/.test(formData.cidade)) {
                alert('Cidade inválida. Deve conter apenas letras e espaços.');
                return;
            }

            // --- LÓGICA DE ENVIO ---
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = localStorage.getItem('authToken');

            const payload = {
                ...formData,
                usuario_id: userInfo.id,
                pais: 'Brasil',
                endereco_principal: false
            };

            try {
                const response = await fetch(`${API_BASE_URL}/api/enderecos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao salvar o endereço.');
                }
                window.location.href = 'meus_enderecos.html'; 
            } catch (error) {
                console.error('Erro no formulário de endereço:', error);
                alert(error.message);
            }
        });
    }
});
