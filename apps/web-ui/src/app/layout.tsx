import './global.css';
import ClientProviders from './providers';
import OrbBackground from '@/components/background/OrbBackground';

export const metadata = {
  title: 'YouFizz - Your Trusted Company',
  description: 'Your trusted company for buying and selling quality products',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <ClientProviders>
          <div className="relative min-h-screen overflow-hidden">
            <OrbBackground />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}