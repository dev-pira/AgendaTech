import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { formatarDataHora, rotuloPapel } from '@/lib/format';
import {
  adicionarMembro,
  atualizarPapelMembro,
  listarMembros,
  removerMembro,
} from '@/services/comunidades';
import { HttpError } from '@/services/http';
import type { Membro, PapelMembro } from '@/types/api';

export function MembrosComunidadePage() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();

  const [membros, setMembros] = useState<Membro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [emailNovoMembro, setEmailNovoMembro] = useState('');
  const [papelNovoMembro, setPapelNovoMembro] = useState<PapelMembro>('membro');
  const [erroDialog, setErroDialog] = useState<string | null>(null);
  const [enviandoDialog, setEnviandoDialog] = useState(false);

  async function carregar() {
    if (!id) return;
    setCarregando(true);
    try {
      const resposta = await listarMembros(id);
      setMembros(resposta.dados);
      setErro(null);
    } catch (err) {
      setErro(err instanceof HttpError ? err.message : 'Não foi possível carregar os membros');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const souOrganizador = membros.some(
    (m) => m.usuario?.id === usuario?.id && m.papel === 'organizador',
  );

  async function handleAdicionar(event: FormEvent) {
    event.preventDefault();
    if (!id) return;
    setErroDialog(null);
    setEnviandoDialog(true);
    try {
      await adicionarMembro(id, { email: emailNovoMembro, papel: papelNovoMembro });
      setDialogAberto(false);
      setEmailNovoMembro('');
      setPapelNovoMembro('membro');
      await carregar();
    } catch (err) {
      setErroDialog(err instanceof HttpError ? err.message : 'Não foi possível adicionar membro');
    } finally {
      setEnviandoDialog(false);
    }
  }

  async function handleAlterarPapel(usuarioId: string, papel: PapelMembro) {
    if (!id) return;
    try {
      await atualizarPapelMembro(id, usuarioId, papel);
      await carregar();
    } catch (err) {
      setErro(err instanceof HttpError ? err.message : 'Não foi possível alterar o papel');
    }
  }

  async function handleRemover(usuarioId: string, nome: string) {
    if (!id) return;
    if (!confirm(`Remover "${nome}" da comunidade?`)) return;
    try {
      await removerMembro(id, usuarioId);
      await carregar();
    } catch (err) {
      setErro(err instanceof HttpError ? err.message : 'Não foi possível remover o membro');
    }
  }

  if (carregando) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link to={`/comunidades/${id}`} className="text-sm text-muted-foreground hover:underline">
        ← Voltar à comunidade
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Membros</h1>
        {souOrganizador && (
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button>Adicionar Membro</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar membro</DialogTitle>
              </DialogHeader>
              <form className="flex flex-col gap-4" onSubmit={handleAdicionar}>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email-membro">E-mail</Label>
                  <Input
                    id="email-membro"
                    type="email"
                    required
                    value={emailNovoMembro}
                    onChange={(e) => setEmailNovoMembro(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Papel</Label>
                  <Select
                    value={papelNovoMembro}
                    onValueChange={(v) => setPapelNovoMembro(v as PapelMembro)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="membro">Membro</SelectItem>
                      <SelectItem value="organizador">Organizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {erroDialog && <p className="text-sm text-destructive">{erroDialog}</p>}
                <DialogFooter>
                  <Button type="submit" disabled={enviandoDialog}>
                    {enviandoDialog ? 'Adicionando...' : 'Adicionar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Adicionado em</TableHead>
            {souOrganizador && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {membros.map((membro) => (
            <TableRow key={membro.usuario_id}>
              <TableCell>{membro.usuario?.nome ?? '—'}</TableCell>
              <TableCell>{membro.usuario?.email ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={membro.papel === 'organizador' ? 'default' : 'secondary'}>
                  {rotuloPapel[membro.papel]}
                </Badge>
              </TableCell>
              <TableCell>{formatarDataHora(membro.adicionado_em)}</TableCell>
              {souOrganizador && (
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleAlterarPapel(
                        membro.usuario_id,
                        membro.papel === 'organizador' ? 'membro' : 'organizador',
                      )
                    }
                  >
                    {membro.papel === 'organizador' ? 'Rebaixar' : 'Promover'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemover(membro.usuario_id, membro.usuario?.nome ?? '')}
                  >
                    Remover
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
