import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { formatarData, rotuloTipoEvento } from '@/lib/format';
import {
  excluirComunidade,
  buscarComunidade,
  listarEventosDaComunidade,
} from '@/services/comunidades';
import { HttpError } from '@/services/http';
import type { Comunidade, Evento } from '@/types/api';

export function DetalheComunidadePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [comunidade, setComunidade] = useState<Comunidade | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    setCarregando(true);
    Promise.all([buscarComunidade(id), listarEventosDaComunidade(id, { limite: 10 })])
      .then(([comunidadeResposta, eventosResposta]) => {
        if (cancelado) return;
        setComunidade(comunidadeResposta);
        setEventos(eventosResposta.dados);
        setErro(null);
      })
      .catch((err) => {
        if (cancelado) return;
        setErro(err instanceof HttpError ? err.message : 'Comunidade não encontrada');
      })
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [id]);

  async function handleExcluir() {
    if (!id || !comunidade) return;
    if (!confirm(`Excluir a comunidade "${comunidade.nome}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setExcluindo(true);
    try {
      await excluirComunidade(id);
      navigate('/comunidades');
    } catch (err) {
      setErro(err instanceof HttpError ? err.message : 'Não foi possível excluir a comunidade');
      setExcluindo(false);
    }
  }

  if (carregando) return <p className="text-muted-foreground">Carregando...</p>;
  if (erro || !comunidade) {
    return <p className="text-destructive">{erro ?? 'Comunidade não encontrada'}</p>;
  }

  const ehCriador = usuario?.id === comunidade.criado_por;

  return (
    <div className="flex flex-col gap-6">
      <Link to="/comunidades" className="text-sm text-muted-foreground hover:underline">
        ← Voltar à listagem
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{comunidade.nome}</h1>
          <p className="text-muted-foreground">{comunidade.cidade}</p>
        </div>
        {ehCriador && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/comunidades/${comunidade.id}/editar`}>Editar</Link>
            </Button>
            <Button variant="destructive" disabled={excluindo} onClick={handleExcluir}>
              {excluindo ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-5">
          <p>{comunidade.descricao}</p>
          <p className="text-sm">
            <span className="font-medium">Contato:</span> {comunidade.contato}
          </p>
          {comunidade.total_membros !== undefined && (
            <p className="text-sm text-muted-foreground">
              {comunidade.total_membros} membro(s) —{' '}
              <Link
                to={`/comunidades/${comunidade.id}/membros`}
                className="underline underline-offset-4"
              >
                ver membros
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Próximos eventos</h2>
        {eventos.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum evento cadastrado.</p>
        )}
        <div className="flex flex-col gap-2">
          {eventos.map((evento) => (
            <Link key={evento.id} to={`/eventos/${evento.id}`}>
              <Card className="transition-colors hover:border-primary">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{evento.titulo}</CardTitle>
                  <Badge variant="outline">{rotuloTipoEvento[evento.tipo]}</Badge>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {formatarData(evento.data)} · {evento.hora_inicio} · {evento.local}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
