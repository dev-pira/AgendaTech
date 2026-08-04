# Agenda Tech — Backend (DevLimeira)

API REST em Node.js + Express + PostgreSQL (via Prisma) para o [Agenda Tech](../README.md),
o calendário colaborativo de eventos das comunidades de tecnologia.

> Responsabilidade da comunidade **DevLimeira** — Milestone 2 do [WBS](../docs/wbs.md).

## Stack

| Camada       | Tecnologia                          |
|--------------|--------------------------------------|
| Runtime      | Node.js 20 LTS                       |
| Framework    | Express 4                            |
| ORM          | Prisma 5 (PostgreSQL 16)             |
| Validação    | Zod                                  |
| Autenticação | JWT (jsonwebtoken + bcryptjs)        |
| Testes       | Jest + Supertest                     |
| Lint/format  | ESLint 8 + Prettier 3                |

## Decisão de arquitetura: autenticação

O `docs/escopo-funcional.md` define papéis (organizador/membro/visitante) e códigos
`401`/`403`, mas não detalhava login nem senha no modelo `Usuario`. Para não bloquear o
CRUD nessa lacuna, adicionamos:

- Campo `senha_hash` em `usuarios` (hash bcrypt, nunca a senha em texto puro)
- `POST /api/auth/registro` e `POST /api/auth/login` retornando um JWT
- Middleware `requireAuth` que popula `req.usuario` a partir do Bearer token
- Verificações de papel (organizador da comunidade) feitas por recurso, na camada de
  serviço — não é um papel global, é escopado por comunidade

Isso é uma decisão da DevLimeira registrada aqui para alinhamento com DevItape (consome
a API) e DevRioClaro (cobre isso na pipeline de testes).

## Setup local

### 1. Pré-requisitos

- Node.js ≥ 20.11 (`node -v`)
- Uma instância PostgreSQL 16 acessível (local, Docker ou gerenciada — ex. [Neon](https://neon.tech)
  ou [Supabase](https://supabase.com), ambos com plano gratuito e connection string pronta)

### 2. Instalar dependências

```bash
cd backend
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
# edite .env com sua DATABASE_URL e um JWT_SECRET forte
```

### 4. Rodar as migrations e o seed

```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
```

O seed cria um usuário (`organizador@devlimeira.dev` / `senha123`) já como organizador
da comunidade "DevLimeira", útil para testar os endpoints autenticados manualmente.

### 5. Subir a API

```bash
npm run dev
# API em http://localhost:3333 — GET /health para checar
```

### 6. Rodar os testes

```bash
npm test
```

Os testes de `tests/validators.test.js` cobrem as regras de negócio (RN-COM-*, RN-EVT-*)
sem precisar de banco de dados — servem de base para o pipeline de CI da DevRioClaro.
Testes de integração ponta-a-ponta (com banco) ficam como próximo passo, uma vez que
haja um Postgres de CI disponível.

## Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma   # modelagem de dados (issue 2.1)
│   └── seed.js
├── src/
│   ├── config/         # env e client do Prisma
│   ├── controllers/     # tradução HTTP <-> service
│   ├── middlewares/     # auth, validação, tratamento de erro
│   ├── routes/          # definição das rotas por recurso
│   ├── services/        # regras de negócio + acesso a dados
│   ├── utils/            # ApiError, asyncHandler
│   ├── validators/       # schemas Zod por recurso
│   ├── app.js
│   └── server.js
└── tests/
```

## Documentação da API

Ver [`docs/API.md`](./docs/API.md) para a referência completa de endpoints, parâmetros,
exemplos de request/response e códigos de status — issue 2.5 do WBS.
