# Implementation Plan: Agenda Tech — Definição e Organização do Projeto

## Overview

Este plano converte o design organizacional do Agenda Tech em tarefas incrementais de criação de arquivos, configurações e documentação no repositório. O foco é exclusivamente em artefatos que podem ser criados/modificados por um agente de código: arquivos Markdown, templates YAML, estrutura de diretórios e documentação. Configurações que exigem interação com a UI do GitHub (Projects board, automações, milestones via API) serão documentadas como scripts ou instruções executáveis.

## Tasks

- [x] 1. Estrutura do repositório e documentação base
  - [x] 1.1 Criar estrutura de diretórios do projeto
    - Criar os diretórios: `.github/ISSUE_TEMPLATE/`, `docs/wireframes/`, `backend/`, `frontend/`, `infra/`
    - Adicionar arquivos `.gitkeep` nos diretórios vazios para preservar a estrutura no Git
    - _Requirements: 2.2_

  - [x] 1.2 Criar/atualizar o README.md com todas as seções exigidas
    - Incluir: propósito do projeto, stack tecnológica, estrutura de pastas, link para CONTRIBUTING.md
    - Incluir badges e links para o GitHub Projects board
    - Listar as 4 comunidades participantes e suas responsabilidades
    - _Requirements: 2.1_

  - [x] 1.3 Criar o arquivo CONTRIBUTING.md
    - Documentar regras de formatação e linting
    - Documentar convenção de commits baseada em Conventional Commits
    - Documentar fluxo de pull requests (criação de branch → desenvolvimento → PR → review → merge)
    - Documentar o workflow de fork + PR para contribuidores externos
    - _Requirements: 2.3_

  - [x] 1.4 Verificar/atualizar o arquivo LICENSE (MIT)
    - Confirmar que o arquivo LICENSE na raiz contém a licença MIT completa e atualizada
    - _Requirements: 2.4_

- [x] 2. Definição da Stack Tecnológica
  - [x] 2.1 Criar o documento docs/stack.md
    - Para cada camada (backend, frontend, banco de dados, CI/CD): nome da tecnologia, versão adotada, finalidade
    - Incluir justificativa de escolha para cada tecnologia
    - Listar pré-requisitos de ambiente (versões de runtime, gerenciadores de pacotes, ferramentas CLI)
    - Incluir instruções de setup do ambiente local com comando de verificação para cada camada
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Templates de Issues
  - [x] 3.1 Criar o template .github/ISSUE_TEMPLATE/feature.yml
    - Campos obrigatórios: descrição, critérios de aceitação, comunidade responsável (dropdown), estimativa de esforço (dropdown P/M/G)
    - Usar formato YAML com `validations.required: true` para todos os campos obrigatórios
    - _Requirements: 4.1, 4.4, 4.5_

  - [x] 3.2 Criar o template .github/ISSUE_TEMPLATE/bug.yml
    - Campos obrigatórios: descrição do problema, passos para reproduzir, comportamento esperado, comportamento atual
    - Incluir label pré-configurada "bug"
    - Usar formato YAML com `validations.required: true`
    - _Requirements: 4.2, 4.5_

  - [x] 3.3 Criar o template .github/ISSUE_TEMPLATE/infra.yml
    - Campos obrigatórios: descrição, impacto, dependências
    - Incluir label pré-configurada "ci-cd"
    - Usar formato YAML com `validations.required: true`
    - _Requirements: 4.3, 4.5_

  - [x] 3.4 Criar o arquivo .github/PULL_REQUEST_TEMPLATE.md
    - Incluir seções: descrição das mudanças, tipo de mudança, checklist de revisão, issue relacionada
    - _Requirements: 2.3, 2.5_

