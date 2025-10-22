import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: 'Roboto', sans-serif;
    background: white;
    color: #30475E;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* Garantir que os estilos sejam aplicados corretamente */
  #__next {
    height: 100%;
  }

  /* Estilo inicial para evitar flash de tela branca */
  .initial-load {
    opacity: 1;
    background: white;
    min-height: 100vh;
  }

  /* Forçar re-aplicação de estilos em navegação */
  .page-transition {
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
  }
`;
