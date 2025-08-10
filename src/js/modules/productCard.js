import { authManager } from './authManager.js';
import { fetchWithAuth } from '../apiService.js';

/**
 * Cria o elemento HTML para um único card de produto.
 * @param {object} product - O objeto do produto.
 * @returns {HTMLElement}
 */
export function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageUrl = product.imagens && product.imagens.length > 0
        ? product.imagens[0].url
        : 'https://placehold.co/300x300/eee/ccc?text=Sem+Imagem';
    
    const price = parseFloat(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    card.innerHTML = `
        <div class="card-image">
            <a href="/src/html/detalhes_produto.html?id=${product.id}">
                <img src="${imageUrl}" alt="${product.nome}">
            </a>
        </div>
        <div class="card-content">
            <div class="card-info-wrapper">
                <span class="card-category">${product.categoria?.nome || 'Categoria'}</span>
                <h4 class="card-title"><a href="/src/html/detalhes_produto.html?id=${product.id}">${product.nome}</a></h4>
                <p class="card-price">${price}</p>
            </div>
            <button type="button" class="btn btn-primary full-width add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>
        </div>
    `;
    return card;
}

/**
 * Lida com o clique no botão "Adicionar ao Carrinho".
 * @param {Event} event - O evento de clique.
 */
export async function handleAddToCart(event) {
    if (!event.target.matches('.add-to-cart-btn')) return;

    if (!authManager.isLoggedIn()) {
        alert('Você precisa estar logado para adicionar produtos ao carrinho.');
        window.location.href = '/src/html/auth/login.html';
        return;
    }

    const button = event.target;
    const productId = parseInt(button.dataset.productId);
    
    button.textContent = 'Adicionando...';
    button.disabled = true;

    try {
        await fetchWithAuth('/api/carrinho/items', {
            method: 'POST',
            body: { produto_id: productId, quantidade: 1 }
        });

        button.textContent = 'Adicionado!';
        setTimeout(() => {
            button.textContent = 'Adicionar ao Carrinho';
            button.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        alert(error.message);
        button.textContent = 'Adicionar ao Carrinho';
        button.disabled = false;
    }
}