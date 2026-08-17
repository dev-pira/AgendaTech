import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';
import * as comunidadesService from '@/services/comunidades';
import { HttpError } from '@/services/http';
import type { Comunidade } from '@/types/api';

import { ListaComunidadesPage } from './lista-page';

// Ver #30 ([Test Coverage]) - comunidades/lista-page.tsx estava em 0%.
// Cobre a busca no backend com debounce (achado do regressivo #92: antes
// filtrava só a página já carregada, não o banco inteiro).
const usuarioFake = { id: 'u1', nome: 'Fabio', email: 'fabio@example.com' };
const comunidadeFake: Comunidade = {
  id: 'c1',
  nome: 'DEVPIRA',
  descricao: 'Comunidade de desenvolvedores de Piracicaba e região'.repeat(2),
  cidade: 'Piracicaba',
  contato: 'a@b.com',
  logo_url: null,
  total_membros: 5,
  criado_em: '2026-01-01T00:00:00Z',
};

function renderPage(usuario: typeof usuarioFake | null = null) {
  return render(
    <MemoryRouter initialEntries={['/comunidades']}>
      <AuthContext.Provider
        value={{ usuario, carregando: false, login: vi.fn(), registrar: vi.fn(), logout: vi.fn() }}
      >
        <ListaComunidadesPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('ListaComunidadesPage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('carrega e lista as comunidades depois do debounce inicial', async () => {
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [comunidadeFake],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 1 },
    });

    renderPage();

    expect(await screen.findByText('DEVPIRA')).toBeInTheDocument();
    expect(screen.getByText('5 membro(s)')).toBeInTheDocument();
    expect(comunidadesService.listarComunidades).toHaveBeenCalledWith({
      busca: undefined,
      cidade: undefined,
      pagina: 1,
      limite: 12,
    });
  });

  it('não mostra "Nova Comunidade" pra visitante anônimo', async () => {
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 0 },
    });

    renderPage(null);

    await waitFor(() => expect(comunidadesService.listarComunidades).toHaveBeenCalled());
    expect(screen.queryByRole('link', { name: 'Nova Comunidade' })).not.toBeInTheDocument();
  });

  it('mostra "Nova Comunidade" pra usuário logado', async () => {
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 0 },
    });

    renderPage(usuarioFake);

    expect(await screen.findByRole('link', { name: 'Nova Comunidade' })).toBeInTheDocument();
  });

  it('mostra mensagem de vazio quando não há comunidades', async () => {
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 0 },
    });

    renderPage();

    expect(await screen.findByText('Nenhuma comunidade encontrada.')).toBeInTheDocument();
  });

  it('mostra a mensagem de erro da API quando a listagem falha', async () => {
    vi.spyOn(comunidadesService, 'listarComunidades').mockRejectedValue(
      new HttpError(500, 'Não foi possível carregar comunidades.'),
    );

    renderPage();

    expect(await screen.findByText('Não foi possível carregar comunidades.')).toBeInTheDocument();
  });

  it('busca por nome dispara a chamada (debounced) com o termo digitado', async () => {
    const user = userEvent.setup();
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 0 },
    });

    renderPage();
    await waitFor(() => expect(comunidadesService.listarComunidades).toHaveBeenCalledTimes(1));

    await user.type(screen.getByPlaceholderText('Buscar por nome...'), 'dev');

    await waitFor(() =>
      expect(comunidadesService.listarComunidades).toHaveBeenLastCalledWith(
        expect.objectContaining({ busca: 'dev', pagina: 1 }),
      ),
    );
  });

  it('mostra paginação e navega pra próxima página', async () => {
    const user = userEvent.setup();
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [comunidadeFake],
      paginacao: { pagina: 1, total_paginas: 2, limite: 12, total: 20 },
    });

    renderPage();

    const botaoProxima = await screen.findByRole('button', { name: 'Próxima' });
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();

    await user.click(botaoProxima);

    await waitFor(() =>
      expect(comunidadesService.listarComunidades).toHaveBeenLastCalledWith(
        expect.objectContaining({ pagina: 2 }),
      ),
    );
  });
});
