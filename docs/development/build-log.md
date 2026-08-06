# Build Log — Como o Frontend Foi Construído

Registro retroativo, passo a passo, do que foi feito para sair de "pasta `frontend/` vazia" até
o estado atual — incluindo decisões técnicas, problemas encontrados e o que mudou de rumo.
Existe porque foi pedido explicitamente: um histórico compartilhável para explicar a estrutura
do projeto a terceiros.

## Fase 0 — Diagnóstico

Antes de escrever qualquer código, o repositório foi mapeado:

- `backend/` já estava completo e validado (Node 20 + Express + Prisma + PostgreSQL 16, CRUD de
  comunidades/eventos/membros, auth JWT, testes Jest, seed funcional). Havia também pastas
  `backend/django/`, `backend/laravel/`, `backend/rails/` — protótipos de outras comunidades do
  evento original, não a stack oficial.
- `frontend/` continha só um `.gitkeep`.
- `docs/escopo-funcional.md` define entidades, endpoints e telas — mas uma comparação linha a
  linha com o código real do backend revelou **divergências**: a resposta de
  `GET /api/calendario` usa `{ eventos, total, periodo }`, não `{ dados, total_eventos }` como a
  doc mostra; a listagem de membros aninha nome/e-mail em `membro.usuario`, não no nível raiz;
  `GET /comunidades/:id` não retorna a lista de `membros`; não existe campo de cor por
  comunidade. Decisão: **os tipos do frontend seguiriam o código real, não a doc** — registrado
  em `frontend/README.md`.
- Não havia `.github/workflows/`, `CLAUDE.md`, nem `.claude/`.

## Fase 1 — Scaffold inicial (primeira entrega)

Decisões de stack confirmadas com o usuário antes de começar: **TypeScript** (diverge do
`docs/stack.md` original, que previa JS puro — trade-off aceito por reduzir erros de integração
com o contrato da API), **Tailwind CSS + shadcn/ui + biblioteca de componentes**, **FullCalendar**
para o calendário (não construído do zero), **docker-compose** para setup local de um comando.

### Passo a passo

1. `npm create vite@latest frontend -- --template react-ts` — scaffold base (React 19, Vite 8,
   TypeScript ~6, na época a versão "latest" real do ecossistema).
2. Tailwind CSS v4 + PostCSS configurados (`@tailwindcss/postcss`, CSS-first config via
   `@theme`/`@import` em `index.css`, sem `tailwind.config.js` — é o modelo novo do Tailwind v4).
3. **shadcn/ui instalado manualmente**: o CLI (`npx shadcn@latest init`) precisa acessar
   `ui.shadcn.com`, que o proxy de rede do ambiente bloqueia (403). Solução: instalar as
   dependências subjacentes via npm (Radix UI, `class-variance-authority`, `clsx`,
   `tailwind-merge`, `lucide-react`) e escrever os componentes (`button`, `input`, `label`,
   `textarea`, `card`, `badge`, `select`, `dialog`, `table`) manualmente em
   `src/components/ui/` — é exatamente o que o CLI faria (copiar código-fonte pro projeto), só
   sem o passo de rede.
4. **ESLint trocado**: o template do Vite vinha com `oxlint` por padrão; substituído por
   ESLint 9 (flat config) + Prettier, pra manter consistência com o padrão já usado no
   `backend/` (ESLint 8 + Prettier 3, definido em `CONTRIBUTING.md`). A config "recommended" da
   versão instalada de `eslint-plugin-react-hooks` (v7) trazia regras experimentais do React
   Compiler (`set-state-in-effect`, etc.) — desabilitadas por não se aplicarem a este projeto
   (não usa o Compiler); mantidas só as duas regras clássicas (`rules-of-hooks`,
   `exhaustive-deps`).
5. `react-router-dom` instalado e **pinado em `7.18.2`**: a versão mais recente resolvida pelo
   npm tinha um CVE alto (`GHSA-qwww-vcr4-c8h2`, "RSC Mode CSRF Bypass") sem correção disponível
   em nenhuma versão estável na época — mas o CVE só afeta o modo Framework/RSC (Server
   Actions), que este projeto não usa (SPA puro via `createBrowserRouter`). Decisão registrada
   em `frontend/README.md`.
6. FullCalemdar instalado — **conflito de versão**: `@fullcalendar/react@latest` resolveu para
   `7.0.2`, mas `@fullcalendar/core`/`daygrid`/`interaction` só tinham `6.1.21` como última
   versão estável (7.x só em RC). Isso gerava dois `@fullcalendar/core` diferentes no
   `node_modules` e erros de tipo TS incompatíveis entre si. Corrigido pinando
   `@fullcalendar/react@6.1.21` — todos os pacotes FullCalendar na mesma major.
7. Tipos em `src/types/api.ts` escritos a partir da leitura direta do código do backend
   (`backend/src/services/*.js`, `backend/src/validators/*.js`), não da documentação.
8. Client HTTP (`src/services/http.ts`) com `HttpError` tipado, proxy do Vite pra `/api` em dev
   (evita CORS sem precisar configurar nada).
