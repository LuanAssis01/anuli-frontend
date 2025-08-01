// src/js/apiService.js

import { API_BASE_URL, LOGIN_PAGE_URL } from './apiConfig.js';
import { authManager } from './modules/authManager.js';

/**
 * Uma função fetch aprimorada que lida com autenticação (cookies)
 * e diferentes tipos de corpo de requisição (JSON e FormData).
 * @param {string} endpoint - O endpoint da API (ex: '/users/login').
 * @param {object} options - As opções da requisição fetch (method, body, etc.).
 * @returns {Promise<any>} - Os dados da resposta em JSON.
 */
export async function fetchWithAuth(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      ...options.headers,
    },
    credentials: 'include', // Envia os cookies automaticamente
    ...options,
  };

  // Lógica inteligente para o Content-Type
  // Se o corpo for FormData, o navegador define o Content-Type sozinho (essencial para uploads).
  // Se for um objeto, nós o transformamos em JSON e definimos o header.
  if (options.body && !(options.body instanceof FormData)) {
    defaultOptions.headers['Content-Type'] = 'application/json';
    defaultOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, defaultOptions);

  // Se a sessão expirar (erro 401), desloga o utilizador e redireciona.
  if (response.status === 401) {
    authManager.logout();
    window.location.href = LOGIN_PAGE_URL;
    throw new Error('Sessão expirada. Por favor, faça login novamente.');
  }

  // Se a resposta for 204 (No Content), retorna um sucesso sem tentar analisar o JSON.
  if (response.status === 204) {
    return { success: true };
  }

  const data = await response.json();

  // Se a resposta não for bem-sucedida, lança um erro com a mensagem da API.
  if (!response.ok) {
    throw new Error(data.message || `Erro na requisição para ${endpoint}`);
  }

  return data;
}
