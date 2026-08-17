import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';
import { ThemeContext } from '@/context/theme-provider';

import { RootLayout } from './root-layout';

// Ver #30 ([Test Coverage]) - root-layout.tsx estava em 0%.
const usuarioFake = { id: 'u1', nome: 'Fabio', email: 'fabio@example.com' };

function renderLayout(usuario: typeof usuarioFake | null = null, setTheme = vi.fn()) {
  return render(
    <MemoryRouter initialEntries={['/comunidades']}>
      <ThemeContext.Provider value={{ theme: 'light', resolvedTheme: 'light', setTheme }}>
        <AuthContext.Provider
          value={{
            usuario,
            carregando: false,
            login: vi.fn(),
            registrar: vi.fn(),
            logout: vi.fn(),
          }}
        >
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/comunidades" element={<p>Conteúdo da página</p>} />
            </Route>
          </Routes>
        </AuthContext.Provider>
      </ThemeContext.Provider>
    </MemoryRouter>,
  );
}

describe('RootLayout', () => {
  it('renderiza os links de navegação e o conteúdo da rota filha', () => {
    renderLayout();

    expect(screen.getByRole('link', { name: /Comunidades/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Eventos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Calendário' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument();
  });

  it('mostra Entrar/Criar conta pra visitante anônimo', () => {
    renderLayout(null);

    expect(screen.getAllByRole('link', { name: 'Entrar' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Criar conta' })[0]).toBeInTheDocument();
  });

  it('mostra o nome do usuário e botão Sair quando logado', () => {
    const logout = vi.fn();
    render(
      <MemoryRouter initialEntries={['/comunidades']}>
        <ThemeContext.Provider
          value={{ theme: 'light', resolvedTheme: 'light', setTheme: vi.fn() }}
        >
          <AuthContext.Provider
            value={{
              usuario: usuarioFake,
              carregando: false,
              login: vi.fn(),
              registrar: vi.fn(),
              logout,
            }}
          >
            <Routes>
              <Route element={<RootLayout />}>
                <Route path="/comunidades" element={<p>Conteúdo</p>} />
              </Route>
            </Routes>
          </AuthContext.Provider>
        </ThemeContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Fabio')[0]).toBeInTheDocument();
  });

  it('alterna o tema ao clicar no botão de sol/lua', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();
    renderLayout(null, setTheme);

    await user.click(screen.getByRole('button', { name: 'Ativar modo escuro' }));

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('abre e fecha o menu mobile', async () => {
    const user = userEvent.setup();
    renderLayout();

    expect(document.getElementById('menu-mobile')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(document.getElementById('menu-mobile')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fechar menu' }));
    expect(document.getElementById('menu-mobile')).not.toBeInTheDocument();
  });
});
