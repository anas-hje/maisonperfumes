import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartPanel from '@/components/layout/CartPanel';
import SearchOverlay from '@/components/layout/SearchOverlay';
import MobileMenu from '@/components/layout/MobileMenu';
import StoreHydration from '@/components/StoreHydration';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300', '500'],
  variable: '--font-cormorant'
});

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter'
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = 'Maison';
const siteDescription = 'Découvrez notre collection exclusive de parfums et cosmétiques de luxe.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Parfumerie & Cosmétiques de Luxe`,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    siteName,
    title: `${siteName} — Parfumerie & Cosmétiques de Luxe`,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} — Parfumerie & Cosmétiques de Luxe`,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-graphite text-quartz">
        <StoreHydration />
        <Header />
        <MobileMenu />
        <SearchOverlay />
        <CartPanel />
        <main className="flex-grow pt-20">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
