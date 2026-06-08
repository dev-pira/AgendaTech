# Plano de Tracking — Agenda Tech

Documento de acompanhamento e monitoramento do progresso do projeto Agenda Tech, utilizado pela DEVPIRA para gerenciar e apresentar o status das entregas durante o evento "Communities WKND Boituva".

---

## 1. Indicadores de Progresso

Os indicadores abaixo são utilizados para medir e comunicar o avanço do projeto em tempo real.

### 1.1 Issues Abertas vs. Fechadas

| Métrica | Descrição | Onde visualizar |
|---------|-----------|-----------------|
| Total abertas | Quantidade de issues no estado open | GitHub → Issues → filtro `is:open` |
| Total fechadas | Quantidade de issues no estado closed | GitHub → Issues → filtro `is:closed` |
| Ratio | Fechadas / (Abertas + Fechadas) × 100% | Calculado manualmente ou via GitHub Insights |

**Granularidade:**
- **Total do projeto:** todas as issues do repositório
- **Por milestone:** filtro `milestone:"MS1: Organização do Projeto"` (e análogos para MS2, MS3, MS4)

### 1.2 Percentual de Conclusão por Milestone

Cada milestone possui um indicador nativo de progresso no GitHub, calculado automaticamente:

```
% conclusão = (issues fechadas no milestone / total de issues no milestone) × 100
```

| Milestone | Comunidade | Como acessar |
|-----------|-----------|--------------|
| MS1: Organização do Projeto | DEVPIRA | GitHub → Milestones → MS1 |
| MS2: Backend API | DevLimeira | GitHub → Milestones → MS2 |
| MS3: CI/CD e Testes | DevRioClaro | GitHub → Milestones → MS3 |
| MS4: Frontend | DevItape | GitHub → Milestones → MS4 |

**Meta de acompanhamento:** Verificar os percentuais a cada bloco da apresentação para demonstrar evolução.

### 1.3 Distribuição de Tarefas por Comunidade

Visualização da carga de trabalho e progresso de cada comunidade, baseada nas labels de comunidade:

| Label | Comunidade | Filtro no GitHub |
|-------|-----------|------------------|
| `devpira` | DEVPIRA | `label:devpira` |
| `devlimeira` | DevLimeira | `label:devlimeira` |
| `devrioclaro` | DevRioClaro | `label:devrioclaro` |
| `devitape` | DevItape | `label:devitape` |

**Visualização recomendada:** GitHub Insights (gráfico de pizza/barras por label) para demonstrar a proporção de tarefas atribuídas a cada comunidade e seu respectivo progresso (abertas vs. fechadas por grupo).

---

## 2. Fluxo de Trabalho

O fluxo de trabalho segue um modelo Kanban com 4 colunas no GitHub Projects. Cada transição possui um trigger explícito que define quando uma tarefa se move entre estados.

### 2.1 Colunas e Transições

```
┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│  To Do   │ ──► │ In Progress  │ ──► │  Review  │ ──► │   Done   │
└──────────┘     └──────────────┘     └──────────┘     └──────────┘
```

### 2.2 Detalhamento das Transições

| Transição | Trigger | Quem executa | Resultado |
|-----------|---------|--------------|-----------|
| **→ To Do** | Issue criada com label de comunidade | Automação do GitHub Projects | Issue aparece no board na coluna To Do |
| **To Do → In Progress** | Assignee inicia o trabalho na tarefa | Contribuidor (manual) | Indica que há trabalho ativo na issue |
| **In Progress → Review** | Pull Request vinculado à issue é aberto | Contribuidor (manual ou automação) | Sinaliza que o código está pronto para revisão |
| **Review → Done** | PR aprovado e mergeado na branch principal | Revisor aprova + merge | Tarefa concluída; issue é fechada automaticamente |

### 2.3 Regras de Transição

1. **Entrada no board:** Apenas issues com pelo menos uma label de comunidade (`devpira`, `devlimeira`, `devrioclaro` ou `devitape`) são adicionadas automaticamente ao board.
2. **Issues sem label de comunidade:** Permanecem apenas no repositório até receberem a label adequada.
3. **Retorno de coluna:** Se um PR é rejeitado na review, a issue volta para "In Progress" para correções.
4. **Fechamento via PR:** Utilizar palavras-chave no PR (`Closes #123`, `Fixes #123`) para fechar a issue automaticamente ao mergear.

