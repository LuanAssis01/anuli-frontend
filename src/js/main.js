document.addEventListener('DOMContentLoaded', () => {

  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mainHeader = document.querySelector('.main-header');

  // Verifica se o botão do menu realmente existe na página
  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
      // Adiciona ou remove a classe 'nav-open' do elemento header
      mainHeader.classList.toggle('nav-open');
    });
  }

});