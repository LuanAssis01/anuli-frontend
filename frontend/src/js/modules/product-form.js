// frontend/src/js/modules/product-form.js
import { API_BASE_URL } from '../apiConfig.js';

// Função de segurança para verificar se o usuário é admin
function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!token || userInfo?.tipo_cadastro !== 'admin') {
        alert('Acesso negado. Você precisa ser um administrador.');
        // O caminho correto para voltar para o login a partir da pasta /admin/
        window.location.href = '../auth/login.html'; 
        return false;
    }
    return true;
}

// Função principal que inicializa a página do formulário
async function initProductForm() {
    // --- Seleção de Elementos do DOM ---
    const form = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const nameInput = document.getElementById('nome');
    const descriptionInput = document.getElementById('descricao');
    const priceInput = document.getElementById('preco');
    const stockInput = document.getElementById('quantidade_estoque');
    const categoryInput = document.getElementById('categoria_id');
    const skuInput = document.getElementById('sku');
    const imageInput = document.getElementById('imagens'); // ID para múltiplas imagens
    const imagePreviewContainer = document.getElementById('image-preview');

    // --- Detecção de Modo (Criar vs. Editar) ---
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const isEditMode = !!productId;

    // --- Função para carregar categorias no select ---
    async function loadCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/categoria`);
            if (!response.ok) throw new Error('Falha ao carregar categorias');
            const categories = await response.json();
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.nome;
                categoryInput.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    // Carrega as categorias antes de qualquer outra coisa
    await loadCategories();

    // --- Preencher Formulário (se estiver em modo de edição) ---
    if (isEditMode) {
        formTitle.textContent = 'Editar Produto';
        try {
            const response = await fetch(`${API_BASE_URL}/api/produtos/${productId}`);
            if (!response.ok) throw new Error('Produto não encontrado');
            const product = await response.json();
            
            nameInput.value = product.nome;
            descriptionInput.value = product.descricao;
            priceInput.value = product.preco;
            stockInput.value = product.quantidade_estoque;
            skuInput.value = product.sku || '';
            categoryInput.value = product.categoria_id;

            if (product.imagens && product.imagens.length > 0) {
                imagePreviewContainer.innerHTML = `<p>Imagens Atuais:</p>`;
                product.imagens.forEach(img => {
                    const currentImageUrl = `${API_BASE_URL}/${img.url}`;
                    imagePreviewContainer.innerHTML += `<img src="${currentImageUrl}" alt="Imagem atual" style="max-width: 100px; border-radius: 6px; margin: 5px;">`;
                });
            }
        } catch (error) {
            console.error('Erro ao buscar dados do produto para edição:', error);
            alert('Não foi possível carregar os dados do produto.');
        }
    }

    // --- Lógica de Pré-visualização de Novas Imagens ---
    imageInput.addEventListener('change', () => {
        // Se estiver editando, mostra a pré-visualização abaixo das imagens atuais
        if (!isEditMode) {
            imagePreviewContainer.innerHTML = '';
        }
        imagePreviewContainer.innerHTML += '<p>Pré-visualização das novas imagens:</p>';
        if (imageInput.files) {
            Array.from(imageInput.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style = "max-width: 100px; border-radius: 6px; margin: 5px;";
                    imagePreviewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        }
    });

    // --- Lógica de Envio do Formulário ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData();
        formData.append('nome', nameInput.value);
        formData.append('descricao', descriptionInput.value);
        formData.append('preco', priceInput.value);
        formData.append('quantidade_estoque', stockInput.value);
        formData.append('categoria_id', categoryInput.value);
        formData.append('sku', skuInput.value);

        // Adiciona todas as novas imagens selecionadas
        if (imageInput.files.length > 0) {
            for (const file of imageInput.files) {
                formData.append('imagens', file);
            }
        }

        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode 
            ? `${API_BASE_URL}/api/produtos/${productId}` 
            : `${API_BASE_URL}/api/produtos`;
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao salvar produto.');
            }

            alert(`Produto ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
            window.location.href = 'produtos.html';

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            alert(error.message);
        }
    });
}

// Roda a inicialização da página apenas se o usuário for um admin
if (checkAdminAuth()) {
    initProductForm();
}