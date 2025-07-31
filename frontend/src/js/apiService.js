// src/js/apiService.js

import { API_BASE_URL } from './apiConfig.js';
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

  // ⭐ LÓGICA INTELIGENTE DE HEADER ⭐
  // Se o corpo for FormData, o navegador define o Content-Type sozinho.
  // Se for um objeto, nós o transformamos em JSON e definimos o header.
  if (options.body && !(options.body instanceof FormData)) {
    defaultOptions.headers['Content-Type'] = 'application/json';
    defaultOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, defaultOptions);

  if (response.status === 401) {
    authManager.logout(); // Limpa a sessão do frontend
    window.location.href = '/frontend/src/html/auth/login.html';
    throw new Error('Sessão expirada. Por favor, faça login novamente.');
  }

  if (response.status === 204) {
    return { success: true };
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Erro na requisição para ${endpoint}`);
  }

  return data;
}
