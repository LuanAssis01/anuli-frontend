// src/js/modules/addresses.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';

/**
 * Função principal que carrega e exibe os endereços do usuário.
 */
async function loadAddresses() {
    // Verifica se o usuário está logado antes de prosseguir
    if (!authManager.isLoggedIn()) {
        window.location.href = '/frontend/src/html/auth/login.html';
        return;
    }

    const addressesGrid = document.getElementById('addresses-grid');
    if (!addressesGrid) return;

    try {
        // Usa a nova rota segura que obtém os endereços do usuário logado
        const addresses = await fetchWithAuth('/api/enderecos');

        addressesGrid.innerHTML = ''; // Limpa o conteúdo antigo

        if (addresses.length === 0) {
            addressesGrid.innerHTML = '<p>Nenhum endereço cadastrado. <a href="cadastrar-endereco.html">Adicionar novo endereço</a></p>';
        } else {
            addresses.forEach(address => {
                const card = createAddressCard(address);
                addressesGrid.appendChild(card);
            });
        }

    } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        addressesGrid.innerHTML = '<p>Não foi possível carregar seus endereços. Tente novamente.</p>';
    }
}

/**
 * Cria o HTML para um único card de endereço.
 * @param {object} address - O objeto de endereço.
 * @returns {HTMLElement} - O elemento do card.
 */
function createAddressCard(address) {
    const card = document.createElement('div');
    card.className = 'address-card';
    card.dataset.id = address.id; // Adiciona o ID ao elemento para fácil acesso

    // Adiciona uma classe especial se for o endereço principal
    if (address.endereco_principal) {
        card.classList.add('principal');
    }

    card.innerHTML = `
        ${address.endereco_principal ? '<span class="principal-badge">Principal</span>' : ''}
        <h4>${address.titulo || 'Endereço'}</h4>
        <p>
            ${address.rua}, ${address.numero}<br>
            ${address.complemento ? address.complemento + '<br>' : ''}
            ${address.bairro}<br>
            ${address.cidade}, ${address.estado} - ${address.cep}
        </p>
        <div class="address-actions">
            <button class="action-link-edit">Editar</button>
            <button class="action-link-delete">Excluir</button>
            ${!address.endereco_principal ? '<button class="action-link-principal">Definir como Principal</button>' : ''}
        </div>
    `;

    // Adiciona os event listeners para os botões do card
    card.querySelector('.action-link-edit').addEventListener('click', () => {
        // Redireciona para a página de edição com o ID do endereço
        window.location.href = `editar-endereco.html?id=${address.id}`;
    });

    card.querySelector('.action-link-delete').addEventListener('click', () => handleDeleteAddress(address.id));
    
    const principalButton = card.querySelector('.action-link-principal');
    if (principalButton) {
        principalButton.addEventListener('click', () => handleSetPrincipal(address.id));
    }

    return card;
}

/**
 * Lida com a exclusão de um endereço.
 * @param {number} addressId - O ID do endereço a ser excluído.
 */
async function handleDeleteAddress(addressId) {
    // Usamos um 'confirm' simples aqui, mas um modal customizado seria ideal
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
        try {
            await fetchWithAuth(`/api/enderecos/${addressId}`, { method: 'DELETE' });
            loadAddresses(); // Recarrega a lista de endereços
        } catch (error) {
            alert(error.message);
            console.error('Erro ao excluir endereço:', error);
        }
    }
}

/**
 * Define um endereço como o principal.
 * @param {number} addressId - O ID do endereço.
 */
async function handleSetPrincipal(addressId) {
    try {
        await fetchWithAuth(`/api/enderecos/${addressId}/principal`, { method: 'PATCH' });
        loadAddresses(); // Recarrega a lista para mostrar a mudança
    } catch (error) {
        alert(error.message);
        console.error('Erro ao definir endereço principal:', error);
    }
}


// Inicia o processo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', loadAddresses);
