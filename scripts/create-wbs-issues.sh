#!/usr/bin/env bash
# =============================================================================
# Script: Criação de Issues da WBS — Agenda Tech
# Descrição: Cria todas as issues da Work Breakdown Structure no repositório
#            GitHub usando o GitHub CLI (gh).
#
# Pré-requisitos:
#   - GitHub CLI instalado (https://cli.github.com/)
#   - Autenticado: `gh auth login`
#   - Repositório: executar na raiz do projeto ou definir REPO abaixo
#   - Labels e Milestones já criados no repositório (ver docs/github-projects-setup.md)
#
# Uso:
#   chmod +x scripts/create-wbs-issues.sh
#   ./scripts/create-wbs-issues.sh
#
# Nota: O script usa --milestone com o título exato do milestone.
#       Certifique-se de que os milestones foram criados antes de executar.
# =============================================================================

set -euo pipefail

# Configuração — ajuste se necessário
REPO=""  # Deixe vazio para usar o repositório atual, ou defina como "owner/repo"
REPO_FLAG=""
if [ -n "$REPO" ]; then
  REPO_FLAG="--repo $REPO"
fi

echo "=============================================="
echo " Agenda Tech — Criação de Issues da WBS"
echo "=============================================="
echo ""
echo "Este script criará 22 issues correspondentes à WBS do projeto."
echo "Certifique-se de que labels e milestones já foram criados."
echo ""
read -p "Continuar? (s/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo "Abortado."
  exit 0
fi

echo ""
echo "=============================================="
echo " MS1: Organização do Projeto (DEVPIRA)"
echo "=============================================="
echo ""

# --- Issue 1.1: Definição de Stack ---
echo "→ Criando issue 1.1: Definição de Stack..."
gh issue create $REPO_FLAG \
  --title "1.1 Definição de Stack" \
  --label "devpira,organizacao,prioridade:alta" \
  --milestone "MS1: Organização do Projeto" \
  --body "## Descrição

