# Requirements Document

## Introduction

O **Agenda Tech** é um calendário colaborativo e open-source onde comunidades de tecnologia podem registrar seus eventos e todos os interessados visualizam uma agenda compartilhada. O projeto está sendo construído ao vivo durante o evento "Communities WKND Boituva", com contribuições de 4 comunidades:

- **DEVPIRA**: Organização e gestão de projeto (GitHub Projects)
- **DevLimeira**: Construção do backend (APIs simples)
- **DevRioClaro**: CI/CD e testes
- **DevItape**: Construção do frontend

**Escopo desta especificação:** Este documento cobre EXCLUSIVAMENTE a definição, organização e especificação do projeto. Nenhuma implementação de código será produzida nesta fase. Cada comunidade executará sua etapa de desenvolvimento de forma independente.

**Entregáveis desta spec:**
- Setup do quadro de projeto no GitHub
- Templates de issues
- Definições de milestones
- Breakdown de tarefas para cada comunidade
- Plano de acompanhamento e monitoramento para a apresentação da DEVPIRA

## Glossary

- **Agenda_Tech**: A aplicação web de calendário colaborativo de eventos de comunidades de tecnologia.
- **Comunidade**: Grupo de tecnologia participante do projeto (DEVPIRA, DevLimeira, DevRioClaro, DevItape).
- **GitHub_Projects**: Ferramenta de gerenciamento de projetos integrada ao repositório GitHub para rastreamento de tarefas.
- **Quadro_de_Tarefas**: Board no GitHub_Projects organizado por status (To Do, In Progress, Done).
- **WBS**: Work Breakdown Structure — estrutura de decomposição do trabalho que organiza entregas e tarefas por comunidade.
- **Milestone**: Marco de entrega no GitHub que agrupa issues relacionadas a uma fase ou comunidade.
- **Issue_Template**: Modelo padronizado para criação de issues no repositório.
- **Stack_Tecnológica**: Conjunto de tecnologias, frameworks e ferramentas escolhidas para cada camada do projeto.
- **Plano_de_Tracking**: Estratégia de acompanhamento de progresso das tarefas durante a apresentação da DEVPIRA.

## Requirements

---

### Requisito 1: Definição da Stack Tecnológica

**User Story:** Como membro da DEVPIRA, eu quero documentar a stack tecnológica escolhida para cada camada do projeto, para que todas as comunidades saibam quais ferramentas e tecnologias utilizar.

#### Critérios de Aceitação

1. THE Agenda_Tech SHALL manter um documento de definição de stack no repositório que especifique, para cada camada (backend, frontend, banco de dados e infraestrutura de CI/CD), no mínimo: nome da tecnologia, versão adotada e finalidade dentro do projeto.
2. THE Agenda_Tech SHALL documentar a justificativa de escolha para cada tecnologia da Stack_Tecnológica.
3. THE Agenda_Tech SHALL listar os pré-requisitos de ambiente de desenvolvimento para cada camada, especificando versões exatas de runtime, gerenciadores de pacotes e ferramentas CLI necessárias.
4. WHEN uma Comunidade iniciar sua etapa de desenvolvimento, THE Agenda_Tech SHALL fornecer instruções de setup do ambiente local baseadas na Stack_Tecnológica definida, cobrindo instalação de dependências, configuração do ambiente e um comando de verificação que confirme o funcionamento correto do setup.

---

### Requisito 2: Estrutura do Repositório e Documentação

**User Story:** Como contribuidor, eu quero que o repositório tenha uma estrutura clara e documentação de contribuição, para que eu possa colaborar de forma organizada.

#### Critérios de Aceitação

1. THE Agenda_Tech SHALL manter um arquivo README.md contendo as seguintes seções: propósito do projeto, Stack_Tecnológica utilizada, estrutura de pastas do repositório e link para o guia de contribuição.
2. THE Agenda_Tech SHALL definir a estrutura de diretórios com no mínimo diretórios separados para frontend, backend e configurações de infraestrutura na raiz do repositório.
3. THE Agenda_Tech SHALL disponibilizar um guia de contribuição (CONTRIBUTING.md) contendo: regras de formatação e linting de código, convenção de commits baseada em Conventional Commits, e fluxo de pull requests descrevendo as etapas desde a criação do branch até o merge.
4. THE Agenda_Tech SHALL manter licença open-source (MIT) no arquivo LICENSE na raiz do repositório.
5. THE Agenda_Tech SHALL definir branch protection rules para a branch principal (main) exigindo no mínimo 1 aprovação de revisão de código antes do merge.
6. IF um pull request não atende aos checks de CI configurados, THEN THE Agenda_Tech SHALL bloquear o merge na branch principal até que todos os checks obrigatórios passem.

