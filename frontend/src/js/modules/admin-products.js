// frontend/src/js/modules/admin-products.js

// Função de segurança para verificar se o usuário é admin
function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!token || userInfo?.tipo_cadastro !== 'admin') {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = '../auth/login.html'; 
        return false;
    }
    return true;
}

// Função para buscar e renderizar os produtos na tabela
async function fetchAndRenderAdminProducts() {
    const tableBody = document.getElementById('admin-products-tbody');
    if (!tableBody) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://127.0.0.1:3000/api/produtos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Falha ao buscar produtos.');

        const products = await response.json();
        tableBody.innerHTML = ''; // Limpa o conteúdo estático

        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            
            let stockStatusClass = 'stock-ok';
            if (product.quantidade_estoque <= 5 && product.quantidade_estoque > 0) {
                stockStatusClass = 'stock-low';
            } else if (product.quantidade_estoque === 0) {
                stockStatusClass = 'stock-out';
            }

            const imageUrl = product.imagens && product.imagens.length > 0
                ? `http://127.0.0.1:3000/${product.imagens[0].url}`
                : 'https://via.placeholder.com/60x60.png?text=N/A';

            row.innerHTML = `
                <td>
                    <div class="product-cell">
                        <img src="${imageUrl}" alt="${product.nome}">
                        <span>${product.nome}</span>
                    </div>
                </td>
                <td>${product.sku || 'N/A'}</td>
                <td><span class="stock ${stockStatusClass}">${product.quantidade_estoque} em estoque</span></td>
                <td>${parseFloat(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>
                    <div class="action-buttons">
                        <a href="formulario-produto.html?id=${product.id}" class="btn btn-secondary btn-sm">Editar</a>
                        <button class="btn btn-danger btn-sm" data-product-id="${product.id}">Excluir</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Erro ao carregar produtos no painel:', error);
        tableBody.innerHTML = '<tr><td colspan="5">Erro ao carregar produtos.</td></tr>';
    }
}

// Função para deletar um produto
async function handleDeleteProduct(event) {
    if (!event.target.matches('.btn-danger')) {
        return;
    }

    const confirmation = confirm('Tem certeza de que deseja excluir este produto? Esta ação não pode ser desfeita.');

    if (!confirmation) {
        return;
    }

    const button = event.target;
    const productId = button.dataset.productId;
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`http://127.0.0.1:3000/api/produtos/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 204) {
            const row = button.closest('tr');
            row.remove();
            alert('Produto excluído com sucesso!');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao excluir o produto.');
        }

    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        alert(error.message);
    }
}


// Função principal que roda quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica se o usuário tem permissão
    if (checkAdminAuth()) {
        // 2. Se tiver, busca e exibe os produtos
        fetchAndRenderAdminProducts();

        // 3. E também ativa a funcionalidade de deletar na tabela
        const tableBody = document.getElementById('admin-products-tbody');
        if (tableBody) {
            tableBody.addEventListener('click', handleDeleteProduct);
        }
    }
});