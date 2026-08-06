import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { MOCK_ENABLED } from '@/services/http';

const navLinks = [
  { to: '/comunidades', label: 'Comunidades' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/calendario', label: 'Calendário' },
];

export function RootLayout() {
  const { usuario, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [menuAberto, setMenuAberto] = useState(false);

  const fecharMenu = () => setMenuAberto(false);
  const alternarTema = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  const rotuloAlternarTema = resolvedTheme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro';

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold"
            onClick={fecharMenu}
          >
            🗓️ Agenda Tech
            {MOCK_ENABLED && (
              <Badge variant="secondary" className="font-normal">
                dados de demonstração
              </Badge>
            )}
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label={rotuloAlternarTema}
              onClick={alternarTema}
            >
              {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
            </Button>
            {usuario ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {usuario.nome}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/registro">Criar conta</Link>
                </Button>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 md:hidden"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            onClick={() => setMenuAberto((aberto) => !aberto)}
          >
            {menuAberto ? <X /> : <Menu />}
          </Button>
        </div>
        {menuAberto && (
          <div id="menu-mobile" className="border-t px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={fecharMenu}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                      isActive && 'bg-accent text-accent-foreground',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t pt-3">
              <Button
                variant="ghost"
                className="min-h-11 w-full justify-center gap-2"
                aria-label={rotuloAlternarTema}
                onClick={alternarTema}
              >
                {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
                {rotuloAlternarTema}
              </Button>
              {usuario ? (
                <>
                  <span className="px-3 text-sm text-muted-foreground">{usuario.nome}</span>
                  <Button
                    variant="outline"
                    className="min-h-11 w-full justify-center"
                    onClick={() => {
                      logout();
                      fecharMenu();
                    }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="min-h-11 w-full justify-center"
                    asChild
                    onClick={fecharMenu}
                  >
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button className="min-h-11 w-full justify-center" asChild onClick={fecharMenu}>
                    <Link to="/registro">Criar conta</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
