# Referência Completa — Issues da WBS

Este documento lista todas as 22 issues a serem criadas no repositório, organizadas por milestone/comunidade. Cada issue inclui título, labels, milestone e o comando `gh` correspondente para criação individual.

---

## Sumário

| Milestone | Comunidade | Qtd Issues | Story Points |
|-----------|-----------|------------|--------------|
| MS1: Organização do Projeto | DEVPIRA | 8 | 32 |
| MS2: Backend API | DevLimeira | 5 | 21 |
| MS3: CI/CD e Testes | DevRioClaro | 4 | 16 |
| MS4: Frontend | DevItape | 5 | 26 |
| **Total** | — | **22** | **95** |

---

## MS1: Organização do Projeto (DEVPIRA)

### 1.1 Definição de Stack

| Campo | Valor |
|-------|-------|
| **Título** | 1.1 Definição de Stack |
| **Labels** | `devpira`, `organizacao`, `prioridade:alta` |
| **Milestone** | MS1: Organização do Projeto |
| **Estimativa** | 3 pontos |
| **Dependências** | Nenhuma |

**Comando:**
```bash
gh issue create --title "1.1 Definição de Stack" --label "devpira,organizacao,prioridade:alta" --milestone "MS1: Organização do Projeto" --body "..."
```

---

### 1.2 Setup Repositório

| Campo | Valor |
|-------|-------|
| **Título** | 1.2 Setup Repositório |
| **Labels** | `devpira`, `organizacao`, `prioridade:alta` |
| **Milestone** | MS1: Organização do Projeto |
| **Estimativa** | 3 pontos |
| **Dependências** | Nenhuma |

**Comando:**
```bash
gh issue create --title "1.2 Setup Repositório" --label "devpira,organizacao,prioridade:alta" --milestone "MS1: Organização do Projeto" --body "..."
```

---

### 1.3 Configuração do GitHub Projects

| Campo | Valor |
|-------|-------|
| **Título** | 1.3 Configuração do GitHub Projects |
| **Labels** | `devpira`, `organizacao`, `prioridade:alta` |
| **Milestone** | MS1: Organização do Projeto |
| **Estimativa** | 5 pontos |
| **Dependências** | 1.2 Setup Repositório |

**Comando:**
```bash
gh issue create --title "1.3 Configuração do GitHub Projects" --label "devpira,organizacao,prioridade:alta" --milestone "MS1: Organização do Projeto" --body "..."
```

---

### 1.4 Templates de Issues

| Campo | Valor |
|-------|-------|
| **Título** | 1.4 Templates de Issues |
| **Labels** | `devpira`, `organizacao`, `prioridade:media` |
| **Milestone** | MS1: Organização do Projeto |
| **Estimativa** | 3 pontos |
| **Dependências** | 1.2 Setup Repositório |

**Comando:**
```bash
gh issue create --title "1.4 Templates de Issues" --label "devpira,organizacao,prioridade:media" --milestone "MS1: Organização do Projeto" --body "..."
```

---

### 1.5 Criação dos Milestones

| Campo | Valor |
|-------|-------|
| **Título** | 1.5 Criação dos Milestones |
| **Labels** | `devpira`, `organizacao`, `prioridade:media` |
| **Milestone** | MS1: Organização do Projeto |
| **Estimativa** | 2 pontos |
| **Dependências** | 1.3 Config GitHub Projects |

**Comando:**
```bash
gh issue create --title "1.5 Criação dos Milestones" --label "devpira,organizacao,prioridade:media" --milestone "MS1: Organização do Projeto" --body "..."
```

---

### 1.6 Criação de Issues da WBS

| Campo | Valor |
|-------|-------|
| **Título** | 1.6 Criação de Issues da WBS |
| **Labels** | `devpira`, `organizacao`, `prioridade:media` |
| **Milestone** | MS1: Organização do Projeto |
| **Estimativa** | 5 pontos |
| **Dependências** | 1.4 Templates de Issues, 1.5 Milestones |

**Comando:**
```bash
gh issue create --title "1.6 Criação de Issues da WBS" --label "devpira,organizacao,prioridade:media" --milestone "MS1: Organização do Projeto" --body "..."
```

