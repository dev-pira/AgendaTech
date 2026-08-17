# Slides — Apresentação DEVPIRA
## Agenda Tech × Communities WKND Boituva
### ~40 minutos | 6 blocos

---

---

# SLIDE 1 — CAPA

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           🗓️  AGENDA TECH                           │
│                                                     │
│   Calendário colaborativo open-source               │
│   para comunidades de tecnologia                    │
│                                                     │
│   ─────────────────────────────────                 │
│                                                     │
│   Communities WKND Boituva                          │
│   Apresentação DEVPIRA                              │
│                                                     │
│   DEVPIRA · DevLimeira · DevRioClaro · DevItape     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Nota do apresentador:** Abrir o repositório no GitHub em segundo plano antes de começar.

---

---

# BLOCO 1 — INTRODUÇÃO (5 min)

---

# SLIDE 2 — O que é o Agenda Tech?

## 🗓️ Agenda Tech

> Um calendário colaborativo onde comunidades de tecnologia registram seus eventos e qualquer pessoa visualiza a agenda compartilhada.

### Por que existe?

- Eventos de comunidades ficam espalhados em grupos de WhatsApp, Meetup, Eventbrite…
- Não existe um ponto único onde você vê **tudo** que está acontecendo no interior de SP
- O Agenda Tech resolve isso com uma **única agenda, aberta, colaborativa e open-source**

**Nota do apresentador:** Mostrar a tela inicial do repositório no GitHub enquanto fala.

---

# SLIDE 3 — O Contexto

## Communities WKND Boituva

```
Proposta:  Construir um projeto open-source AO VIVO
           durante o evento, com 4 comunidades
           trabalhando em paralelo.

Duração:   3 dias de desenvolvimento colaborativo

Resultado: Um produto funcional, com código no GitHub,
           pipelines de CI/CD rodando e frontend publicado
```

### O papel da DEVPIRA neste bloco

Apresentar como o **projeto foi organizado** e como **acompanhar o progresso** em tempo real.

---

# SLIDE 4 — As 4 Comunidades

## Quem faz o quê?

| # | Comunidade | Responsabilidade | Milestone |
|---|-----------|-----------------|-----------|
| 🟣 | **DEVPIRA** | Organização e gestão de projeto | MS1 |
| 🟢 | **DevLimeira** | Backend — API REST em Laravel | MS2 |
| 🔴 | **DevRioClaro** | CI/CD e testes — GitHub Actions | MS3 |
| 🔵 | **DevItape** | Frontend — React + Vite | MS4 |

### Divisão pensada para o evento

- Cada comunidade tem um **milestone próprio**
- MS2 e MS3 rodam **em paralelo**
- Frontend (MS4) depende de ambos — começa depois

**Nota do apresentador:** Mostrar a aba Milestones no GitHub ao falar sobre a divisão.

---

# SLIDE 5 — A Stack Tecnológica

## O que vamos construir com quê?

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Backend** | PHP + Laravel | 8.2 / 12.x |
| **Banco de Dados** | PostgreSQL | 13 |
| **Frontend** | React + Vite | 18 / 5.x |
| **Lint/Format** | Laravel Pint + PHPStan | 1.x |
| **CI/CD** | GitHub Actions | — |

### Por que essa stack?

- Laravel: ecossistema maduro, Eloquent ORM, zero boilerplate
- React: desenvolvimento por componentes — cada comunidade trabalha isolada
- GitHub Actions: nativo ao repositório, runners gratuitos para open-source

**Nota do apresentador:** Mencionar que a docs/stack.md tem justificativas completas para cada escolha.

---

# SLIDE 6 — O que vamos ver hoje

## Roteiro da apresentação

