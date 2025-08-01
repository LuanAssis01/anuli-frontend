// src/js/apiConfig.js

// Força o uso das configurações de produção
export const API_BASE_URL = 'https://anuli-backend.onrender.com'; // URL para o site no ar (produção)

// Em produção, o caminho base é vazio.
export const BASE_PATH = '';

// Constantes para as rotas do frontend, usando o caminho base de produção
export const LOGIN_PAGE_URL = `${BASE_PATH}/src/html/auth/login.html`;

// Informa que a API está configurada para produção
// console.log('API rodando em modo: Produção');
// console.log(`URL da API: ${API_BASE_URL}`);
