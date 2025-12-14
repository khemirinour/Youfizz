import './global.css';
import ClientProviders from './providers';
import OrbBackground from '@/components/background/OrbBackground';

export const metadata = {
  title: 'YouFizz - Your Trusted Company',
  description: 'Your trusted company for buying and selling quality products',
  icons: {
    icon: [
      { url: '/logopub.png', sizes: 'any' },
      { url: '/logopub.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/logopub.png',
    apple: '/logopub.png',
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