import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        {/* Estilo inline para evitar flash de tela em branco */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              margin: 0;
              padding: 0;
              font-family: 'Roboto', sans-serif;
              background: var(--background-primary, #FFFFFF);
              color: var(--text-primary, #30475E);
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            #__next {
              min-height: 100vh;
              background: var(--background-primary, #FFFFFF);
            }
            
            /* Estilos para modais de seleção - evitar FOUC */
            [data-modal="profile-selection"],
            [data-modal="group-selection"] {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 2000;
              backdrop-filter: blur(10px);
            }
            
            [data-modal-content="profile-selection"],
            [data-modal-content="group-selection"] {
              background: rgba(255, 255, 255, 0.98);
              backdrop-filter: blur(20px);
              border-radius: 24px;
              padding: 2.5rem;
              max-width: 500px;
              width: 90%;
              max-height: 85vh;
              overflow-y: auto;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
              border: 1px solid rgba(41, 171, 226, 0.3);
            }
          `
        }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
