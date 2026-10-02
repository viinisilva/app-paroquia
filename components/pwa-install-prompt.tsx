'use client';
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
const DISMISS_KEY = 'paroquia-install-prompt-dismissed-until';
const DISMISS_DAYS = 14;

function postponePrompt() {
  const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(DISMISS_KEY, String(until));
}

export default function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const handler = (e: Event) => {
      e.preventDefault();
      const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (dismissedUntil > Date.now()) return;
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
      className="pwa-install-prompt fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 mx-auto max-w-md rounded-xl border bg-card p-4 shadow-lg"
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
                const choice = await prompt.userChoice;
                if (choice.outcome === 'dismissed') postponePrompt();
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
          onClick={() => {
            postponePrompt();
            setPrompt(null);
          }}
        >
          <X />
        </Button>
      </div>
    </aside>
  );
}
