import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dračí Kabala | RPG Dračího Doupěte & Knihy Zohar',
  description: 'Atmosférická webová RPG hra spojující pravidla Dračího doupěte a kabalistickou mystiku Knihy Zohar s AI Pánem Jeskyně.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-amber-900 selection:text-amber-100">
        {children}
      </body>
    </html>
  );
}
