import { fetchAndRenderProducts } from './productList.js';
import { handleAddToCart } from './productCard.js';

/**
 * Função principal que inicializa a página inicial.
 */
function initHomepage() {
    const featuredGrid = document.getElementById('featured-products-grid');
    
    // Carrega os 4 produtos em destaque
    if (featuredGrid) {
        fetchAndRenderProducts(featuredGrid, 4);
        
        // Adiciona o listener para os botões "Adicionar ao Carrinho" nesta seção
        featuredGrid.addEventListener('click', handleAddToCart);
    }
}

document.addEventListener('DOMContentLoaded', initHomepage);