| # | Bloco | Tempo |
|---|-------|-------|
| 1 | ✅ Introdução | 5 min |
| 2 | 📋 Demonstração do Board | 10 min |
| 3 | 🎬 Simulação ao Vivo | 10 min |
| 4 | 🔄 Fluxo de Trabalho | 5 min |
| 5 | 📊 Métricas e Tracking | 5 min |
| 6 | 🚀 Encerramento | 5 min |

**Total: ~40 minutos**

---

---

# BLOCO 2 — DEMONSTRAÇÃO DO BOARD (10 min)

---

# SLIDE 7 — O Quadro de Tarefas

## GitHub Projects — Por que Kanban?

```
┌──────────┐   ┌──────────────┐   ┌──────────┐   ┌──────────┐
│          │   │              │   │          │   │          │
│  To Do   │──►│ In Progress  │──►│  Review  │──►│   Done   │
│          │   │              │   │          │   │          │
│ Planejad.│   │ Em andamento │   │ PR aberto│   │ Concluído│
└──────────┘   └──────────────┘   └──────────┘   └──────────┘
```

### Vantagens para o evento ao vivo

- Qualquer movimentação aparece **em tempo real** para todos
- Simples o suficiente para demonstrar em 40 minutos
- Nativo ao GitHub — sem ferramentas extras

**Nota do apresentador:** Abrir o board no GitHub Projects agora.

---

# SLIDE 8 — Labels: A Linguagem do Board

## Como classificamos cada tarefa?

### Labels de Comunidade (quem faz)
```
  devpira        devlimeira      devrioclaro     devitape
  🟣 Gestão      🟢 Backend      🔴 CI/CD        🔵 Frontend
```

### Labels de Camada Técnica (o que é)
```
  organizacao    backend         ci-cd           frontend
  📋 Docs/Org    ⚙️ API          🔧 Infra        🖥️ UI
```

### Regra importante

> Issues **sem label de comunidade** NÃO entram no board automaticamente.
> A automação só funciona quando a label de comunidade está presente.

**Nota do apresentador:** Mostrar a lista de labels em github.com/repo/labels.

---

# SLIDE 9 — Campos Customizados

## Além das labels: Prioridade e Estimativa

### Prioridade
| Valor | Significado |
|-------|-------------|
| 🔴 **Alta** | Bloqueadora ou crítica para o evento |
| 🟡 **Média** | Importante, mas não bloqueia outros |
| 🟢 **Baixa** | Nice-to-have, melhorias |

### Estimativa (Story Points — escala Fibonacci)
```
  1 pt     2 pts    3 pts    5 pts    8 pts
  ─────    ─────    ─────    ─────    ─────
  ~1h      ~2h      ~4h      ~1d      ~2d
```

**Nota do apresentador:** Clicar em uma issue do board para mostrar esses campos preenchidos.

---

# SLIDE 10 — Automações do Board

## O que acontece automaticamente?

```
  Nova issue criada
  com label de comunidade
          │
          ▼
    ┌─────────────┐
    │  Coluna     │  ◄── Automação do GitHub Projects
    │  "To Do"    │
    └─────────────┘

  PR mergeado com
  "Closes #123"
          │
          ▼
    ┌─────────────┐
    │  Issue      │  ◄── Automação do GitHub
    │  fechada    │
    └─────────────┘
```

**O que é manual:** mover entre In Progress, Review e Done.

**Nota do apresentador:** Criar uma issue de teste ao vivo no próximo bloco para demonstrar isso.

---

# SLIDE 11 — As 3 Views do Projeto

## Diferentes perspectivas, mesmos dados

| View | Layout | Agrupamento | Uso principal |
|------|--------|-------------|---------------|
| **Por Comunidade** | Board (Kanban) | Label de comunidade | Identificar gargalos por time |
| **Por Prioridade** | Table (tabela) | Campo Prioridade | Focar no que bloqueia primeiro |
| **Timeline** | Roadmap | Milestone | Visão temporal do projeto |

**Nota do apresentador:** Alternar entre as 3 views ao vivo durante o próximo bloco.

