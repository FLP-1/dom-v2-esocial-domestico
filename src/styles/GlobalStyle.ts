import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

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
    font-family: ${theme.fonts.body};
    background: ${theme.colors.background};
    color: ${theme.colors.text};
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

  /* Forçar re-aplicação de estilos em navegação */
  .page-transition {
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
  }
`;