Criar documento \`docs/stack.md\` com a definição completa da stack tecnológica do projeto.

## Entregável

Documento \`docs/stack.md\` com stack completa para todas as camadas.

## Critérios de Aceitação

- [ ] Cada camada (backend, frontend, BD, CI/CD) possui: nome da tecnologia, versão, finalidade
- [ ] Justificativa de escolha documentada para cada tecnologia
- [ ] Pré-requisitos de ambiente com versões exatas
- [ ] Instruções de setup local com comando de verificação

## Informações Adicionais

- **Comunidade:** DEVPIRA
- **Estimativa:** 3 pontos
- **Dependências:** Nenhuma"

# --- Issue 1.2: Setup Repositório ---
echo "→ Criando issue 1.2: Setup Repositório..."
gh issue create $REPO_FLAG \
  --title "1.2 Setup Repositório" \
  --label "devpira,organizacao,prioridade:alta" \
  --milestone "MS1: Organização do Projeto" \
  --body "## Descrição

Estruturar o repositório com diretórios, README, CONTRIBUTING e LICENSE.

## Entregável

Repositório com estrutura de diretórios completa e documentação base.

## Critérios de Aceitação

- [ ] Diretórios \`.github/ISSUE_TEMPLATE/\`, \`docs/wireframes/\`, \`backend/\`, \`frontend/\`, \`infra/\` existem
- [ ] README.md com seções: propósito, stack, estrutura de pastas, link CONTRIBUTING
- [ ] CONTRIBUTING.md com: formatação/linting, Conventional Commits, fluxo de PR, fork workflow
- [ ] LICENSE MIT presente na raiz

## Informações Adicionais

- **Comunidade:** DEVPIRA
- **Estimativa:** 3 pontos
- **Dependências:** Nenhuma"

# --- Issue 1.3: Config GitHub Projects ---
echo "→ Criando issue 1.3: Configuração do GitHub Projects..."
gh issue create $REPO_FLAG \
  --title "1.3 Configuração do GitHub Projects" \
  --label "devpira,organizacao,prioridade:alta" \
  --milestone "MS1: Organização do Projeto" \
  --body "## Descrição

Configurar o board do GitHub Projects com colunas, labels, campos customizados e automações.

## Entregável

Board do GitHub Projects totalmente configurado e operacional.

## Critérios de Aceitação

- [ ] 4 colunas: To Do → In Progress → Review → Done
- [ ] Labels de comunidade: \`devpira\`, \`devlimeira\`, \`devrioclaro\`, \`devitape\`
- [ ] Labels de camada: \`organizacao\`, \`backend\`, \`ci-cd\`, \`frontend\`
- [ ] Campos customizados: prioridade (alta/média/baixa), estimativa (1/2/3/5/8)
- [ ] Automação configurada: issue com label de comunidade → To Do

## Informações Adicionais

- **Comunidade:** DEVPIRA
- **Estimativa:** 5 pontos
- **Dependências:** 1.2 Setup Repositório"

# --- Issue 1.4: Templates de Issues ---
echo "→ Criando issue 1.4: Templates de Issues..."
gh issue create $REPO_FLAG \
  --title "1.4 Templates de Issues" \
  --label "devpira,organizacao,prioridade:media" \
  --milestone "MS1: Organização do Projeto" \
  --body "## Descrição

Criar templates YAML para issues (feature, bug, infra) e template de Pull Request.

## Entregável

3 templates YAML para issues + PR template no repositório.

## Critérios de Aceitação

- [ ] \`feature.yml\` com campos: descrição, critérios de aceitação, comunidade (dropdown), estimativa (dropdown)
- [ ] \`bug.yml\` com campos: descrição, passos, esperado, atual; label \`bug\` pré-configurada
- [ ] \`infra.yml\` com campos: descrição, impacto, dependências; label \`ci-cd\` pré-configurada
- [ ] \`PULL_REQUEST_TEMPLATE.md\` com seções adequadas
- [ ] Todos os campos com \`validations.required: true\`

## Informações Adicionais

- **Comunidade:** DEVPIRA
- **Estimativa:** 3 pontos
- **Dependências:** 1.2 Setup Repositório"

# --- Issue 1.5: Milestones ---
echo "→ Criando issue 1.5: Criação dos Milestones..."
gh issue create $REPO_FLAG \
  --title "1.5 Criação dos Milestones" \
  --label "devpira,organizacao,prioridade:media" \
  --milestone "MS1: Organização do Projeto" \
  --body "## Descrição

Criar os 4 milestones do projeto no GitHub com descrições, due dates e dependências.

## Entregável

4 milestones configurados no GitHub.

## Critérios de Aceitação

- [ ] MS1: Organização do Projeto (DEVPIRA) criado
- [ ] MS2: Backend API (DevLimeira) criado
- [ ] MS3: CI/CD e Testes (DevRioClaro) criado
- [ ] MS4: Frontend (DevItape) criado
- [ ] Cada milestone possui: descrição, due date, dependências documentadas

## Informações Adicionais

- **Comunidade:** DEVPIRA
- **Estimativa:** 2 pontos
- **Dependências:** 1.3 Config GitHub Projects"

# --- Issue 1.6: Criação de Issues WBS ---
echo "→ Criando issue 1.6: Criação de Issues da WBS..."
gh issue create $REPO_FLAG \
  --title "1.6 Criação de Issues da WBS" \
  --label "devpira,organizacao,prioridade:media" \
  --milestone "MS1: Organização do Projeto" \
  --body "## Descrição

Criar issues no repositório para cada item da WBS com labels, milestones e campos customizados.

## Entregável

Todas as issues da WBS criadas e associadas aos milestones corretos.

## Critérios de Aceitação

- [ ] Issue criada para cada tarefa listada na WBS (22 issues total)
- [ ] Labels de comunidade e camada atribuídas em cada issue
- [ ] Milestone associado corretamente
- [ ] Campos customizados (prioridade, estimativa) preenchidos

## Informações Adicionais

- **Comunidade:** DEVPIRA
- **Estimativa:** 5 pontos
- **Dependências:** 1.4 Templates de Issues, 1.5 Milestones"

# --- Issue 1.7: Plano de Tracking ---
echo "→ Criando issue 1.7: Plano de Tracking..."
gh issue create $REPO_FLAG \
  --title "1.7 Plano de Tracking" \
  --label "devpira,organizacao,prioridade:baixa" \
  --milestone "MS1: Organização do Projeto" \
  --body "## Descrição

Criar documento \`docs/tracking-plan.md\` com indicadores, fluxo de trabalho, views do GitHub Projects, roteiro da apresentação e checklist.

## Entregável

Documento \`docs/tracking-plan.md\` completo.

## Critérios de Aceitação

- [ ] Indicadores definidos: issues abertas vs fechadas, % por milestone, distribuição por comunidade
- [ ] Fluxo de trabalho documentado com triggers de transição
- [ ] Views do GitHub Projects especificadas (comunidade, prioridade, timeline)
- [ ] Roteiro da apresentação com duração por bloco (total 40 min)
- [ ] Checklist pré-apresentação completo

## Informações Adicionais

- **Comunidade:** DEVPIRA
- **Estimativa:** 3 pontos
- **Dependências:** 1.3 Config GitHub Projects"

# --- Issue 1.8: Escopo Funcional ---
echo "→ Criando issue 1.8: Escopo Funcional..."
gh issue create $REPO_FLAG \
  --title "1.8 Escopo Funcional" \
  --label "devpira,organizacao,prioridade:alta" \
  --milestone "MS1: Organização do Projeto" \
  --body "## Descrição

Criar documento \`docs/escopo-funcional.md\` com especificação completa das funcionalidades do produto.

## Entregável

Documento \`docs/escopo-funcional.md\` completo.

## Critérios de Aceitação

- [ ] Módulos documentados: comunidades, eventos, calendário, organizadores
- [ ] Modelo de dados por módulo (entidades, atributos, relacionamentos)
- [ ] Endpoints de API especificados (método, rota, parâmetros, resposta, status codes)
- [ ] Telas do frontend especificadas (componentes, dados, ações, navegação)
- [ ] Regras de negócio documentadas (validações, permissões, cardinalidade)
- [ ] Critérios de aceitação Given-When-Then (min. 1 sucesso + 1 erro por funcionalidade)
- [ ] Papéis de usuário (organizador, membro, visitante) e permissões por módulo

## Informações Adicionais

- **Comunidade:** DEVPIRA
- **Estimativa:** 8 pontos
- **Dependências:** 1.1 Definição de Stack"

echo ""
echo "=============================================="
echo " MS2: Backend API (DevLimeira)"
echo "=============================================="
echo ""

# --- Issue 2.1: Modelagem de Dados ---
echo "→ Criando issue 2.1: Modelagem de Dados..."
gh issue create $REPO_FLAG \
  --title "2.1 Modelagem de Dados" \
  --label "devlimeira,backend,prioridade:alta" \
  --milestone "MS2: Backend API" \
  --body "## Descrição

Definir o schema do banco de dados com entidades, atributos, tipos e relacionamentos. Criar migrations ou schema file e diagrama ER.

## Entregável

Schema do banco de dados definido com entidades, atributos e relacionamentos.

## Critérios de Aceitação

- [ ] Entidade \`Comunidade\` definida (id, nome, descricao, logo_url, website, data_criacao)
- [ ] Entidade \`Evento\` definida (id, titulo, descricao, data_inicio, data_fim, local, comunidade_id)
- [ ] Entidade \`Organizador\` definida (id, nome, email, comunidade_id, papel)
- [ ] Relacionamentos definidos com cardinalidade (1:N comunidade→eventos, N:M comunidade→organizadores)
- [ ] Migrations ou schema file criado
- [ ] Diagrama ER documentado

## Informações Adicionais

- **Comunidade:** DevLimeira
- **Estimativa:** 5 pontos
- **Dependências:** MS1 concluído, 1.8 Escopo Funcional"

# --- Issue 2.2: CRUD Comunidades ---
echo "→ Criando issue 2.2: CRUD Comunidades..."
gh issue create $REPO_FLAG \
  --title "2.2 CRUD Comunidades" \
  --label "devlimeira,backend,prioridade:alta" \
  --milestone "MS2: Backend API" \
  --body "## Descrição

Implementar endpoints REST completos para gerenciamento de comunidades.

## Entregável

Endpoints CRUD para comunidades implementados e funcionais.

## Critérios de Aceitação

- [ ] \`GET /api/comunidades\` — listar todas as comunidades
- [ ] \`GET /api/comunidades/:id\` — buscar comunidade por ID
- [ ] \`POST /api/comunidades\` — criar nova comunidade
- [ ] \`PUT /api/comunidades/:id\` — atualizar comunidade existente
- [ ] \`DELETE /api/comunidades/:id\` — remover comunidade
- [ ] Respostas com status codes corretos (200, 201, 400, 404, 500)
- [ ] Formato de resposta padronizado (JSON com data e meta)

## Informações Adicionais

- **Comunidade:** DevLimeira
- **Estimativa:** 5 pontos
- **Dependências:** 2.1 Modelagem de Dados"

# --- Issue 2.3: CRUD Eventos ---
echo "→ Criando issue 2.3: CRUD Eventos..."
gh issue create $REPO_FLAG \
  --title "2.3 CRUD Eventos" \
  --label "devlimeira,backend,prioridade:media" \
  --milestone "MS2: Backend API" \
  --body "## Descrição

Implementar endpoints REST completos para gerenciamento de eventos com filtros por data e comunidade.

## Entregável

Endpoints CRUD para eventos implementados e funcionais.

## Critérios de Aceitação

- [ ] \`GET /api/eventos\` — listar eventos (com filtros: data, comunidade)
- [ ] \`GET /api/eventos/:id\` — buscar evento por ID
- [ ] \`POST /api/eventos\` — criar novo evento (vinculado a uma comunidade)
- [ ] \`PUT /api/eventos/:id\` — atualizar evento existente
- [ ] \`DELETE /api/eventos/:id\` — remover evento
- [ ] Filtros por query parameters: \`?comunidade_id=\`, \`?data_inicio=\`, \`?data_fim=\`
- [ ] Validação de que \`comunidade_id\` referencia comunidade existente

## Informações Adicionais

- **Comunidade:** DevLimeira
- **Estimativa:** 5 pontos
- **Dependências:** 2.1 Modelagem de Dados, 2.2 CRUD Comunidades"

# --- Issue 2.4: Validações ---
echo "→ Criando issue 2.4: Validações..."
gh issue create $REPO_FLAG \
  --title "2.4 Validações" \
  --label "devlimeira,backend,prioridade:media" \
  --milestone "MS2: Backend API" \
  --body "## Descrição

Implementar camada de validação de dados para todos os endpoints do backend.

## Entregável

Camada de validação de dados implementada e testada.

## Critérios de Aceitação

- [ ] Campos obrigatórios retornam 400 com mensagem específica quando ausentes
- [ ] Validação de formato: email, URL, datas (ISO 8601)
- [ ] Validação de comprimento: nome (3-100 chars), descrição (máx 1000 chars)
- [ ] Validação de relacionamento: comunidade_id deve existir ao criar evento
- [ ] Mensagens de erro padronizadas em formato JSON \`{ \"error\": { \"code\": \"...\", \"message\": \"...\" } }\`

## Informações Adicionais

- **Comunidade:** DevLimeira
- **Estimativa:** 3 pontos
- **Dependências:** 2.2 CRUD Comunidades, 2.3 CRUD Eventos"

# --- Issue 2.5: Documentação API ---
echo "→ Criando issue 2.5: Documentação API..."
gh issue create $REPO_FLAG \
  --title "2.5 Documentação API" \
  --label "devlimeira,backend,prioridade:baixa" \
  --milestone "MS2: Backend API" \
  --body "## Descrição

Criar documentação completa e atualizada da API REST com exemplos de uso.

## Entregável

Documentação completa e atualizada da API REST.

## Critérios de Aceitação

- [ ] Todos os endpoints documentados com método, rota e descrição
- [ ] Parâmetros de entrada (path, query, body) documentados com tipo e obrigatoriedade
- [ ] Formato de resposta documentado com exemplos JSON
- [ ] Códigos de status documentados para cada endpoint (sucesso e erro)
- [ ] Exemplos de uso com curl ou similar
- [ ] Documentação acessível no repositório (\`docs/\` ou gerada automaticamente)

## Informações Adicionais

- **Comunidade:** DevLimeira
- **Estimativa:** 3 pontos
- **Dependências:** 2.2, 2.3, 2.4"

echo ""
echo "=============================================="
echo " MS3: CI/CD e Testes (DevRioClaro)"
echo "=============================================="
echo ""

# --- Issue 3.1: Setup GitHub Actions ---
echo "→ Criando issue 3.1: Setup GitHub Actions..."
gh issue create $REPO_FLAG \
  --title "3.1 Setup GitHub Actions" \
  --label "devrioclaro,ci-cd,prioridade:alta" \
  --milestone "MS3: CI/CD e Testes" \
  --body "## Descrição

Configurar a estrutura base de workflows do GitHub Actions para CI do projeto.

## Entregável

Estrutura base de workflows do GitHub Actions configurada.

## Critérios de Aceitação

- [ ] Diretório \`.github/workflows/\` com arquivo de workflow CI
- [ ] Workflow trigger em \`push\` (main) e \`pull_request\` (main)
- [ ] Runner configurado (ubuntu-latest)
- [ ] Steps básicos: checkout, setup de runtime, instalação de dependências
- [ ] Workflow executando com sucesso (green check)

## Informações Adicionais

- **Comunidade:** DevRioClaro
- **Estimativa:** 3 pontos
- **Dependências:** MS1 concluído, estrutura do repositório definida"

# --- Issue 3.2: Pipeline de Testes ---
echo "→ Criando issue 3.2: Pipeline de Testes..."
gh issue create $REPO_FLAG \
  --title "3.2 Pipeline de Testes" \
  --label "devrioclaro,ci-cd,prioridade:media" \
  --milestone "MS3: CI/CD e Testes" \
  --body "## Descrição

Configurar pipeline de testes automatizados integrado ao CI com cobertura e checks obrigatórios.

## Entregável

Pipeline de testes automatizados integrado ao CI.

## Critérios de Aceitação

- [ ] Testes unitários do backend executando no CI
- [ ] Testes unitários do frontend executando no CI
- [ ] Relatório de cobertura de código gerado (mínimo 70% target)
- [ ] Check \"tests\" configurado como obrigatório em branch protection
- [ ] Falha de teste bloqueia merge do PR

## Informações Adicionais

- **Comunidade:** DevRioClaro
- **Estimativa:** 5 pontos
- **Dependências:** 3.1 Setup GitHub Actions, 2.2 CRUD Comunidades"

# --- Issue 3.3: Pipeline de Deploy ---
echo "→ Criando issue 3.3: Pipeline de Deploy..."
gh issue create $REPO_FLAG \
  --title "3.3 Pipeline de Deploy" \
  --label "devrioclaro,ci-cd,prioridade:baixa" \
  --milestone "MS3: CI/CD e Testes" \
  --body "## Descrição

Configurar workflow de deploy automatizado para staging com notificações.

## Entregável

Workflow de deploy automatizado configurado.

## Critérios de Aceitação

- [ ] Workflow separado para deploy (ou job no workflow principal)
- [ ] Deploy ativado apenas em merge na branch \`main\`
- [ ] Deploy para ambiente de staging/preview configurado
- [ ] Notificação de status (sucesso/falha) via GitHub commit status ou comment
- [ ] Rollback documentado em caso de falha

## Informações Adicionais

- **Comunidade:** DevRioClaro
- **Estimativa:** 5 pontos
- **Dependências:** 3.1 Setup GitHub Actions, 3.2 Pipeline de Testes"

# --- Issue 3.4: Linting e Formatação ---
echo "→ Criando issue 3.4: Linting e Formatação..."
gh issue create $REPO_FLAG \
  --title "3.4 Linting e Formatação" \
  --label "devrioclaro,ci-cd,prioridade:media" \
  --milestone "MS3: CI/CD e Testes" \
  --body "## Descrição

Configurar verificação automatizada de qualidade de código com ESLint, Prettier e checks no CI.

## Entregável

Verificação automatizada de qualidade de código no CI.

## Critérios de Aceitação

- [ ] ESLint configurado para código TypeScript/JavaScript (frontend)
- [ ] Linter configurado para código backend (linguagem da stack)
- [ ] Prettier configurado para formatação consistente
- [ ] Step de linting no workflow CI
- [ ] Falha de linting bloqueia merge
- [ ] Configuração local (\`.eslintrc\`, \`.prettierrc\`) alinhada com CI

## Informações Adicionais

- **Comunidade:** DevRioClaro
- **Estimativa:** 3 pontos
- **Dependências:** 3.1 Setup GitHub Actions"

echo ""
echo "=============================================="
echo " MS4: Frontend (DevItape)"
echo "=============================================="
echo ""

# --- Issue 4.1: Setup Projeto Frontend ---
echo "→ Criando issue 4.1: Setup Projeto Frontend..."
gh issue create $REPO_FLAG \
  --title "4.1 Setup Projeto Frontend" \
  --label "devitape,frontend,prioridade:alta" \
  --milestone "MS4: Frontend" \
  --body "## Descrição

Inicializar o projeto frontend com o framework definido na stack, estrutura de pastas e configuração de desenvolvimento.

## Entregável

Projeto frontend funcional com estrutura base.

## Critérios de Aceitação

- [ ] Projeto criado com framework definido na stack (React + Next.js ou similar)
- [ ] Estrutura de pastas: \`components/\`, \`pages/\`, \`services/\`, \`styles/\`, \`utils/\`
- [ ] Configuração de linting (ESLint) e formatação (Prettier)
- [ ] Aplicação rodando localmente com página inicial placeholder
- [ ] Scripts de desenvolvimento (\`dev\`, \`build\`, \`lint\`) configurados

## Informações Adicionais

- **Comunidade:** DevItape
- **Estimativa:** 3 pontos
- **Dependências:** MS1 concluído, 1.1 Definição de Stack"

# --- Issue 4.2: Tela Listagem Comunidades ---
echo "→ Criando issue 4.2: Tela Listagem Comunidades..."
gh issue create $REPO_FLAG \
  --title "4.2 Tela Listagem Comunidades" \
  --label "devitape,frontend,prioridade:media" \
  --milestone "MS4: Frontend" \
  --body "## Descrição

Implementar página funcional de listagem de comunidades com integração à API.

## Entregável

Página funcional de listagem de comunidades.

## Critérios de Aceitação

- [ ] Componente de listagem exibindo comunidades em cards ou lista
- [ ] Dados exibidos: nome, descrição (truncada), logo/avatar
- [ ] Integração com endpoint \`GET /api/comunidades\`
- [ ] Estado de loading (skeleton ou spinner) durante fetch
- [ ] Estado vazio quando não há comunidades cadastradas
- [ ] Layout responsivo (mobile e desktop)

## Informações Adicionais

- **Comunidade:** DevItape
- **Estimativa:** 5 pontos
- **Dependências:** 4.1 Setup Projeto Frontend, 2.2 CRUD Comunidades (contrato de API)"

# --- Issue 4.3: Formulários de Cadastro ---
echo "→ Criando issue 4.3: Formulários de Cadastro..."
gh issue create $REPO_FLAG \
  --title "4.3 Formulários de Cadastro" \
  --label "devitape,frontend,prioridade:media" \
  --milestone "MS4: Frontend" \
  --body "## Descrição

Implementar formulários de criação e edição de comunidades e eventos com validação e integração à API.

## Entregável

Formulários de criação e edição de comunidades e eventos.

## Critérios de Aceitação

- [ ] Formulário de comunidade: nome (obrigatório), descrição, logo URL, website
- [ ] Formulário de evento: título (obrigatório), descrição, data início, data fim, local, comunidade
- [ ] Validação de campos no frontend (obrigatoriedade, formato)
- [ ] Integração com endpoints POST (criar) e PUT (editar)
- [ ] Feedback visual: mensagem de sucesso, destaque de campo com erro
- [ ] Redirecionamento após sucesso

## Informações Adicionais

- **Comunidade:** DevItape
- **Estimativa:** 5 pontos
- **Dependências:** 4.1 Setup Projeto Frontend, 2.2 CRUD Comunidades, 2.3 CRUD Eventos"

# --- Issue 4.4: Calendário Compartilhado ---
echo "→ Criando issue 4.4: Calendário Compartilhado..."
gh issue create $REPO_FLAG \
  --title "4.4 Calendário Compartilhado" \
  --label "devitape,frontend,prioridade:media" \
  --milestone "MS4: Frontend" \
  --body "## Descrição

Implementar componente de calendário interativo com eventos integrado à API.

## Entregável

Componente de calendário interativo com eventos.

## Critérios de Aceitação

- [ ] Visualização mensal de calendário com dias e eventos
- [ ] Navegação entre meses (anterior/próximo)
- [ ] Eventos exibidos no dia correspondente com título e cor da comunidade
- [ ] Clique em evento abre modal ou navega para detalhes
- [ ] Integração com \`GET /api/eventos?data_inicio=&data_fim=\`
- [ ] Performance adequada com muitos eventos (lazy loading se necessário)

## Informações Adicionais

- **Comunidade:** DevItape
- **Estimativa:** 8 pontos
- **Dependências:** 4.1 Setup Projeto Frontend, 2.3 CRUD Eventos"

# --- Issue 4.5: Filtros ---
echo "→ Criando issue 4.5: Filtros..."
gh issue create $REPO_FLAG \
  --title "4.5 Filtros" \
  --label "devitape,frontend,prioridade:baixa" \
  --milestone "MS4: Frontend" \
  --body "## Descrição

Implementar sistema de filtros integrado às telas de listagem e calendário.

## Entregável

Sistema de filtros integrado às telas de listagem e calendário.

## Critérios de Aceitação

- [ ] Filtro por comunidade (dropdown ou chips) funcional na listagem e calendário
- [ ] Filtro por período (date range picker) funcional
- [ ] Filtro por texto (campo de busca) funcional
- [ ] Filtros refletidos na URL via query parameters
- [ ] Estado de filtros mantido ao navegar entre páginas
- [ ] Botão \"limpar filtros\" disponível

## Informações Adicionais

- **Comunidade:** DevItape
- **Estimativa:** 5 pontos
- **Dependências:** 4.2 Tela Listagem Comunidades, 4.4 Calendário Compartilhado"

echo ""
echo "=============================================="
echo " ✅ Concluído!"
echo "=============================================="
echo ""
echo "22 issues criadas com sucesso."
echo ""
echo "Próximos passos:"
echo "  1. Verifique as issues no repositório"
echo "  2. Atribua os campos customizados (prioridade, estimativa) no GitHub Projects"
echo "  3. Verifique se as automações adicionaram as issues ao board"
echo ""
