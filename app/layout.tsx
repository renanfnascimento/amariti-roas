import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ContentHub Pro',
  description: 'Seu estúdio centralizado de criação e postagem de vídeos',
  other: {
    'tiktok-developers-site-verification': 'MLi8eWys3B4XxMD1e9f7dOwQZOpRnuNy',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