---

### 1.7 Plano de Tracking

| Campo | Valor |
|-------|-------|
| **Título** | 1.7 Plano de Tracking |
| **Labels** | `devpira`, `organizacao`, `prioridade:baixa` |
| **Milestone** | MS1: Organização do Projeto |
| **Estimativa** | 3 pontos |
| **Dependências** | 1.3 Config GitHub Projects |

**Comando:**
```bash
gh issue create --title "1.7 Plano de Tracking" --label "devpira,organizacao,prioridade:baixa" --milestone "MS1: Organização do Projeto" --body "..."
```

---

### 1.8 Escopo Funcional

| Campo | Valor |
|-------|-------|
| **Título** | 1.8 Escopo Funcional |
| **Labels** | `devpira`, `organizacao`, `prioridade:alta` |
| **Milestone** | MS1: Organização do Projeto |
| **Estimativa** | 8 pontos |
| **Dependências** | 1.1 Definição de Stack |

**Comando:**
```bash
gh issue create --title "1.8 Escopo Funcional" --label "devpira,organizacao,prioridade:alta" --milestone "MS1: Organização do Projeto" --body "..."
```

---

## MS2: Backend API (DevLimeira)

### 2.1 Modelagem de Dados

| Campo | Valor |
|-------|-------|
| **Título** | 2.1 Modelagem de Dados |
| **Labels** | `devlimeira`, `backend`, `prioridade:alta` |
| **Milestone** | MS2: Backend API |
| **Estimativa** | 5 pontos |
| **Dependências** | MS1 concluído, 1.8 Escopo Funcional |

**Comando:**
```bash
gh issue create --title "2.1 Modelagem de Dados" --label "devlimeira,backend,prioridade:alta" --milestone "MS2: Backend API" --body "..."
```

---

### 2.2 CRUD Comunidades

| Campo | Valor |
|-------|-------|
| **Título** | 2.2 CRUD Comunidades |
| **Labels** | `devlimeira`, `backend`, `prioridade:alta` |
| **Milestone** | MS2: Backend API |
| **Estimativa** | 5 pontos |
| **Dependências** | 2.1 Modelagem de Dados |

**Comando:**
```bash
gh issue create --title "2.2 CRUD Comunidades" --label "devlimeira,backend,prioridade:alta" --milestone "MS2: Backend API" --body "..."
```

---

### 2.3 CRUD Eventos

| Campo | Valor |
|-------|-------|
| **Título** | 2.3 CRUD Eventos |
| **Labels** | `devlimeira`, `backend`, `prioridade:media` |
| **Milestone** | MS2: Backend API |
| **Estimativa** | 5 pontos |
| **Dependências** | 2.1 Modelagem de Dados, 2.2 CRUD Comunidades |

**Comando:**
```bash
gh issue create --title "2.3 CRUD Eventos" --label "devlimeira,backend,prioridade:media" --milestone "MS2: Backend API" --body "..."
```

---

### 2.4 Validações

| Campo | Valor |
|-------|-------|
| **Título** | 2.4 Validações |
| **Labels** | `devlimeira`, `backend`, `prioridade:media` |
| **Milestone** | MS2: Backend API |
| **Estimativa** | 3 pontos |
| **Dependências** | 2.2 CRUD Comunidades, 2.3 CRUD Eventos |

**Comando:**
```bash
gh issue create --title "2.4 Validações" --label "devlimeira,backend,prioridade:media" --milestone "MS2: Backend API" --body "..."
```

---

### 2.5 Documentação API

| Campo | Valor |
|-------|-------|
| **Título** | 2.5 Documentação API |
| **Labels** | `devlimeira`, `backend`, `prioridade:baixa` |
| **Milestone** | MS2: Backend API |
| **Estimativa** | 3 pontos |
| **Dependências** | 2.2, 2.3, 2.4 |

**Comando:**
```bash
gh issue create --title "2.5 Documentação API" --label "devlimeira,backend,prioridade:baixa" --milestone "MS2: Backend API" --body "..."
```

