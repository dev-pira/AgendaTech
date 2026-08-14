import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as authService from '@/services/auth';
import { getToken, getUsuario } from '@/services/http';

import { AuthProvider } from './auth-context';
import { useAuth } from '@/hooks/use-auth';

// Ver issue #30 (cobertura no CI) - auth-context.tsx só tinha 5% de
// cobertura (usado indiretamente via mocks nos testes de página). Aqui
// testamos o Provider de verdade: persistência em localStorage e o bug já
// corrigido de persistUsuario() faltando em registrar() (ver comentário no
// próprio auth-context.tsx).
const usuarioFake = { id: '1', nome: 'Fabio Baldin', email: 'fabio@example.com' };

describe('AuthProvider', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('começa deslogado quando não há token salvo', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.usuario).toBeNull();
  });

  it('restaura o usuário do localStorage quando já há token salvo', () => {
    localStorage.setItem('agendatech:token', 'token-salvo');
    localStorage.setItem('agendatech:usuario', JSON.stringify(usuarioFake));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.usuario).toEqual(usuarioFake);
  });

  it('login() persiste token e usuário e atualiza o estado', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue({ token: 'novo-token', usuario: usuarioFake });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => {
      await result.current.login('fabio', 'segredo123');
    });

    expect(result.current.usuario).toEqual(usuarioFake);
    expect(getToken()).toBe('novo-token');
    expect(getUsuario()).toEqual(usuarioFake);
  });

  it('registrar() persiste token e usuário e atualiza o estado', async () => {
    // Regressão coberta aqui: persistUsuario() não era chamado após
    // registrar(), só após login() - sem isso o usuário sumia do header
    // depois de um F5 logo após se cadastrar.
    vi.spyOn(authService, 'registrar').mockResolvedValue({
      token: 'novo-token',
      usuario: usuarioFake,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => {
      await result.current.registrar({
        username: 'fabio',
        first_name: 'Fabio',
        last_name: 'Baldin',
        email: 'fabio@example.com',
        password: 'segredo123',
        password_confirmation: 'segredo123',
      });
    });

    expect(result.current.usuario).toEqual(usuarioFake);
    expect(getToken()).toBe('novo-token');
    expect(getUsuario()).toEqual(usuarioFake);
  });

  it('logout() limpa token, usuário e estado', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue({ token: 'novo-token', usuario: usuarioFake });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => {
      await result.current.login('fabio', 'segredo123');
    });
    act(() => result.current.logout());

    expect(result.current.usuario).toBeNull();
    expect(getToken()).toBeNull();
    expect(getUsuario()).toBeNull();
  });
});
