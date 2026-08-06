# Commits, Versionamento e Fluxo de Git

Este documento complementa o [`CONTRIBUTING.md`](../../CONTRIBUTING.md) da raiz — que já define
Conventional Commits, nomenclatura de branches e o fluxo de PR — com as regras específicas para
o desenvolvimento conduzido pelo time de subagentes: **commits atômicos** e **versionamento
semântico**.

## Commits atômicos

**Uma unidade lógica de trabalho por commit.** Isso significa, na prática:

- Cada feature/fix implementado por um ciclo `frontend-engineer → revisão → aprovação` vira
  **um** commit — não um commit gigante no final do dia agregando várias features.
- Um commit de documentação (`docs: ...`) não mistura mudança de código.
- Um commit de configuração (`chore`/`ci`/`build`) não mistura lógica de produto.
- Ao preparar uma release, o bump de versão + changelog é **um commit separado**, criado pelo
  `release-engineer`, nunca junto com a última feature que entrou na release.

Isso é uma correção deliberada de processo: a primeira entrega do frontend (scaffold completo:
Vite, Tailwind, shadcn/ui, todas as telas, docker-compose) foi feita como um único commit grande
— documentado em [`build-log.md`](./build-log.md) como o que **não** repetir. A partir da camada
de mock (segunda entrega), cada peça (mock layer, design system, subagentes, docs) já foi
commitada separadamente.

### Por que isso importa aqui especificamente

Com múltiplos subagentes revisando/implementando, um commit atômico por unidade de trabalho é o
que torna possível:

- Reverter uma feature problemática sem arrastar outras.
- `git blame`/`git log` explicarem o "porquê" de uma mudança específica, não uma lista de 60
  arquivos sem contexto individual.
- O histórico de commits servir como registro do próprio processo de revisão (cada commit
  corresponde a um ciclo aprovado pelo `ui-designer`/`code-reviewer`/`qa-engineer`).

## Conventional Commits (referência rápida)

Ver `CONTRIBUTING.md` para a especificação completa. Tipos usados neste projeto:
`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`.

Escopo quando fizer sentido: `feat(frontend): ...`, `fix(backend): ...`, `docs(design): ...`.

## Versionamento Semântico (SemVer)

O projeto ainda não tem uma versão publicada/instalável — é uma aplicação, não uma biblioteca —
mas adota tags SemVer (`vMAJOR.MINOR.PATCH`) para marcar pontos estáveis do desenvolvimento:

| Enquanto pré-1.0 (`0.x.y`) | Significado |
|---|---|
| `0.(x+1).0` | Funcionalidade nova (novo módulo, nova tela, novo endpoint consumido) |
| `0.x.(y+1)` | Correção de bug, ajuste de UI, mudança que não adiciona funcionalidade |

Não há noção de "breaking change" de API pública ainda (não existem consumidores externos do
frontend) — quando o produto estabilizar para uso real, este documento será atualizado para a
semântica `1.0.0`+ completa (MAJOR = breaking change de contrato/rota, MINOR = feature
compatível, PATCH = fix compatível).

Tags são criadas pelo `release-engineer`, associadas a um changelog gerado a partir dos commits
Conventional Commits desde a tag anterior — ainda não automatizado (ver `.kiro/specs/` para o
plano de CI/CD, que cobre automação de changelog/release como item futuro).

## Branches

Segue exatamente o `CONTRIBUTING.md`: `feature/`, `fix/`, `docs/`, `chore/`, `ci/`, `refactor/`.
Sessões conduzidas por agente de código usam a branch designada pela tarefa (ex.:
`claude/agendatech-frontend-setup-*`) em vez de criar uma branch nova por commit — os commits
atômicos dentro dessa branch é que garantem granularidade, não uma branch por unidade de
trabalho.
