'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  BookOpen,
  CalendarDays,
  CalendarHeart,
  Church,
  Ellipsis,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserRound,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ShellUser = { name: string; role: 'ADMIN' | 'MEMBER' };
type NavEntry = { href: string; label: string; icon: typeof Church };

const adminEntries: NavEntry[] = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/missas', label: 'Missas', icon: Church },
  { href: '/calendario', label: 'Calendário', icon: CalendarDays },
  { href: '/membros', label: 'Membros', icon: Users },
  { href: '/eventos', label: 'Eventos', icon: CalendarHeart },
  { href: '/avisos', label: 'Avisos', icon: Bell },
  { href: '/leituras', label: 'Leituras', icon: BookOpen },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

const memberEntries: NavEntry[] = [
  { href: '/inicio', label: 'Início', icon: House },
  { href: '/missas', label: 'Missas', icon: Church },
  { href: '/calendario', label: 'Agenda', icon: CalendarDays },
  { href: '/leituras', label: 'Leituras', icon: BookOpen },
  { href: '/eventos', label: 'Eventos', icon: CalendarHeart },
  { href: '/avisos', label: 'Avisos', icon: Bell },
  { href: '/perfil', label: 'Perfil', icon: UserRound },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

function LogoutButton({ label = false }: { label?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      size={label ? 'default' : 'icon'}
      disabled={busy}
      aria-label="Sair da conta"
      className={cn(label && 'w-full justify-start')}
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
      <LogOut aria-hidden />
      {label && (busy ? 'Saindo…' : 'Sair')}
    </Button>
  );
}

function NavLinks({
  entries,
  collapsed = false,
  onNavigate,
}: {
  entries: NavEntry[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação principal" className="space-y-1">
      {entries.map(({ href, label, icon: Icon }) => {
        const link = (
          <Link
            key={href}
            aria-label={label}
            aria-current={isActive(pathname, href) ? 'page' : undefined}
            onClick={onNavigate}
            href={href}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10 focus-visible:outline-white',
              isActive(pathname, href) && 'bg-white/15 text-white shadow-[inset_3px_0_0_#d9bc81]',
              collapsed && 'justify-center px-0',
            )}
          >
            <Icon aria-hidden className="h-5 w-5 shrink-0" />
            {!collapsed && label}
          </Link>
        );
        if (!collapsed) return link;
        return (
          <Tooltip key={href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        );
      })}
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
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col bg-primary px-3 py-4 text-primary-foreground transition-[width] lg:flex',
          collapsed ? 'w-[4.75rem]' : 'w-[15.5rem]',
        )}
      >
        <Link
          href={user.role === 'ADMIN' ? '/dashboard' : '/inicio'}
          aria-label="Paróquia São Roque"
          className={cn(
            'mb-7 flex min-h-16 items-center gap-3 rounded-lg px-1.5',
            collapsed && 'justify-center px-0',
          )}
        >
          <Image
            src="/images/logo.png"
            width={54}
            height={55}
            sizes="54px"
            alt=""
            className="h-[3.4rem] w-[3.4rem] shrink-0 rounded-md bg-white object-contain p-0.5"
          />
          {!collapsed && (
            <span className="font-cinzel text-sm leading-relaxed">
              Paróquia
              <br />
              <strong>São Roque</strong>
            </span>
          )}
        </Link>
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.2em] text-primary-foreground/65">
            {user.role === 'ADMIN' ? 'Administração paroquial' : 'Nossa comunidade'}
          </p>
        )}
        <NavLinks
          entries={user.role === 'ADMIN' ? adminEntries : memberEntries}
          collapsed={collapsed}
        />
        <div className="mt-auto border-t border-white/15 pt-3">
          <Button
            className="w-full text-inherit hover:bg-white/10 hover:text-white"
            variant="ghost"
            onClick={toggle}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden />
            ) : (
              <>
                <PanelLeftClose aria-hidden />
                Recolher menu
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

function AdminMobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir menu" className="lg:hidden">
          <Menu aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="safe-bottom w-[min(88vw,22rem)] overflow-y-auto bg-primary px-4 pt-[calc(1.25rem+env(safe-area-inset-top))] text-primary-foreground"
      >
        <div className="mb-7 flex items-center gap-3 pr-10">
          <Image
            src="/images/logo.png"
            width={54}
            height={55}
            alt=""
            className="h-14 w-14 rounded-md bg-white object-contain p-0.5"
          />
          <div>
            <SheetTitle className="font-cinzel text-base text-primary-foreground">
              Paróquia São Roque
            </SheetTitle>
            <SheetDescription className="mt-1 text-primary-foreground/70">
              Administração paroquial
            </SheetDescription>
          </div>
        </div>
        <NavLinks entries={adminEntries} onNavigate={() => setOpen(false)} />
        <div className="mt-6 border-t border-white/15 pt-3">
          <LogoutButton label />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MemberMoreMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Mais opções"
          aria-expanded={open}
          className={cn(
            'flex min-h-14 min-w-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[11px] font-medium text-muted-foreground',
            (active || open) && 'text-primary',
          )}
        >
          <Ellipsis aria-hidden className="h-5 w-5" />
          Mais
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[75dvh] overflow-y-auto rounded-t-2xl px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <SheetTitle className="font-cinzel text-xl">Mais da comunidade</SheetTitle>
        <SheetDescription>Acesse eventos, avisos e seus dados.</SheetDescription>
        <nav aria-label="Mais opções" className="mt-5 grid gap-2">
          {memberEntries.slice(4).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 rounded-lg border bg-card px-4 font-medium"
            >
              <Icon aria-hidden className="h-5 w-5 text-primary" />
              {label}
            </Link>
          ))}
          <LogoutButton label />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function MemberBottomNavigation() {
  const pathname = usePathname();
  const mainEntries = memberEntries.slice(0, 4);
  const moreActive = memberEntries.slice(4).some((entry) => isActive(pathname, entry.href));
  return (
    <nav
      data-member-bottom-nav
      aria-label="Navegação móvel"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {mainEntries.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(pathname, href) ? 'page' : undefined}
            className={cn(
              'flex min-h-14 min-w-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[11px] font-medium text-muted-foreground',
              isActive(pathname, href) && 'text-primary',
            )}
          >
            <Icon aria-hidden className="h-5 w-5" />
            {label}
          </Link>
        ))}
        <MemberMoreMenu active={moreActive} />
      </div>
    </nav>
  );
}

