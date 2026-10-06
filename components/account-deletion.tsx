'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AccountDeletion() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setPassword('');
    setConfirmation('');
    setError('');
  }

  async function removeAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || confirmation !== 'EXCLUIR' || !password) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmation }),
      });
      const result: { error?: string; url?: string } = await response.json();
      if (!response.ok) {
        setError(result.error || 'Não foi possível excluir sua conta.');
        return;
      }
      window.location.replace(result.url || '/');
    } catch {
      setError('Não foi possível concluir a solicitação. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        setOpen(next);
        if (!next) reset();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="min-h-11 text-destructive">
          Excluir minha conta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir sua conta permanentemente?</AlertDialogTitle>
          <AlertDialogDescription>
            Seus dados de cadastro e sessões serão removidos. Essa ação não pode ser desfeita.
            Informe sua senha atual e digite EXCLUIR para confirmar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={removeAccount} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deletion-password">Senha atual</Label>
            <Input
              id="deletion-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              maxLength={128}
              className="min-h-11 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deletion-confirmation">Digite EXCLUIR</Label>
            <Input
              id="deletion-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              required
              className="min-h-11 text-base"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={busy} className="min-h-11">
              Cancelar
            </AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={busy || !password || confirmation !== 'EXCLUIR'}
              className="min-h-11"
            >
              {busy ? 'Excluindo…' : 'Excluir minha conta'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
