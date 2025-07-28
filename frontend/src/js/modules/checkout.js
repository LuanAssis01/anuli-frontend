import { API_BASE_URL } from '../apiConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    const summaryItemsContainer = document.getElementById('checkout-summary-items');
    const totalValueElement = document.getElementById('checkout-total-value');
    const submitButton = document.getElementById('whatsapp-button');

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        alert('Seu carrinho está vazio.');
        window.location.href = 'carrinho_compras.html';
        return;
    }

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

    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.textContent = 'Processando...';
        submitButton.disabled = true;

        const token = localStorage.getItem('authToken');
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        const addressData = {
            rua: document.getElementById('checkout-street').value,
            numero: document.getElementById('checkout-number').value,
            complemento: document.getElementById('checkout-complement').value,
            bairro: document.getElementById('checkout-neighborhood').value,
            cidade: document.getElementById('checkout-city').value,
            estado: document.getElementById('checkout-state').value,
            cep: document.getElementById('checkout-cep').value,
        };

        const orderPayload = {
            usuario_id: userInfo.id,
            valor_total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'aguardando_pagamento',
            itens: cart,
            endereco_entrega: addressData
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(orderPayload)
            });

            const createdOrder = await response.json();

            if (!response.ok) {
                throw new Error(createdOrder.message || 'Não foi possível registrar seu pedido.');
            }

            const customerName = document.getElementById('checkout-name').value;
            let message = `Olá! Acabei de finalizar o pedido *#${createdOrder.id}* pelo site.\n\n*Cliente:* ${customerName}\n\n*Itens do Pedido:*\n`;
            cart.forEach(item => { message += `- ${item.name} (x${item.quantity})\n`; });
            message += `\n*Total:* ${orderPayload.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n`;
            message += `*Endereço de Entrega:*\n`;
            message += `${addressData.rua}, ${addressData.numero} - ${addressData.bairro}\n`;
            message += `${addressData.cidade}, ${addressData.estado} - CEP: ${addressData.cep}\n\n`;
            message += `Aguardo as instruções para o pagamento. Obrigado!`;

            const whatsappNumber = '5594992078960'; // SEU NÚMERO
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

            localStorage.removeItem('cart');
            window.location.href = whatsappURL;

        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            alert(`Erro: ${error.message}`);
            submitButton.textContent = 'Finalizar Pedido no WhatsApp';
            submitButton.disabled = false;
        }
    });

    renderSummary();
});