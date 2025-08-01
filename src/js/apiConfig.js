// src/js/apiConfig.js

// Verifica se o site está a ser executado no ambiente local (desenvolvimento)
const isDevelopment = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

// Define a URL base da API com base no ambiente
export const API_BASE_URL = isDevelopment
  ? 'http://127.0.0.1:3000' // URL para a sua máquina
  : 'https://anuli-backend.onrender.com'; // URL para o site em produção

// --- Constantes para as rotas do frontend ---
// Usamos caminhos absolutos para garantir que funcionem a partir de qualquer página.
export const LOGIN_PAGE_URL = '/src/html/auth/login.html';
export const ADMIN_DASHBOARD_URL = '/src/html/admin/dashboard.html'; // <-- NOVO
export const USER_ACCOUNT_URL = '/src/html/conta/minha_conta.html';    // <-- NOVO

// Informa no console em que modo a API está a ser executada
console.log(`API a ser executada em modo: ${isDevelopment ? 'Desenvolvimento' : 'Produção'}`);
console.log(`URL da API: ${API_BASE_URL}`);