---

---

# BLOCO 3 — SIMULAÇÃO AO VIVO (10 min)

---

# SLIDE 12 — Roteiro da Demo ao Vivo

## O que vamos fazer agora (passo a passo)

```
1. Criar uma issue usando o template 🚀 Feature
   └─ Título: "Criar endpoint de listagem de comunidades"
   └─ Labels: devlimeira + backend
   └─ Prioridade: Alta | Estimativa: 5

2. Observar a issue aparecer em "To Do" (automação)

3. Mover para "In Progress" → depois para "Review"

4. Abrir View por Comunidade → ver agrupamento
5. Abrir View por Prioridade → ver ordenação Alta→Baixa
6. Abrir View Timeline → ver distribuição por milestone

7. Aplicar filtro rápido: label:devlimeira
```

**Nota do apresentador:** Executar cada passo de forma pausada. Nomear o que está fazendo em voz alta.

---

# SLIDE 13 — O Template de Issue

## Por que templates?

Sem template → campo em branco → informação incompleta → retrabalho

### O que o template de Feature pede:

```yaml
- Descrição da funcionalidade
- Critérios de aceitação (o que define "pronto")
- Comunidade responsável (dropdown: devpira/devlimeira/...)
- Estimativa (dropdown: 1/2/3/5/8 story points)
- Issue relacionada (se existir dependência)
```

> Todos os campos são **obrigatórios** — o GitHub bloqueia o envio se estiverem vazios.

**Nota do apresentador:** Abrir github.com/repo/issues/new/choose para mostrar os templates disponíveis.

---

---

# BLOCO 4 — FLUXO DE TRABALHO (5 min)

---

# SLIDE 14 — O Ciclo Completo de uma Tarefa

## De "To Do" até "Done"

```
  Issue criada +
  label comunidade
        │
        ▼
  ┌─────────┐     Contribuidor       ┌──────────────┐
  │  To Do  │ ─── inicia trabalho ──►│ In Progress  │
  └─────────┘                        └──────────────┘
                                             │
                                      Abre PR com
                                      Closes #N
                                             │
                                             ▼
  ┌──────────┐     PR aprovado +     ┌──────────────┐
  │   Done   │ ◄── CI passando ───── │    Review    │
  └──────────┘     merge na main     └──────────────┘
       │
       └── Issue fechada automaticamente ✅
```

---

# SLIDE 15 — Regras do Fluxo

## O que garante a qualidade?

### Branch protection na `main`

```
Para mergear na main, obrigatório:
  ✅ Mínimo 1 aprovação de revisor
  ✅ Todos os checks de CI passando
  ✅ Branch atualizada com a main
```

### Vinculando PR à issue

```bash
# No título ou corpo do PR:
Closes #42
Fixes #42
Resolves #42

# Efeito: ao mergear o PR, a issue #42 fecha automaticamente
#         e vai para a coluna "Done"
```

### Se o PR for rejeitado

A issue **volta para "In Progress"** — o contribuidor corrige e reabre o PR.

---

# SLIDE 16 — Convenção de Commits

## Conventional Commits no Agenda Tech

```bash
# Formato
<tipo>(escopo): <descrição>

# Exemplos reais do projeto
feat(api): adicionar endpoint de listagem de comunidades
fix(calendar): corrigir exibição de eventos no fuso horário
test(backend): adicionar testes para CRUD de comunidades
ci: adicionar step de linting no workflow
docs: atualizar README com instruções de setup
```

### Tipos mais usados
| Tipo | Quando |
|------|--------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `ci` | Mudança em CI/CD |
| `test` | Testes |
| `docs` | Documentação |

---

---

# BLOCO 5 — MÉTRICAS E TRACKING (5 min)

---

# SLIDE 17 — Como medimos o progresso?

## 3 indicadores principais

### 1. Issues abertas vs. fechadas

