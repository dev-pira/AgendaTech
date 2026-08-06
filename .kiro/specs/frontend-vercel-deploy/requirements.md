# Requirements Document

## Introduction

Esta spec define o plano de deploy contínuo do **frontend** do Agenda Tech na Vercel. É um
documento de planejamento — **nenhuma implementação de infraestrutura de deploy é feita nesta
fase** (a única exceção já realizada é um deploy manual único de demonstração, coberto pelo
Requisito 2, que ficou bloqueado por permissão — ver `docs/development/build-log.md`).

**Decisão de escopo, confirmada explicitamente com o usuário:** esta spec cobre **somente o
frontend na Vercel**. Não há decisão tomada sobre hospedagem do backend, e nenhuma infraestrutura
de backend deve ser criada como parte desta spec. O backend é tratado como propriedade de outro
time/fluxo de trabalho; a integração com ele acontece depois, localmente, quando ele estiver
publicado — não faz parte deste pipeline de CI/CD.

## Glossary

- **Vercel_Project**: Projeto na plataforma Vercel que builda e serve o frontend.
- **Modo_Mock**: Modo de operação do frontend (`VITE_USE_MOCK=true`) em que todas as chamadas de
  API são substituídas por dados fake em memória (`frontend/src/mocks/`) — ver
  `frontend/README.md#modo-mock`.
- **Deploy_Preview**: Deployment não-produtivo da Vercel, gerado automaticamente por push/PR,
  com URL própria e efêmera.
- **Deploy_Produção**: Deployment da Vercel servido no domínio de produção do projeto.
- **Simulação_Local**: Ambiente local que reproduz o comportamento de build/roteamento da
  Vercel antes de um push (via `vercel dev` / `vercel build`).

## Requirements

---

### Requisito 1: Deploy automático do frontend na Vercel

**User Story:** Como responsável pelo frontend, eu quero que cada push gere um Deploy_Preview
automaticamente, para que eu possa validar mudanças em uma URL real antes de qualquer merge.

#### Critérios de Aceitação

1. THE Vercel_Project SHALL ter `frontend/` como root directory de build, com framework
   detectado automaticamente como Vite (`npm install` / `npm run build` / output em
   `frontend/dist`).
2. WHEN um push ocorre em qualquer branch conectada ao Vercel_Project, THE Vercel_Project SHALL
   gerar um Deploy_Preview com URL própria, sem afetar o Deploy_Produção.
3. WHEN um pull request é aberto contra a branch principal, THE Vercel_Project SHALL comentar a
   URL do Deploy_Preview correspondente no PR (comportamento nativo da integração
   Vercel↔GitHub).
4. THE Vercel_Project SHALL usar Node.js ≥ 20 como runtime de build, consistente com
   `frontend/package.json` (`engines`, se definido) e com `docs/stack.md`.
5. IF o build falhar (erro de `tsc` ou `vite build`), THEN THE Vercel_Project SHALL marcar o
   deployment como falho e preservar o último Deploy_Produção bem-sucedido sem alteração.

---

### Requisito 2: Modo mock configurável por ambiente

**User Story:** Como responsável pelo frontend, eu quero controlar o Modo_Mock por variável de
ambiente em cada ambiente da Vercel, para que eu possa demonstrar a aplicação completa antes do
backend estar publicado, e desligar o mock sem mudar código quando ele estiver disponível.

#### Critérios de Aceitação

1. THE Vercel_Project SHALL expor `VITE_USE_MOCK` como variável de ambiente configurável
   independentemente por ambiente (Production, Preview, Development) no painel da Vercel.
2. WHILE o backend real não estiver publicado em uma URL acessível pela Vercel, THE
   Vercel_Project SHALL manter `VITE_USE_MOCK=true` em todos os ambientes — o frontend funciona
   de ponta a ponta sem nenhuma dependência de rede externa.
3. WHEN o backend real estiver publicado, THE Vercel_Project SHALL permitir alternar
   `VITE_USE_MOCK=false` e definir `VITE_API_URL` apontando para o backend, sem exigir nenhuma
   mudança de código no frontend (ver `frontend/src/services/http.ts:MOCK_ENABLED`).
4. THE Vercel_Project SHALL nunca ter `VITE_USE_MOCK=true` como valor implícito não-documentado
   — a configuração de cada ambiente deve ser explícita e visível no painel/`vercel.json`.

---

### Requisito 3: Simulação local antes do push

**User Story:** Como responsável pelo frontend, eu quero simular localmente o comportamento de
build/deploy da Vercel, para que eu detecte problemas de configuração antes de gerar um
Deploy_Preview real.

#### Critérios de Aceitação

1. THE Agenda_Tech SHALL documentar um fluxo de Simulação_Local usando a Vercel CLI
   (`vercel dev` e/ou `vercel build` + `vercel deploy --prebuilt --local`) executável dentro de
   `frontend/`.
2. THE Agenda_Tech SHALL manter um `vercel.json` (quando criado, na Fase de implementação desta
   spec) versionado no repositório, não gerado apenas via painel — configuração de deploy é
   código, não estado escondido no dashboard.
3. WHEN a Simulação_Local é executada com `VITE_USE_MOCK=true`, THE Simulação_Local SHALL
   produzir o mesmo comportamento observado em produção/preview (mesmo `vite build`, mesmas
   variáveis de ambiente aplicadas da mesma forma).

---

### Requisito 4: Backend fora de escopo (decisão explícita)

**User Story:** Como responsável pelo projeto, eu quero que a decisão de não hospedar o backend
nesta fase fique registrada e seja respeitada, para que nenhum trabalho de infraestrutura de
backend seja feito por engano como parte do pipeline do frontend.

#### Critérios de Aceitação

1. THE Vercel_Project SHALL conter apenas o frontend — nenhuma função serverless, API route ou
   proxy para o backend real deve ser criada como parte desta spec.
2. IF uma necessidade de expor o backend surgir no futuro, THEN a decisão de hospedagem
   (adaptar para serverless vs. host persistente separado) SHALL ser levantada explicitamente
   com o usuário antes de qualquer implementação — não deve ser assumida por um agente.
3. THE Agenda_Tech SHALL manter esta decisão documentada e visível (`docs/development/team.md`,
   `.claude/agents/release-engineer.md`) até que seja explicitamente revisitada.

---

### Requisito 5: Pré-requisito de permissão da conta Vercel

**User Story:** Como responsável pelo deploy, eu quero que o bloqueio de permissão já observado
seja resolvido antes da implementação desta spec prosseguir, para que o Vercel_Project possa
ser criado.

#### Critérios de Aceitação

1. THE Agenda_Tech SHALL documentar que uma tentativa de deploy retornou `403 forbidden`
   ("You don't have permission to create a project") tanto no escopo pessoal quanto no time
   `Paulo Henrique's projects` (ver `docs/development/build-log.md`).
2. THE Agenda_Tech SHALL, antes de criar um Vercel_Project novo, verificar via `list_projects`
   se já existe um projeto elegível para reutilizar, evitando repetir o erro de permissão.
3. IF a permissão de criação de projeto continuar ausente, THEN a implementação desta spec SHALL
   ficar pendente até o usuário resolver o acesso no dashboard da Vercel — nenhuma tentativa de
   contorno (ex.: token alternativo não autorizado) deve ser feita.
