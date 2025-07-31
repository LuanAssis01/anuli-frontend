// src/js/modules/authManager.js

const USER_KEY = 'anuli_user';

export const authManager = {
  /**
   * Salva os dados do usuário no sessionStorage após o login.
   * @param {object} userData - O objeto de usuário recebido da API.
   */
  login(userData) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
  },

  /**
   * Remove os dados do usuário do sessionStorage.
   */
  logout() {
    sessionStorage.removeItem(USER_KEY);
    // Aqui também faremos a chamada de API para o backend limpar o cookie.
  },

  /**
   * Verifica se há dados de usuário salvos na sessão.
   * @returns {boolean} - True se o usuário estiver logado, false caso contrário.
   */
  isLoggedIn() {
    return sessionStorage.getItem(USER_KEY) !== null;
  },

  /**
   * Retorna os dados do usuário que estão salvos.
   * @returns {object | null} - O objeto de usuário ou null se não estiver logado.
   */
  getUser() {
    const user = sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Retorna o tipo de cadastro do usuário (ex: 'admin' ou 'cliente').
   * @returns {string | null}
   */
  getUserType() {
    const user = this.getUser();
    return user ? user.tipo_cadastro : null;
  },

  /**
   * Retorna o ID do usuário.
   * @returns {number | null}
   */
  getUserId() {
    const user = this.getUser();
    return user ? user.id : null;
  }
};
