// frontend/src/js/modules/addresses.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const addressesGrid = document.getElementById('addresses-grid'); // O container dos cards
    
    if (!userInfo || !addressesGrid) {
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:3000/api/enderecos/usuario/${userInfo.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar endereços.');
        }

        const addresses = await response.json();
        
        addressesGrid.innerHTML = ''; 

        if (addresses.length === 0) {
            addressesGrid.innerHTML = '<p>Nenhum endereço cadastrado.</p>';
        } else {
            addresses.forEach(address => {
                const card = document.createElement('div');
                card.className = 'address-card';

                card.innerHTML = `
                    <h4>${address.titulo || 'Endereço'}</h4>
                    <p>
                        ${address.rua}, ${address.numero}<br>
                        ${address.complemento ? address.complemento + '<br>' : ''}
                        ${address.bairro}<br>
                        ${address.cidade}, ${address.estado} - ${address.cep}
                    </p>
                    <div class="address-actions">
                        <a href="#" class="action-link-edit">Editar</a>
                        <a href="#" class="action-link-delete">Excluir</a>
                    </div>
                `;
                
                addressesGrid.appendChild(card);
            });
        }

    } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        addressesGrid.innerHTML = '<p>Não foi possível carregar seus endereços. Tente novamente.</p>';
    }
});