---

## MS3: CI/CD e Testes (DevRioClaro)

### 3.1 Setup GitHub Actions

| Campo | Valor |
|-------|-------|
| **Título** | 3.1 Setup GitHub Actions |
| **Labels** | `devrioclaro`, `ci-cd`, `prioridade:alta` |
| **Milestone** | MS3: CI/CD e Testes |
| **Estimativa** | 3 pontos |
| **Dependências** | MS1 concluído |

**Comando:**
```bash
gh issue create --title "3.1 Setup GitHub Actions" --label "devrioclaro,ci-cd,prioridade:alta" --milestone "MS3: CI/CD e Testes" --body "..."
```

---

### 3.2 Pipeline de Testes

| Campo | Valor |
|-------|-------|
| **Título** | 3.2 Pipeline de Testes |
| **Labels** | `devrioclaro`, `ci-cd`, `prioridade:media` |
| **Milestone** | MS3: CI/CD e Testes |
| **Estimativa** | 5 pontos |
| **Dependências** | 3.1 Setup GitHub Actions, 2.2 CRUD Comunidades |

**Comando:**
```bash
gh issue create --title "3.2 Pipeline de Testes" --label "devrioclaro,ci-cd,prioridade:media" --milestone "MS3: CI/CD e Testes" --body "..."
```

---

### 3.3 Pipeline de Deploy

| Campo | Valor |
|-------|-------|
| **Título** | 3.3 Pipeline de Deploy |
| **Labels** | `devrioclaro`, `ci-cd`, `prioridade:baixa` |
| **Milestone** | MS3: CI/CD e Testes |
| **Estimativa** | 5 pontos |
| **Dependências** | 3.1 Setup GitHub Actions, 3.2 Pipeline de Testes |

**Comando:**
```bash
gh issue create --title "3.3 Pipeline de Deploy" --label "devrioclaro,ci-cd,prioridade:baixa" --milestone "MS3: CI/CD e Testes" --body "..."
```

---

### 3.4 Linting e Formatação

| Campo | Valor |
|-------|-------|
| **Título** | 3.4 Linting e Formatação |
| **Labels** | `devrioclaro`, `ci-cd`, `prioridade:media` |
| **Milestone** | MS3: CI/CD e Testes |
| **Estimativa** | 3 pontos |
| **Dependências** | 3.1 Setup GitHub Actions |

**Comando:**
```bash
gh issue create --title "3.4 Linting e Formatação" --label "devrioclaro,ci-cd,prioridade:media" --milestone "MS3: CI/CD e Testes" --body "..."
```

---

## MS4: Frontend (DevItape)

### 4.1 Setup Projeto Frontend

| Campo | Valor |
|-------|-------|
| **Título** | 4.1 Setup Projeto Frontend |
| **Labels** | `devitape`, `frontend`, `prioridade:alta` |
| **Milestone** | MS4: Frontend |
| **Estimativa** | 3 pontos |
| **Dependências** | MS1 concluído, 1.1 Definição de Stack |

**Comando:**
```bash
gh issue create --title "4.1 Setup Projeto Frontend" --label "devitape,frontend,prioridade:alta" --milestone "MS4: Frontend" --body "..."
```

---

### 4.2 Tela Listagem Comunidades

| Campo | Valor |
|-------|-------|
| **Título** | 4.2 Tela Listagem Comunidades |
| **Labels** | `devitape`, `frontend`, `prioridade:media` |
| **Milestone** | MS4: Frontend |
| **Estimativa** | 5 pontos |
| **Dependências** | 4.1 Setup Projeto Frontend, 2.2 CRUD Comunidades |

**Comando:**
```bash
gh issue create --title "4.2 Tela Listagem Comunidades" --label "devitape,frontend,prioridade:media" --milestone "MS4: Frontend" --body "..."
```

---

### 4.3 Formulários de Cadastro

| Campo | Valor |
|-------|-------|
| **Título** | 4.3 Formulários de Cadastro |
| **Labels** | `devitape`, `frontend`, `prioridade:media` |
| **Milestone** | MS4: Frontend |
| **Estimativa** | 5 pontos |
| **Dependências** | 4.1 Setup Projeto Frontend, 2.2 CRUD Comunidades, 2.3 CRUD Eventos |

