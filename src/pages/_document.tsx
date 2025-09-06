// pages/_document.tsx

import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  override render() {
    return (
      <Html lang='pt-BR'>
        <Head>
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional'
          />
          {/* favicon, meta tags, etc */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
