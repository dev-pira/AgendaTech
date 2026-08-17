import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { formatarData, rotuloTipoEvento } from '@/lib/format';
import { listarComunidades } from '@/services/comunidades';
import { listarEventos, type FiltrosEventos } from '@/services/eventos';
import { HttpError } from '@/services/http';
import type { Comunidade, Evento, TipoEvento } from '@/types/api';

const TODOS = 'todos';

export function ListaEventosPage() {
  const { usuario } = useAuth();
  const [filtros, setFiltros] = useState<FiltrosEventos>({});
  const [pagina, setPagina] = useState(1);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Lista de comunidades pro filtro dropdown - a tela Blade equivalente
  // (eventos.index) tem esse select, o React nao tinha nenhum jeito de
  // filtrar por comunidade aqui (so via link vindo da propria comunidade).
  // Achado no regressivo #92.
  useEffect(() => {
    listarComunidades({ limite: 100 }).then((resposta) => setComunidades(resposta.dados));
  }, []);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    listarEventos({ ...filtros, pagina, limite: 15 })
      .then((resposta) => {
        if (cancelado) return;
        setEventos(resposta.dados);
        setTotalPaginas(resposta.paginacao.total_paginas);
        setErro(null);
      })
      .catch((err) => {
        if (cancelado) return;
        setErro(err instanceof HttpError ? err.message : 'Não foi possível carregar eventos');
      })
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [filtros, pagina]);

  function atualizarFiltro<K extends keyof FiltrosEventos>(campo: K, valor: FiltrosEventos[K]) {
    setPagina(1);
    setFiltros((atual) => ({ ...atual, [campo]: valor || undefined }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Eventos</h1>
        {usuario && (
          <Button asChild>
            <Link to="/eventos/novo">Novo Evento</Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filtros.comunidade_id ?? TODOS}
          onValueChange={(v) => atualizarFiltro('comunidade_id', v === TODOS ? undefined : v)}
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
          value={filtros.cidade ?? ''}
          onChange={(e) => atualizarFiltro('cidade', e.target.value)}
        />
        <Input
          type="date"
          className="max-w-xs"
          value={filtros.data_inicio ?? ''}
          onChange={(e) => atualizarFiltro('data_inicio', e.target.value)}
        />
        <Input
          type="date"
          className="max-w-xs"
          value={filtros.data_fim ?? ''}
          onChange={(e) => atualizarFiltro('data_fim', e.target.value)}
        />
        <Select
          value={filtros.tipo ?? TODOS}
          onValueChange={(v) =>
            atualizarFiltro('tipo', v === TODOS ? undefined : (v as TipoEvento))
          }
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
      {carregando && <p className="text-muted-foreground">Carregando...</p>}
      {!carregando && eventos.length === 0 && !erro && (
        <p className="text-muted-foreground">Nenhum evento encontrado.</p>
      )}

      <div className="flex flex-col gap-3">
        {eventos.map((evento) => (
          <Link key={evento.id} to={`/eventos/${evento.id}`}>
            <Card className="transition-colors hover:border-primary">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{evento.titulo}</CardTitle>
                <Badge variant="outline">{rotuloTipoEvento[evento.tipo]}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                <span>
                  {formatarData(evento.data)} · {evento.hora_inicio}
                  {evento.hora_fim ? ` – ${evento.hora_fim}` : ''} · {evento.local}
                </span>
                <span>{evento.comunidade.nome}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {pagina} de {totalPaginas}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