```
Ratio = fechadas / (abertas + fechadas) × 100%

Filtros úteis:
  is:open    → tarefas pendentes
  is:closed  → tarefas entregues
```

### 2. % de conclusão por Milestone

```
GitHub calcula automaticamente:
  % = issues fechadas no MS / total de issues no MS

Onde ver: GitHub → Issues → Milestones
```

### 3. Distribuição por comunidade

```
label:devpira      → tarefas da DEVPIRA
label:devlimeira   → tarefas da DevLimeira
label:devrioclaro  → tarefas da DevRioClaro
label:devitape     → tarefas da DevItape
```

---

# SLIDE 18 — Os 4 Milestones

## Quanto cada comunidade tem a entregar?

| Milestone | Comunidade | Tarefas | Story Points | Fase |
|-----------|-----------|---------|:------------:|------|
| **MS1** Organização | DEVPIRA | 8 | 32 | Dia 1 |
| **MS2** Backend API | DevLimeira | 5 | 21 | Dia 2 |
| **MS3** CI/CD e Testes | DevRioClaro | 4 | 16 | Dia 2 |
| **MS4** Frontend | DevItape | 5 | 26 | Dia 3 |
| **Total** | 4 comunidades | **22** | **95** | — |

```
Dependências:
  MS1 ──┬──► MS2 ──┐
        │           ├──► MS4
        └──► MS3 ──┘
```

**Nota do apresentador:** Abrir GitHub → Milestones e mostrar a barra de progresso de cada um.

---

# SLIDE 19 — As 3 Views como Ferramenta de Gestão

## Quando usar cada view?

### 📋 Por Comunidade (Kanban)
> Use para responder: *"Onde está cada tarefa de cada time?"*
> Aplique `label:devlimeira` para focar em uma comunidade.

### 📊 Por Prioridade (Tabela)
> Use para responder: *"O que está bloqueando o progresso?"*
> Ordena Alta → Média → Baixa automaticamente.

### 📅 Timeline (Roadmap)
> Use para responder: *"Estamos dentro do cronograma?"*
> Mostra a sequência MS1 → MS2+MS3 → MS4.

**Nota do apresentador:** Demostrar os filtros rápidos `label:devlimeira is:open` ao vivo.

---

---

# BLOCO 6 — ENCERRAMENTO (5 min)

---

# SLIDE 20 — O que foi entregue pelo MS1

## DEVPIRA — Organização do Projeto ✅

```
✅ Repositório estruturado (backend/, frontend/, infra/, docs/)
✅ README + CONTRIBUTING + LICENSE
✅ GitHub Projects com 4 colunas, labels e campos customizados
✅ Automação: issue com label → coluna "To Do"
✅ 3 templates de issue (feature, bug, infra) + PR template
✅ 4 milestones criados (MS1 → MS4) com due dates
✅ 22 issues da WBS criadas e associadas a milestones
✅ docs/stack.md — stack completa com justificativas
✅ docs/escopo-funcional.md — especificação completa do produto
✅ docs/tracking-plan.md — roteiro e indicadores de acompanhamento
```

**Total:** 8 tarefas / 32 story points entregues

---

# SLIDE 21 — Próximos Passos

## O que acontece agora?

```
                    ┌────────────────────────────────────────┐
  MS1 ✅            │  DevLimeira inicia MS2 — Backend API   │
  DEVPIRA           │  • Modelagem de dados (5 pts)          │
  concluído    ────►│  • CRUD Comunidades (5 pts)            │
                    │  • CRUD Eventos (5 pts)                 │
                    └────────────────────────────────────────┘
                    ┌────────────────────────────────────────┐
                    │ DevRioClaro inicia MS3 — CI/CD          │
                    │  • Setup GitHub Actions (3 pts)        │
                    │  • Pipeline de Testes (5 pts)          │
                    └────────────────────────────────────────┘

  Quando MS2 + MS3 estiverem prontos:
                    ┌────────────────────────────────────────┐
                    │  DevItape inicia MS4 — Frontend        │
                    │  • Setup React + Vite (3 pts)          │
                    │  • Telas + Calendário (23 pts)         │
                    └────────────────────────────────────────┘
```

