'use client';
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
export default function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
    };
    const installed = () => setPrompt(null);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);
  if (!prompt) return null;
  return (
    <aside
      aria-label="Instalar aplicativo"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-xl border bg-card p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">São Roque sempre por perto</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Instale para acessar mais rápido. A agenda precisa de conexão.
          </p>
          <Button
            className="mt-3"
            onClick={async () => {
              try {
                await prompt.prompt();
                await prompt.userChoice;
              } finally {
                setPrompt(null);
              }
            }}
          >
            <Download aria-hidden />
            Instalar aplicativo
          </Button>
        </div>
        <Button
          aria-label="Fechar sugestão de instalação"
          variant="ghost"
          size="icon"
          onClick={() => setPrompt(null)}
        >
          <X />
        </Button>
      </div>
    </aside>
  );
}
