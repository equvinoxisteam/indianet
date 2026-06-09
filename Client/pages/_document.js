import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="author" content="Indianet" />
        <meta name="application-name" content="Indianet — B2B Marketplace" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo_bg.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/logo_bg.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo_bg.jpg" />
        <meta name="theme-color" content="#0a66c2" />
        <link href='/Poppins/Poppins.css' rel='stylesheet' />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel='stylesheet' href='/bootstrap/dist/css/bootstrap.min.css' />
        <script src='/bootstrap/dist/js/bootstrap.bundle.js' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
