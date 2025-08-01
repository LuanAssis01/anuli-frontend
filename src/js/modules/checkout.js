// src/js/modules/checkout.js

import { fetchWithAuth } from '../apiService.js';
import { authManager } from './authManager.js';
import { API_BASE_URL } from '../apiConfig.js';

document.addEventListener('DOMContentLoaded', async () => {
    // --- Validação Inicial ---
    if (!authManager.isLoggedIn()) {
        alert('Você precisa estar logado para finalizar a compra.');
        window.location.href = '/src/html/auth/login.html';
        return;
    }

    // --- Seleção de Elementos ---
    const savedAddressesContainer = document.getElementById('saved-addresses-container');
    const submitOrderBtn = document.getElementById('submit-order-btn');
    const summaryItemsContainer = document.getElementById('checkout-summary-items');
    const totalValueElement = document.getElementById('checkout-total-value');
    const userNameInput = document.getElementById('checkout-name');
    
    // --- Elementos do Novo Formulário de Endereço ---
    const addNewAddressBtn = document.getElementById('add-new-address-btn');
    const newAddressFormContainer = document.getElementById('new-address-form-container');
    const newAddressForm = document.getElementById('new-address-form');

    // --- Variáveis de estado ---
    let cartData = null;
    let selectedAddressId = null;
    let userAddresses = [];

    /**
     * Renderiza o resumo do pedido.
     */
    function renderSummary() {
        summaryItemsContainer.innerHTML = '';
        if (!cartData || cartData.itens.length === 0) return;

        cartData.itens.forEach(item => {
            const produto = item.produto;
            const itemTotal = item.preco_unitario * item.quantidade;
            const imageUrl = produto.imagens && produto.imagens.length > 0
                ? `${API_BASE_URL}/${produto.imagens[0].url}`
                : 'https://placehold.co/60x60/eee/ccc?text=Produto';

            const itemHTML = `
                <div class="summary-item">
                    <img src="${imageUrl}" alt="${produto.nome}">
                    <div class="summary-item-details">
                        <p>${produto.nome} (x${item.quantidade})</p>
                        <p>${itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>`;
            summaryItemsContainer.innerHTML += itemHTML;
        });
        totalValueElement.textContent = cartData.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    /**
     * Carrega e exibe os endereços salvos do usuário.
     */
    async function loadAddresses() {
        try {
            const addresses = await fetchWithAuth('/api/enderecos');
            userAddresses = addresses;
            savedAddressesContainer.innerHTML = '';

            if (addresses.length > 0) {
                // ⭐ CORREÇÃO 1: Habilita o botão de finalizar o pedido.
                if (submitOrderBtn) submitOrderBtn.disabled = false;

                addresses.forEach(address => {
                    const addressElement = document.createElement('div');
                    addressElement.className = 'address-option';
                    addressElement.innerHTML = `
                        <input type="radio" name="address" id="address-${address.id}" value="${address.id}" ${address.endereco_principal ? 'checked' : ''}>
                        <label for="address-${address.id}">
                            <strong>${address.titulo || `Endereço`}</strong>
                            <p>${address.rua}, ${address.numero} - ${address.bairro}</p>
                            <p>${address.cidade}, ${address.estado} - CEP: ${address.cep}</p>
                        </label>
                    `;
                    savedAddressesContainer.appendChild(addressElement);
                });
                
                // ⭐ CORREÇÃO 2: Garante que um endereço esteja sempre selecionado.
                const principal = addresses.find(a => a.endereco_principal);
                if (principal) {
                    selectedAddressId = principal.id;
                } else if (addresses.length > 0) {
                    // Se não houver endereço principal, seleciona o primeiro da lista.
                    selectedAddressId = addresses[0].id;
                    const firstRadio = document.getElementById(`address-${addresses[0].id}`);
                    if (firstRadio) firstRadio.checked = true;
                }

                document.querySelectorAll('input[name="address"]').forEach(radio => {
                    radio.addEventListener('change', (e) => selectedAddressId = e.target.value);
                });

            } else {
                savedAddressesContainer.innerHTML = '<p>Nenhum endereço cadastrado.</p>';
                newAddressFormContainer.classList.remove('hidden');
                addNewAddressBtn.style.display = 'none';
                if (submitOrderBtn) submitOrderBtn.disabled = true;
            }

        } catch (error) {
            console.error("Erro ao carregar endereços:", error);
            savedAddressesContainer.innerHTML = '<p>Não foi possível carregar seus endereços.</p>';
        }
    }
    
    /**
     * Lida com o envio do pedido para o backend.
     */
    async function submitOrder() {
        if (!selectedAddressId) {
            alert('Por favor, selecione um endereço de entrega.');
            return;
        }

        submitOrderBtn.textContent = 'Processando...';
        submitOrderBtn.disabled = true;

        const orderPayload = {
            endereco_id: selectedAddressId,
            itens: cartData.itens.map(item => ({
                produto_id: item.produto.id,
                quantidade: item.quantidade
            }))
        };

        try {
            const createdOrderResponse = await fetchWithAuth('/api/pedidos', {
                method: 'POST',
                body: orderPayload
            });

            const contactResponse = await fetch(`${API_BASE_URL}/api/site/contact-info`);
            if (!contactResponse.ok) throw new Error('Não foi possível obter o contato da loja.');
            
            const contactInfo = await contactResponse.json();
            const whatsappNumber = contactInfo.whatsappNumber;
            const customerName = userNameInput.value || authManager.getUser().nome_usuario;
            const total = cartData.total;
            const pedidoId = createdOrderResponse.pedidoId;
            const selectedAddress = userAddresses.find(addr => addr.id == selectedAddressId);

            let message = `Olá! Gostaria de finalizar meu pedido *#${pedidoId}* pelo site.\n\n*Cliente:* ${customerName}\n\n*Itens:*\n`;
            cartData.itens.forEach(item => {
                message += `- ${item.produto.nome} (x${item.quantidade})\n`;
            });
            message += `\n*Total:* ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n`;
            
            if (selectedAddress) {
                message += `*Endereço de Entrega:*\n${selectedAddress.rua}, ${selectedAddress.numero}\n${selectedAddress.cidade}, ${selectedAddress.estado} - CEP: ${selectedAddress.cep}\n\n`;
            }
            message += `Aguardo as instruções para o pagamento. Obrigado!`;
            
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.location.href = whatsappURL;

        } catch (error) {
            alert(`Erro: ${error.message}`);
            submitOrderBtn.textContent = 'Finalizar Pedido';
            submitOrderBtn.disabled = false;
        }
    }

    /**
     * Lida com o envio do formulário de novo endereço.
     */
    async function handleNewAddressSubmit(event) {
        event.preventDefault();
        const errorElement = document.getElementById('new-address-error');
        if(errorElement) errorElement.textContent = '';

        const payload = {
            titulo: document.getElementById('new-titulo').value,
            cep: document.getElementById('new-cep').value,
            rua: document.getElementById('new-rua').value,
            numero: document.getElementById('new-numero').value,
            complemento: document.getElementById('new-complemento').value,
            bairro: document.getElementById('new-bairro').value,
            cidade: document.getElementById('new-cidade').value,
            estado: document.getElementById('new-estado').value,
        };

        try {
            await fetchWithAuth('/api/enderecos', {
                method: 'POST',
                body: payload
            });
            
            newAddressFormContainer.classList.add('hidden');
            addNewAddressBtn.style.display = 'block';
            await loadAddresses();

        } catch (error) {
            if(errorElement) errorElement.textContent = error.message;
            console.error('Erro ao salvar novo endereço:', error);
        }
    }

    /**
     * Função de inicialização da página de checkout.
     */
    async function initCheckout() {
        const user = authManager.getUser();
        if (userNameInput && user) {
            userNameInput.value = user.nome_usuario;
        }

        try {
            cartData = await fetchWithAuth('/api/carrinho');
            if (!cartData || cartData.itens.length === 0) {
                alert('Seu carrinho está vazio.');
                window.location.href = 'carrinho_compras.html';
                return;
            }
            renderSummary();
            await loadAddresses();
            
            // --- Adiciona os Event Listeners ---
            submitOrderBtn.addEventListener('click', submitOrder);
            if (addNewAddressBtn) {
                addNewAddressBtn.addEventListener('click', () => {
                    newAddressFormContainer.classList.toggle('hidden');
                });
            }
            if (newAddressForm) {
                newAddressForm.addEventListener('submit', handleNewAddressSubmit);
            }

        } catch (error) {
            console.error('Erro ao inicializar o checkout:', error);
            document.body.innerHTML = '<h1>Erro ao carregar dados do checkout. Tente novamente mais tarde.</h1>';
        }
    }

    // --- Inicialização ---
    initCheckout();
});
