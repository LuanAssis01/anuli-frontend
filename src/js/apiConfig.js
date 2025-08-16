// src/js/apiConfig.js

const isDevelopment = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

export const API_BASE_URL = isDevelopment
  ? 'http://127.0.0.1:3000'
  : 'https://api.anuliacessorios.com.br';


export const LOGIN_PAGE_URL = '/src/html/auth/login.html';
export const ADMIN_DASHBOARD_URL = '/src/html/admin/dashboard.html'; 
export const USER_ACCOUNT_URL = '/src/html/conta/minha_conta.html';   
