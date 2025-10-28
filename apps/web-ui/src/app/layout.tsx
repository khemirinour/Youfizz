import './global.css';
import ClientProviders from './providers';

export const metadata = {
  title: 'MarketSpace - Your Trusted Marketplace',
  description: 'Your trusted marketplace for buying and selling quality products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}