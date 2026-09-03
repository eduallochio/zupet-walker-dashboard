import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Zupet Walker — App para Profissionais de Pets',
  description: 'GPS, relatórios com fotos e controle financeiro para passeadores, banhistas, adestradores e cuidadores de pets. Organize seu negócio. Gratuito para começar.',
  keywords: [
    'passeador de cães', 'dog walker', 'app passeador', 'zupet walker', 'passeio de cachorro',
    'banhista de cães', 'banho e tosa', 'adestrador de cães', 'adestramento canino',
    'dog sitter', 'cuidador de pets', 'day care pet', 'hospedagem animal', 'pet sitter',
    'app para banhista', 'app para adestrador', 'app cuidador de pets', 'gestão pet profissional',
    'controle financeiro pet', 'agenda pet', 'relatório passeio', 'GPS passeio cachorro',
  ],
  openGraph: {
    title: 'Zupet Walker — App para Profissionais de Pets',
    description: 'GPS, relatórios com fotos e agenda integrada para passeadores, banhistas, adestradores e cuidadores. Gratuito para começar.',
    url: 'https://walker.zupet.io',
    siteName: 'Zupet Walker',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Zupet Walker — App para Profissionais de Pets' }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zupet Walker — App para Profissionais de Pets',
    description: 'GPS, relatórios com fotos e agenda integrada para passeadores, banhistas, adestradores e cuidadores. Gratuito para começar.',
    images: ['/og'],
  },
  verification: {
    google: '-ovGHfU3QXPS-Vb2dKgozcIHuZnp9ibbBTe-crd0qMU',
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

const jsonLdApp = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Zupet Walker',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Android, iOS',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
    description: 'Plano gratuito disponível. Pro por R$ 29/mês.',
  },
  description: 'App para profissionais de pets — passeadores, banhistas, adestradores e cuidadores. GPS em tempo real, relatórios com fotos, agenda integrada e controle financeiro.',
  url: 'https://walker.zupet.io',
  publisher: {
    '@type': 'Organization',
    name: 'Zupet',
    url: 'https://zupet.io',
  },
};

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Zupet',
  url: 'https://zupet.io',
  logo: 'https://walker.zupet.io/logo-simbolo.png',
  sameAs: ['https://zupet.io'],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'eduallochio2@outlook.com',
    contactType: 'customer service',
    availableLanguage: 'Portuguese',
  },
};

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'O app Zupet Walker é gratuito?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. O plano gratuito é permanente e inclui GPS, relatórios e gestão de até 10 pets. O Pro desbloqueia recursos avançados por R$ 29/mês.',
      },
    },
    {
      '@type': 'Question',
      name: 'Para quais profissionais de pets o app é indicado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O Zupet Walker atende passeadores de cães (dog walkers), banhistas, tosadores, adestradores, cuidadores (pet sitters), profissionais de day care e hospedagem animal.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como os tutores encontram meu perfil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tutores buscam profissionais pelo app Zupet pelo nome ou localização. No plano Pro você aparece em destaque nos resultados.',
      },
    },
    {
      '@type': 'Question',
      name: 'O app registra a rota do passeio com GPS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. O GPS registra distância e rota durante o passeio. Ao finalizar, o tutor recebe um relatório com distância, duração, fotos e eventos registrados.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como o pagamento funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O pagamento é combinado diretamente entre o profissional e o tutor — o app não processa cobranças. O Zupet Walker ajuda a registrar e acompanhar o histórico de recebimentos.',
      },
    },
  ],
};

const jsonLdServices = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Serviços para profissionais de pets — Zupet Walker',
  description: 'Tipos de atendimento gerenciados pelo app Zupet Walker',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Passeio de cães', description: 'Caminhadas seguras e monitoradas para cães de todos os portes', url: 'https://walker.zupet.io' },
    { '@type': 'ListItem', position: 2, name: 'Banho e Tosa', description: 'Higiene e bem-estar com produtos de qualidade para o seu pet', url: 'https://walker.zupet.io' },
    { '@type': 'ListItem', position: 3, name: 'Hospedagem de pets', description: 'Seu pet acolhido em ambiente seguro enquanto você viaja', url: 'https://walker.zupet.io' },
    { '@type': 'ListItem', position: 4, name: 'Day Care para pets', description: 'Companhia e atividades durante o dia para pets que ficam sozinhos', url: 'https://walker.zupet.io' },
    { '@type': 'ListItem', position: 5, name: 'Adestramento de cães', description: 'Treinamento comportamental com métodos positivos e eficazes', url: 'https://walker.zupet.io' },
    { '@type': 'ListItem', position: 6, name: 'Visita Veterinária domiciliar', description: 'Acompanhamento domiciliar com profissionais veterinários', url: 'https://walker.zupet.io' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdServices) }} />
      </head>
      <body className={jakarta.variable} style={{ fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
