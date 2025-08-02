// src/js/utils/validation.js

/**
 * Verifica se um campo não está vazio.
 * @param {string} value - O valor do campo.
 * @returns {boolean}
 */
export function isNotEmpty(value) {
    return value.trim() !== '';
}

/**
 * Verifica se um e-mail tem um formato válido.
 * @param {string} email - O e-mail a ser validado.
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Verifica se um telefone tem um formato válido para o Brasil (10 ou 11 dígitos).
 * @param {string} phone - O telefone a ser validado.
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    const numericPhone = phone.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    return /^\d{10,11}$/.test(numericPhone);
}

/**
 * Verifica se uma senha é forte (ex: mínimo de 6 caracteres).
 * @param {string} password - A senha a ser validada.
 * @returns {boolean}
 */
export function isStrongPassword(password) {
    return password.length >= 6;
}

/**
 * Verifica se duas senhas coincidem.
 * @param {string} password - A primeira senha.
 * @param {string} confirmPassword - A segunda senha.
 * @returns {boolean}
 */
export function doPasswordsMatch(password, confirmPassword) {
    return password === confirmPassword;
}

/**
 * Mostra uma mensagem de erro abaixo de um campo de formulário.
 * @param {HTMLElement} inputElement - O elemento do input.
 * @param {string} message - A mensagem de erro a ser exibida.
 */
export function showError(inputElement, message) {
    const formGroup = inputElement.closest('.form-group');
    if (formGroup) {
        // Remove qualquer mensagem de erro antiga
        clearError(inputElement);
        // Cria e adiciona o novo elemento de erro
        const errorElement = document.createElement('p');
        errorElement.className = 'error-text';
        errorElement.textContent = message;
        formGroup.appendChild(errorElement);
    }
}

/**
 * Limpa a mensagem de erro de um campo de formulário.
 * @param {HTMLElement} inputElement - O elemento do input.
 */
export function clearError(inputElement) {
    const formGroup = inputElement.closest('.form-group');
    if (formGroup) {
        const errorElement = formGroup.querySelector('.error-text');
        if (errorElement) {
            errorElement.remove();
        }
    }
}
