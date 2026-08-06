# CLAUDE.md

Guia para trabalhar neste repositório com o Claude Code.

## O que é este projeto

Agenda Tech — calendário colaborativo open-source para comunidades de tecnologia. Monorepo com
`backend/` (Node/Express/Prisma/PostgreSQL — completo e validado) e `frontend/` (React/TS/Vite —
em desenvolvimento, conduzido por um time de subagentes, ver abaixo).

## Antes de qualquer coisa

- **`frontend/src/types/api.ts` é a fonte da verdade do contrato de API**, não
  `docs/escopo-funcional.md` — a doc diverge do backend real em pontos documentados em
  `frontend/README.md#nota-contrato-da-api-implementada-vs-documentada`. Se os dois discordarem,
  o código do backend está certo.
- **O backend é tratado como de outro time**: não mexa em `backend/` a menos que explicitamente
  pedido. O desenvolvimento do frontend acontece contra `frontend/src/mocks/` (mesmas regras de
  negócio do backend, replicadas) — ver `frontend/README.md#modo-mock`.
- **Commits são atômicos**: uma unidade lógica de trabalho por commit, Conventional Commits. Ver
  `docs/development/git-workflow.md`. Não agregue várias features num commit só.

## Time de subagentes

Este projeto usa um time de subagentes definidos em `.claude/agents/` para desenvolvimento de
frontend, cada um com escopo e regras próprias:

- `frontend-engineer` — implementa
- `ui-designer` — revisa contra `docs/design/design-system.md` (bloqueante)
- `qa-engineer` — valida contra os critérios de aceite de `docs/escopo-funcional.md`
- `backend-engineer` — só sob pedido explícito
- `code-reviewer` — audita Clean Code/SOLID no diff
- `release-engineer` — versionamento, changelog, CI/CD

Fluxo completo e regras de economia de tokens em `docs/development/team.md`.

## Como rodar localmente

```bash
# Opção rápida: tudo de uma vez (Postgres + backend + frontend)
docker compose up --build

# Frontend sozinho, sem backend nenhum (modo mock)
cd frontend
echo "VITE_USE_MOCK=true" >> .env
npm install && npm run dev
```

Login de demonstração no modo mock: `organizador@devlimeira.dev` / `senha123`.

Detalhes completos: [`README.md`](./README.md), [`backend/README.md`](./backend/README.md),
[`frontend/README.md`](./frontend/README.md).

## Antes de considerar uma mudança de frontend pronta

```bash
cd frontend
npm run build   # tsc -b && vite build — zero erros
npm run lint     # zero erros (warnings pré-existentes em components/ui/*.tsx são esperados)
npm run format   # Prettier
```

Se a mudança envolve fluxo de usuário (formulário, navegação, dado novo), rode
`VITE_USE_MOCK=true npm run dev` e valide manualmente antes de dar como concluído — não confie
só em build+lint passando.

## Documentação de referência

| Arquivo | Conteúdo |
|---|---|
| `docs/escopo-funcional.md` | Especificação funcional original (entidades, telas, regras RN-*) |
| `docs/design/design-system.md` | Regras de design (Apple HIG adaptado) |
| `docs/development/team.md` | Papéis dos subagentes e fluxo de revisão |
| `docs/development/build-log.md` | Retrospectiva de como o frontend foi construído |
| `docs/development/engineering-principles.md` | Clean Code/SOLID/acessibilidade aplicados |
| `docs/development/git-workflow.md` | Commits atômicos + SemVer |
| `.kiro/specs/` | Specs (requirements → design → tasks), incluindo o plano de CI/CD |
| `CONTRIBUTING.md` | Convenção de commits, branches e fluxo de PR (regras gerais do repo) |