---

# SLIDE 22 — Como Contribuir

## O projeto é open-source — você pode participar!

### Passo a passo rápido

```bash
# 1. Fork do repositório no GitHub

# 2. Clone o seu fork
git clone https://github.com/SEU-USUARIO/AgendaTech.git

# 3. Crie uma branch
git checkout -b feature/minha-contribuicao

# 4. Faça suas mudanças e commit
git commit -m "feat: minha contribuição"

# 5. Abra um Pull Request apontando para a main do projeto original
```

### Regras de ouro
- Siga a **Conventional Commits** nos commits
- Use os **templates de issue** para reportar bugs ou propor features
- Leia o `CONTRIBUTING.md` antes de abrir o PR

---

# SLIDE 23 — Links Úteis

## Tudo em um lugar só

```
📦 Repositório
   github.com/AgendaTech/AgendaTech

📋 Board de Tarefas
   github.com/orgs/AgendaTech/projects/1

📌 Milestones
   github.com/AgendaTech/AgendaTech/milestones

📄 Documentação
   docs/stack.md           → Stack tecnológica
   docs/escopo-funcional.md → Especificação do produto
   docs/wbs.md             → Work Breakdown Structure
   docs/tracking-plan.md   → Plano de tracking
   CONTRIBUTING.md         → Como contribuir
```

**Nota do apresentador:** Enviar esses links no chat ou QR code para a audiência.

---

# SLIDE 24 — ENCERRAMENTO

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│          Obrigado! 💜                               │
│                                                     │
│   Feito com 💜 pelas comunidades:                   │
│                                                     │
│   🟣 DEVPIRA          🟢 DevLimeira                 │
│   🔴 DevRioClaro      🔵 DevItape                   │
│                                                     │
│   ─────────────────────────────────                 │
│                                                     │
│   github.com/AgendaTech/AgendaTech                  │
│                                                     │
│   Perguntas? 🙋                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

---

# APÊNDICE — Checklist Pré-Apresentação

Use este checklist no dia do evento, antes de subir ao palco.

## Board e Dados de Exemplo
- [ ] Board do GitHub Projects acessível (testar URL)
- [ ] 2–3 issues de exemplo em cada coluna (To Do, In Progress, Review, Done)
- [ ] Labels e campos customizados visíveis nas issues de exemplo

## Views Configuradas
- [ ] View "Por Comunidade" criada e salva
- [ ] View "Por Prioridade" criada e salva
- [ ] View "Timeline" criada e salva
- [ ] Filtros `label:devlimeira`, `label:devpira` testados e retornando resultado

## Milestones
- [ ] 4 Milestones criados (MS1–MS4) com descrições e due dates
- [ ] Issues associadas aos milestones corretos
- [ ] Barras de progresso visíveis em GitHub → Milestones

## Automações
- [ ] Automação testada: criar issue com label → aparece em "To Do"
- [ ] Automação de fechamento testada: PR com "Closes #N" → issue fecha ao mergear

## Infraestrutura da Apresentação
- [ ] Link do repositório pronto para compartilhar com a audiência
- [ ] Tela compartilhada configurada e testada
- [ ] Abas pré-abertas no navegador: Board, Milestones, Issues, Views
- [ ] Conexão de internet estável verificada
- [ ] Roteiro impresso ou em segundo monitor
- [ ] Backup de capturas de tela do board (caso a internet caia)

## Verificação Final
- [ ] Dry-run completo do roteiro executado sem erros
- [ ] Tempo total dentro de 40 minutos

---

*Slides gerados a partir do `docs/tracking-plan.md` — Communities WKND Boituva*
