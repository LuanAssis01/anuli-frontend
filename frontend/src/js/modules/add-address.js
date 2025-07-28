// frontend/src/js/modules/add-address.js

document.addEventListener('DOMContentLoaded', () => {
    const addAddressForm = document.getElementById('add-address-form');

    if (addAddressForm) {
        addAddressForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = localStorage.getItem('authToken');

            if (!userInfo) {
                alert('Você precisa estar logado para adicionar um endereço.');
                return;
            }

            const formData = {
                usuario_id: userInfo.id,
                titulo: document.getElementById('titulo').value,
                cep: document.getElementById('cep').value,
                rua: document.getElementById('rua').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                estado: 'Pará',
                // O modelo espera 'pais' e 'endereco_principal', vamos adicionar valores padrão
                pais: 'Brasil',
                endereco_principal: false // Pode ser ajustado conforme sua lógica
            };

            try {
                const response = await fetch('http://localhost:3000/api/enderecos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Erro ao salvar o endereço.');
                }
                
                // Redireciona de volta para a lista de endereços após o sucesso
                window.location.href = 'meus_enderecos.html'; 

            } catch (error) {
                console.error('Erro no formulário de endereço:', error);
                alert(error.message);
            }
        });
    }
});