### 2.4 Reflexo Imediato nas Views

Quando um contribuidor move uma issue de coluna no Quadro de Tarefas, a mudança é refletida imediatamente em todas as views e indicadores de progresso do GitHub Projects. Isso garante que durante a apresentação ao vivo, qualquer movimentação feita por uma comunidade será visível em tempo real para todos os participantes.

---

## 3. Views do GitHub Projects

Três views são configuradas no GitHub Projects para oferecer diferentes perspectivas de acompanhamento.

### 3.1 View por Comunidade

| Propriedade | Valor |
|-------------|-------|
| **Nome** | Por Comunidade |
| **Layout** | Board (Kanban) |
| **Agrupamento** | Label de comunidade |
| **Colunas** | To Do, In Progress, Review, Done |
| **Filtro** | Nenhum (mostra todas) |

**Uso:** Permite visualizar rapidamente quantas tarefas cada comunidade tem em cada estágio. Ideal para identificar gargalos por time.

**Filtros rápidos por comunidade:**
- `label:devpira` — ver apenas tarefas da DEVPIRA
- `label:devlimeira` — ver apenas tarefas da DevLimeira
- `label:devrioclaro` — ver apenas tarefas da DevRioClaro
- `label:devitape` — ver apenas tarefas da DevItape

### 3.2 View por Prioridade

| Propriedade | Valor |
|-------------|-------|
| **Nome** | Por Prioridade |
| **Layout** | Table (tabela) |
| **Agrupamento** | Campo customizado "Prioridade" |
| **Ordenação** | Alta → Média → Baixa |
| **Campos visíveis** | Título, Status, Comunidade, Estimativa, Assignee |

**Uso:** Permite focar nas tarefas mais críticas primeiro. Útil durante a apresentação para mostrar como priorizar work items.

**Grupos:**
- **Alta** — Tarefas bloqueadoras ou críticas para o evento
- **Média** — Tarefas importantes mas não bloqueadoras
- **Baixa** — Melhorias e tarefas nice-to-have

### 3.3 View Timeline

| Propriedade | Valor |
|-------------|-------|
| **Nome** | Timeline |
| **Layout** | Roadmap |
| **Eixo temporal** | Due dates dos milestones |
| **Agrupamento** | Milestone |
| **Campos visíveis** | Título, Status, Comunidade |

**Uso:** Oferece uma visão temporal do projeto, mostrando a sequência de execução dos milestones e como as tarefas se distribuem ao longo do cronograma do evento.

**Ordem temporal dos milestones:**
1. MS1: Organização do Projeto (DEVPIRA) — primeiro
2. MS2: Backend API (DevLimeira) — paralelo com MS3
3. MS3: CI/CD e Testes (DevRioClaro) — paralelo com MS2
4. MS4: Frontend (DevItape) — último (depende de MS2 e MS3)

---

## 4. Roteiro da Apresentação

Roteiro estruturado para a apresentação da DEVPIRA durante o "Communities WKND Boituva". Duração total estimada: **~40 minutos**, divididos em 6 blocos.

### 4.1 Introdução (5 min)

| Item | Detalhes |
|------|----------|
| **Objetivo** | Apresentar o projeto Agenda Tech e o contexto de colaboração entre comunidades |
| **Duração** | 5 minutos |

**Tópicos a cobrir:**
- O que é o Agenda Tech: calendário colaborativo open-source para comunidades de tecnologia
- Contexto do evento "Communities WKND Boituva" e a proposta de construção ao vivo
- As 4 comunidades participantes e suas responsabilidades:
  - **DEVPIRA** — Organização, gestão e project management
  - **DevLimeira** — Backend (APIs)
  - **DevRioClaro** — CI/CD e testes
  - **DevItape** — Frontend
- Objetivo da apresentação: demonstrar como a gestão de projeto foi estruturada e como acompanhar o progresso

**Ações sugeridas:**
1. Abrir o repositório no GitHub e mostrar a estrutura geral
2. Apresentar brevemente o README.md com o propósito e a stack
3. Transição: "Agora vamos ver como organizamos o trabalho..."

---

### 4.2 Demonstração do Board (10 min)

| Item | Detalhes |
|------|----------|
| **Objetivo** | Mostrar a configuração do GitHub Projects e explicar a organização visual |
| **Duração** | 10 minutos |