---

### Requisito 3: Setup do GitHub Projects e Quadro de Tarefas

**User Story:** Como membro da DEVPIRA, eu quero configurar o GitHub Projects com um quadro organizado, para que todas as comunidades tenham visibilidade e possam acompanhar o progresso do projeto.

#### Critérios de Aceitação

1. THE GitHub_Projects SHALL conter um Quadro_de_Tarefas com colunas na seguinte ordem da esquerda para direita: To Do, In Progress, Review e Done.
2. THE GitHub_Projects SHALL organizar as tarefas com labels identificando a Comunidade responsável (devpira, devlimeira, devrioclaro, devitape), sendo obrigatória exatamente uma label de comunidade por tarefa.
3. THE GitHub_Projects SHALL organizar as tarefas com labels identificando a camada técnica (organizacao, backend, ci-cd, frontend), sendo obrigatória ao menos uma label de camada técnica por tarefa.
4. THE GitHub_Projects SHALL definir campos customizados para prioridade (alta, média, baixa) e estimativa de esforço em escala de pontos (1, 2, 3, 5 e 8).
5. WHEN uma issue é criada no repositório com label de comunidade, THE GitHub_Projects SHALL associar a issue ao Quadro_de_Tarefas na coluna To Do por meio de uma regra de automação configurada no projeto.
6. IF uma issue é criada no repositório sem nenhuma label de comunidade, THEN THE GitHub_Projects SHALL não associar a issue automaticamente ao Quadro_de_Tarefas, permanecendo apenas no repositório até receber a label adequada.

---

### Requisito 4: Templates de Issues e Padronização

**User Story:** Como membro de qualquer comunidade, eu quero templates padronizados para criação de issues, para que todas as tarefas tenham informações consistentes e completas.

#### Critérios de Aceitação

1. THE Agenda_Tech SHALL disponibilizar um Issue_Template para tarefas de feature contendo os seguintes campos obrigatórios: descrição, critérios de aceitação, comunidade responsável (DEVPIRA, DevLimeira, DevRioClaro ou DevItape) e estimativa de esforço (P, M ou G).
2. THE Agenda_Tech SHALL disponibilizar um Issue_Template para bugs contendo os seguintes campos obrigatórios: descrição do problema, passos para reproduzir, comportamento esperado e comportamento atual.
3. THE Agenda_Tech SHALL disponibilizar um Issue_Template para tarefas de infraestrutura/configuração contendo os seguintes campos obrigatórios: descrição, impacto e dependências.
4. WHEN um contribuidor cria uma nova issue, THE Agenda_Tech SHALL apresentar os templates disponíveis para seleção com labels de comunidade e camada técnica pré-configuradas conforme o tipo de template.
5. IF um contribuidor submeter uma issue sem preencher todos os campos obrigatórios do template, THEN THE Agenda_Tech SHALL indicar quais campos obrigatórios estão faltando antes de permitir a criação da issue.

---

### Requisito 5: Definição de Milestones e Cronograma

**User Story:** Como membro da DEVPIRA, eu quero definir milestones claros para cada fase do projeto, para que o progresso possa ser medido e reportado durante o evento.

#### Critérios de Aceitação

1. THE GitHub_Projects SHALL conter um Milestone para cada Comunidade representando sua entrega principal (organização, backend, ci-cd, frontend), totalizando 4 Milestones.
2. THE GitHub_Projects SHALL associar cada Milestone a uma descrição contendo: objetivo da entrega, lista de issues incluídas e critérios de conclusão mensuráveis.
3. THE GitHub_Projects SHALL documentar a ordem de dependência entre Milestones (organização → backend/ci-cd → frontend) na descrição de cada Milestone, indicando quais Milestones predecessores devem ser concluídos antes do início.
4. THE GitHub_Projects SHALL atribuir a cada Milestone uma data-limite (due date) correspondente à ordem de execução dentro do cronograma do evento.
5. WHEN todas as issues de um Milestone são fechadas, THE GitHub_Projects SHALL marcar o Milestone com status "Closed" e percentual de progresso em 100%.
6. IF uma issue pertencente a um Milestone é reaberta após o fechamento do Milestone, THEN THE GitHub_Projects SHALL reabrir o Milestone correspondente.

---

### Requisito 6: Work Breakdown Structure (WBS) por Comunidade

**User Story:** Como membro da DEVPIRA, eu quero um breakdown de tarefas detalhado para cada comunidade, para que cada time saiba exatamente o que precisa entregar.

#### Critérios de Aceitação