export function Header({ user }: { user: ShellUser }) {
  const isAdmin = user.role === 'ADMIN';
  return (
    <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b bg-card/95 px-3 backdrop-blur-sm sm:px-6 lg:min-h-16 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        {isAdmin && <AdminMobileMenu />}
        <Link
          href={isAdmin ? '/dashboard' : '/inicio'}
          className="flex min-w-0 items-center gap-2 lg:hidden"
          aria-label="Paróquia São Roque"
        >
          <Image
            src="/images/logo.png"
            alt=""
            width={36}
            height={36}
            sizes="36px"
            className="h-9 w-9 rounded bg-white object-contain"
          />
          <span className="truncate font-cinzel text-sm font-semibold">Paróquia São Roque</span>
        </Link>
        <span className="hidden text-sm text-muted-foreground lg:inline">
          {isAdmin ? 'Administração paroquial' : 'Nossa comunidade'}
        </span>
      </div>
      <div className="flex min-w-0 items-center gap-1 sm:gap-3">
        <Link
          href="/perfil"
          aria-label="Meu perfil"
          className="flex min-h-11 min-w-0 items-center gap-3 rounded-lg px-1"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-48 truncate text-sm font-medium">{user.name}</span>
            <span className="block text-xs text-muted-foreground">
              {isAdmin ? 'Administrador' : 'Membro'}
            </span>
          </span>
        </Link>
        <span className="hidden lg:inline-flex">
          <LogoutButton />
        </span>
      </div>
    </header>
  );
}

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const member = user.role === 'MEMBER';
  return (
    <div className="flex min-h-screen">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-card focus:p-4"
      >
        Ir para o conteúdo
      </a>
      <Sidebar user={user} collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />
      <div className="min-w-0 flex-1">
        <Header user={user} />
        <main
          id="conteudo"
          className={cn(
            'content-container px-4 py-4 sm:px-6 sm:py-7 lg:px-8 lg:py-8',
            member &&
              'pb-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom)+1.5rem)] lg:pb-8',
          )}
        >
          {children}
        </main>
        {member && <MemberBottomNavigation />}
      </div>
    </div>
  );
}
