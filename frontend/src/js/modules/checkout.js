// frontend/src/js/modules/checkout.js
import { API_BASE_URL } from '../apiConfig.js';

document.addEventListener('DOMContentLoaded', async () => {
    // --- Seleção de Elementos ---
    const savedAddressesContainer = document.getElementById('saved-addresses-container');
    const addNewAddressBtn = document.getElementById('add-new-address-btn');
    const newAddressFormContainer = document.getElementById('new-address-form-container');
    const submitOrderBtn = document.getElementById('submit-order-btn');
    const summaryItemsContainer = document.getElementById('checkout-summary-items');
    const totalValueElement = document.getElementById('checkout-total-value');
    
    // --- Pega dados do localStorage ---
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // --- Variáveis de estado ---
    let selectedAddressId = null;

    // --- Validação Inicial ---
    if (!token || !userInfo) {
        alert('Você precisa estar logado para finalizar a compra.');
        window.location.href = '../auth/login.html';
        return;
    }
    if (cart.length === 0) {
        window.location.href = 'carrinho_compras.html';
        return;
    }

    // --- Funções Auxiliares ---

    // Renderiza o resumo do pedido
    function renderSummary() {
        summaryItemsContainer.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const imageUrl = `${API_BASE_URL}/${item.image}`;
            const itemHTML = `
                <div class="summary-item">
                    <img src="${imageUrl}" alt="${item.name}">
                    <div class="summary-item-details">
                        <p>${item.name} (x${item.quantity})</p>
                        <p>${itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>`;
            summaryItemsContainer.innerHTML += itemHTML;
        });
        totalValueElement.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Carrega e exibe os endereços salvos
    async function loadAddresses() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/enderecos/usuario/${userInfo.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const addresses = await response.json();

            savedAddressesContainer.innerHTML = '';

            if (addresses.length > 0) {
                addresses.forEach((address, index) => {
                    const addressElement = document.createElement('div');
                    addressElement.className = 'address-option';
                    addressElement.innerHTML = `
                        <input type="radio" name="address" id="address-${address.id}" value="${address.id}">
                        <label for="address-${address.id}">
                            <strong>${address.titulo || `Endereço ${index + 1}`}</strong>
                            <p>${address.rua}, ${address.numero} - ${address.bairro}</p>
                            <p>${address.cidade}, ${address.estado} - CEP: ${address.cep}</p>
                        </label>
                    `;
                    savedAddressesContainer.appendChild(addressElement);
                });

                document.querySelectorAll('input[name="address"]').forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        selectedAddressId = e.target.value;
                        newAddressFormContainer.classList.add('hidden');
                    });
                });

            } else {
                newAddressFormContainer.classList.remove('hidden');
                addNewAddressBtn.style.display = 'none';
            }

        } catch (error) {
            console.error("Erro ao carregar endereços:", error);
            savedAddressesContainer.innerHTML = '<p>Não foi possível carregar seus endereços.</p>';
        }
    }
    
    // --- Lógica de Envio do Pedido ---
    async function submitOrder() {
        submitOrderBtn.textContent = 'Processando...';
        submitOrderBtn.disabled = true;

        const orderPayload = {
            usuario_id: userInfo.id,
            valor_total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'aguardando_pagamento',
            itens: cart,
        };
        
        if (selectedAddressId) {
            orderPayload.endereco_entrega_id = selectedAddressId;
        } else {
            const newAddressData = {
                rua: document.getElementById('checkout-street').value,
                numero: document.getElementById('checkout-number').value,
                complemento: document.getElementById('checkout-complement').value,
                bairro: document.getElementById('checkout-neighborhood').value,
                cidade: document.getElementById('checkout-city').value,
                estado: document.getElementById('checkout-state').value,
                cep: document.getElementById('checkout-cep').value,
            };
            // Validação simples
            if(!newAddressData.rua || !newAddressData.numero || !newAddressData.bairro || !newAddressData.cidade || !newAddressData.estado || !newAddressData.cep){
                alert('Por favor, preencha todos os campos do novo endereço.');
                submitOrderBtn.textContent = 'Finalizar Pedido no WhatsApp';
                submitOrderBtn.disabled = false;
                return;
            }
            orderPayload.endereco_novo = newAddressData;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(orderPayload)
            });
            const createdOrder = await response.json();
            if (!response.ok) throw new Error(createdOrder.message || 'Erro ao criar o pedido.');
            
            const customerName = document.getElementById('checkout-name').value;
            const customerPhone = document.getElementById('checkout-phone').value;
            let total = orderPayload.valor_total;

            let message = `Olá! Gostaria de finalizar meu pedido *#${createdOrder.id}* pelo site.\n\n*Cliente:* ${customerName}\n*Contato:* ${customerPhone}\n\n*Itens:*\n`;
            cart.forEach(item => { message += `- ${item.name} (x${item.quantity})\n`; });
            message += `\n*Total:* ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n`;
            
            if(selectedAddressId) {
                message += `*Entregar no endereço cadastrado.*\n\n`;
            } else {
                message += `*Endereço de Entrega:*\n${orderPayload.endereco_novo.rua}, ${orderPayload.endereco_novo.numero}\n${orderPayload.endereco_novo.cidade}, ${orderPayload.endereco_novo.estado} - CEP: ${orderPayload.endereco_novo.cep}\n\n`;
            }
            message += `Aguardo as instruções para o pagamento. Obrigado!`;
            
            const whatsappNumber = '5594992078960'; // SEU NÚMERO
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

            localStorage.removeItem('cart');
            window.location.href = whatsappURL;

        } catch (error) {
            alert(`Erro: ${error.message}`);
            submitOrderBtn.textContent = 'Finalizar Pedido no WhatsApp';
            submitOrderBtn.disabled = false;
        }
    }

    // --- Adiciona os Event Listeners ---
    addNewAddressBtn.addEventListener('click', () => {
        newAddressFormContainer.classList.toggle('hidden');
        selectedAddressId = null;
        document.querySelectorAll('input[name="address"]').forEach(radio => radio.checked = false);
    });

    submitOrderBtn.addEventListener('click', submitOrder);

    // --- Inicialização ---
    renderSummary();
    await loadAddresses();
    
    document.getElementById('checkout-name').value = userInfo.nome_usuario || '';
});
