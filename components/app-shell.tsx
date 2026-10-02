'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Church,
  CalendarDays,
  Users,
  BookOpen,
  Bell,
  CalendarHeart,
  LayoutDashboard,
  UserRound,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
type ShellUser = { name: string; role: 'ADMIN' | 'MEMBER' };
function entries(admin: boolean) {
  return [
    {
      href: admin ? '/dashboard' : '/inicio',
      label: admin ? 'Dashboard' : 'Início',
      icon: LayoutDashboard,
    },
    { href: '/missas', label: 'Missas', icon: Church },
    { href: '/calendario', label: 'Calendário', icon: CalendarDays },
    ...(admin ? [{ href: '/membros', label: 'Membros', icon: Users }] : []),
    { href: '/eventos', label: 'Eventos', icon: CalendarHeart },
    { href: '/avisos', label: 'Avisos', icon: Bell },
    { href: '/leituras', label: 'Leituras', icon: BookOpen },
    {
      href: admin ? '/configuracoes' : '/perfil',
      label: admin ? 'Configurações' : 'Perfil',
      icon: admin ? Settings : UserRound,
    },
  ];
}
function NavLinks({
  user,
  collapsed = false,
  onNavigate,
}: {
  user: ShellUser;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação principal" className="space-y-1">
      {entries(user.role === 'ADMIN').map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          title={collapsed ? label : undefined}
          aria-label={label}
          aria-current={pathname === href || pathname.startsWith(href + '/') ? 'page' : undefined}
          onClick={onNavigate}
          href={href}
          className={cn(
            'flex min-h-11 items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-white/10',
            (pathname === href || pathname.startsWith(href + '/')) &&
              'bg-white/15 text-white shadow-[inset_3px_0_0_#d9bc81]',
            collapsed && 'justify-center',
          )}
        >
          <Icon aria-hidden className="h-5 w-5 shrink-0" />
          {!collapsed && label}
        </Link>
      ))}
    </nav>
  );
}
export function Sidebar({
  user,
  collapsed,
  toggle,
}: {
  user: ShellUser;
  collapsed: boolean;
  toggle: () => void;
}) {
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col bg-primary p-4 text-primary-foreground lg:flex',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      <Link
        href="/inicio"
        aria-label="Paróquia São Roque"
        className="mb-10 flex items-center gap-3 px-1 pt-4"
      >
        <Image src="/images/logo.png" width={44} height={44} alt="" className="shrink-0" />
        {!collapsed && (
          <span className="font-cinzel text-sm leading-relaxed">
            Paróquia
            <br />
            <strong>São Roque</strong>
          </span>
        )}
      </Link>
      {!collapsed && (
        <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.2em] opacity-65">
          {user.role === 'ADMIN' ? 'Administração paroquial' : 'Nossa comunidade'}
        </p>
      )}
      <NavLinks user={user} collapsed={collapsed} />
      <div className="mt-auto border-t border-white/15 pt-4">
        <Button
          className="w-full text-inherit hover:bg-white/10 hover:text-white"
          variant="ghost"
          onClick={toggle}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <PanelLeftOpen />
          ) : (
            <>
              <PanelLeftClose />
              Recolher menu
            </>
          )}
        </Button>
        {!collapsed && <p className="mt-4 text-center text-xs opacity-60">Fé que nos une.</p>}
      </div>
    </aside>
  );
}
export function MobileNavigation({ user }: { user: ShellUser }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir menu" className="lg:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto bg-primary text-primary-foreground">
        <SheetTitle className="mb-2 text-primary-foreground">Paróquia São Roque</SheetTitle>
        <SheetDescription className="mb-6 text-primary-foreground/75">
          Acesse as atividades da comunidade.
        </SheetDescription>
        <NavLinks user={user} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
export function Header({ user }: { user: ShellUser }) {
  const [busy, setBusy] = useState(false);
  return (
    <header className="flex min-h-20 items-center justify-between gap-3 border-b bg-card px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNavigation user={user} />
        <div className="text-sm text-muted-foreground">
          <span className="hidden sm:inline">Bem-vindo à nossa comunidade</span>
          <span className="font-cinzel sm:hidden">São Roque</span>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/perfil"
          aria-label="Meu perfil"
          className="flex min-h-11 min-w-0 items-center gap-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
            {user.name.charAt(0)}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-48 truncate text-sm font-medium">{user.name}</span>
            <span className="block text-xs text-muted-foreground">
              {user.role === 'ADMIN' ? 'Administrador' : 'Membro'}
            </span>
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          disabled={busy}
          aria-label="Sair da conta"
          onClick={async () => {
            setBusy(true);
            try {
              const response = await fetch('/api/auth/logout', { method: 'POST' });
              if (!response.ok) throw new Error();
              window.location.assign('/');
            } catch {
              toast.error('Não foi possível sair. Tente novamente.');
              setBusy(false);
            }
          }}
        >
          <LogOut />
        </Button>
      </div>
    </header>
  );
}
export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-card focus:p-4"
      >
        Ir para o conteúdo
      </a>
      <Sidebar user={user} collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />
      <div className="min-w-0 flex-1">
        <Header user={user} />
        <main id="conteudo" className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:py-10">
          {children}
        </main>
        <footer className="px-5 py-8 text-center text-xs text-muted-foreground">
          Paróquia São Roque • Fé, comunidade e serviço
        </footer>
      </div>
    </div>
  );
}
