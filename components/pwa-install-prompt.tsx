'use client';
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isIosDevice, isStandaloneMode } from '@/lib/pwa';
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
const DISMISS_KEY = 'paroquia-install-prompt-dismissed-until';
const DISMISS_DAYS = 14;

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function postponePrompt() {
  const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(DISMISS_KEY, String(until));
}

export default function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});

    if (Capacitor.isNativePlatform()) return;

    const navigatorWithStandalone = navigator as NavigatorWithStandalone;
    const standalone = isStandaloneMode(
      window.matchMedia('(display-mode: standalone)').matches,
      navigatorWithStandalone.standalone,
    );
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);

    if (
      !standalone &&
      dismissedUntil <= Date.now() &&
      isIosDevice(navigator.userAgent, navigator.platform, navigator.maxTouchPoints)
    ) {
      setShowIosGuide(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const browserDismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (browserDismissedUntil > Date.now() || standalone) return;
      setShowIosGuide(false);
      setPrompt(e as InstallEvent);
    };
    const installed = () => {
      setPrompt(null);
      setShowIosGuide(false);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  if (!prompt && !showIosGuide) return null;

  const closePrompt = () => {
    postponePrompt();
    setPrompt(null);
    setShowIosGuide(false);
  };

  return (
    <aside
      aria-label="Instalar aplicativo"
      className="pwa-install-prompt fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 mx-auto max-w-md rounded-xl border bg-card p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">São Roque sempre por perto</p>
          {showIosGuide ? (
            <div className="mt-1 flex gap-2 text-sm text-muted-foreground">
              <Share2 aria-hidden className="mt-0.5 size-4 shrink-0" />
              <p>
                No Safari, toque em{' '}
                <strong className="font-medium text-foreground">Compartilhar</strong> e depois em{' '}
                <strong className="font-medium text-foreground">Adicionar à Tela de Início</strong>.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                Instale para acessar mais rápido. A agenda precisa de conexão.
              </p>
              <Button
                className="mt-3"
                onClick={async () => {
                  if (!prompt) return;
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
            </>
          )}
        </div>
        <Button
          aria-label="Fechar sugestão de instalação"
          variant="ghost"
          size="icon"
          onClick={closePrompt}
        >
          <X aria-hidden />
        </Button>
      </div>
    </aside>
  );
}
