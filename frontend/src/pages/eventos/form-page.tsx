import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { listarComunidades } from '@/services/comunidades';
import { atualizarEvento, buscarEvento, criarEvento } from '@/services/eventos';
import { HttpError } from '@/services/http';
import type { Comunidade, EventoInput, TipoEvento } from '@/types/api';

const vazio: EventoInput = {
  titulo: '',
  descricao: '',
  data: '',
  hora_inicio: '',
  hora_fim: '',
  local: '',
  tipo: 'presencial',
  url_online: '',
  comunidade_id: '',
};

export function FormEventoPage() {
  const { id } = useParams<{ id: string }>();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<EventoInput>(vazio);
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listarComunidades({ limite: 100 }), id ? buscarEvento(id) : Promise.resolve(null)])
      .then(([comunidadesResposta, evento]) => {
        setComunidades(comunidadesResposta.dados);
        if (evento) {
          setForm({
            titulo: evento.titulo,
            descricao: evento.descricao,
            data: evento.data,
            hora_inicio: evento.hora_inicio,
            hora_fim: evento.hora_fim ?? '',
            local: evento.local,
            tipo: evento.tipo,
            url_online: evento.url_online ?? '',
            comunidade_id: evento.comunidade_id,
          });
        } else if (comunidadesResposta.dados[0]) {
          setForm((atual) => ({ ...atual, comunidade_id: comunidadesResposta.dados[0].id }));
        }
      })
      .catch((err) =>
        setErro(err instanceof HttpError ? err.message : 'Não foi possível carregar o formulário'),
      )
      .finally(() => setCarregando(false));
  }, [id]);

  function atualizarCampo<K extends keyof EventoInput>(campo: K, valor: EventoInput[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const payload = {
        ...form,
        hora_fim: form.hora_fim || undefined,
        url_online: form.url_online || undefined,
      };
      const evento =
        editando && id ? await atualizarEvento(id, payload) : await criarEvento(payload);
      navigate(`/eventos/${evento.id}`);
    } catch (err) {
      setErro(err instanceof HttpError ? err.message : 'Não foi possível salvar o evento');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <p className="text-muted-foreground">Carregando...</p>;

  const precisaUrlOnline = form.tipo !== 'presencial';

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>{editando ? 'Editar evento' : 'Novo evento'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="comunidade">Comunidade</Label>
              <Select
                value={form.comunidade_id}
                onValueChange={(v) => atualizarCampo('comunidade_id', v)}
                disabled={editando}
              >
                <SelectTrigger id="comunidade">
                  <SelectValue placeholder="Selecione a comunidade" />
                </SelectTrigger>
                <SelectContent>
                  {comunidades.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                required
                minLength={5}
                maxLength={200}
                value={form.titulo}
                onChange={(e) => atualizarCampo('titulo', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                required
                minLength={20}
                value={form.descricao}
                onChange={(e) => atualizarCampo('descricao', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  required
                  value={form.data}
                  onChange={(e) => atualizarCampo('data', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="hora_inicio">Início</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  required
                  value={form.hora_inicio}
                  onChange={(e) => atualizarCampo('hora_inicio', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="hora_fim">Fim (opcional)</Label>
                <Input
                  id="hora_fim"
                  type="time"
                  value={form.hora_fim}
                  onChange={(e) => atualizarCampo('hora_fim', e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                required
                minLength={3}
                maxLength={300}
                placeholder="Endereço ou 'Online'"
                value={form.local}
                onChange={(e) => atualizarCampo('local', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => atualizarCampo('tipo', v as TipoEvento)}
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {precisaUrlOnline && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="url_online">Link do evento online</Label>
                <Input
                  id="url_online"
                  type="url"
                  required
                  value={form.url_online}
                  onChange={(e) => atualizarCampo('url_online', e.target.value)}
                />
              </div>
            )}

            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
