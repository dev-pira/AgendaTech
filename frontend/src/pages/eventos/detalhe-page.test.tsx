import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';
import * as comunidadesService from '@/services/comunidades';
import * as eventosService from '@/services/eventos';
import { HttpError } from '@/services/http';
import type { Comunidade, Evento } from '@/types/api';

import { DetalheEventoPage } from './detalhe-page';

// Ver #30 ([Test Coverage]) - eventos/detalhe-page.tsx estava em 0%. Cobre
// a regra de permissão real (organizador da comunidade, não "qualquer
// logado") corrigida no regressivo #92.
const usuarioFake = { id: 'u1', nome: 'Fabio', email: 'fabio@example.com' };
const eventoFake: Evento = {
  id: 'e1',
  titulo: 'Meetup React',
  descricao: 'Um encontro sobre React',
  data: '2026-09-10',
  hora_inicio: '19:00',
  hora_fim: '21:00',
  local: 'Online',
  tipo: 'online',
  url_online: 'https://meet.example.com/x',
  criado_em: '2026-01-01T00:00:00Z',
  atualizado_em: '2026-01-01T00:00:00Z',
  comunidade: { id: 'c1', nome: 'DEVPIRA', cidade: 'Piracicaba' },
  organizador: { id: 'u2', nome: 'Maria' },
};

function comunidadeComMembros(membros: Comunidade['membros']): Comunidade {
  return {
    id: 'c1',
    nome: 'DEVPIRA',
    descricao: 'x',
    cidade: 'Piracicaba',
    contato: 'a@b.com',
    logo_url: null,
    total_membros: membros?.length ?? 0,
    criado_em: '2026-01-01T00:00:00Z',
    atualizado_em: '2026-01-01T00:00:00Z',
    membros,
  };
}

function renderPage(usuario: typeof usuarioFake | null = null) {
  return render(
    <MemoryRouter initialEntries={['/eventos/e1']}>
      <AuthContext.Provider
        value={{ usuario, carregando: false, login: vi.fn(), registrar: vi.fn(), logout: vi.fn() }}
      >
        <Routes>
          <Route path="/eventos/:id" element={<DetalheEventoPage />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('DetalheEventoPage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('mostra os dados do evento depois de carregar', async () => {
    vi.spyOn(eventosService, 'buscarEvento').mockResolvedValue(eventoFake);

    renderPage();

    expect(await screen.findByText('Meetup React')).toBeInTheDocument();
    expect(screen.getByText('Um encontro sobre React')).toBeInTheDocument();
    expect(screen.getByText('Maria', { exact: false })).toBeInTheDocument();
  });

  it('mostra mensagem de erro quando o evento não é encontrado', async () => {
    vi.spyOn(eventosService, 'buscarEvento').mockRejectedValue(
      new HttpError(404, 'Evento não encontrado.'),
    );

    renderPage();

    expect(await screen.findByText('Evento não encontrado.')).toBeInTheDocument();
  });

  it('não mostra Editar/Excluir pra visitante anônimo', async () => {
    vi.spyOn(eventosService, 'buscarEvento').mockResolvedValue(eventoFake);

    renderPage(null);

    await screen.findByText('Meetup React');
    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
  });

  it('não mostra Editar/Excluir pra usuário logado que não é organizador da comunidade', async () => {
    vi.spyOn(eventosService, 'buscarEvento').mockResolvedValue(eventoFake);
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(
      comunidadeComMembros([{ usuario_id: 'u1', papel: 'membro', nome: 'Fabio' }]),
    );

    renderPage(usuarioFake);

    await screen.findByText('Meetup React');
    await waitFor(() => expect(comunidadesService.buscarComunidade).toHaveBeenCalledWith('c1'));
    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument();
  });

  it('mostra Editar/Excluir pra usuário que É organizador da comunidade do evento', async () => {
    vi.spyOn(eventosService, 'buscarEvento').mockResolvedValue(eventoFake);
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(
      comunidadeComMembros([{ usuario_id: 'u1', papel: 'organizador', nome: 'Fabio' }]),
    );

    renderPage(usuarioFake);

    expect(await screen.findByRole('link', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('exclui o evento quando confirmado', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(eventosService, 'buscarEvento').mockResolvedValue(eventoFake);
    vi.spyOn(eventosService, 'excluirEvento').mockResolvedValue(undefined);
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(
      comunidadeComMembros([{ usuario_id: 'u1', papel: 'organizador', nome: 'Fabio' }]),
    );

    renderPage(usuarioFake);

    await user.click(await screen.findByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(eventosService.excluirEvento).toHaveBeenCalledWith('e1'));
  });

  it('não exclui quando o usuário cancela a confirmação', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    vi.spyOn(eventosService, 'buscarEvento').mockResolvedValue(eventoFake);
    const excluir = vi.spyOn(eventosService, 'excluirEvento');
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(
      comunidadeComMembros([{ usuario_id: 'u1', papel: 'organizador', nome: 'Fabio' }]),
    );

    renderPage(usuarioFake);

    await user.click(await screen.findByRole('button', { name: 'Excluir' }));

    expect(excluir).not.toHaveBeenCalled();
  });
});