9. Todas as telas implementadas: listagem/detalhe/form de comunidades, gestão de membros (com
   modal via `Dialog`), listagem/detalhe/form de eventos, calendário mensal com FullCalendar
   (cores por comunidade geradas por hash do `id`, já que a API não retorna cor), login/registro.
10. `docker-compose.yml` + `Dockerfile.dev` (backend e frontend) — Postgres + backend
    (migrate+seed automático) + frontend, subindo com um `docker compose up`.
11. **Validação end-to-end**: o Docker não conseguiu rodar no ambiente da sessão (`dockerd` falha
    ao iniciar por restrição de `ulimit` em containers aninhados — limitação do sandbox, não do
    `docker-compose.yml`, que passou na validação de sintaxe `docker compose config`).
    Alternativa: Postgres instalado localmente no ambiente, backend + frontend rodando via
    `npm run dev`, fluxo completo testado com Playwright headless (login → criar comunidade →
    criar evento → aparece no calendário → gestão de membros) — zero erros de console.
12. Commit único, grande, com tudo isso junto (60 arquivos). **Identificado depois como
    anti-padrão** — corrigido a partir da fase seguinte com commits atômicos.

## Fase 2 — Time de subagentes, design system e modo mock (segunda entrega)

Pedido do usuário: montar um "time de desenvolvimento" usando subagentes do Claude Code, com
revisão de design baseada na Apple, documentação do processo, Conventional Commits + SemVer,
economia de tokens, commits atômicos, e uma camada de mock pra ver o frontend rodando na Vercel
sem depender do backend.

### Passo a passo

1. **Esclarecimento de requisitos** (várias rodadas, pedido chegou via transcrição de voz com
   trechos cortados): confirmado que "Get Designer" era [`getdesign.md`](https://getdesign.md/)
   — coleção de arquivos `DESIGN.md` (specs de design system legíveis por IA) para marcas
   conhecidas, incluindo Apple. Confirmado que o escopo de CI/CD nesta fase é **só Vercel +
   frontend** — nenhuma decisão de hospedagem de backend a ser tomada agora.
2. Arquivo `DESIGN.md` da Apple obtido do repositório
   [`VoltAgent/awesome-design-md`](https://github.com/voltagent/awesome-design-md) (o domínio
   `getdesign.md` está fora da allowlist de rede do sandbox; `raw.githubusercontent.com` não
   está, então o conteúdo foi obtido clonando o repo).
3. `docs/design/design-system.md` escrito adaptando os princípios da Apple (paleta de acento
   único, escala tipográfica, grid 8px, regra de sombra única, alvo de toque 44px) para um app
   de produtividade/CRUD — não o layout de marketing original — mapeados aos componentes
   shadcn/ui já implementados.
4. Camada de mock (`src/mocks/`) implementada: dados fake em memória + funções espelhando a
   assinatura exata de cada `services/*.ts`, replicando as mesmas regras de negócio do backend
   (RN-COM-*, RN-EVT-*, RN-ORG-*) e os mesmos códigos de erro HTTP. Toggle via
   `VITE_USE_MOCK=true`, centralizado em `MOCK_ENABLED` (`services/http.ts`) — nenhuma página
   precisa saber qual modo está ativo.
5. Validado localmente rodando `VITE_USE_MOCK=true npm run dev` **sem nenhum backend/Postgres
   ativo** — fluxo completo testado via Playwright (login, criar comunidade, calendário com
   eventos seed), zero erros de console, badge "dados de demonstração" visível no header.
6. **Tentativa de deploy na Vercel**: bloqueada por permissão — o token/integração conectada
   retornou `403 forbidden` ("You don't have permission to create a project") tanto no escopo
   pessoal quanto no time `Paulo Henrique's projects`. Registrado como pendência aberta (ver
   `docs/development/team.md` e o item correspondente no histórico de tarefas da sessão) — não
   é algo resolvível do lado do agente.
7. Subagentes criados em `.claude/agents/`: `frontend-engineer`, `ui-designer`, `qa-engineer`,
   `backend-engineer`, `code-reviewer`, `release-engineer` — ver `docs/development/team.md` para
   o fluxo de revisão entre eles.
8. `docs/development/{team,engineering-principles,git-workflow}.md` e este `build-log.md`
   escritos.
9. **A partir deste ponto, commits passaram a ser atômicos** (um por entrega: mock layer, design
   system, subagentes, cada doc) — corrigindo o padrão de commit único da Fase 1.

## Pendências conhecidas

- Deploy de demonstração na Vercel bloqueado por permissão do token (ver item 6 acima) —
  retomar quando resolvido ou apontando um projeto Vercel existente para reusar.
- Backlog de auditoria de UI documentado em `docs/design/design-system.md` (alvos de toque,
  micro-interação de "active", lint de acessibilidade automatizado).
- Plano de CI/CD completo (Vercel + estratégia de backend) ainda como spec, não implementado —
  ver `.kiro/specs/`.
