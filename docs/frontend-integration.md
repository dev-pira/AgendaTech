# Integração Frontend ↔ Backend (AgendaTech)

Guia de referência para quem for construir um frontend novo (React ou outro) consumindo a API REST do backend Laravel. O backend também serve uma UI web server-rendered (Blade) em paralelo — ela não é afetada por nada aqui, e as duas convivem até decidirmos aposentar a Blade.

## Base URLs

| Ambiente   | URL base da API                                              |
|------------|---------------------------------------------------------------|
| Local (dev)| `http://localhost:8000/api`                                   |
| Produção   | `https://agendatech.devpira.web88f08.kinghost.net/api`        |

## Autenticação

JWT stateless (sem sessão, sem tabela de tokens — o token carrega a própria validade).

```
POST /api/auth/token
Content-Type: application/json

{ "username": "...", "password": "..." }
```

Resposta `200`:
```json
{ "token": "<jwt>" }
```

Em todas as chamadas autenticadas, enviar:
```
Authorization: Bearer <jwt>
```

Token expira em 60 minutos (`JWT_TTL`, configurável no `.env` do backend). Não há refresh token — ao expirar, repetir o login.

> ⚠️ **Não existe endpoint de cadastro via API ainda.** Hoje um usuário só é criado pelo formulário web (`/cadastro`, Blade). Se o React precisar de autoatendimento (usuário se cadastra sozinho), isso precisa ser adicionado à API antes — hoje é um gap conhecido.

## Formato de erro (todas as rotas `api/*`)

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Os dados enviados são inválidos.", "fields": { "nome": ["..."] } } }
```

`fields` só aparece em erros de validação (422). Códigos possíveis: `BAD_REQUEST`, `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `METHOD_NOT_ALLOWED`, `CONFLICT`, `VALIDATION_ERROR` (422), `TOO_MANY_REQUESTS`, `INTERNAL_ERROR` (500 — mensagem genérica, nunca vaza detalhe interno).

## Endpoints

### Comunidades

| Método | Rota                              | Auth | Body / Query |
|--------|------------------------------------|------|---------------|
| GET    | `/comunidades`                     | não  | —             |
| GET    | `/comunidades/{id}`                 | não  | —             |
| GET    | `/comunidades/{id}/eventos`         | não  | —             |
| POST   | `/comunidades`                     | sim  | ver abaixo    |
| PUT    | `/comunidades/{id}`                 | sim  | ver abaixo    |
| DELETE | `/comunidades/{id}`                 | sim  | —             |

Body (`POST`/`PUT`, campos de `PUT` todos opcionais/`sometimes`):
```json
{
  "nome": "string, obrigatório",
  "descricao": "string, obrigatório, até 1000 chars",
  "cidade": "string, obrigatório, até 100 chars",
  "contato": "string, obrigatório, até 255 chars",
  "logo_url": "string opcional, até 500 chars"
}
```

Resposta (`ComunidadeResource`):
```json
{ "id": "uuid", "nome": "...", "descricao": "...", "cidade": "...", "contato": "...", "logo_url": "...", "criado_em": "...", "total_membros": 1 }
```

`GET /comunidades/{id}` retorna o detalhe (`ComunidadeDetailResource`), que acrescenta:
```json
{ "atualizado_em": "...", "criado_por": { "id": "uuid", "nome": "..." }, "membros": [{ "usuario_id": "uuid", "nome": "...", "papel": "organizador|membro" }] }
```

### Membros (gestão dentro de uma comunidade — todas exigem auth + ser organizador)

| Método | Rota                                                    | Body |
|--------|-----------------------------------------------------------|------|
| GET    | `/comunidades/{id}/membros`                                | —    |
| POST   | `/comunidades/{id}/membros`                                | `{ "email": "...", "papel": "organizador\|membro" }` |
| PATCH  | `/comunidades/{id}/membros/{usuarioId}/papel`               | `{ "papel": "organizador\|membro" }` |
| DELETE | `/comunidades/{id}/membros/{usuarioId}`                     | —    |

Resposta (`MembroGestaoResource`):
```json
{ "comunidade_id": "uuid", "usuario_id": "uuid", "papel": "...", "adicionado_em": "...", "adicionado_por_id": "uuid", "usuario": { "id": "uuid", "nome": "...", "email": "..." } }
```

### Eventos

| Método | Rota                | Auth | Body |
|--------|----------------------|------|------|
| GET    | `/eventos`           | não  | —    |
| GET    | `/eventos/{id}`      | não  | —    |
| POST   | `/eventos`           | sim  | ver abaixo |
| PUT    | `/eventos/{id}`      | sim  | ver abaixo |
| DELETE | `/eventos/{id}`      | sim  | —    |

Body (`PUT` com todos os campos `sometimes`):
```json
{
  "titulo": "string, obrigatório",
  "descricao": "string, obrigatório",
  "data": "YYYY-MM-DD, obrigatório",
  "hora_inicio": "HH:mm ou HH:mm:ss, obrigatório",
  "hora_fim": "HH:mm ou HH:mm:ss, opcional",
  "local": "string, obrigatório, até 300 chars",
  "tipo": "presencial | online | hibrido, obrigatório",
  "url_online": "string opcional até 500 — obrigatório na prática se tipo for online/hibrido",
  "comunidade_id": "uuid existente, obrigatório (só no POST)"
}
```

Resposta (`EventoResource`):
```json
{ "id": "uuid", "titulo": "...", "descricao": "...", "data": "YYYY-MM-DD", "hora_inicio": "...", "hora_fim": "...", "local": "...", "tipo": "...", "comunidade": { "id": "uuid", "nome": "..." }, "organizador": { "id": "uuid", "nome": "..." } }
```

`GET /eventos/{id}` retorna o detalhe (`EventoDetailResource`), que acrescenta `url_online`, `comunidade` (com `cidade` também), `criado_em`, `atualizado_em`.

### Calendário (agregador, tela de calendário compartilhado)

```
GET /api/calendario?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD&comunidade_id=&cidade=&tipo=
```

`data_inicio` e `data_fim` são obrigatórios (diferente da listagem genérica de eventos, onde são opcionais). `comunidade_id`, `cidade` e `tipo` são filtros opcionais.

## CORS — pendência antes do frontend novo poder chamar de outro domínio

Hoje **não há middleware de CORS registrado** (`bootstrap/app.php` → `withMiddleware` está vazio). Se o frontend do Paulo for hospedado em domínio diferente do backend (bem provável — ex. Lovable/Vercel), o browser vai bloquear as chamadas por CORS até isso ser configurado. Precisa habilitar `Illuminate\Http\Middleware\HandleCors` + `config/cors.php` liberando o(s) origin(s) do frontend antes de testar a integração de ponta a ponta.

## Gaps conhecidos / decisões pendentes antes da troca completa

1. **Sem endpoint de cadastro via API** — hoje só o formulário web (Blade) cria usuário.
2. **CORS não configurado** — ver acima.
3. Depois que o frontend novo estiver de pé e validado: decidir se `routes/web.php` (UI Blade atual) é removida ou mantida como fallback.
