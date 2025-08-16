import { API_BASE_URL } from '../apiConfig.js';
import { createProductCard, handleAddToCart } from './productCard.js'; // Assumindo que você centralizou as funções

/**
 * Busca e renderiza os produtos em destaque na página inicial.
 */
async function fetchFeaturedProducts() {
    const featuredGrid = document.getElementById('featured-products-grid');
    if (!featuredGrid) return;

    featuredGrid.innerHTML = '<p>Carregando produtos...</p>';

    try {
        // ⭐ CHAMA A NOVA ROTA DE DESTAQUES ⭐
        const response = await fetch(`${API_BASE_URL}/api/produtos/destaques`);
        if (!response.ok) throw new Error('Falha ao buscar produtos em destaque');

        const products = await response.json();
        featuredGrid.innerHTML = ''; // Limpa a mensagem de carregamento

        if (products.length === 0) {
            featuredGrid.innerHTML = '<p>Nenhum produto em destaque no momento.</p>';
            return;
        }

        products.forEach(product => {
            const card = createProductCard(product); // Reutiliza a função de criar card
            featuredGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
        featuredGrid.innerHTML = '<p>Não foi possível carregar os produtos em destaque.</p>';
    }
}

/**
 * Função principal que inicializa a página inicial.
 */
function initHomepage() {
    const featuredGrid = document.getElementById('featured-products-grid');
    
    if (featuredGrid) {
        fetchFeaturedProducts();
        
        // Adiciona o listener para os botões "Adicionar ao Carrinho" nesta seção
        featuredGrid.addEventListener('click', handleAddToCart);
    }
}

document.addEventListener('DOMContentLoaded', initHomepage);