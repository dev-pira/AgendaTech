import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';
import * as comunidadesService from '@/services/comunidades';
import type { Membro } from '@/types/api';

import { MembrosComunidadePage } from './membros-page';

// Ver #30 ([Test Coverage]) - comunidades/membros-page.tsx estava em 0%.
const usuarioFake = { id: 'u1', nome: 'Fabio', email: 'fabio@example.com' };

const usuariosPorId: Record<string, { id: string; nome: string; email: string }> = {
  u1: { id: 'u1', nome: 'Fabio', email: 'fabio@example.com' },
  u2: { id: 'u2', nome: 'Maria', email: 'maria@example.com' },
};

function membro(overrides: Partial<Membro>): Membro {
  const usuarioId = overrides.usuario_id ?? 'u2';
  return {
    comunidade_id: 'c1',
    usuario_id: usuarioId,
    papel: 'membro',
    adicionado_em: '2026-01-01T00:00:00Z',
    adicionado_por: 'u1',
    usuario: usuariosPorId[usuarioId],
    ...overrides,
  };
}

function mockListaMembros(dados: Membro[]) {
  vi.spyOn(comunidadesService, 'listarMembros').mockResolvedValue({
    dados,
    paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: dados.length },
  });
}

function renderPage(usuario: typeof usuarioFake | null = null) {
  return render(
    <MemoryRouter initialEntries={['/comunidades/c1/membros']}>
      <AuthContext.Provider
        value={{ usuario, carregando: false, login: vi.fn(), registrar: vi.fn(), logout: vi.fn() }}
      >
        <Routes>
          <Route path="/comunidades/:id/membros" element={<MembrosComunidadePage />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('MembrosComunidadePage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('lista os membros com nome, e-mail e papel', async () => {
    mockListaMembros([membro({ usuario_id: 'u2', papel: 'membro' })]);

    renderPage();

    expect(await screen.findByText('Maria')).toBeInTheDocument();
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    expect(screen.getByText('Membro')).toBeInTheDocument();
  });

  it('não mostra "Adicionar Membro" nem ações pra quem não é organizador', async () => {
    mockListaMembros([membro({ usuario_id: 'u1', papel: 'membro' })]);

    renderPage(usuarioFake);

    await screen.findByText('Fabio');
    expect(screen.queryByRole('button', { name: 'Adicionar Membro' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Promover' })).not.toBeInTheDocument();
  });

  it('mostra "Adicionar Membro" e ações pra organizador', async () => {
    mockListaMembros([
      membro({ usuario_id: 'u1', papel: 'organizador' }),
      membro({ usuario_id: 'u2', papel: 'membro' }),
    ]);

    renderPage(usuarioFake);

    expect(await screen.findByRole('button', { name: 'Adicionar Membro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Promover' })).toBeInTheDocument();
  });

  it('adiciona um novo membro pelo diálogo e recarrega a lista', async () => {
    const user = userEvent.setup();
    mockListaMembros([membro({ usuario_id: 'u1', papel: 'organizador' })]);
    vi.spyOn(comunidadesService, 'adicionarMembro').mockResolvedValue(
      membro({ usuario_id: 'u3', papel: 'membro' }),
    );

    renderPage(usuarioFake);

    await user.click(await screen.findByRole('button', { name: 'Adicionar Membro' }));
    await user.type(screen.getByLabelText('E-mail'), 'novo@membro.com');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() =>
      expect(comunidadesService.adicionarMembro).toHaveBeenCalledWith('c1', {
        email: 'novo@membro.com',
        papel: 'membro',
      }),
    );
    await waitFor(() => expect(comunidadesService.listarMembros).toHaveBeenCalledTimes(2));
  });

  it('promove um membro pra organizador', async () => {
    const user = userEvent.setup();
    mockListaMembros([
      membro({ usuario_id: 'u1', papel: 'organizador' }),
      membro({ usuario_id: 'u2', papel: 'membro' }),
    ]);
    vi.spyOn(comunidadesService, 'atualizarPapelMembro').mockResolvedValue(
      membro({ usuario_id: 'u2', papel: 'organizador' }),
    );

    renderPage(usuarioFake);

    await screen.findByText('Maria');
    await user.click(screen.getAllByRole('button', { name: 'Promover' })[0]);

    await waitFor(() =>
      expect(comunidadesService.atualizarPapelMembro).toHaveBeenCalledWith(
        'c1',
        'u2',
        'organizador',
      ),
    );
  });

  it('remove um membro quando confirmado', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockListaMembros([
      membro({ usuario_id: 'u1', papel: 'organizador' }),
      membro({ usuario_id: 'u2', papel: 'membro' }),
    ]);
    vi.spyOn(comunidadesService, 'removerMembro').mockResolvedValue(undefined);

    renderPage(usuarioFake);

    await screen.findByText('Maria');
    // membros[0] é o próprio usuário logado (u1/Fabio, organizador);
    // membros[1] é a Maria (u2) - queremos remover ela, não a si mesmo.
    await user.click(screen.getAllByRole('button', { name: 'Remover' })[1]);

    await waitFor(() => expect(comunidadesService.removerMembro).toHaveBeenCalledWith('c1', 'u2'));
  });
});
