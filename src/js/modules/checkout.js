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

    // --- Variáveis de estado ---
    let cartData = null;
    let selectedAddressId = null;
    let userAddresses = []; // Armazena os endereços carregados

    /**
     * Renderiza o resumo do pedido com base nos dados do carrinho vindos da API.
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
            userAddresses = addresses; // Salva os endereços para uso posterior
            savedAddressesContainer.innerHTML = '';

            if (addresses.length > 0) {
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
                
                const principal = addresses.find(a => a.endereco_principal);
                if (principal) {
                    selectedAddressId = principal.id;
                }

                document.querySelectorAll('input[name="address"]').forEach(radio => {
                    radio.addEventListener('change', (e) => selectedAddressId = e.target.value);
                });

            } else {
                savedAddressesContainer.innerHTML = '<p>Nenhum endereço cadastrado. <a href="../conta/cadastrar-endereco.html" target="_blank">Adicione um endereço</a> antes de continuar.</p>';
                submitOrderBtn.disabled = true;
            }

        } catch (error) {
            console.error("Erro ao carregar endereços:", error);
            savedAddressesContainer.innerHTML = '<p>Não foi possível carregar seus endereços.</p>';
        }
    }
    
    /**
     * Lida com o envio do pedido para o backend e redireciona para o WhatsApp.
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
            // 1. Cria o pedido no backend de forma segura
            const createdOrderResponse = await fetchWithAuth('/api/pedidos', {
                method: 'POST',
                body: orderPayload // CORREÇÃO: Passa o objeto diretamente
            });

            // 2. Busca o número de WhatsApp do admin no backend
            const contactResponse = await fetch(`${API_BASE_URL}/api/site/contact-info`);
            if (!contactResponse.ok) {
                throw new Error('Não foi possível obter o contato da loja.');
            }
            const contactInfo = await contactResponse.json();
            const whatsappNumber = contactInfo.whatsappNumber;

            // 3. Prepara a mensagem para o WhatsApp
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
            
            // 4. Redireciona o usuário para o WhatsApp
            window.location.href = whatsappURL;

        } catch (error) {
            alert(`Erro: ${error.message}`);
            submitOrderBtn.textContent = 'Finalizar Pedido';
            submitOrderBtn.disabled = false;
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
            submitOrderBtn.addEventListener('click', submitOrder);
        } catch (error) {
            console.error('Erro ao inicializar o checkout:', error);
            document.body.innerHTML = '<h1>Erro ao carregar dados do checkout. Tente novamente mais tarde.</h1>';
        }
    }

    // --- Inicialização ---
    initCheckout();
});
