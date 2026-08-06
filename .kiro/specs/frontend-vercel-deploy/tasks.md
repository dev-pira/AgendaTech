# Implementation Plan: Deploy do Frontend na Vercel

## Overview

Plano de implementação desta spec. **Nada aqui foi executado ainda** — é o roteiro para quando o
Requisito 5 (permissão da conta Vercel) estiver resolvido. Cada tarefa deve virar um commit
atômico (`docs/development/git-workflow.md`), tipicamente `chore(deploy): ...` ou `ci: ...`.

## Tasks

- [ ] 1. Resolver bloqueio de permissão (pré-requisito, Requisito 5)
  - [ ] 1.1 Confirmar no dashboard da Vercel (`vercel.com/account/tokens` ou configurações do
        time `Paulo Henrique's projects`) se o token/integração usado tem escopo de criar
        projetos
    - _Requirements: 5.1, 5.3_
  - [ ] 1.2 Alternativa: se a intenção for reaproveitar um projeto Vercel já existente na conta
        em vez de criar um novo, identificar qual (`list_projects`) antes de tentar deploy
    - _Requirements: 5.2_

- [ ] 2. Checkpoint — confirmar permissão resolvida antes de prosseguir
  - Ensure a project can be created or reused via the Vercel MCP tools before continuing.

- [ ] 3. Criar o Vercel_Project apontando para o frontend
  - [ ] 3.1 Criar/conectar o projeto com root directory `frontend/`, framework Vite
    - _Requirements: 1.1_
  - [ ] 3.2 Confirmar runtime Node ≥ 20 nas configurações do projeto
    - _Requirements: 1.4_

- [ ] 4. Versionar `frontend/vercel.json`
  - [ ] 4.1 Criar o arquivo conforme design.md (Componente 1), incluindo o rewrite para SPA
    - _Requirements: 3.2_
  - [ ] 4.2 Validar localmente com `vercel build` antes do primeiro deploy real
    - _Requirements: 3.1, 3.3_

- [ ] 5. Configurar variáveis de ambiente por ambiente Vercel
  - [ ] 5.1 `VITE_USE_MOCK=true` em Production, Preview e Development (tabela do design.md)
    - _Requirements: 2.1, 2.2, 2.4_
  - [ ] 5.2 Documentar em `frontend/README.md` como alternar para `VITE_USE_MOCK=false` +
        `VITE_API_URL` quando o backend publicar — sem exigir mudança de código
    - _Requirements: 2.3_

- [ ] 6. Conectar o repositório GitHub ao Vercel_Project
  - [ ] 6.1 Habilitar Deploy_Preview automático por push/PR
    - _Requirements: 1.2, 1.3_
  - [ ] 6.2 Confirmar que falha de build preserva o último Deploy_Produção
    - _Requirements: 1.5_

- [ ] 7. Checkpoint — smoke test do primeiro Deploy_Preview real
  - Executar os 3 testes descritos em design.md#testing-strategy (smoke test, rota profunda,
    alternância de ambiente). Ask the user if questions arise.

- [ ] 8. Documentar a Simulação_Local (`vercel dev`) no `frontend/README.md`
  - [ ] 8.1 Passo a passo de `vercel link` / `vercel env pull` / `vercel dev`
    - _Requirements: 3.1, 3.3_

## Notes

- Backend permanece fora do escopo em toda esta implementação (Requisito 4) — se qualquer tarefa
  acima parecer exigir tocar em `backend/` ou criar infraestrutura de API, isso é um sinal de que
  o escopo está sendo violado; pare e levante a questão em vez de prosseguir.
- Nenhuma tarefa aqui deve resultar em `target: "production"` sem confirmação explícita do
  usuário no momento da execução, mesmo que o plano já esteja aprovado — deploy de produção é
  sempre um ato deliberado, não automático a partir de um plano aprovado anteriormente.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["3.1", "3.2"] },
    { "id": 2, "tasks": ["4.1", "5.1"] },
    { "id": 3, "tasks": ["4.2", "5.2", "6.1"] },
    { "id": 4, "tasks": ["6.2"] },
    { "id": 5, "tasks": ["8.1"] }
  ]
}
```
