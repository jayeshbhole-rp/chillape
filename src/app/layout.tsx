import { Toaster } from '@/components/ui/sonner';
import AppContext from '@/context/AppContext';
import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import '../styles/globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chill Ape',
  description: 'Best Asset Management UX on BNB',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    {
      url: '/logo-banner.png',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`dark ${spaceGrotesk.className}`}>
        <div className='bg-lines'>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>

        <AppContext>{children}</AppContext>

        <Toaster />
      </body>
    </html>
  );
}
