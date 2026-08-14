import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { truncar } from '@/lib/format';
import { listarComunidades } from '@/services/comunidades';
import { HttpError } from '@/services/http';
import type { Comunidade } from '@/types/api';

export function ListaComunidadesPage() {
  const { usuario } = useAuth();
  const [cidade, setCidade] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    // Debounce simples pra não disparar 1 request por tecla digitada -
    // a busca agora é feita no backend (issue #92: antes só filtrava os
    // itens já carregados da página atual, perdia resultado fora dela).
    const timer = setTimeout(() => {
      setCarregando(true);
      listarComunidades({
        busca: busca || undefined,
        cidade: cidade || undefined,
        pagina,
        limite: 12,
      })
        .then((resposta) => {
          if (cancelado) return;
          setComunidades(resposta.dados);
          setTotalPaginas(resposta.paginacao.total_paginas);
          setErro(null);
        })
        .catch((err) => {
          if (cancelado) return;
          setErro(err instanceof HttpError ? err.message : 'Não foi possível carregar comunidades');
        })
        .finally(() => !cancelado && setCarregando(false));
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [busca, cidade, pagina]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Comunidades</h1>
        {usuario && (
          <Button asChild>
            <Link to="/comunidades/nova">Nova Comunidade</Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => {
            setPagina(1);
            setBusca(e.target.value);
          }}
          className="max-w-xs"
        />
        <Input
          placeholder="Filtrar por cidade..."
          value={cidade}
          onChange={(e) => {
            setPagina(1);
            setCidade(e.target.value);
          }}
          className="max-w-xs"
        />
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}
      {carregando && <p className="text-muted-foreground">Carregando...</p>}

      {!carregando && comunidades.length === 0 && !erro && (
        <p className="text-muted-foreground">Nenhuma comunidade encontrada.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {comunidades.map((comunidade) => (
          <Link key={comunidade.id} to={`/comunidades/${comunidade.id}`}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{comunidade.nome}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{comunidade.cidade}</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm">{truncar(comunidade.descricao, 100)}</p>
                {comunidade.total_membros !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {comunidade.total_membros} membro(s)
                  </p>
                )}
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
