import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { atualizarComunidade, buscarComunidade, criarComunidade } from '@/services/comunidades';
import { HttpError } from '@/services/http';
import type { ComunidadeInput } from '@/types/api';

const vazio: ComunidadeInput = { nome: '', descricao: '', cidade: '', contato: '', logo_url: '' };

export function FormComunidadePage() {
  const { id } = useParams<{ id: string }>();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<ComunidadeInput>(vazio);
  const [carregando, setCarregando] = useState(editando);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    buscarComunidade(id)
      .then((comunidade) =>
        setForm({
          nome: comunidade.nome,
          descricao: comunidade.descricao,
          cidade: comunidade.cidade,
          contato: comunidade.contato,
          logo_url: comunidade.logo_url ?? '',
        }),
      )
      .catch((err) => setErro(err instanceof HttpError ? err.message : 'Comunidade não encontrada'))
      .finally(() => setCarregando(false));
  }, [id]);

  function atualizarCampo<K extends keyof ComunidadeInput>(campo: K, valor: ComunidadeInput[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const payload = { ...form, logo_url: form.logo_url || undefined };
      const comunidade =
        editando && id ? await atualizarComunidade(id, payload) : await criarComunidade(payload);
      navigate(`/comunidades/${comunidade.id}`);
    } catch (err) {
      setErro(err instanceof HttpError ? err.message : 'Não foi possível salvar a comunidade');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>{editando ? 'Editar comunidade' : 'Nova comunidade'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                required
                minLength={3}
                maxLength={100}
                value={form.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                required
                minLength={10}
                value={form.descricao}
                onChange={(e) => atualizarCampo('descricao', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                required
                minLength={2}
                maxLength={100}
                value={form.cidade}
                onChange={(e) => atualizarCampo('cidade', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contato">Contato (e-mail ou URL)</Label>
              <Input
                id="contato"
                required
                value={form.contato}
                onChange={(e) => atualizarCampo('contato', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="logo_url">URL da logo (opcional)</Label>
              <Input
                id="logo_url"
                type="url"
                value={form.logo_url}
                onChange={(e) => atualizarCampo('logo_url', e.target.value)}
              />
            </div>
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
