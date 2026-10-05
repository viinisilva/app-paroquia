import type { Metadata, Viewport } from 'next';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/cinzel/latin-500.css';
import '@fontsource/cinzel/latin-600.css';
import './globals.css';
import { Toaster } from 'sonner';
import PWAInstallPrompt from '@/components/pwa-install-prompt';
import NativeBackButton from '@/components/native-back-button';
export const metadata: Metadata = {
  title: { default: 'Paróquia São Roque', template: '%s | Paróquia São Roque' },
  description: 'Fé, comunidade e serviço. Acompanhe a vida da Paróquia São Roque.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'São Roque', statusBarStyle: 'default' },
  icons: { apple: '/icons/icon-192x192.png', icon: '/icons/icon-192x192.png' },
};
export const viewport: Viewport = { themeColor: '#493326', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <NativeBackButton />
        <Toaster richColors closeButton position="top-right" />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
