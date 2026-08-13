import type { Comunidade, Evento, Membro, PapelMembro, TipoEvento } from '@/types/api';

/**
 * "Banco de dados" em memória do modo mock. Reseta a cada reload da página —
 * é intencional: o mock existe pra demonstrar a UI, não pra persistir dados.
 */

export function uuid() {
  return crypto.randomUUID();
}

function diasAPartirDeHoje(dias: number) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

interface UsuarioInterno {
  id: string;
  nome: string;
  email: string;
  senha: string;
  criado_em: string;
}

export const usuarios: UsuarioInterno[] = [
  {
    id: 'usr-organizador-devlimeira',
    nome: 'Organizador DevLimeira',
    email: 'organizador@devlimeira.dev',
    senha: 'senha123',
    criado_em: '2026-01-15T10:00:00Z',
  },
  {
    id: 'usr-organizador-devitape',
    nome: 'Organizadora DevItape',
    email: 'organizadora@devitape.dev',
    senha: 'senha123',
    criado_em: '2026-02-01T10:00:00Z',
  },
];

export const comunidades: Comunidade[] = [
  {
    id: 'com-devlimeira',
    nome: 'DevLimeira',
    descricao:
      'Comunidade de tecnologia de Limeira/SP. Encontros mensais, meetups e workshops abertos a todos os níveis.',
    cidade: 'Limeira',
    contato: 'contato@devlimeira.dev',
    logo_url: null,
    criado_em: '2026-01-15T10:00:00Z',
    atualizado_em: '2026-01-15T10:00:00Z',
    criado_por: { id: 'usr-organizador-devlimeira', nome: 'Organizador DevLimeira' },
    total_membros: 2,
  },
  {
    id: 'com-devitape',
    nome: 'DevItape',
    descricao:
      'Comunidade de desenvolvedores de Itapetininga e região. Foco em frontend, design e boas práticas de engenharia.',
    cidade: 'Itapetininga',
    contato: 'contato@devitape.dev',
    logo_url: null,
    criado_em: '2026-02-01T09:00:00Z',
    atualizado_em: '2026-02-01T09:00:00Z',
    criado_por: { id: 'usr-organizador-devitape', nome: 'Organizadora DevItape' },
    total_membros: 1,
  },
];

export const membros: Membro[] = [
  {
    comunidade_id: 'com-devlimeira',
    usuario_id: 'usr-organizador-devlimeira',
    papel: 'organizador' as PapelMembro,
    adicionado_em: '2026-01-15T10:00:00Z',
    adicionado_por: 'usr-organizador-devlimeira',
    usuario: {
      id: 'usr-organizador-devlimeira',
      nome: 'Organizador DevLimeira',
      email: 'organizador@devlimeira.dev',
    },
  },
  {
    comunidade_id: 'com-devlimeira',
    usuario_id: 'usr-organizador-devitape',
    papel: 'membro' as PapelMembro,
    adicionado_em: '2026-03-01T10:00:00Z',
    adicionado_por: 'usr-organizador-devlimeira',
    usuario: {
      id: 'usr-organizador-devitape',
      nome: 'Organizadora DevItape',
      email: 'organizadora@devitape.dev',
    },
  },
  {
    comunidade_id: 'com-devitape',
    usuario_id: 'usr-organizador-devitape',
    papel: 'organizador' as PapelMembro,
    adicionado_em: '2026-02-01T09:00:00Z',
    adicionado_por: 'usr-organizador-devitape',
    usuario: {
      id: 'usr-organizador-devitape',
      nome: 'Organizadora DevItape',
      email: 'organizadora@devitape.dev',
    },
  },
];

export const eventos: Evento[] = [
  {
    id: 'evt-meetup-react',
    titulo: 'Meetup React Avançado',
    descricao: 'Palestras sobre React Server Components, performance e novidades do ecossistema.',
    data: diasAPartirDeHoje(4),
    hora_inicio: '19:00',
    hora_fim: '21:30',
    local: 'Espaço Coworking Limeira - Rua Dev, 123',
    tipo: 'presencial' as TipoEvento,
    url_online: null,
    comunidade_id: 'com-devlimeira',
    organizador_id: 'usr-organizador-devlimeira',
    criado_em: '2026-07-20T10:00:00Z',
    atualizado_em: '2026-07-20T10:00:00Z',
    comunidade: { id: 'com-devlimeira', nome: 'DevLimeira', cidade: 'Limeira' },
    organizador: { id: 'usr-organizador-devlimeira', nome: 'Organizador DevLimeira' },
  },
  {
    id: 'evt-workshop-node',
    titulo: 'Workshop de Node.js e APIs REST',
    descricao: 'Hands-on de criação de APIs REST com Express e boas práticas de validação.',
    data: diasAPartirDeHoje(11),
    hora_inicio: '14:00',
    hora_fim: '18:00',
    local: 'Online',
    tipo: 'online' as TipoEvento,
    url_online: 'https://meet.example.com/devlimeira-node',
    comunidade_id: 'com-devlimeira',
    organizador_id: 'usr-organizador-devlimeira',
    criado_em: '2026-07-22T10:00:00Z',
    atualizado_em: '2026-07-22T10:00:00Z',
    comunidade: { id: 'com-devlimeira', nome: 'DevLimeira', cidade: 'Limeira' },
    organizador: { id: 'usr-organizador-devlimeira', nome: 'Organizador DevLimeira' },
  },
  {
    id: 'evt-design-systems',
    titulo: 'Design Systems na prática',
    descricao:
      'Como construir e manter um design system consistente entre times de produto e engenharia.',
    data: diasAPartirDeHoje(7),
    hora_inicio: '19:30',
    hora_fim: '21:00',
    local: 'Híbrido — presencial em Itapetininga ou online',
    tipo: 'hibrido' as TipoEvento,
    url_online: 'https://meet.example.com/devitape-design',
    comunidade_id: 'com-devitape',
    organizador_id: 'usr-organizador-devitape',
    criado_em: '2026-07-25T10:00:00Z',
    atualizado_em: '2026-07-25T10:00:00Z',
    comunidade: { id: 'com-devitape', nome: 'DevItape', cidade: 'Itapetininga' },
    organizador: { id: 'usr-organizador-devitape', nome: 'Organizadora DevItape' },
  },
  {
    id: 'evt-coding-dojo',
    titulo: 'Coding Dojo: Testes Automatizados',
    descricao: 'Sessão prática de TDD em grupo, resolvendo desafios com testes automatizados.',
    data: diasAPartirDeHoje(18),
    hora_inicio: '19:00',
    hora_fim: null,
    local: 'Espaço Coworking Limeira - Rua Dev, 123',
    tipo: 'presencial' as TipoEvento,
    url_online: null,
    comunidade_id: 'com-devlimeira',
    organizador_id: 'usr-organizador-devlimeira',
    criado_em: '2026-07-28T10:00:00Z',
    atualizado_em: '2026-07-28T10:00:00Z',
    comunidade: { id: 'com-devlimeira', nome: 'DevLimeira', cidade: 'Limeira' },
    organizador: { id: 'usr-organizador-devlimeira', nome: 'Organizador DevLimeira' },
  },
];
