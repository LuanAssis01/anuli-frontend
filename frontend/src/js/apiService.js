import { API_BASE_URL } from './apiConfig.js';

/**
 * Faz uma requisição para a API, enviando os cookies de autenticação automaticamente.
 * @param {string} endpoint - O endpoint da API (ex: '/api/users/login').
 * @param {object} options - As opções do fetch (method, body, etc.).
 * @returns {Promise<any>} - A resposta da API em formato JSON.
 */
export async function fetchWithAuth(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Adiciona as configurações essenciais para a comunicação com cookies
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        // ESSENCIAL: Envia os cookies HttpOnly com a requisição
        credentials: 'include', 
        ...options,
    };

    const response = await fetch(url, defaultOptions);
    
    // Se a resposta for 204 (No Content), como no logout, retorna sucesso
    if (response.status === 204) {
        return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Erro na requisição para ${endpoint}`);
    }

    return data;
}