import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';

import { ProtectedRoute } from './protected-route';

// Ver #30 ([Test Coverage]) - protected-route.tsx estava em 0%.
function renderComContexto(
  usuario: { id: string; nome: string; email: string } | null,
  carregando = false,
) {
  return render(
    <MemoryRouter initialEntries={['/eventos/novo']}>
      <AuthContext.Provider
        value={{ usuario, carregando, login: vi.fn(), registrar: vi.fn(), logout: vi.fn() }}
      >
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/eventos/novo" element={<p>Conteúdo protegido</p>} />
          </Route>
          <Route path="/login" element={<p>Tela de login</p>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('mostra "Carregando..." enquanto a sessão ainda não resolveu', () => {
    renderComContexto(null, true);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
  });

  it('redireciona pra /login quando não há usuário logado', () => {
    renderComContexto(null, false);

    expect(screen.getByText('Tela de login')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
  });

  it('renderiza a rota filha (Outlet) quando há usuário logado', () => {
    renderComContexto({ id: 'u1', nome: 'Fabio', email: 'fabio@example.com' }, false);

    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
  });
});
