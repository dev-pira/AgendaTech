# GitHub Projects — Setup do Board

Guia completo para configuração do quadro de tarefas do **Agenda Tech** no GitHub Projects. Este documento cobre a criação do board, colunas, labels, campos customizados e regras de automação.

## Pré-requisitos

- Acesso de admin ao repositório `AgendaTech`
- [GitHub CLI (`gh`)](https://cli.github.com/) instalado e autenticado
- Permissão de criação de Projects na organização (ou no perfil pessoal do owner)

```bash
# Verificar autenticação
gh auth status
```

---

## 1. Criação do Projeto

Criar o GitHub Project do tipo **Board** vinculado ao repositório:

```bash
# Criar projeto (retorna o número do projeto)
gh project create --owner "<OWNER>" --title "Agenda Tech — Board" --format board
```

> **Nota:** Substitua `<OWNER>` pelo nome da organização ou usuário dono do repositório.

---

## 2. Colunas do Quadro

O board deve conter **4 colunas**, na seguinte ordem da esquerda para direita:

| # | Coluna | Descrição | Trigger de Entrada |
|---|--------|-----------|-------------------|
| 1 | **To Do** | Tarefas planejadas, não iniciadas | Issue criada com label de comunidade (automação) |
| 2 | **In Progress** | Trabalho em andamento | Assignee inicia trabalho |
| 3 | **Review** | PR aberto aguardando revisão | PR vinculado à issue é aberto |
| 4 | **Done** | Tarefa concluída | PR aprovado e mergeado |

### Configuração via UI

1. Acesse o projeto em **Projects** → **Agenda Tech — Board**
2. O campo padrão `Status` gerencia as colunas
3. Edite as opções do campo `Status` para conter exatamente: `To Do`, `In Progress`, `Review`, `Done` (nesta ordem)
4. Remova quaisquer opções padrão que não correspondam a essas 4 colunas

### Configuração via CLI

```bash
# Listar campos do projeto para obter o ID do campo Status
gh project field-list <PROJECT_NUMBER> --owner "<OWNER>"

# Editar opções do campo Status (via GraphQL - requer API)
# As colunas são opções do campo single-select "Status"
```

---

## 3. Labels

As labels são criadas no **repositório** (não no projeto) e são usadas para categorizar issues.

### 3.1 Labels de Comunidade

Identificam qual comunidade é responsável pela tarefa. **Obrigatória exatamente uma por tarefa.**

| Label | Cor (hex) | Descrição |
|-------|-----------|-----------|
| `devpira` | `#7B68EE` | Tarefas da DEVPIRA — Organização e gestão |
| `devlimeira` | `#2E8B57` | Tarefas da DevLimeira — Backend |
| `devrioclaro` | `#FF6347` | Tarefas da DevRioClaro — CI/CD e testes |
| `devitape` | `#4169E1` | Tarefas da DevItape — Frontend |

```bash
# Criar labels de comunidade
gh label create "devpira" --color "7B68EE" --description "Tarefas da DEVPIRA — Organização e gestão" --repo "<OWNER>/AgendaTech"
gh label create "devlimeira" --color "2E8B57" --description "Tarefas da DevLimeira — Backend" --repo "<OWNER>/AgendaTech"
gh label create "devrioclaro" --color "FF6347" --description "Tarefas da DevRioClaro — CI/CD e testes" --repo "<OWNER>/AgendaTech"
gh label create "devitape" --color "4169E1" --description "Tarefas da DevItape — Frontend" --repo "<OWNER>/AgendaTech"
```

### 3.2 Labels de Camada Técnica

Identificam a camada técnica da tarefa. **Obrigatória ao menos uma por tarefa.**

| Label | Cor (hex) | Descrição |
|-------|-----------|-----------|
| `organizacao` | `#DDA0DD` | Tarefas de project management |
| `backend` | `#20B2AA` | Tarefas de API e dados |
| `ci-cd` | `#FFA500` | Tarefas de pipeline e testes |
| `frontend` | `#87CEEB` | Tarefas de interface de usuário |

```bash
# Criar labels de camada técnica
gh label create "organizacao" --color "DDA0DD" --description "Tarefas de project management" --repo "<OWNER>/AgendaTech"
gh label create "backend" --color "20B2AA" --description "Tarefas de API e dados" --repo "<OWNER>/AgendaTech"
gh label create "ci-cd" --color "FFA500" --description "Tarefas de pipeline e testes" --repo "<OWNER>/AgendaTech"
gh label create "frontend" --color "87CEEB" --description "Tarefas de interface de usuário" --repo "<OWNER>/AgendaTech"
```

### 3.3 Labels Adicionais (Tipo e Prioridade)

| Label | Cor (hex) | Tipo | Descrição |
|-------|-----------|------|-----------|
| `bug` | `#D73A4A` | Tipo | Bug report |
| `prioridade:alta` | `#B60205` | Prioridade | Prioridade alta |
| `prioridade:media` | `#FBCA04` | Prioridade | Prioridade média |
| `prioridade:baixa` | `#0E8A16` | Prioridade | Prioridade baixa |

```bash
# Criar labels adicionais
gh label create "bug" --color "D73A4A" --description "Bug report" --repo "<OWNER>/AgendaTech"
gh label create "prioridade:alta" --color "B60205" --description "Prioridade alta" --repo "<OWNER>/AgendaTech"
gh label create "prioridade:media" --color "FBCA04" --description "Prioridade média" --repo "<OWNER>/AgendaTech"
gh label create "prioridade:baixa" --color "0E8A16" --description "Prioridade baixa" --repo "<OWNER>/AgendaTech"
```

### Resumo Visual de Labels

```
┌─────────────────────────────────────────────────────────────────┐
│ COMUNIDADE        │ CAMADA           │ TIPO/PRIORIDADE           │
├───────────────────┼──────────────────┼───────────────────────────┤
│ 🟣 devpira       │ 🩷 organizacao   │ 🔴 bug                   │
│ 🟢 devlimeira    │ 🩵 backend       │ 🔴 prioridade:alta       │
│ 🔴 devrioclaro   │ 🟠 ci-cd         │ 🟡 prioridade:media      │
│ 🔵 devitape      │ 🩵 frontend      │ 🟢 prioridade:baixa      │
└───────────────────┴──────────────────┴───────────────────────────┘
```

---

## 4. Campos Customizados

Os campos customizados são configurados no **GitHub Project** (não no repositório).

### 4.1 Campo: Prioridade

| Propriedade | Valor |
|-------------|-------|
| Nome | `Prioridade` |
| Tipo | Single select |
| Opções | `Alta`, `Média`, `Baixa` |

```bash
# Criar campo customizado de prioridade
gh project field-create <PROJECT_NUMBER> --owner "<OWNER>" --name "Prioridade" --data-type "SINGLE_SELECT"

# Após criação, adicionar opções via UI do GitHub Projects:
# Settings → Fields → Prioridade → Opções: Alta, Média, Baixa
```

### 4.2 Campo: Estimativa

| Propriedade | Valor |
|-------------|-------|
| Nome | `Estimativa` |
| Tipo | Single select |
| Opções | `1`, `2`, `3`, `5`, `8` |
| Escala | Story points (Fibonacci simplificada) |

```bash
# Criar campo customizado de estimativa
gh project field-create <PROJECT_NUMBER> --owner "<OWNER>" --name "Estimativa" --data-type "SINGLE_SELECT"

# Após criação, adicionar opções via UI do GitHub Projects:
# Settings → Fields → Estimativa → Opções: 1, 2, 3, 5, 8
```

### Referência de Estimativa

| Pontos | Complexidade | Exemplo |
|--------|-------------|---------|
| 1 | Trivial | Correção de typo, ajuste de config |
| 2 | Simples | Criar um template, documentar seção |
| 3 | Moderada | Implementar endpoint simples, criar componente |
| 5 | Complexa | Funcionalidade com lógica de negócio |
| 8 | Muito complexa | Integração entre camadas, feature completa |

---

## 5. Regras de Automação

### 5.1 Regra Principal: Issue com label de comunidade → Coluna To Do

**Comportamento:**
- QUANDO uma issue é criada no repositório com uma label de comunidade (`devpira`, `devlimeira`, `devrioclaro` ou `devitape`)
- ENTÃO a issue é automaticamente adicionada ao board na coluna **To Do**

**Comportamento inverso:**
- SE uma issue é criada SEM nenhuma label de comunidade
- ENTÃO a issue NÃO é adicionada automaticamente ao board
- A issue permanece apenas no repositório até receber a label adequada

### Configuração da Automação

#### Opção A: Via UI do GitHub Projects (Recomendado)

1. Acesse o projeto → **Settings** (⚙️) → **Workflows**
2. Ative o workflow **"Auto-add to project"**
3. Configure o filtro:
   - **Filter**: `label:devpira,devlimeira,devrioclaro,devitape`
4. Configure a ação:
   - **Set value**: Status = `To Do`

#### Opção B: Via GitHub Actions (Alternativa)

Criar o arquivo `.github/workflows/auto-add-to-project.yml`:

```yaml
name: Auto Add to Project
on:
  issues:
    types: [opened, labeled]

jobs:
  add-to-project:
    runs-on: ubuntu-latest
    steps:
      - name: Check for community label
        id: check
        run: |
          LABELS='${{ toJSON(github.event.issue.labels.*.name) }}'
          if echo "$LABELS" | grep -qE '"(devpira|devlimeira|devrioclaro|devitape)"'; then
            echo "has_community_label=true" >> $GITHUB_OUTPUT
          else
            echo "has_community_label=false" >> $GITHUB_OUTPUT
          fi

      - name: Add to project
        if: steps.check.outputs.has_community_label == 'true'
        uses: actions/add-to-project@v1
        with:
          project-url: https://github.com/orgs/<OWNER>/projects/<PROJECT_NUMBER>
          github-token: ${{ secrets.PROJECT_TOKEN }}
```

> **Nota:** A Opção A (workflow nativo do Projects) é mais simples e não requer token adicional. Use a Opção B apenas se precisar de lógica customizada mais complexa.

---

## 6. Validação do Setup

Após completar a configuração, execute os seguintes testes:

### Checklist de Validação

- [ ] Board criado com título "Agenda Tech — Board"
- [ ] Campo Status possui exatamente 4 opções: To Do, In Progress, Review, Done (nesta ordem)
- [ ] 4 labels de comunidade criadas com cores corretas
- [ ] 4 labels de camada técnica criadas com cores corretas
- [ ] 4 labels adicionais (bug + 3 prioridades) criadas com cores corretas
- [ ] Campo customizado "Prioridade" criado com opções Alta, Média, Baixa
- [ ] Campo customizado "Estimativa" criado com opções 1, 2, 3, 5, 8
- [ ] Automação configurada e ativa

### Teste de Automação

```bash
# Criar issue de teste com label de comunidade
gh issue create --title "[TESTE] Validação de automação" \
  --body "Issue de teste para validar automação do board." \
  --label "devpira,organizacao" \
  --repo "<OWNER>/AgendaTech"

# Verificar se a issue apareceu na coluna "To Do" do board
# (verificação manual via UI do GitHub Projects)

# Criar issue de teste SEM label de comunidade
gh issue create --title "[TESTE] Sem label de comunidade" \
  --body "Esta issue NÃO deve aparecer no board." \
  --repo "<OWNER>/AgendaTech"

# Verificar que esta issue NÃO aparece no board

# Limpar issues de teste
gh issue close <ISSUE_NUMBER> --repo "<OWNER>/AgendaTech"
```

---

## 7. Referência Rápida de Comandos

```bash
# ═══════════════════════════════════════════════════
# LABELS
# ═══════════════════════════════════════════════════

# Listar labels existentes
gh label list --repo "<OWNER>/AgendaTech"

# Deletar label (se precisar recriar)
gh label delete "<LABEL_NAME>" --repo "<OWNER>/AgendaTech" --yes

# ═══════════════════════════════════════════════════
# PROJETO
# ═══════════════════════════════════════════════════

# Listar projetos
gh project list --owner "<OWNER>"

# Ver detalhes do projeto
gh project view <PROJECT_NUMBER> --owner "<OWNER>"

# Listar campos do projeto
gh project field-list <PROJECT_NUMBER> --owner "<OWNER>"

# Listar itens do projeto
gh project item-list <PROJECT_NUMBER> --owner "<OWNER>"
```

---

## Troubleshooting

| Problema | Causa Provável | Solução |
|----------|---------------|---------|
| Issue não aparece no board | Falta label de comunidade | Adicionar uma das 4 labels de comunidade à issue |
| Automação não dispara | Workflow desativado | Verificar Settings → Workflows no projeto |
| Erro ao criar label via CLI | Label já existe | Usar `gh label edit` ou deletar e recriar |
| Campo customizado não aparece | Criado no repositório | Campos customizados são do Project, não do repo |
| Coluna fora de ordem | Opções do Status desordenadas | Reordenar via drag-and-drop na UI do Projects |
