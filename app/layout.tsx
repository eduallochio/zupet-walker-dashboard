import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Zupet Walker — App para Passeadores Profissionais',
  description: 'GPS em tempo real, relatórios com fotos e controle financeiro. O app que os melhores walkers usam para crescer. Gratuito para começar.',
  keywords: ['passeador de cães', 'dog walker', 'app passeador', 'zupet walker', 'passeio de cachorro'],
  openGraph: {
    title: 'Zupet Walker — Transforme seu amor por pets em profissão',
    description: 'GPS em tempo real, relatórios automáticos com fotos e controle financeiro. Gratuito para começar.',
    url: 'https://walker.zupet.io',
    siteName: 'Zupet Walker',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Zupet Walker' }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zupet Walker — App para Passeadores Profissionais',
    description: 'GPS em tempo real, relatórios com fotos e controle financeiro. Gratuito para começar.',
    images: ['/og'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL('https://walker.zupet.io'),
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Zupet Walker',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Android, iOS',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
    description: 'Plano gratuito disponível',
  },
  description: 'App para passeadores profissionais com GPS, relatórios com fotos e controle financeiro.',
  url: 'https://walker.zupet.io',
  publisher: {
    '@type': 'Organization',
    name: 'Zupet',
    url: 'https://zupet.io',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={jakarta.variable} style={{ fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
