import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import type { EventClickArg, EventInput } from '@fullcalendar/core';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { corPorComunidade } from '@/lib/colors';
import { buscarCalendario } from '@/services/calendario';
import { listarComunidades } from '@/services/comunidades';
import { HttpError } from '@/services/http';
import type { Comunidade, TipoEvento } from '@/types/api';

const TODOS = 'todos';

export function CalendarioPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const comunidadeId = searchParams.get('comunidade_id') ?? '';
  const cidade = searchParams.get('cidade') ?? '';
  const tipo = (searchParams.get('tipo') as TipoEvento | null) ?? '';

  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [eventos, setEventos] = useState<EventInput[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<{ inicio: string; fim: string } | null>(null);

  useEffect(() => {
    listarComunidades({ limite: 100 }).then((resposta) => setComunidades(resposta.dados));
  }, []);

  const carregarEventos = useCallback(
    (dataInicio: string, dataFim: string) => {
      buscarCalendario({
        data_inicio: dataInicio,
        data_fim: dataFim,
        comunidade_id: comunidadeId || undefined,
        cidade: cidade || undefined,
        tipo: tipo || undefined,
      })
        .then((resposta) => {
          setEventos(
            resposta.eventos.map((evento) => ({
              id: evento.id,
              title: evento.titulo,
              start: evento.hora_inicio ? `${evento.data}T${evento.hora_inicio}` : evento.data,
              end: evento.hora_fim ? `${evento.data}T${evento.hora_fim}` : undefined,
              backgroundColor: evento.comunidade
                ? corPorComunidade(evento.comunidade.id)
                : undefined,
              borderColor: evento.comunidade ? corPorComunidade(evento.comunidade.id) : undefined,
            })),
          );
          setErro(null);
        })
        .catch((err) =>
          setErro(
            err instanceof HttpError ? err.message : 'Não foi possível carregar o calendário',
          ),
        );
    },
    [comunidadeId, cidade, tipo],
  );

  // Refaz a busca com o mesmo período quando os filtros mudam (RN-CAL-05).
  useEffect(() => {
    if (periodo) carregarEventos(periodo.inicio, periodo.fim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunidadeId, cidade, tipo]);

  function atualizarFiltro(chave: string, valor: string) {
    const proximos = new URLSearchParams(searchParams);
    if (valor) proximos.set(chave, valor);
    else proximos.delete(chave);
    setSearchParams(proximos, { replace: true });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Calendário</h1>

      <div className="flex flex-wrap gap-3">
        <Select
          value={comunidadeId || TODOS}
          onValueChange={(v) => atualizarFiltro('comunidade_id', v === TODOS ? '' : v)}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Comunidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todas as comunidades</SelectItem>
            {comunidades.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Filtrar por cidade..."
          className="max-w-xs"
          value={cidade}
          onChange={(e) => atualizarFiltro('cidade', e.target.value)}
        />

        <Select
          value={tipo || TODOS}
          onValueChange={(v) => atualizarFiltro('tipo', v === TODOS ? '' : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os tipos</SelectItem>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="hibrido">Híbrido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <div className="rounded-lg border p-2">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          locale="pt-br"
          firstDay={0}
          dayMaxEvents={3}
          events={eventos}
          datesSet={(info) => {
            const inicio = info.startStr.slice(0, 10);
            const fim = info.endStr.slice(0, 10);
            setPeriodo({ inicio, fim });
            carregarEventos(inicio, fim);
          }}
          eventClick={(info: EventClickArg) => {
            info.jsEvent.preventDefault();
            navigate(`/eventos/${info.event.id}`);
          }}
          buttonText={{ today: 'Hoje' }}
        />
      </div>
    </div>
  );
}