- [x] 4. Checkpoint - Verificar estrutura e templates
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Documentação de Milestones e WBS
  - [x] 5.1 Criar documento docs/wbs.md com Work Breakdown Structure completa
    - Documentar WBS da DEVPIRA: definição de stack, setup repositório, config GitHub Projects, criação de issues, plano de tracking
    - Documentar WBS da DevLimeira: modelagem de dados, CRUD comunidades, CRUD eventos, validações, documentação API
    - Documentar WBS da DevRioClaro: setup GitHub Actions, pipeline de testes, pipeline de deploy, linting
    - Documentar WBS da DevItape: setup frontend, listagem comunidades, formulários, calendário, filtros
    - Para cada tarefa: entregável, critério de conclusão, dependências
    - Documentar dependências entre tarefas de comunidades diferentes
    - Incluir diagrama visual (Mermaid) da WBS
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_

  - [x] 5.2 Criar documento com definição dos Milestones
    - Documentar os 4 milestones: MS1 Organização (DEVPIRA), MS2 Backend (DevLimeira), MS3 CI/CD (DevRioClaro), MS4 Frontend (DevItape)
    - Para cada milestone: objetivo, lista de issues incluídas, critérios de conclusão, data-limite, dependências
    - Documentar ordem de dependência: MS1 → MS2/MS3 → MS4
    - Adicionar informações no docs/wbs.md ou em seção dedicada
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6. Escopo Funcional do Produto
  - [x] 6.1 Criar documento docs/escopo-funcional.md
    - Documentar funcionalidades por módulo: cadastro de comunidades, registro de eventos, calendário compartilhado, gestão de organizadores
    - Para cada módulo: modelo de dados (entidades, atributos, relacionamentos)
    - Especificar endpoints da API: método HTTP, rota, parâmetros, formato de resposta, códigos de status
    - Especificar telas do frontend: componentes, dados exibidos, ações do usuário, navegação
    - Documentar regras de negócio: campos obrigatórios, validações, relacionamentos, permissões
    - Definir critérios de aceitação no formato Given-When-Then (mínimo 1 sucesso + 1 erro por funcionalidade)
    - Documentar papéis de usuário (organizador, membro, visitante) e permissões por módulo
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 6.2 Criar wireframes de baixa fidelidade em docs/wireframes/
    - Criar wireframes para as telas principais: listagem de comunidades, cadastro de evento, calendário compartilhado
    - Podem ser em formato texto/ASCII ou Markdown com descrição visual
    - _Requirements: 8.3_

- [x] 7. Checkpoint - Verificar documentação completa
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Configuração do GitHub Projects (scripts e documentação)
  - [x] 8.1 Criar documentação de setup do GitHub Projects board
    - Documentar as 4 colunas (To Do, In Progress, Review, Done) e sua ordem
    - Documentar labels de comunidade: devpira (#7B68EE), devlimeira (#2E8B57), devrioclaro (#FF6347), devitape (#4169E1)
    - Documentar labels de camada: organizacao (#DDA0DD), backend (#20B2AA), ci-cd (#FFA500), frontend (#87CEEB)
    - Documentar labels adicionais: bug (#D73A4A), prioridade:alta (#B60205), prioridade:media (#FBCA04), prioridade:baixa (#0E8A16)
    - Documentar campos customizados: prioridade (alta/média/baixa), estimativa (1/2/3/5/8)
    - Documentar regra de automação: issue com label de comunidade → coluna To Do
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 8.2 Criar script ou documentação para criação de issues da WBS
    - Listar todas as issues a serem criadas com: título, body, labels (comunidade + camada), milestone
    - Organizar por milestone/comunidade
    - Formato que permita criação via GitHub CLI (`gh issue create`)
    - _Requirements: 6.5_

- [x] 9. Plano de Tracking e Apresentação
  - [x] 9.1 Criar documento docs/tracking-plan.md
    - Definir indicadores de progresso: issues abertas vs fechadas, percentual por milestone, distribuição por comunidade
    - Descrever fluxo de trabalho: To Do → In Progress → Review → Done com triggers de transição
    - Documentar views do GitHub Projects: view por comunidade, view por prioridade, view timeline
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [x] 9.2 Incluir roteiro da apresentação no plano de tracking
    - Bloco Introdução (5 min): contexto, comunidades, objetivo
    - Bloco Demonstração do Board (10 min): quadro, colunas, labels, campos, automações
    - Bloco Simulação ao Vivo (10 min): criar issue, mover entre colunas, views e filtros
    - Bloco Fluxo de Trabalho (5 min): To Do → In Progress → Review → Done
    - Bloco Métricas e Tracking (5 min): indicadores, percentuais, views por comunidade
    - Bloco Encerramento (5 min): próximos passos, como contribuir, links
    - _Requirements: 7.4_

  - [x] 9.3 Incluir checklist de preparação pré-apresentação
    - Board acessível com dados de exemplo
    - Issues de exemplo em cada coluna
    - Views criadas e salvas
    - Milestones com issues associadas
    - Automações testadas
    - Link do repositório compartilhado
    - Tela compartilhada configurada
    - _Requirements: 7.6_

- [x] 10. Final checkpoint - Validação completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Este projeto não produz código de aplicação — todos os entregáveis são arquivos de configuração, documentação e templates
- Configurações que exigem a UI do GitHub (criação de Projects board, labels, milestones, automações) devem ser documentadas com instruções passo-a-passo ou comandos `gh` CLI
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Property-Based Testing não se aplica a esta fase (conforme design)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.4"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4"] },
    { "id": 3, "tasks": ["5.1", "6.1"] },
    { "id": 4, "tasks": ["5.2", "6.2"] },
    { "id": 5, "tasks": ["8.1", "8.2"] },
    { "id": 6, "tasks": ["9.1"] },
    { "id": 7, "tasks": ["9.2", "9.3"] }
  ]
}
```
