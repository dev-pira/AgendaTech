import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';
import { HttpError } from '@/services/http';

import { RegistroPage } from './registro-page';

// Ver #30 ([Test Coverage]) - registro-page.tsx estava em 0%. Mesmo padrão
// do login-page.test.tsx: AuthContext controlado, sem depender do
// AuthProvider real.
function renderComContexto(registrar: (dados: unknown) => Promise<void>) {
  return render(
    <MemoryRouter initialEntries={['/registro']}>
      <AuthContext.Provider
        value={{
          usuario: null,
          carregando: false,
          login: vi.fn(),
          registrar: registrar as never,
          logout: vi.fn(),
        }}
      >
        <RegistroPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

async function preencherFormulario(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Usuário'), 'joaosilva');
  await user.type(screen.getByLabelText('Nome'), 'João');
  await user.type(screen.getByLabelText('Sobrenome'), 'Silva');
  await user.type(screen.getByLabelText('E-mail'), 'joao@example.com');
  await user.type(screen.getByLabelText('Senha'), 'SenhaForte123');
  await user.type(screen.getByLabelText('Confirmar senha'), 'SenhaForte123');
}

describe('RegistroPage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renderiza todos os campos do CadastroRequest', () => {
    renderComContexto(vi.fn());

    expect(screen.getByLabelText('Usuário')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Sobrenome')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Confirmar senha')).toHaveAttribute('type', 'password');
  });

  it('chama registrar() com os campos no formato do CadastroRequest (first_name/last_name/password)', async () => {
    const user = userEvent.setup();
    const registrar = vi.fn().mockResolvedValue(undefined);
    renderComContexto(registrar);

    await preencherFormulario(user);
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() =>
      expect(registrar).toHaveBeenCalledWith({
        username: 'joaosilva',
        email: 'joao@example.com',
        first_name: 'João',
        last_name: 'Silva',
        password: 'SenhaForte123',
        password_confirmation: 'SenhaForte123',
      }),
    );
  });

  it('envia last_name: undefined quando sobrenome fica em branco', async () => {
    const user = userEvent.setup();
    const registrar = vi.fn().mockResolvedValue(undefined);
    renderComContexto(registrar);

    await user.type(screen.getByLabelText('Usuário'), 'joaosilva');
    await user.type(screen.getByLabelText('Nome'), 'João');
    await user.type(screen.getByLabelText('E-mail'), 'joao@example.com');
    await user.type(screen.getByLabelText('Senha'), 'SenhaForte123');
    await user.type(screen.getByLabelText('Confirmar senha'), 'SenhaForte123');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() =>
      expect(registrar).toHaveBeenCalledWith(expect.objectContaining({ last_name: undefined })),
    );
  });

  it('mostra erro e não chama registrar() quando as senhas não coincidem', async () => {
    const user = userEvent.setup();
    const registrar = vi.fn();
    renderComContexto(registrar);

    await preencherFormulario(user);
    await user.clear(screen.getByLabelText('Confirmar senha'));
    await user.type(screen.getByLabelText('Confirmar senha'), 'OutraSenha123');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText('As senhas não coincidem')).toBeInTheDocument();
    expect(registrar).not.toHaveBeenCalled();
  });

  it('mostra a mensagem de erro da API quando o cadastro falha (ex: 409 username em uso)', async () => {
    const user = userEvent.setup();
    const registrar = vi.fn().mockRejectedValue(new HttpError(409, 'Username já está em uso.'));
    renderComContexto(registrar);

    await preencherFormulario(user);
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText('Username já está em uso.')).toBeInTheDocument();
  });

  it('mostra uma mensagem genérica quando o erro não é um HttpError', async () => {
    const user = userEvent.setup();
    const registrar = vi.fn().mockRejectedValue(new Error('falha de rede'));
    renderComContexto(registrar);

    await preencherFormulario(user);
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText('Não foi possível criar a conta')).toBeInTheDocument();
  });
});
