# API REST — Agenda Tech

> Referente à tarefa [2.5 Documentação API](https://github.com/dev-pira/AgendaTech/issues/29) (DevLimeira, MS2: Backend API).
> Base local: `http://localhost:8000/api`. Backend: Laravel 11 / PHP 8.2 (ver [`docs/stack.md`](./stack.md)). Schema: [`docs/er-diagram.md`](./er-diagram.md).

## Sumário

- [Autenticação](#autenticação)
- [Formato de resposta](#formato-de-resposta)
- [Paginação](#paginação)
- [Formato de erro](#formato-de-erro)
- [Comunidades](#comunidades)
- [Membros](#membros)
- [Eventos](#eventos)
- [Calendário](#calendário)

---

## Autenticação

A API usa **JWT** (JSON Web Token, HS256 — ver `App\Support\JwtService`), stateless: não há tabela de tokens, a validade inteira (assinatura + expiração) vive no próprio token. Endpoints de escrita (`POST`/`PUT`/`DELETE`) exigem o header `Authorization: Bearer <token>`; endpoints de leitura (`GET`) são públicos, exceto os de [Membros](#membros).

Token expira em `JWT_TTL` minutos (padrão 60, configurável no `.env`) — depois disso, `POST /api/auth/token` de novo pra obter um novo.

### `POST /api/auth/token`

Troca `username`/`password` por um JWT.

**Body**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `username` | string | Sim | Username do usuário (não é o e-mail) |
| `password` | string | Sim | Senha em texto plano |

**Respostas**

| Status | Quando |
|---|---|
| `200` | Credenciais válidas |
| `401` | Credenciais inválidas |
| `422` | `username` ou `password` ausente |

```bash
curl -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "fabio", "password": "senha-do-usuario"}'
```

```json
{ "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIuLi4iLCJpYXQiOjE3ODYwNTI5MTUsImV4cCI6MTc4NjA1NjUxNX0.oTY3nlsLqoslgnumQkuzlS5XL0fo6GH9IPjSSLMjPYw" }
```

Use o token nas próximas chamadas:

```bash
curl http://localhost:8000/api/comunidades \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

Token inválido, expirado, malformado ou de assinatura incorreta → sempre `401 UNAUTHENTICATED` (nunca 500), com o mesmo [envelope de erro](#formato-de-erro).

---

## Formato de resposta

Listagens (`GET` de coleção) sempre devolvem o envelope:

```json
{
  "dados": [ /* array de recursos */ ],
  "paginacao": {
    "pagina_atual": 1,
    "total_paginas": 3,
    "total_itens": 42,
    "limite": 20
  }
}
```

Recursos individuais (`GET`/`POST`/`PUT` de item único) são devolvidos diretamente, sem envelope.

---

## Paginação

Aplicável a `GET /api/comunidades` e `GET /api/eventos`.

| Query param | Tipo | Padrão | Descrição |
|---|---|---|---|
| `pagina` | int | `1` | Página atual (a partir de 1) |
| `limite` | int | `20` | Itens por página (1 a 100) |

`pagina < 1` ou `limite` fora de `[1, 100]` → `400 BAD_REQUEST`.

---

## Formato de erro

Toda resposta de erro da API segue o mesmo envelope (ver `App\Support\ApiErrorResponder`, tarefa 2.4):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Os dados enviados são inválidos.",
    "fields": {
      "nome": ["O campo nome é obrigatório."]
    }
  }
}
```

`fields` só aparece em erros de validação (`422`). Para os demais erros, o corpo é só `{"error": {"code", "message"}}`.

| Status | `code` | Quando |
|---|---|---|
| `400` | `BAD_REQUEST` | Parâmetro de paginação inválido |
| `401` | `UNAUTHENTICATED` | Token ausente, inválido ou expirado |
| `403` | `FORBIDDEN` | Usuário autenticado sem permissão para a ação (não é organizador) |
| `404` | `NOT_FOUND` | Recurso não existe |
| `409` | `CONFLICT` | Nome de comunidade ou evento duplicado |
| `422` | `VALIDATION_ERROR` | Corpo da requisição inválido |
| `500` | `INTERNAL_ERROR` | Erro inesperado no servidor |

---

## Comunidades

### `GET /api/comunidades`

Lista comunidades. Público.

**Query params**

| Param | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `cidade` | string | Não | Filtra por cidade (case-insensitive, match exato) |
| `pagina`, `limite` | int | Não | Ver [Paginação](#paginação) |

```bash
curl "http://localhost:8000/api/comunidades?cidade=Limeira&pagina=1&limite=20"
```

```json
{
  "dados": [
    {
      "id": "9c1f0e1a-...",
      "nome": "DevLimeira",
      "descricao": "Comunidade de tecnologia de Limeira.",
      "cidade": "Limeira",
      "contato": "contato@devlimeira.dev",
      "logo_url": "",
      "criado_em": "2026-08-01T12:00:00.000000Z",
      "total_membros": 12
    }
  ],
  "paginacao": { "pagina_atual": 1, "total_paginas": 1, "total_itens": 1, "limite": 20 }
}
```

**Respostas:** `200` · `400` (paginação inválida)

---

### `GET /api/comunidades/{id}`

Detalhe de uma comunidade, incluindo criador e lista de membros. Público.

| Path param | Tipo | Descrição |
|---|---|---|
| `id` | uuid | ID da comunidade |

```bash
curl http://localhost:8000/api/comunidades/9c1f0e1a-...
```

```json
{
  "id": "9c1f0e1a-...",
  "nome": "DevLimeira",
  "descricao": "Comunidade de tecnologia de Limeira.",
  "cidade": "Limeira",
  "contato": "contato@devlimeira.dev",
  "logo_url": "",
  "criado_em": "2026-08-01T12:00:00.000000Z",
  "total_membros": 12,
  "atualizado_em": "2026-08-01T12:00:00.000000Z",
  "criado_por": { "id": "3fa2...", "nome": "Fábio Baldin" },
  "membros": [
    { "usuario_id": "3fa2...", "nome": "Fábio Baldin", "papel": "organizador" }
  ]
}
```

**Respostas:** `200` · `404` (id inexistente)

---

### `GET /api/comunidades/{id}/eventos`

Lista os eventos de uma comunidade. Público.

| Query param | Tipo | Descrição |
|---|---|---|
| `data_inicio` | date (`YYYY-MM-DD`) | Filtra eventos a partir desta data |
| `data_fim` | date (`YYYY-MM-DD`) | Filtra eventos até esta data |
| `pagina`, `limite` | int | Ver [Paginação](#paginação) |

```bash
curl "http://localhost:8000/api/comunidades/9c1f0e1a-.../eventos?data_inicio=2026-09-01"
```

Resposta: mesmo envelope de [`GET /api/eventos`](#get-apieventos).

**Respostas:** `200` · `404` (comunidade inexistente) · `400` (paginação inválida)

---

### `POST /api/comunidades`

Cria uma comunidade. **Requer autenticação.** O criador é automaticamente adicionado como `organizador` (RN-COM-08).

**Body**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `nome` | string | Sim | 3–100 caracteres, único (case-insensitive) |
| `descricao` | string | Sim | 10–1000 caracteres |
| `cidade` | string | Sim | máx 100 caracteres |
| `contato` | string | Sim | e-mail ou URL válida, máx 255 caracteres |
| `logo_url` | string | Não | URL terminando em `.png`/`.jpg`/`.jpeg`/`.svg`/`.webp` |

```bash
curl -X POST http://localhost:8000/api/comunidades \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nome":"DevLimeira","descricao":"Comunidade de tecnologia de Limeira.","cidade":"Limeira","contato":"contato@devlimeira.dev"}'
```

Resposta: `201` com o corpo de [`GET /api/comunidades/{id}`](#get-apicomunidadesid).

**Respostas:** `201` · `401` (sem token) · `409` (nome duplicado) · `422` (validação)

---

### `PUT /api/comunidades/{id}`

Atualiza uma comunidade. **Requer autenticação + ser organizador** (RN-COM-07). Todos os campos são opcionais (`sometimes`) — envie só o que quer alterar.

**Body:** mesmos campos de `POST`, todos opcionais.

```bash
curl -X PUT http://localhost:8000/api/comunidades/9c1f0e1a-... \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"descricao":"Nova descrição da comunidade."}'
```

**Respostas:** `200` · `401` · `403` (não é organizador) · `404` · `409` (nome duplicado) · `422`

---

### `DELETE /api/comunidades/{id}`

Remove uma comunidade. **Requer autenticação + ser organizador.** Bloqueado se houver eventos futuros agendados (RN-COM-09).

```bash
curl -X DELETE http://localhost:8000/api/comunidades/9c1f0e1a-... \
  -H "Authorization: Bearer $TOKEN"
```

**Respostas:** `204` · `400` (evento futuro agendado) · `401` · `403` · `404`

---

## Membros

Gestão de membros/organizadores de uma comunidade. **Todos os endpoints exigem autenticação** — inclusive a listagem (diferente de Comunidades/Eventos, onde `GET` é público).

### `GET /api/comunidades/{id}/membros`

Lista os membros de uma comunidade. Qualquer usuário autenticado pode listar (não precisa ser organizador).

**Query params**

| Param | Tipo | Descrição |
|---|---|---|
| `papel` | `organizador`\|`membro` | Filtra por papel |
| `pagina`, `limite` | int | Ver [Paginação](#paginação) |

```bash
curl "http://localhost:8000/api/comunidades/9c1f0e1a-.../membros?papel=organizador" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "dados": [
    {
      "comunidade_id": "9c1f0e1a-...",
      "usuario_id": "3fa2...",
      "papel": "organizador",
      "adicionado_em": "2026-08-01T12:00:00.000000Z",
      "adicionado_por_id": "3fa2...",
      "usuario": { "id": "3fa2...", "nome": "Fábio Baldin", "email": "fabio@example.com" }
    }
  ],
  "paginacao": { "pagina_atual": 1, "total_paginas": 1, "total_itens": 1, "limite": 20 }
}
```

**Respostas:** `200` · `401` · `404` (comunidade inexistente)

---

### `POST /api/comunidades/{id}/membros`

Adiciona um membro existente do sistema à comunidade. **Requer ser organizador da comunidade.**

**Body**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `email` | string | Sim | Deve corresponder a um usuário já cadastrado (RN-ORG-04) |
| `papel` | `organizador`\|`membro` | Sim | |

```bash
curl -X POST http://localhost:8000/api/comunidades/9c1f0e1a-.../membros \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"email":"novo@example.com","papel":"membro"}'
```

Resposta: `201` com o mesmo formato do item de [`GET /api/comunidades/{id}/membros`](#get-apicomunidadesidmembros).

**Respostas:** `201` · `401` · `403` (não é organizador) · `404` (comunidade ou email sem usuário correspondente) · `409` (já é membro) · `422`

---

### `PATCH /api/comunidades/{id}/membros/{usuario_id}/papel`

Altera o papel de um membro. **Requer ser organizador da comunidade.**

**Body**

| Campo | Tipo | Obrigatório |
|---|---|---|
| `papel` | `organizador`\|`membro` | Sim |

```bash
curl -X PATCH http://localhost:8000/api/comunidades/9c1f0e1a-.../membros/3fa2.../papel \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"papel":"membro"}'
```

**Respostas:** `200` · `401` · `403` · `404` (membro não pertence à comunidade) · `422` (RN-ORG-01 — rebaixar o último organizador)

---

### `DELETE /api/comunidades/{id}/membros/{usuario_id}`

Remove um membro da comunidade. **Requer ser organizador da comunidade.**

```bash
curl -X DELETE http://localhost:8000/api/comunidades/9c1f0e1a-.../membros/3fa2... \
  -H "Authorization: Bearer $TOKEN"
```

**Respostas:** `204` · `401` · `403` · `404` (membro não pertence à comunidade) · `422` (RN-ORG-01 — remover o último organizador)

---

## Eventos

### `GET /api/eventos`

Lista eventos de todas as comunidades. Público.

**Query params**

| Param | Tipo | Descrição |
|---|---|---|
| `comunidade_id` | uuid | Filtra por comunidade |
| `cidade` | string | Filtra pela cidade da comunidade do evento |
| `data_inicio`, `data_fim` | date | Intervalo de datas |
| `tipo` | `presencial`\|`online`\|`hibrido` | Filtra por tipo |
| `pagina`, `limite` | int | Ver [Paginação](#paginação) |

```bash
curl "http://localhost:8000/api/eventos?data_inicio=2026-09-01&tipo=online"
```

```json
{
  "dados": [
    {
      "id": "a2708e...",
      "titulo": "Tech Talk - Introdução a Laravel",
      "descricao": "Uma palestra introdutória sobre o framework Laravel.",
      "data": "2026-09-10",
      "hora_inicio": "19:00:00",
      "hora_fim": "21:00:00",
      "local": "Online",
      "tipo": "online",
      "comunidade": { "id": "9c1f0e1a-...", "nome": "DevLimeira" },
      "organizador": { "id": "3fa2...", "nome": "Fábio Baldin" }
    }
  ],
  "paginacao": { "pagina_atual": 1, "total_paginas": 1, "total_itens": 1, "limite": 20 }
}
```

**Respostas:** `200` · `400` (paginação inválida)

---

### `GET /api/eventos/{id}`

Detalhe de um evento. Público.

```bash
curl http://localhost:8000/api/eventos/a2708e...
```

```json
{
  "id": "a2708e...",
  "titulo": "Tech Talk - Introdução a Laravel",
  "descricao": "Uma palestra introdutória sobre o framework Laravel.",
  "data": "2026-09-10",
  "hora_inicio": "19:00:00",
  "hora_fim": "21:00:00",
  "local": "Online",
  "tipo": "online",
  "comunidade": { "id": "9c1f0e1a-...", "nome": "DevLimeira", "cidade": "Limeira" },
  "organizador": { "id": "3fa2...", "nome": "Fábio Baldin" },
  "url_online": "https://meet.example.com/tech-talk",
  "criado_em": "2026-08-20T10:00:00.000000Z",
  "atualizado_em": "2026-08-20T10:00:00.000000Z"
}
```

**Respostas:** `200` · `404`

---

### `POST /api/eventos`

Cria um evento vinculado a uma comunidade. **Requer autenticação + ser membro ou organizador da comunidade** (RN-EVT-07). Não pode duplicar título+data na mesma comunidade (RN-EVT-09); a data não pode ser passada (RN-EVT-04).

**Body**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `comunidade_id` | uuid | Sim | Deve existir |
| `titulo` | string | Sim | 5–200 caracteres |
| `descricao` | string | Sim | mín 20 caracteres |
| `data` | date (`YYYY-MM-DD`) | Sim | Hoje ou futuro |
| `hora_inicio` | time (`HH:mm` ou `HH:mm:ss`) | Sim | |
| `hora_fim` | time | Não | Deve ser posterior a `hora_inicio` |
| `local` | string | Sim | máx 300 caracteres |
| `tipo` | `presencial`\|`online`\|`hibrido` | Sim | |
| `url_online` | string | Obrigatório se `tipo` for `online`/`hibrido` | máx 500 caracteres |

```bash
curl -X POST http://localhost:8000/api/eventos \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "comunidade_id": "9c1f0e1a-...",
    "titulo": "Tech Talk - Introdução a Laravel",
    "descricao": "Uma palestra introdutória sobre o framework Laravel.",
    "data": "2026-09-10",
    "hora_inicio": "19:00",
    "local": "Online",
    "tipo": "online",
    "url_online": "https://meet.example.com/tech-talk"
  }'
```

Resposta: `201` com o corpo de [`GET /api/eventos/{id}`](#get-apieventosid).

**Respostas:** `201` · `400` (data passada) · `401` · `403` (não é membro/organizador da comunidade) · `404` (comunidade não existe) · `409` (título+data duplicados) · `422`

---

### `PUT /api/eventos/{id}`

Atualiza um evento. **Requer autenticação + ser organizador da comunidade do evento.** Bloqueado para eventos que já ocorreram (RN-EVT-10). Todos os campos opcionais.

```bash
curl -X PUT http://localhost:8000/api/eventos/a2708e... \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"titulo":"Tech Talk - Edição Especial"}'
```

**Respostas:** `200` · `400` (evento já ocorreu) · `401` · `403` · `404` · `409` · `422`

---

### `DELETE /api/eventos/{id}`

Remove um evento. **Requer autenticação + ser organizador da comunidade do evento.** Bloqueado para eventos que já ocorreram.

```bash
curl -X DELETE http://localhost:8000/api/eventos/a2708e... \
  -H "Authorization: Bearer $TOKEN"
```

**Respostas:** `204` · `400` (evento já ocorreu) · `401` · `403` · `404`

---

## Calendário

Endpoint agregador feito especificamente para a tela de calendário compartilhado do frontend (DevItape) — devolve todos os eventos de um período de uma vez (sem paginação), com metadados de comunidade prontos para color-coding.

### `GET /api/calendario`

Público. Diferente de `GET /api/eventos`, aqui `data_inicio`/`data_fim` são **obrigatórios**.

**Query params**

| Param | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `data_inicio` | date (`YYYY-MM-DD`) | Sim | Início do período |
| `data_fim` | date (`YYYY-MM-DD`) | Sim | Fim do período — deve ser igual ou posterior a `data_inicio` |
| `comunidade_id` | uuid | Não | Filtra por comunidade |
| `cidade` | string | Não | Filtra pela cidade da comunidade do evento |
| `tipo` | `presencial`\|`online`\|`hibrido` | Não | Filtra por tipo |

```bash
curl "http://localhost:8000/api/calendario?data_inicio=2026-09-01&data_fim=2026-09-30&cidade=Limeira"
```

```json
{
  "eventos": [
    {
      "id": "a2708e...",
      "titulo": "Tech Talk - Introdução a Laravel",
      "descricao": "Uma palestra introdutória sobre o framework Laravel.",
      "data": "2026-09-10",
      "hora_inicio": "19:00:00",
      "hora_fim": "21:00:00",
      "local": "Online",
      "tipo": "online",
      "comunidade": { "id": "9c1f0e1a-...", "nome": "DevLimeira", "cidade": "Limeira" },
      "organizador": { "id": "3fa2...", "nome": "Fábio Baldin" },
      "url_online": "https://meet.example.com/tech-talk",
      "criado_em": "2026-08-20T10:00:00.000000Z",
      "atualizado_em": "2026-08-20T10:00:00.000000Z"
    }
  ],
  "total": 1,
  "periodo": { "data_inicio": "2026-09-01", "data_fim": "2026-09-30" }
}
```

Nota: o objeto de evento aqui é o mesmo formato de [`GET /api/eventos/{id}`](#get-apieventosid) (`EventoDetailResource`) — o protótipo Node original devolvia um formato mais enxuto (sem `organizador` aninhado), mas reaproveitar o resource padrão evita duplicar a serialização e mantém o formato de evento consistente em toda a API.

**Respostas:** `200` · `422` (`data_inicio`/`data_fim` ausentes, `data_fim` antes de `data_inicio`, ou `comunidade_id`/`tipo` inválidos)
