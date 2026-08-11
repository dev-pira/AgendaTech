# 🗓️ Agenda Tech

[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/AgendaTech/AgendaTech/ci.yml?branch=main&label=build)](https://github.com/AgendaTech/AgendaTech/actions)
[![GitHub Projects](https://img.shields.io/badge/board-GitHub%20Projects-blue.svg)](https://github.com/orgs/AgendaTech/projects/1)

> Calendário colaborativo open-source para comunidades de tecnologia registrarem e compartilharem seus eventos.

---

## 📌 Sobre o Projeto

O **Agenda Tech** é uma aplicação web de calendário colaborativo onde comunidades de tecnologia podem registrar seus eventos e todos os interessados visualizam uma agenda compartilhada. O projeto está sendo construído ao vivo durante o evento **"Communities WKND Boituva"**, com contribuições de 4 comunidades de tecnologia do interior de São Paulo.

### Objetivos

- Centralizar eventos de comunidades de tecnologia em um calendário único
- Promover a colaboração entre comunidades por meio de um projeto open-source
- Demonstrar na prática como equipes distribuídas podem trabalhar juntas usando GitHub

---

## 👥 Comunidades Participantes

| Comunidade | Responsabilidade | Descrição |
|:----------:|:---------------:|:----------|
| **DEVPIRA** | Organização e gestão de projeto | Responsável pelo project management, definição de stack, configuração do GitHub Projects, criação de issues e plano de tracking |
| **DevLimeira** | Backend (APIs) | Construção do backend: modelagem de dados, endpoints CRUD para comunidades e eventos, validações e documentação da API |
| **DevRioClaro** | CI/CD e testes | Configuração de GitHub Actions, pipelines de testes e deploy, linting e verificação de formatação |
| **DevItape** | Frontend | Construção do frontend: telas de listagem, formulários de cadastro, visualização do calendário compartilhado e filtros |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Finalidade |
|--------|-----------|------------|
| **Backend** | PHP 8.2 + Laravel 11.x | API REST para gerenciamento de comunidades e eventos |
| **Banco de Dados** | PostgreSQL 9.5 | Armazenamento de dados de comunidades, eventos e organizadores |
| **Frontend** | React 18 + Vite 5.x | Interface de usuário do calendário colaborativo |
| **Lint/Format** | Laravel Pint 1.x | Formatação automática de código PHP |
| **Análise Estática** | PHPStan 1.x | Detecção de erros de tipo e inconsistências em PHP |
| **CI/CD** | GitHub Actions | Pipelines de integração contínua, testes e deploy automatizado |

> Para detalhes completos sobre a stack (versões, justificativas e setup de ambiente), consulte [`docs/stack.md`](./docs/stack.md).

---

## 📁 Estrutura de Pastas

```
AgendaTech/
├── .github/                  # Configurações do GitHub
│   ├── ISSUE_TEMPLATE/       # Templates de issues (feature, bug, infra)
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/            # GitHub Actions (CI/CD)
├── docs/                     # Documentação do projeto
│   ├── stack.md              # Definição da stack tecnológica
│   ├── wbs.md                # Work Breakdown Structure
│   ├── escopo-funcional.md   # Especificação funcional do produto
│   ├── tracking-plan.md      # Plano de tracking e apresentação
│   └── wireframes/           # Wireframes de baixa fidelidade
├── backend/                  # Código do backend (DevLimeira)
├── frontend/                 # Código do frontend (DevItape)
├── infra/                    # Configurações de infraestrutura (DevRioClaro)
├── docker-compose.yml        # Sobe banco + backend + frontend com um comando
├── CONTRIBUTING.md           # Guia de contribuição
├── LICENSE                   # Licença MIT
└── README.md                 # Este arquivo
```

---

## ▶️ Como Rodar Localmente

### Opção rápida: Docker Compose

Sobe banco (PostgreSQL 16), backend e frontend de uma vez, já com migrations e seed aplicados:

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3333 (`GET /health`)
- Login de teste (criado pelo seed): `organizador@devlimeira.dev` / `senha123`

### Opção manual (sem Docker)

Requer Node.js ≥ 20 e PostgreSQL 16 rodando localmente (ou uma connection string gerenciada,
ex. Neon/Supabase). Detalhes completos em [`backend/README.md`](./backend/README.md) e
[`frontend/README.md`](./frontend/README.md).

```bash
# Backend
cd backend
npm install
cp .env.example .env   # configure DATABASE_URL e JWT_SECRET
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev             # http://localhost:3333

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173 — proxy automático para /api
```

---

## 🚀 Como Contribuir

Contribuições são bem-vindas! Leia o nosso **[Guia de Contribuição (CONTRIBUTING.md)](./CONTRIBUTING.md)** para entender:

- Regras de formatação e linting de código
- Convenção de commits (Conventional Commits)
- Fluxo de pull requests (branch → desenvolvimento → PR → review → merge)
- Workflow de fork + PR para contribuidores externos

---

## 📋 Quadro de Tarefas

Acompanhe o progresso do projeto no nosso board do GitHub Projects:

🔗 **[Agenda Tech — Board de Tarefas](https://github.com/orgs/AgendaTech/projects/1)**

O quadro está organizado em 4 colunas:

| Coluna | Descrição |
|--------|-----------|
| **To Do** | Tarefas planejadas, não iniciadas |
| **In Progress** | Trabalho em andamento |
| **Review** | PR aberto aguardando revisão |
| **Done** | Tarefa concluída |

---

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](./LICENSE).

---

## 🔗 Links Úteis

- [Guia de Contribuição](./CONTRIBUTING.md)
- [Definição de Stack](./docs/stack.md)
- [Work Breakdown Structure](./docs/wbs.md)
- [Escopo Funcional](./docs/escopo-funcional.md)
- [Plano de Tracking](./docs/tracking-plan.md)
- [GitHub Projects Board](https://github.com/orgs/AgendaTech/projects/1)

---

<p align="center">
  Feito com 💜 pelas comunidades <strong>DEVPIRA</strong>, <strong>DevLimeira</strong>, <strong>DevRioClaro</strong> e <strong>DevItape</strong><br/>
  durante o Communities WKND Boituva
</p>
