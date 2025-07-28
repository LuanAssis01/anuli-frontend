// frontend/src/js/modules/product-detail.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Pega o ID do produto da URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    // Seleciona os elementos que vamos preencher
    const container = document.querySelector('.product-page-container');
    const mainImage = document.getElementById('main-product-image');
    const thumbnailsContainer = document.querySelector('.thumbnail-images');
    const categoryElement = document.getElementById('product-category-detail');
    const titleElement = document.getElementById('product-title-detail');
    const priceElement = document.getElementById('product-price-detail');
    const descriptionElement = document.getElementById('product-short-description');

    if (!productId) {
        container.innerHTML = '<h1>Produto não encontrado.</h1>';
        return;
    }

    try {
        // 2. Busca os dados do produto específico na API
        const response = await fetch(`http://127.0.0.1:3000/api/produtos/${productId}`);
        if (!response.ok) {
            throw new Error('Produto não encontrado.');
        }
        const product = await response.json();

        // 3. Preenche a página com os dados
        document.title = `${product.nome} - Anuli Acessórios`;
        categoryElement.textContent = product.categoria?.nome || 'Categoria';
        titleElement.textContent = product.nome;
        priceElement.textContent = parseFloat(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        descriptionElement.textContent = product.descricao;
        
        // 4. Preenche a galeria de imagens
        if (product.imagens && product.imagens.length > 0) {
            mainImage.src = `http://127.0.0.1:3000/${product.imagens[0].url}`;
            mainImage.alt = product.nome;

            thumbnailsContainer.innerHTML = '';
            product.imagens.forEach((image, index) => {
                const thumb = document.createElement('img');
                thumb.src = `http://127.0.0.1:3000/${image.url}`;
                thumb.alt = `Thumbnail ${index + 1}`;
                thumb.className = 'thumbnail';
                if (index === 0) {
                    thumb.classList.add('active');
                }
                
                thumb.addEventListener('click', () => {
                    mainImage.src = thumb.src;
                    const currentActive = document.querySelector('.thumbnail.active');
                    if (currentActive) {
                        currentActive.classList.remove('active');
                    }
                    thumb.classList.add('active');
                });

                thumbnailsContainer.appendChild(thumb);
            });
        }

        const addToCartButton = document.querySelector('.btn-add-to-cart');
        const quantityInput = document.querySelector('.quantity-selector input');

        if (addToCartButton) {
            addToCartButton.addEventListener('click', () => {
                // 1. Pega o carrinho atual do localStorage, ou cria um array vazio se não existir
                let cart = JSON.parse(localStorage.getItem('cart')) || [];

                // 2. Pega a quantidade selecionada
                const quantity = parseInt(quantityInput.value);

                // 3. Verifica se o produto já está no carrinho
                const existingProductIndex = cart.findIndex(item => item.id === product.id);

                if (existingProductIndex > -1) {
                    // Se já existe, apenas atualiza a quantidade
                    cart[existingProductIndex].quantity += quantity;
                } else {
                    // Se não existe, adiciona o novo produto
                    cart.push({
                        id: product.id,
                        name: product.nome,
                        price: product.preco,
                        quantity: quantity,
                        image: (product.imagens && product.imagens.length > 0) ? product.imagens[0].url : ''
                    });
                }

                // 4. Salva o carrinho atualizado de volta no localStorage
                localStorage.setItem('cart', JSON.stringify(cart));

                // 5. Dá um feedback visual para o usuário
                addToCartButton.textContent = 'Adicionado!';
                setTimeout(() => {
                    addToCartButton.textContent = 'Adicionar ao Carrinho';
                }, 2000); // Volta ao texto original depois de 2 segundos

                console.log('Carrinho atualizado:', cart);
                alert('Produto adicionado ao carrinho!');
            });
        }

    } catch (error) {
        console.error('Erro ao carregar detalhes do produto:', error);
        container.innerHTML = `<h1>Erro ao carregar produto.</h1><p>${error.message}</p>`;
    }

    // 5. LÓGICA DO SELETOR DE QUANTIDADE
    const quantityInput = document.querySelector('.quantity-selector input');
    const minusBtn = document.querySelector('.quantity-selector button:first-child');
    const plusBtn = document.querySelector('.quantity-selector button:last-child');

    if(quantityInput && minusBtn && plusBtn) {
        minusBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }
});