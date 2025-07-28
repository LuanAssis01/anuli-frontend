// frontend/src/js/apiConfig.js

// Verifica se o site está rodando no ambiente local (desenvolvimento)
const isDevelopment = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

// Define a URL base da API com base no ambiente
export const API_BASE_URL = isDevelopment
  ? 'http://127.0.0.1:3000' // URL para rodar na sua máquina
  : 'https://anuli-backend.onrender.com'; // URL para o site no ar (produção)

console.log(`API rodando em modo: ${isDevelopment ? 'Desenvolvimento' : 'Produção'}`);
console.log(`URL da API: ${API_BASE_URL}`);