import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';
import { HttpError } from '@/services/http';

import { LoginPage } from './login-page';

// Testa a página de login isolada, com um AuthContext controlado — evita
// depender do AuthProvider real (localStorage, chamada HTTP de verdade)
// pra cobrir o que realmente importa aqui: o formulário chama login() com
// os campos certos (username/password, não email - ver issue #93) e reage
// certo ao sucesso/erro.
function renderComContexto(login: (usuario: string, senha: string) => Promise<void>) {
  return render(
    <MemoryRouter initialEntries={['/entrar']}>
      <AuthContext.Provider
        value={{
          usuario: null,
          carregando: false,
          login,
          registrar: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renderiza campos de usuário (texto, não e-mail) e senha', () => {
    renderComContexto(vi.fn());

    const campoUsuario = screen.getByLabelText('Usuário');
    expect(campoUsuario).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  });

  it('chama login com usuário e senha digitados ao submeter', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    renderComContexto(login);

    await user.type(screen.getByLabelText('Usuário'), 'joao');
    await user.type(screen.getByLabelText('Senha'), 'StrongPass123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(login).toHaveBeenCalledWith('joao', 'StrongPass123!'));
  });

  it('mostra a mensagem de erro da API quando o login falha (ex: 401)', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new HttpError(401, 'Credenciais inválidas.'));
    renderComContexto(login);

    await user.type(screen.getByLabelText('Usuário'), 'joao');
    await user.type(screen.getByLabelText('Senha'), 'senha-errada');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('Credenciais inválidas.')).toBeInTheDocument();
  });

  it('mostra uma mensagem genérica quando o erro não é um HttpError', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new Error('falha de rede'));
    renderComContexto(login);

    await user.type(screen.getByLabelText('Usuário'), 'joao');
    await user.type(screen.getByLabelText('Senha'), 'x');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('Não foi possível entrar')).toBeInTheDocument();
  });
});
