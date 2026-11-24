import { Inter, UnifrakturMaguntia } from 'next/font/google';
import '../index.css';
import Sidebar from '../components/Layout/Sidebar';
import MainContent from '../components/Layout/MainContent';
import { Providers } from './Providers';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const unifraktur = UnifrakturMaguntia({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-gothic',
  display: 'swap',
});

export const metadata = {
  applicationName: '𝔊𝔲𝔩𝔩𝔞𝔯𝔱 𝔏𝔢𝔱𝔱𝔢𝔯𝔦𝔫𝔤',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: '𝔊𝔲𝔩𝔩𝔞𝔯𝔱 𝔏𝔢𝔱𝔱𝔢𝔯𝔦𝔫𝔤',
    statusBarStyle: 'black-translucent',
  },
  title: '𝔊𝔲𝔩𝔩𝔞𝔯𝔱 𝔏𝔢𝔱𝔱𝔢𝔯𝔦𝔫𝔤 | 𝔓𝔯𝔢𝔱𝔬 𝔢 𝔠𝔦𝔫𝔷𝔞 🇧🇷',
  description:
    'CRM & Agenda PWA da Gullart Lettering — Preto e cinza 🇧🇷: controle de horários, fotos de referência, esboços, locais no corpo, clientes e serviços realizados.',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable} ${unifraktur.variable}`}>
      <body className="bg-[#07060A] text-text-primary antialiased font-sans">
        <Providers>
          <div className="flex h-screen overflow-hidden bg-[#07060A]">
            <Sidebar />
            <MainContent>{children}</MainContent>
          </div>
        </Providers>
      </body>
    </html>
  );
}