**Comando:**
```bash
gh issue create --title "4.3 Formulários de Cadastro" --label "devitape,frontend,prioridade:media" --milestone "MS4: Frontend" --body "..."
```

---

### 4.4 Calendário Compartilhado

| Campo | Valor |
|-------|-------|
| **Título** | 4.4 Calendário Compartilhado |
| **Labels** | `devitape`, `frontend`, `prioridade:media` |
| **Milestone** | MS4: Frontend |
| **Estimativa** | 8 pontos |
| **Dependências** | 4.1 Setup Projeto Frontend, 2.3 CRUD Eventos |

**Comando:**
```bash
gh issue create --title "4.4 Calendário Compartilhado" --label "devitape,frontend,prioridade:media" --milestone "MS4: Frontend" --body "..."
```

---

### 4.5 Filtros

| Campo | Valor |
|-------|-------|
| **Título** | 4.5 Filtros |
| **Labels** | `devitape`, `frontend`, `prioridade:baixa` |
| **Milestone** | MS4: Frontend |
| **Estimativa** | 5 pontos |
| **Dependências** | 4.2 Tela Listagem Comunidades, 4.4 Calendário Compartilhado |

**Comando:**
```bash
gh issue create --title "4.5 Filtros" --label "devitape,frontend,prioridade:baixa" --milestone "MS4: Frontend" --body "..."
```

---

## Labels Necessárias (Pré-requisito)

Antes de executar o script, crie as labels com os seguintes comandos:

```bash
# Labels de Comunidade
gh label create "devpira" --color "7B68EE" --description "Tarefas da DEVPIRA"
gh label create "devlimeira" --color "2E8B57" --description "Tarefas da DevLimeira"
gh label create "devrioclaro" --color "FF6347" --description "Tarefas da DevRioClaro"
gh label create "devitape" --color "4169E1" --description "Tarefas da DevItape"

# Labels de Camada Técnica
gh label create "organizacao" --color "DDA0DD" --description "Project management"
gh label create "backend" --color "20B2AA" --description "API e dados"
gh label create "ci-cd" --color "FFA500" --description "Pipeline e testes"
gh label create "frontend" --color "87CEEB" --description "Interface de usuário"

# Labels de Prioridade
gh label create "prioridade:alta" --color "B60205" --description "Prioridade alta"
gh label create "prioridade:media" --color "FBCA04" --description "Prioridade média"
gh label create "prioridade:baixa" --color "0E8A16" --description "Prioridade baixa"

# Label de Tipo
gh label create "bug" --color "D73A4A" --description "Bug report"
```

## Milestones Necessários (Pré-requisito)

```bash
gh api repos/{owner}/{repo}/milestones -f title="MS1: Organização do Projeto" -f description="Repositório estruturado, board configurado, issues criadas, plano de tracking pronto. Comunidade: DEVPIRA. Dependências: Nenhuma." -f due_on="2024-01-01T23:59:59Z"

gh api repos/{owner}/{repo}/milestones -f title="MS2: Backend API" -f description="Endpoints CRUD funcionais para comunidades e eventos, documentação da API. Comunidade: DevLimeira. Dependências: MS1." -f due_on="2024-01-02T23:59:59Z"

gh api repos/{owner}/{repo}/milestones -f title="MS3: CI/CD e Testes" -f description="Pipelines de CI/CD configurados, testes automatizados rodando, linting. Comunidade: DevRioClaro. Dependências: MS1." -f due_on="2024-01-02T23:59:59Z"

gh api repos/{owner}/{repo}/milestones -f title="MS4: Frontend" -f description="Telas implementadas, integração com API, calendário funcional. Comunidade: DevItape. Dependências: MS2, MS3." -f due_on="2024-01-03T23:59:59Z"
```

> **Nota:** Ajuste as datas (`due_on`) conforme o cronograma real do evento e substitua `{owner}/{repo}` pelo owner/repo correto.
