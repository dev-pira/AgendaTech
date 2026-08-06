import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ShareButton } from '@/components/share-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { formatarData, rotuloTipoEvento } from '@/lib/format';
import { buscarEvento, excluirEvento } from '@/services/eventos';
import { HttpError } from '@/services/http';
import type { Evento } from '@/types/api';

export function DetalheEventoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    buscarEvento(id)
      .then((resposta) => {
        if (!cancelado) setEvento(resposta);
      })
      .catch((err) => {
        if (!cancelado) setErro(err instanceof HttpError ? err.message : 'Evento não encontrado');
      })
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [id]);

  async function handleExcluir() {
    if (!id || !evento) return;
    if (!confirm(`Excluir o evento "${evento.titulo}"?`)) return;
    setExcluindo(true);
    try {
      await excluirEvento(id);
      navigate('/eventos');
    } catch (err) {
      setErro(err instanceof HttpError ? err.message : 'Não foi possível excluir o evento');
      setExcluindo(false);
    }
  }

  if (carregando) return <p className="text-muted-foreground">Carregando...</p>;
  if (erro || !evento) return <p className="text-destructive">{erro ?? 'Evento não encontrado'}</p>;

  // A API não devolve organizador_id != usuário: mostramos ações a qualquer usuário
  // autenticado e deixamos o backend (403) ser a fonte de verdade sobre permissão,
  // já que "organizador da comunidade" não é algo que o detalhe do evento expõe hoje.
  const podeTentarGerenciar = Boolean(usuario);

  return (
    <div className="flex flex-col gap-6">
      <Link to="/eventos" className="text-sm text-muted-foreground hover:underline">
        ← Voltar à listagem
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{evento.titulo}</h1>
          {evento.comunidade && (
            <Link
              to={`/comunidades/${evento.comunidade.id}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              {evento.comunidade.nome}
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          <ShareButton title={evento.titulo} text={`${evento.titulo} — Agenda Tech`} />
          {podeTentarGerenciar && (
            <>
              <Button variant="outline" asChild>
                <Link to={`/eventos/${evento.id}/editar`}>Editar</Link>
              </Button>
              <Button variant="destructive" disabled={excluindo} onClick={handleExcluir}>
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{rotuloTipoEvento[evento.tipo]}</Badge>
          </div>
          <p>{evento.descricao}</p>
          <p className="text-sm">
            <span className="font-medium">Data:</span> {formatarData(evento.data)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Horário:</span> {evento.hora_inicio}
            {evento.hora_fim ? ` – ${evento.hora_fim}` : ''}
          </p>
          <p className="text-sm">
            <span className="font-medium">Local:</span> {evento.local}
          </p>
          {evento.url_online && (
            <p className="text-sm">
              <span className="font-medium">Link:</span>{' '}
              <a
                href={evento.url_online}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {evento.url_online}
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
