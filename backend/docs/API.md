# Agenda Tech — Referência da API

Base URL local: `http://localhost:3333/api`

Todas as respostas são JSON. Erros seguem o formato:

```json
{ "erro": { "mensagem": "descrição do problema", "detalhes": [ { "campo": "nome", "mensagem": "..." } ] } }
```

`detalhes` só aparece em erros de validação (`400`).

## Autenticação

Endpoints marcados com 🔒 exigem o header `Authorization: Bearer <token>`, obtido em
`/auth/login` ou `/auth/registro`.

### POST /auth/registro

```bash
curl -X POST http://localhost:3333/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Silva","email":"ana@exemplo.com","senha":"senha123"}'
```

**201 Created**
```json
{ "usuario": { "id": "uuid", "nome": "Ana Silva", "email": "ana@exemplo.com" }, "token": "jwt..." }
```
`409` se o email já estiver cadastrado.

### POST /auth/login

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@exemplo.com","senha":"senha123"}'
```

**200 OK** — mesmo formato do registro. `401` em credenciais inválidas.

### GET /auth/eu 🔒

Retorna o usuário do token atual.

---

## Comunidades

### GET /comunidades

Query params: `cidade` (opcional), `pagina` (padrão 1), `limite` (padrão 20, máx 100).

```bash
curl "http://localhost:3333/api/comunidades?cidade=Limeira&pagina=1&limite=20"
```

**200 OK**
```json
{
  "dados": [{ "id": "uuid", "nome": "DevLimeira", "cidade": "Limeira", "total_membros": 12, "...": "..." }],
  "paginacao": { "pagina": 1, "limite": 20, "total": 4, "total_paginas": 1 }
}
```

### GET /comunidades/:id

**200 OK** com o objeto da comunidade. **404** se não existir.

### POST /comunidades 🔒

```bash
curl -X POST http://localhost:3333/api/comunidades \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nome":"DevLimeira","descricao":"Comunidade de tecnologia de Limeira/SP","cidade":"Limeira","contato":"contato@devlimeira.dev"}'
```

**201 Created** — o usuário autenticado vira `criado_por` e organizador automático.
**400** campo obrigatório ausente/inválido · **409** nome já existe (case-insensitive).

### PUT /comunidades/:id 🔒

Mesmo corpo do POST, todos os campos opcionais (atualização parcial). Só o criador pode
editar (**403** caso contrário).

### DELETE /comunidades/:id 🔒

**204 No Content**. **403** se não for o criador. **422** se existirem eventos futuros
agendados para a comunidade.

---

## Eventos

### GET /eventos

Query params: `comunidade_id`, `cidade`, `data_inicio`, `data_fim` (YYYY-MM-DD), `tipo`
(`presencial|online|hibrido`), `pagina`, `limite`.

### GET /comunidades/:id/eventos

Mesma listagem, já filtrada pela comunidade da URL.

### GET /eventos/:id

**200 OK** ou **404**.

### POST /eventos 🔒

```bash
curl -X POST http://localhost:3333/api/eventos \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "titulo":"Meetup de Node.js",
    "descricao":"Encontro mensal sobre o ecossistema Node.js e boas práticas.",
    "data":"2026-09-10",
    "hora_inicio":"19:00",
    "hora_fim":"21:00",
    "local":"Espaço DevLimeira",
    "tipo":"presencial",
    "comunidade_id":"<uuid-da-comunidade>"
  }'
```

**201 Created**. **400** validação (título curto, `hora_fim` antes de `hora_inicio`, tipo
online/híbrido sem `url_online`, data no passado). **403** se o usuário não for membro da
comunidade. **404** comunidade inexistente. **409** título duplicado na mesma
comunidade/data.

### PUT /eventos/:id 🔒

Atualização parcial. Só organizadores da comunidade do evento podem editar. **422** se o
evento já passou.

### DELETE /eventos/:id 🔒

**204 No Content**. Mesmas regras de permissão do PUT.

---

## Membros da comunidade

Todos exigem 🔒 e que o requisitante seja **organizador** da comunidade.

### GET /comunidades/:id/membros

Query: `papel` (`organizador|membro`), `pagina`, `limite`.

### POST /comunidades/:id/membros

```bash
curl -X POST http://localhost:3333/api/comunidades/<id>/membros \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"email":"novo.membro@exemplo.com","papel":"membro"}'
```

**404** se o email não corresponder a um usuário cadastrado. **409** se já for membro.

### PATCH /comunidades/:id/membros/:usuario_id/papel

```json
{ "papel": "organizador" }
```

**422** ao tentar rebaixar o último organizador da comunidade.

### DELETE /comunidades/:id/membros/:usuario_id

**204 No Content**. **422** ao tentar remover o último organizador.

---

## Calendário compartilhado

### GET /calendario

Query obrigatória: `data_inicio`, `data_fim` (YYYY-MM-DD). Opcionais: `comunidade_id`,
`cidade`, `tipo`.

```bash
curl "http://localhost:3333/api/calendario?data_inicio=2026-08-01&data_fim=2026-08-31"
```

**200 OK**
```json
{ "eventos": [{ "id": "uuid", "titulo": "...", "comunidade": { "nome": "DevLimeira" } }], "total": 3, "periodo": { "data_inicio": "2026-08-01", "data_fim": "2026-08-31" } }
```

---

## Códigos de status usados

| Código | Significado |
|--------|-------------|
| 200    | Sucesso (GET/PUT/PATCH) |
| 201    | Recurso criado |
| 204    | Sucesso sem corpo (DELETE) |
| 400    | Validação de dados falhou |
| 401    | Não autenticado / token inválido |
| 403    | Autenticado, mas sem permissão para a ação |
| 404    | Recurso não encontrado |
| 409    | Conflito (nome/título duplicado, já é membro) |
| 422    | Regra de negócio violada (ex.: excluir com eventos futuros, remover último organizador) |
| 500    | Erro interno |