1. THE Agenda_Tech SHALL documentar a WBS da DEVPIRA contendo tarefas de: definição de stack, setup de repositório, configuração do GitHub Projects, criação de issues e plano de tracking, com cada tarefa descrevendo entregável, critério de conclusão e dependências.
2. THE Agenda_Tech SHALL documentar a WBS da DevLimeira contendo tarefas de: modelagem de dados, criação de endpoints CRUD para comunidades e eventos, validações e documentação da API, com cada tarefa vinculada ao Milestone de backend.
3. THE Agenda_Tech SHALL documentar a WBS da DevRioClaro contendo tarefas de: configuração de GitHub Actions, pipeline de testes, pipeline de deploy, linting e verificação de formatação, com cada tarefa vinculada ao Milestone de ci-cd.
4. THE Agenda_Tech SHALL documentar a WBS da DevItape contendo tarefas de: setup do projeto frontend, tela de listagem de comunidades, formulários de cadastro, visualização do calendário compartilhado e filtros, com cada tarefa vinculada ao Milestone de frontend.
5. THE Agenda_Tech SHALL criar issues no repositório correspondentes a cada item da WBS com labels de comunidade e camada técnica, associadas ao Milestone correspondente.
6. THE Agenda_Tech SHALL documentar as dependências entre tarefas de diferentes comunidades (ex: frontend depende de endpoints do backend estarem definidos).

---

### Requisito 7: Plano de Tracking e Monitoramento (Apresentação DEVPIRA)

**User Story:** Como apresentador da DEVPIRA, eu quero um plano de acompanhamento estruturado, para que eu possa demonstrar ao vivo como monitorar e gerenciar o progresso do projeto durante minha apresentação.

#### Critérios de Aceitação

1. THE Plano_de_Tracking SHALL definir os indicadores de progresso a serem apresentados: número de issues abertas vs fechadas, percentual de conclusão por Milestone, e distribuição de tarefas por Comunidade.
2. THE Plano_de_Tracking SHALL descrever o fluxo de trabalho de uma tarefa com transições explícitas: To Do → In Progress (quando assignee inicia trabalho), In Progress → Review (quando PR é aberto), Review → Done (quando PR é aprovado e mergeado).
3. THE Plano_de_Tracking SHALL documentar views e filtros do GitHub_Projects para acompanhar o progresso: view por comunidade, view por prioridade e view de timeline.
4. THE Plano_de_Tracking SHALL incluir um roteiro da apresentação com duração estimada de cada bloco, dividido em: introdução ao projeto (contexto), demonstração do quadro e fluxo, simulação de acompanhamento ao vivo e encerramento com próximos passos.
5. WHEN um contribuidor move uma issue de coluna no Quadro_de_Tarefas, THE GitHub_Projects SHALL refletir a mudança imediatamente nas views e indicadores de progresso.
6. THE Plano_de_Tracking SHALL incluir um checklist de preparação pré-apresentação com itens a verificar antes de iniciar a demonstração ao vivo.

---

### Requisito 8: Escopo Funcional do Produto (Especificação)

**User Story:** Como membro da DEVPIRA, eu quero documentar o escopo funcional do Agenda Tech, para que todas as comunidades tenham clareza sobre o que será construído.

#### Critérios de Aceitação

1. THE Agenda_Tech SHALL documentar as funcionalidades do produto organizadas por módulo (cadastro de comunidades, registro de eventos, calendário compartilhado e gestão de organizadores), incluindo para cada módulo: a descrição do modelo de dados com entidades, atributos e relacionamentos entre entidades.
2. THE Agenda_Tech SHALL especificar os endpoints da API para cada funcionalidade documentada nos módulos, incluindo método HTTP, rota, parâmetros de entrada, formato de resposta esperado e códigos de status de sucesso e erro.
3. THE Agenda_Tech SHALL especificar as telas do frontend com descrição de cada componente visível, os dados exibidos, as ações do usuário disponíveis e a navegação entre telas, acompanhadas de wireframes de baixa fidelidade.
4. THE Agenda_Tech SHALL documentar as regras de negócio para cada módulo cobrindo: campos obrigatórios por entidade, validações de formato e valor, relacionamentos e cardinalidade entre entidades, e permissões por papel de usuário.
5. THE Agenda_Tech SHALL definir critérios de aceitação para cada funcionalidade no formato Given-When-Then, com no mínimo um cenário de sucesso e um cenário de erro por funcionalidade, que servirão como base para os testes da DevRioClaro.
6. THE Agenda_Tech SHALL documentar os papéis de usuário do sistema (organizador, membro de comunidade, visitante) especificando quais operações cada papel pode executar em cada módulo.
