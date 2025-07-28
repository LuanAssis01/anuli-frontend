import { API_BASE_URL } from '../apiConfig.js';

async function fetchAndRenderSearchResults() {
    const productGrid = document.querySelector('.product-grid');
    const titleElement = document.getElementById('search-results-title');

    // 1. Pega o termo de busca da URL
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (!query) {
        titleElement.textContent = 'Nenhum termo de busca fornecido.';
        productGrid.innerHTML = '';
        return;
    }

    titleElement.textContent = `Resultados para: "${query}"`;
    productGrid.innerHTML = '<p>Buscando produtos...</p>';

    try {
        // 2. Chama a nova rota de busca da API
        const response = await fetch(`${API_BASE_URL}/api/produtos/search?q=${query}`);
        if (!response.ok) throw new Error('Falha na busca.');

        const products = await response.json();
        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = '<p>Nenhum produto encontrado com este termo.</p>';
            return;
        }

        // 3. Renderiza os cards de produto (lógica reutilizada)
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            const imageUrl = product.imagens && product.imagens.length > 0 ? `${API_BASE_URL}/${product.imagens[0].url}` : 'https://via.placeholder.com/300x300.png?text=Sem+Imagem';
            const price = parseFloat(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            card.innerHTML = `
                <div class="card-image"><a href="detalhes_produto.html?id=${product.id}"><img src="${imageUrl}" alt="${product.nome}"></a></div>
                <div class="card-content">
                    <div class="card-info-wrapper">
                        <span class="card-category">${product.categoria?.nome || 'Categoria'}</span>
                        <h4 class="card-title"><a href="detalhes_produto.html?id=${product.id}">${product.nome}</a></h4>
                        <p class="card-price">${price}</p>
                    </div>
                    <button type="button" class="btn btn-primary full-width add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>
                </div>`;
            productGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao realizar busca:', error);
        productGrid.innerHTML = '<p>Ocorreu um erro ao buscar os produtos.</p>';
    }
}

document.addEventListener('DOMContentLoaded', fetchAndRenderSearchResults);