**Tópicos a cobrir:**
- O quadro Kanban no GitHub Projects e sua finalidade
- As 4 colunas e seu significado: To Do → In Progress → Review → Done
- Labels de comunidade: `devpira`, `devlimeira`, `devrioclaro`, `devitape`
- Labels de camada técnica: `organizacao`, `backend`, `ci-cd`, `frontend`
- Campos customizados: Prioridade (alta/média/baixa) e Estimativa (1, 2, 3, 5, 8 story points)
- Automação configurada: issue criada com label de comunidade é adicionada automaticamente na coluna "To Do"

**Ações sugeridas:**
1. Navegar até a aba "Projects" do repositório e abrir o board
2. Mostrar as colunas e apontar a quantidade de issues em cada uma
3. Clicar em uma issue para mostrar labels, campos customizados e milestone associado
4. Demonstrar a lista de labels existentes (Repositório → Labels)
5. Explicar que issues sem label de comunidade NÃO entram no board automaticamente
6. Transição: "Vamos simular na prática como isso funciona..."

---

### 4.3 Simulação ao Vivo (10 min)

| Item | Detalhes |
|------|----------|
| **Objetivo** | Criar uma issue em tempo real e demonstrar o fluxo de movimentação e as views |
| **Duração** | 10 minutos |

**Tópicos a cobrir:**
- Criação de issue usando template de feature
- Preenchimento dos campos obrigatórios (descrição, critérios, comunidade, estimativa)
- Observar a issue aparecer automaticamente na coluna "To Do"
- Mover a issue entre colunas manualmente (simulando o ciclo de vida)
- Apresentar as 3 views configuradas e seus filtros

**Ações sugeridas:**
1. Clicar em "New Issue" e selecionar o template "🚀 Feature"
2. Preencher os campos com um exemplo relacionado ao evento (ex: "Criar endpoint de listagem de comunidades")
3. Atribuir label `devlimeira` + `backend`, prioridade e estimativa
4. Mostrar a issue aparecendo no board na coluna "To Do" (automação)
5. Mover a issue para "In Progress" e depois para "Review"
6. Alternar para a **View por Comunidade** — mostrar agrupamento por label
7. Alternar para a **View por Prioridade** — mostrar ordenação Alta → Média → Baixa
8. Alternar para a **View Timeline** — mostrar a distribuição temporal por milestone
9. Aplicar um filtro rápido (`label:devlimeira`) e mostrar o resultado
10. Transição: "Esse fluxo é o que cada contribuidor seguirá..."

---

### 4.4 Fluxo de Trabalho (5 min)

| Item | Detalhes |
|------|----------|
| **Objetivo** | Explicar o ciclo completo de uma tarefa do início ao fim |
| **Duração** | 5 minutos |

**Tópicos a cobrir:**
- O modelo Kanban adotado e por quê (simplicidade para evento ao vivo)
- Detalhamento de cada transição:
  - **→ To Do**: Issue criada com label de comunidade (automação)
  - **To Do → In Progress**: Contribuidor assume a tarefa e inicia o trabalho
  - **In Progress → Review**: Pull Request vinculado à issue é aberto
  - **Review → Done**: PR aprovado e mergeado (issue fechada automaticamente)
- Regras adicionais: retorno de coluna quando PR é rejeitado, uso de `Closes #N` no PR
- Branch protection: exigência de 1 aprovação + checks de CI passando

**Ações sugeridas:**
1. Usar o diagrama de fluxo do tracking-plan como referência visual (projetar ou desenhar)
2. Mostrar no board uma issue que já passou por todas as colunas (se disponível)
3. Explicar como vincular um PR a uma issue (`Closes #123`)
4. Mencionar que branch protection impede merge sem aprovação
5. Transição: "E como acompanhamos tudo isso em números..."

---

### 4.5 Métricas e Tracking (5 min)

| Item | Detalhes |
|------|----------|
| **Objetivo** | Demonstrar como medir o progresso do projeto usando indicadores e views |
| **Duração** | 5 minutos |

**Tópicos a cobrir:**
- Indicador: Issues abertas vs. fechadas (total e por milestone)
- Indicador: Percentual de conclusão por milestone (barra de progresso nativa do GitHub)
- Indicador: Distribuição de tarefas por comunidade (GitHub Insights)
- Como cada comunidade pode acompanhar seu próprio progresso usando filtros por label
- Views configuradas como ferramenta de gestão diária

