# Agenda Tech — Frontend (DevItape)

Interface web em React + TypeScript + Vite para o [Agenda Tech](../README.md), consumindo a
API do [backend](../backend).

## Stack

| Camada         | Tecnologia                                                       |
| -------------- | ---------------------------------------------------------------- |
| Framework      | React 19 + TypeScript                                            |
| Bundler        | Vite                                                             |
| Roteamento     | React Router v7 (SPA, client-side)                               |
| Estilo         | Tailwind CSS v4                                                  |
| Componentes UI | shadcn/ui (Radix UI + `class-variance-authority`)                |
| Calendário     | FullCalendar (`@fullcalendar/react` + `daygrid` + `interaction`) |
| Lint/format    | ESLint 9 (flat config) + Prettier 3                              |

## Setup local

### 1. Pré-requisitos

- Node.js ≥ 20 (`node -v`)
- Backend rodando localmente (ver [`../backend/README.md`](../backend/README.md)) — ou use
  o [`docker-compose.yml`](../docker-compose.yml) na raiz do repo para subir tudo de uma vez.

### 2. Instalar dependências

```bash
cd frontend
npm install
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
# App em http://localhost:5173
```

Por padrão, o frontend chama `/api` e o **Vite faz proxy** dessas chamadas para
`http://localhost:3333` (ver `vite.config.ts`) — não é necessário configurar `.env` nem lidar
com CORS para rodar contra um backend local na porta padrão. Para apontar para outro backend,
copie `.env.example` para `.env` e defina `VITE_API_URL`.

### Modo mock

O backend ainda não precisa estar rodando pra desenvolver ou demonstrar o frontend. Com
`VITE_USE_MOCK=true` (copie `.env.example` para `.env` e ajuste), a aplicação inteira passa a
rodar contra dados fake em memória (`src/mocks/`), que replicam as mesmas regras de negócio do
backend real (RN-COM-_, RN-EVT-_, RN-ORG-*) — inclusive erros 401/403/404/409/422 nos mesmos
cenários. O toggle fica centralizado em `MOCK_ENABLED` (`src/services/http.ts`); cada função em
`src/services/*.ts` decide entre chamar o mock ou a API real, então **nenhuma página ou
componente precisa saber qual modo está ativo**.

```bash
echo "VITE_USE_MOCK=true" >> .env
npm run dev
```

Login de demonstração (mesmo e-mail do seed do backend): `organizador@devlimeira.dev` /
`senha123`. Os dados resetam a cada reload da página — é em memória, não persiste.

Quando o backend real estiver disponível, é só voltar `VITE_USE_MOCK=false` (ou remover a
variável) e apontar `VITE_API_URL` para ele — nenhum código de página muda. Runbook completo pra
quem for publicar o backend e conectar aqui:
[`docs/development/backend-integration.md`](../docs/development/backend-integration.md).

### 4. Build de produção

```bash
npm run build   # gera frontend/dist
npm run preview # serve o build localmente para conferir
```

### 5. Lint e formatação

```bash
npm run lint          # eslint .
npm run lint:fix       # eslint . --fix
npm run format         # prettier --write .
npm run format:check   # prettier --check .
```

## Estrutura de pastas

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/         # componentes shadcn/ui (button, card, dialog, select, table...)
│   │   └── layout/      # RootLayout (header/nav) e ProtectedRoute
│   ├── context/          # AuthProvider (estado de autenticação)
│   ├── hooks/            # useAuth
│   ├── lib/              # utils (cn), formatação de data, cores por comunidade
│   ├── pages/
│   │   ├── auth/          # login, registro
│   │   ├── comunidades/   # listagem, detalhes, formulário, membros
│   │   ├── eventos/       # listagem, detalhes, formulário
│   │   └── calendario/    # calendário mensal (FullCalendar)
│   ├── routes/            # definição de rotas (react-router-dom)
│   ├── services/          # client HTTP + funções por recurso da API
│   └── types/             # tipos TS espelhando o contrato real da API
└── vite.config.ts
```

## Rotas implementadas

Conforme [`docs/escopo-funcional.md`](../docs/escopo-funcional.md):

| Rota                                   | Autenticação | Descrição                                 |
| -------------------------------------- | :----------: | ----------------------------------------- |
| `/comunidades`                         |     não      | Listagem com busca e filtro por cidade    |
| `/comunidades/:id`                     |     não      | Detalhes + próximos eventos               |
| `/comunidades/nova`                    |     sim      | Criar comunidade                          |
| `/comunidades/:id/editar`              |     sim      | Editar comunidade                         |
| `/comunidades/:id/membros`             |     sim      | Gestão de membros/organizadores           |
| `/eventos`                             |     não      | Listagem com filtros (cidade, data, tipo) |
| `/eventos/:id`                         |     não      | Detalhes do evento                        |
| `/eventos/novo`, `/eventos/:id/editar` |     sim      | Criar/editar evento                       |
| `/calendario`                          |     não      | Calendário mensal (FullCalendar)          |
| `/login`, `/registro`                  |     não      | Autenticação                              |

## Nota: contrato da API implementada vs. documentada

`src/types/api.ts` foi modelado a partir do **código real do backend** (`backend/src`), que
diverge em alguns pontos do `docs/escopo-funcional.md`:

- `GET /api/calendario` responde `{ eventos, total, periodo }`, não `{ dados, total_eventos }`.
- A listagem de membros aninha nome/e-mail em `membro.usuario`, não no nível raiz do item.
- `GET /comunidades/:id` não retorna a lista de `membros` (só `total_membros` na listagem).
- O backend não devolve uma cor por comunidade no calendário — o frontend gera uma cor estável
  a partir do `id` da comunidade (`src/lib/colors.ts`).

Se o backend mudar esses contratos, atualize `src/types/api.ts` e os arquivos em
`src/services/` de acordo.

## Auditoria de dependências

`npm audit` acusa uma vulnerabilidade alta em `react-router` (GHSA-qwww-vcr4-c8h2, "RSC Mode
CSRF Bypass"). Ela afeta apenas o modo Framework/RSC do React Router (Server Actions), que este
projeto **não usa** — aqui o React Router roda em modo SPA puro (`createBrowserRouter` sem
`unstable_*` data APIs de servidor). É seguro ignorar até uma versão >8.2.0 estável corrigir o
advisory.
