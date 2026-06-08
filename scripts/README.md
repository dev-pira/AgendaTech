# Scripts — Agenda Tech

## create-wbs-issues.sh

Script para criação automática de todas as issues da WBS no repositório GitHub via [GitHub CLI](https://cli.github.com/).

### Pré-requisitos

1. **GitHub CLI** instalado: [https://cli.github.com/](https://cli.github.com/)
2. **Autenticado** no GitHub CLI: `gh auth login`
3. **Labels criadas** no repositório (comunidade + camada + prioridade)
4. **Milestones criados** no repositório com os títulos exatos:
   - `MS1: Organização do Projeto`
   - `MS2: Backend API`
   - `MS3: CI/CD e Testes`
   - `MS4: Frontend`

### Uso

```bash
chmod +x scripts/create-wbs-issues.sh
./scripts/create-wbs-issues.sh
```

### Issues Criadas

O script cria **22 issues** organizadas por milestone:

| # | Milestone | Issues |
|---|-----------|--------|
| MS1 | Organização do Projeto (DEVPIRA) | 8 issues |
| MS2 | Backend API (DevLimeira) | 5 issues |
| MS3 | CI/CD e Testes (DevRioClaro) | 4 issues |
| MS4 | Frontend (DevItape) | 5 issues |

### Referência Completa de Issues

Veja o arquivo [wbs-issues-reference.md](./wbs-issues-reference.md) para a lista completa com detalhes de cada issue.

### Criação Manual (Alternativa)

Se preferir criar issues individualmente, use o formato:

```bash
gh issue create \
  --title "TÍTULO" \
  --label "comunidade,camada,prioridade:nivel" \
  --milestone "NOME_DO_MILESTONE" \
  --body "CORPO_DA_ISSUE"
```