**Ações sugeridas:**
1. Navegar para GitHub → Milestones e mostrar a barra de progresso de cada MS
2. Destacar o percentual de conclusão atual do MS1 (Organização)
3. Mostrar o filtro `label:devlimeira is:open` para demonstrar issues abertas de uma comunidade
4. Se disponível, mostrar GitHub Insights com gráfico de distribuição por label
5. Explicar como esses indicadores serão usados ao longo do evento para acompanhar a evolução
6. Transição: "Para finalizar, os próximos passos..."

---

### 4.6 Encerramento (5 min)

| Item | Detalhes |
|------|----------|
| **Objetivo** | Apresentar próximos passos, convidar contribuições e compartilhar links |
| **Duração** | 5 minutos |

**Tópicos a cobrir:**
- Resumo do que foi apresentado: repositório estruturado, board configurado, issues criadas, plano de tracking
- Próximos passos imediatos:
  - DevLimeira inicia backend (MS2)
  - DevRioClaro inicia CI/CD (MS3)
  - DevItape aguarda MS2+MS3 para iniciar frontend (MS4)
- Como contribuir: fork do repositório, seguir CONTRIBUTING.md, usar templates de issue
- Onde encontrar tudo: link do repositório, link do board, documentação

**Ações sugeridas:**
1. Projetar slide ou tela com os links principais:
   - Repositório: `github.com/[org]/AgendaTech`
   - Board: link direto para o GitHub Projects
   - Guia de contribuição: `CONTRIBUTING.md`
2. Reforçar que o projeto é open-source e aceita contribuições
3. Agradecer as comunidades participantes
4. Abrir para perguntas (se houver tempo)

---

### Resumo do Roteiro

| # | Bloco | Duração | Foco Principal |
|---|-------|---------|----------------|
| 1 | Introdução | 5 min | Contexto, comunidades, objetivo |
| 2 | Demonstração do Board | 10 min | Quadro, colunas, labels, campos, automações |
| 3 | Simulação ao Vivo | 10 min | Criar issue, mover entre colunas, views e filtros |
| 4 | Fluxo de Trabalho | 5 min | To Do → In Progress → Review → Done |
| 5 | Métricas e Tracking | 5 min | Indicadores, percentuais, views por comunidade |
| 6 | Encerramento | 5 min | Próximos passos, como contribuir, links |
| | **Total** | **~40 min** | |

---

## 5. Checklist de Preparação Pré-Apresentação

Lista de verificação para garantir que tudo está pronto antes de iniciar a demonstração ao vivo. Cada item deve ser confirmado pelo apresentador antes do início do bloco de Introdução.

### 5.1 Board e Dados de Exemplo

- [ ] Board do GitHub Projects acessível (URL testada, sem bloqueio de permissão)
- [ ] Pelo menos 2-3 issues de exemplo em cada coluna (To Do, In Progress, Review, Done)
- [ ] Labels de comunidade e camada visíveis nas issues de exemplo

### 5.2 Views Configuradas

- [ ] View "Por Comunidade" criada e salva no GitHub Projects
- [ ] View "Por Prioridade" criada e salva no GitHub Projects
- [ ] View "Timeline" criada e salva no GitHub Projects
- [ ] Filtros rápidos por label testados e retornando resultados corretos

### 5.3 Milestones

- [ ] 4 Milestones criados (MS1, MS2, MS3, MS4) com descrições preenchidas
- [ ] Issues associadas aos milestones correspondentes
- [ ] Percentuais de progresso visíveis na página de Milestones

### 5.4 Automações

- [ ] Automação de board testada: issue com label de comunidade → coluna To Do
- [ ] Automação de fechamento testada: PR com "Closes #X" fecha issue ao merge
- [ ] Transições de coluna funcionando conforme esperado

### 5.5 Infraestrutura da Apresentação

- [ ] Link do repositório compartilhado e pronto para enviar à audiência
- [ ] Tela compartilhada configurada e testada (resolução, visibilidade)
- [ ] Navegador com abas pré-abertas: Board, Milestones, Issues, Views
- [ ] Conexão de internet estável verificada
- [ ] Roteiro da apresentação impresso ou em segundo monitor

### 5.6 Verificação Final

- [ ] Dry-run completo do roteiro executado sem erros
- [ ] Tempo total dentro do limite de 40 minutos
- [ ] Backup de capturas de tela do board caso internet falhe durante a demo
