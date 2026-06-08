# Escopo Funcional — Agenda Tech

Este documento especifica o escopo funcional completo do **Agenda Tech**, um calendário colaborativo open-source para comunidades de tecnologia. A especificação está organizada por módulo funcional e serve como referência para todas as comunidades participantes do desenvolvimento.

---

## Sumário

- [1. Papéis de Usuário e Permissões Globais](#1-papéis-de-usuário-e-permissões-globais)
- [2. Módulo: Cadastro de Comunidades](#2-módulo-cadastro-de-comunidades)
- [3. Módulo: Registro de Eventos](#3-módulo-registro-de-eventos)
- [4. Módulo: Calendário Compartilhado](#4-módulo-calendário-compartilhado)
- [5. Módulo: Gestão de Organizadores](#5-módulo-gestão-de-organizadores)

---

## 1. Papéis de Usuário e Permissões Globais

O sistema possui três papéis de usuário com diferentes níveis de acesso:

### 1.1 Definição dos Papéis

| Papel | Descrição |
|-------|-----------|
| **Organizador** | Administrador de uma ou mais comunidades. Possui controle total sobre os dados de suas comunidades (CRUD completo) e gerencia eventos vinculados a elas. |
| **Membro** | Usuário registrado vinculado a uma ou mais comunidades. Pode visualizar todos os dados públicos e criar eventos para as comunidades das quais participa. |
| **Visitante** | Usuário não autenticado ou sem vínculo com comunidades. Acesso somente leitura ao calendário compartilhado e listagem de comunidades. |

### 1.2 Matriz de Permissões por Módulo

| Operação | Organizador | Membro | Visitante |
|----------|:-----------:|:------:|:---------:|
| **Cadastro de Comunidades** | | | |
| Criar comunidade | ✅ | ❌ | ❌ |
| Visualizar comunidade | ✅ | ✅ | ✅ |
| Editar comunidade (própria) | ✅ | ❌ | ❌ |
| Excluir comunidade (própria) | ✅ | ❌ | ❌ |
| Listar comunidades | ✅ | ✅ | ✅ |
| **Registro de Eventos** | | | |
| Criar evento (comunidade própria) | ✅ | ✅ | ❌ |
| Visualizar evento | ✅ | ✅ | ✅ |
| Editar evento (comunidade própria) | ✅ | ❌ | ❌ |
| Excluir evento (comunidade própria) | ✅ | ❌ | ❌ |
| Listar eventos | ✅ | ✅ | ✅ |
| **Calendário Compartilhado** | | | |
| Visualizar calendário | ✅ | ✅ | ✅ |
| Filtrar eventos | ✅ | ✅ | ✅ |
| **Gestão de Organizadores** | | | |
| Adicionar membro à comunidade | ✅ | ❌ | ❌ |
| Remover membro da comunidade | ✅ | ❌ | ❌ |
| Promover membro a organizador | ✅ | ❌ | ❌ |
| Rebaixar organizador a membro | ✅ | ❌ | ❌ |
| Visualizar membros da comunidade | ✅ | ✅ | ❌ |

---

## 2. Módulo: Cadastro de Comunidades

### 2.1 Descrição

Módulo responsável pelo CRUD (Create, Read, Update, Delete) de comunidades de tecnologia. Cada comunidade representa um grupo organizado que pode registrar eventos no calendário compartilhado.

### 2.2 Modelo de Dados

#### Entidade: Comunidade

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| `id` | UUID | Sim (auto) | Identificador único gerado automaticamente |
| `nome` | VARCHAR(100) | Sim | Nome da comunidade |
| `descricao` | TEXT | Sim | Descrição da comunidade e seus objetivos |
| `cidade` | VARCHAR(100) | Sim | Cidade sede da comunidade |
| `contato` | VARCHAR(255) | Sim | E-mail ou link para contato |
| `logo_url` | VARCHAR(500) | Não | URL da imagem de logo da comunidade |
| `criado_em` | TIMESTAMP | Sim (auto) | Data e hora de criação do registro |
| `atualizado_em` | TIMESTAMP | Sim (auto) | Data e hora da última atualização |
| `criado_por` | UUID (FK) | Sim | Referência ao usuário que criou a comunidade |

#### Relacionamentos

| Relacionamento | Tipo | Descrição |
|----------------|------|-----------|
| Comunidade → Eventos | 1:N | Uma comunidade pode ter vários eventos |
| Comunidade → Membros | N:M | Uma comunidade pode ter vários membros e um usuário pode pertencer a várias comunidades (via tabela `comunidade_membros`) |
| Comunidade → Organizadores | N:M | Relação de organização (via tabela `comunidade_membros` com campo `papel`) |

#### Entidade Associativa: comunidade_membros

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| `comunidade_id` | UUID (FK) | Sim | Referência à comunidade |
| `usuario_id` | UUID (FK) | Sim | Referência ao usuário |
| `papel` | ENUM('organizador', 'membro') | Sim | Papel do usuário na comunidade |
| `adicionado_em` | TIMESTAMP | Sim (auto) | Data de entrada na comunidade |

### 2.3 Endpoints da API

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|:------------:|
| GET | `/api/comunidades` | Listar todas as comunidades | Não |
| GET | `/api/comunidades/:id` | Obter detalhes de uma comunidade | Não |
| POST | `/api/comunidades` | Criar uma nova comunidade | Sim (Organizador) |
| PUT | `/api/comunidades/:id` | Atualizar uma comunidade | Sim (Organizador da comunidade) |
| DELETE | `/api/comunidades/:id` | Excluir uma comunidade | Sim (Organizador da comunidade) |

#### GET /api/comunidades

**Parâmetros de query:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `cidade` | string | Não | Filtrar por cidade |
| `pagina` | integer | Não | Número da página (padrão: 1) |
| `limite` | integer | Não | Itens por página (padrão: 20, máximo: 100) |

**Resposta de sucesso (200 OK):**

```json
{
  "dados": [
    {
      "id": "uuid",
      "nome": "DEVPIRA",
      "descricao": "Comunidade de desenvolvedores de Piracicaba",
      "cidade": "Piracicaba",
      "contato": "contato@devpira.com",
      "logo_url": "https://example.com/logo.png",
      "criado_em": "2024-01-15T10:00:00Z",
      "total_membros": 42
    }
  ],
  "paginacao": {
    "pagina_atual": 1,
    "total_paginas": 3,
    "total_itens": 52,
    "limite": 20
  }
}
```

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Parâmetros de query inválidos |
| 500 | Erro interno do servidor |

#### GET /api/comunidades/:id

**Parâmetros de rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `id` | UUID | Sim | ID da comunidade |

**Resposta de sucesso (200 OK):**

```json
{
  "id": "uuid",
  "nome": "DEVPIRA",
  "descricao": "Comunidade de desenvolvedores de Piracicaba",
  "cidade": "Piracicaba",
  "contato": "contato@devpira.com",
  "logo_url": "https://example.com/logo.png",
  "criado_em": "2024-01-15T10:00:00Z",
  "atualizado_em": "2024-01-20T14:30:00Z",
  "criado_por": "uuid-do-usuario",
  "membros": [
    {
      "usuario_id": "uuid",
      "nome": "João Silva",
      "papel": "organizador"
    }
  ]
}
```

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 404 | Comunidade não encontrada |
| 500 | Erro interno do servidor |

#### POST /api/comunidades

**Headers:** `Authorization: Bearer <token>`

**Body (JSON):**

```json
{
  "nome": "DEVPIRA",
  "descricao": "Comunidade de desenvolvedores de Piracicaba",
  "cidade": "Piracicaba",
  "contato": "contato@devpira.com",
  "logo_url": "https://example.com/logo.png"
}
```

**Resposta de sucesso (201 Created):**

```json
{
  "id": "uuid-gerado",
  "nome": "DEVPIRA",
  "descricao": "Comunidade de desenvolvedores de Piracicaba",
  "cidade": "Piracicaba",
  "contato": "contato@devpira.com",
  "logo_url": "https://example.com/logo.png",
  "criado_em": "2024-01-15T10:00:00Z",
  "criado_por": "uuid-do-usuario"
}
```

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 201 | Comunidade criada com sucesso |
| 400 | Dados inválidos (campos obrigatórios ausentes ou formato incorreto) |
| 401 | Não autenticado |
| 403 | Sem permissão (não é organizador) |
| 409 | Conflito (comunidade com mesmo nome já existe) |
| 500 | Erro interno do servidor |

#### PUT /api/comunidades/:id

**Headers:** `Authorization: Bearer <token>`

**Parâmetros de rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `id` | UUID | Sim | ID da comunidade |

**Body (JSON):** (campos opcionais — apenas os enviados são atualizados)

```json
{
  "nome": "DEVPIRA - Piracicaba",
  "descricao": "Nova descrição",
  "cidade": "Piracicaba",
  "contato": "novo@email.com",
  "logo_url": "https://example.com/novo-logo.png"
}
```

**Resposta de sucesso (200 OK):** Retorna o objeto atualizado (mesmo formato do GET por ID).

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 200 | Comunidade atualizada com sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão (não é organizador desta comunidade) |
| 404 | Comunidade não encontrada |
| 409 | Conflito (nome já em uso) |
| 500 | Erro interno do servidor |

#### DELETE /api/comunidades/:id

**Headers:** `Authorization: Bearer <token>`

**Parâmetros de rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `id` | UUID | Sim | ID da comunidade |

**Resposta de sucesso (204 No Content):** Sem body.

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 204 | Comunidade excluída com sucesso |
| 401 | Não autenticado |
| 403 | Sem permissão (não é organizador desta comunidade) |
| 404 | Comunidade não encontrada |
| 500 | Erro interno do servidor |

### 2.4 Telas do Frontend

#### Tela: Listagem de Comunidades

| Item | Descrição |
|------|-----------|
| **Rota** | `/comunidades` |
| **Componentes** | Header com navegação, campo de busca, filtro por cidade, grid/lista de cards de comunidades, paginação |
| **Dados exibidos** | Nome, cidade, logo, descrição resumida (primeiros 100 caracteres), total de membros |
| **Ações do usuário** | Buscar por nome, filtrar por cidade, clicar para ver detalhes, botão "Nova Comunidade" (visível apenas para usuários autenticados) |
| **Navegação** | Card → `/comunidades/:id`, Botão Nova → `/comunidades/nova` |

#### Tela: Detalhes da Comunidade

| Item | Descrição |
|------|-----------|
| **Rota** | `/comunidades/:id` |
| **Componentes** | Header, breadcrumb, card com dados completos, lista de membros, lista de próximos eventos, botões de ação |
| **Dados exibidos** | Nome, descrição completa, cidade, contato, logo, lista de membros (nome e papel), próximos eventos da comunidade |
| **Ações do usuário** | Editar (organizador), Excluir (organizador), Voltar à listagem, Ver evento |
| **Navegação** | Editar → `/comunidades/:id/editar`, Evento → `/eventos/:id` |

#### Tela: Formulário de Comunidade (Criar/Editar)

| Item | Descrição |
|------|-----------|
| **Rota** | `/comunidades/nova` ou `/comunidades/:id/editar` |
| **Componentes** | Header, breadcrumb, formulário com campos, botões Salvar e Cancelar, mensagens de validação |
| **Dados exibidos** | Campos: nome, descrição (textarea), cidade, contato, URL da logo |
| **Ações do usuário** | Preencher campos, submeter formulário, cancelar e voltar |
| **Navegação** | Salvar com sucesso → `/comunidades/:id`, Cancelar → voltar à página anterior |

### 2.5 Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| RN-COM-01 | Campos obrigatórios: `nome`, `descricao`, `cidade`, `contato` |
| RN-COM-02 | O campo `nome` deve ter entre 3 e 100 caracteres |
| RN-COM-03 | O campo `descricao` deve ter no mínimo 10 caracteres |
| RN-COM-04 | O campo `contato` deve ser um e-mail válido ou URL válida |
| RN-COM-05 | O campo `logo_url` quando informado deve ser uma URL válida terminando em extensão de imagem (.png, .jpg, .jpeg, .svg, .webp) |
| RN-COM-06 | Não é permitido criar duas comunidades com o mesmo nome (case-insensitive) |
| RN-COM-07 | Apenas o organizador da comunidade pode editá-la ou excluí-la |
| RN-COM-08 | Ao criar uma comunidade, o usuário criador é automaticamente atribuído como organizador |
| RN-COM-09 | Uma comunidade só pode ser excluída se não possuir eventos futuros agendados |
| RN-COM-10 | A listagem pública não exibe informações sensíveis de membros |

### 2.6 Critérios de Aceitação

#### Funcionalidade: Criar Comunidade

**Cenário de sucesso:**
```gherkin
Given que o usuário está autenticado como organizador
And está na tela de criação de comunidade
When preenche todos os campos obrigatórios (nome: "DevCity", descrição: "Comunidade local de devs", cidade: "São Paulo", contato: "dev@city.com")
And clica em "Salvar"
Then o sistema cria a comunidade com status de sucesso (201)
And redireciona para a página de detalhes da comunidade criada
And o usuário é automaticamente atribuído como organizador da comunidade
```

**Cenário de erro:**
```gherkin
Given que o usuário está autenticado como organizador
And está na tela de criação de comunidade
When submete o formulário sem preencher o campo "nome"
Then o sistema retorna erro de validação (400)
And exibe mensagem "O campo nome é obrigatório"
And não cria a comunidade no banco de dados
```

#### Funcionalidade: Listar Comunidades

**Cenário de sucesso:**
```gherkin
Given que existem 5 comunidades cadastradas no sistema
When um visitante acessa a rota GET /api/comunidades
Then o sistema retorna status 200
And retorna a lista com as 5 comunidades contendo nome, cidade, descrição resumida e total de membros
```

**Cenário de erro:**
```gherkin
Given que o visitante acessa a rota GET /api/comunidades
When informa o parâmetro pagina=-1
Then o sistema retorna status 400
And retorna mensagem "Parâmetro 'pagina' deve ser um número inteiro positivo"
```

#### Funcionalidade: Editar Comunidade

**Cenário de sucesso:**
```gherkin
Given que o usuário está autenticado como organizador da comunidade "DEVPIRA"
When envia PUT /api/comunidades/:id com novo nome "DEVPIRA - Piracicaba"
Then o sistema atualiza o nome da comunidade
And retorna status 200 com os dados atualizados
And o campo "atualizado_em" é atualizado com a data/hora atual
```

**Cenário de erro:**
```gherkin
Given que o usuário está autenticado como membro (não organizador) da comunidade "DEVPIRA"
When tenta enviar PUT /api/comunidades/:id com dados de atualização
Then o sistema retorna status 403
And retorna mensagem "Apenas organizadores podem editar esta comunidade"
```

#### Funcionalidade: Excluir Comunidade

**Cenário de sucesso:**
```gherkin
Given que o usuário está autenticado como organizador da comunidade "DevTest"
And a comunidade não possui eventos futuros agendados
When envia DELETE /api/comunidades/:id
Then o sistema exclui a comunidade
And retorna status 204
And a comunidade não aparece mais na listagem
```

**Cenário de erro:**
```gherkin
Given que o usuário está autenticado como organizador da comunidade "DevTest"
And a comunidade possui 2 eventos futuros agendados
When envia DELETE /api/comunidades/:id
Then o sistema retorna status 400
And retorna mensagem "Não é possível excluir uma comunidade com eventos futuros agendados"
```

---

## 3. Módulo: Registro de Eventos

### 3.1 Descrição

Módulo responsável pelo CRUD de eventos de tecnologia. Cada evento é vinculado a uma comunidade e possui informações de data, local e organizador responsável.

### 3.2 Modelo de Dados

#### Entidade: Evento

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| `id` | UUID | Sim (auto) | Identificador único gerado automaticamente |
| `titulo` | VARCHAR(200) | Sim | Título do evento |
| `descricao` | TEXT | Sim | Descrição detalhada do evento |
| `data` | DATE | Sim | Data do evento |
| `hora_inicio` | TIME | Sim | Horário de início |
| `hora_fim` | TIME | Não | Horário de término |
| `local` | VARCHAR(300) | Sim | Local do evento (endereço ou "Online") |
| `tipo` | ENUM('presencial', 'online', 'hibrido') | Sim | Modalidade do evento |
| `url_online` | VARCHAR(500) | Não | Link para evento online (obrigatório se tipo = 'online' ou 'hibrido') |
| `comunidade_id` | UUID (FK) | Sim | Referência à comunidade organizadora |
| `organizador_id` | UUID (FK) | Sim | Referência ao usuário que criou o evento |
| `criado_em` | TIMESTAMP | Sim (auto) | Data e hora de criação do registro |
| `atualizado_em` | TIMESTAMP | Sim (auto) | Data e hora da última atualização |

#### Relacionamentos

| Relacionamento | Tipo | Descrição |
|----------------|------|-----------|
| Evento → Comunidade | N:1 | Cada evento pertence a uma única comunidade |
| Evento → Usuário (organizador) | N:1 | Cada evento tem um criador/organizador responsável |

### 3.3 Endpoints da API

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|:------------:|
| GET | `/api/eventos` | Listar todos os eventos | Não |
| GET | `/api/eventos/:id` | Obter detalhes de um evento | Não |
| GET | `/api/comunidades/:id/eventos` | Listar eventos de uma comunidade | Não |
| POST | `/api/eventos` | Criar um novo evento | Sim (Organizador ou Membro) |
| PUT | `/api/eventos/:id` | Atualizar um evento | Sim (Organizador da comunidade) |
| DELETE | `/api/eventos/:id` | Excluir um evento | Sim (Organizador da comunidade) |

#### GET /api/eventos

**Parâmetros de query:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `comunidade_id` | UUID | Não | Filtrar por comunidade |
| `cidade` | string | Não | Filtrar por cidade do evento |
| `data_inicio` | date (ISO 8601) | Não | Filtrar eventos a partir desta data |
| `data_fim` | date (ISO 8601) | Não | Filtrar eventos até esta data |
| `tipo` | string | Não | Filtrar por tipo (presencial, online, hibrido) |
| `pagina` | integer | Não | Número da página (padrão: 1) |
| `limite` | integer | Não | Itens por página (padrão: 20, máximo: 100) |

**Resposta de sucesso (200 OK):**

```json
{
  "dados": [
    {
      "id": "uuid",
      "titulo": "Meetup React Avançado",
      "descricao": "Palestras sobre React Server Components e Next.js 14",
      "data": "2024-03-20",
      "hora_inicio": "19:00",
      "hora_fim": "21:00",
      "local": "Rua Dev, 123 - Centro",
      "tipo": "presencial",
      "comunidade": {
        "id": "uuid",
        "nome": "DevLimeira"
      },
      "organizador": {
        "id": "uuid",
        "nome": "Maria Santos"
      }
    }
  ],
  "paginacao": {
    "pagina_atual": 1,
    "total_paginas": 5,
    "total_itens": 98,
    "limite": 20
  }
}
```

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Parâmetros de query inválidos |
| 500 | Erro interno do servidor |

#### GET /api/eventos/:id

**Parâmetros de rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `id` | UUID | Sim | ID do evento |

**Resposta de sucesso (200 OK):**

```json
{
  "id": "uuid",
  "titulo": "Meetup React Avançado",
  "descricao": "Palestras sobre React Server Components e Next.js 14",
  "data": "2024-03-20",
  "hora_inicio": "19:00",
  "hora_fim": "21:00",
  "local": "Rua Dev, 123 - Centro",
  "tipo": "presencial",
  "url_online": null,
  "comunidade": {
    "id": "uuid",
    "nome": "DevLimeira",
    "cidade": "Limeira"
  },
  "organizador": {
    "id": "uuid",
    "nome": "Maria Santos"
  },
  "criado_em": "2024-03-01T10:00:00Z",
  "atualizado_em": "2024-03-01T10:00:00Z"
}
```

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 404 | Evento não encontrado |
| 500 | Erro interno do servidor |

#### GET /api/comunidades/:id/eventos

**Parâmetros de rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `id` | UUID | Sim | ID da comunidade |

**Parâmetros de query:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `data_inicio` | date | Não | Filtrar a partir desta data |
| `data_fim` | date | Não | Filtrar até esta data |
| `pagina` | integer | Não | Número da página (padrão: 1) |
| `limite` | integer | Não | Itens por página (padrão: 20) |

**Resposta:** Mesmo formato do GET /api/eventos, filtrado pela comunidade.

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 404 | Comunidade não encontrada |
| 500 | Erro interno do servidor |

#### POST /api/eventos

**Headers:** `Authorization: Bearer <token>`

**Body (JSON):**

```json
{
  "titulo": "Workshop Node.js",
  "descricao": "Hands-on de criação de APIs REST com Express",
  "data": "2024-04-15",
  "hora_inicio": "14:00",
  "hora_fim": "18:00",
  "local": "Espaço Maker - Av. Principal, 500",
  "tipo": "presencial",
  "url_online": null,
  "comunidade_id": "uuid-da-comunidade"
}
```

**Resposta de sucesso (201 Created):**

```json
{
  "id": "uuid-gerado",
  "titulo": "Workshop Node.js",
  "descricao": "Hands-on de criação de APIs REST com Express",
  "data": "2024-04-15",
  "hora_inicio": "14:00",
  "hora_fim": "18:00",
  "local": "Espaço Maker - Av. Principal, 500",
  "tipo": "presencial",
  "url_online": null,
  "comunidade_id": "uuid-da-comunidade",
  "organizador_id": "uuid-do-usuario",
  "criado_em": "2024-03-10T09:00:00Z"
}
```

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 201 | Evento criado com sucesso |
| 400 | Dados inválidos (campos obrigatórios ausentes, formato de data incorreto, etc.) |
| 401 | Não autenticado |
| 403 | Sem permissão (não é membro/organizador da comunidade informada) |
| 404 | Comunidade não encontrada |
| 500 | Erro interno do servidor |

#### PUT /api/eventos/:id

**Headers:** `Authorization: Bearer <token>`

**Parâmetros de rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `id` | UUID | Sim | ID do evento |

**Body (JSON):** (campos opcionais — apenas os enviados são atualizados)

```json
{
  "titulo": "Workshop Node.js - Edição Especial",
  "hora_fim": "19:00"
}
```

**Resposta de sucesso (200 OK):** Retorna o objeto atualizado.

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 200 | Evento atualizado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão (não é organizador da comunidade do evento) |
| 404 | Evento não encontrado |
| 500 | Erro interno do servidor |

#### DELETE /api/eventos/:id

**Headers:** `Authorization: Bearer <token>`

**Parâmetros de rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `id` | UUID | Sim | ID do evento |

**Resposta de sucesso (204 No Content):** Sem body.

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 204 | Evento excluído com sucesso |
| 401 | Não autenticado |
| 403 | Sem permissão (não é organizador da comunidade do evento) |
| 404 | Evento não encontrado |
| 500 | Erro interno do servidor |

### 3.4 Telas do Frontend

#### Tela: Listagem de Eventos

| Item | Descrição |
|------|-----------|
| **Rota** | `/eventos` |
| **Componentes** | Header com navegação, filtros (comunidade, cidade, data, tipo), lista de cards de eventos, paginação |
| **Dados exibidos** | Título, data e hora, local, tipo (badge), nome da comunidade, nome do organizador |
| **Ações do usuário** | Filtrar por comunidade/cidade/data/tipo, clicar para ver detalhes, botão "Novo Evento" (membros e organizadores) |
| **Navegação** | Card → `/eventos/:id`, Botão Novo → `/eventos/novo` |

#### Tela: Detalhes do Evento

| Item | Descrição |
|------|-----------|
| **Rota** | `/eventos/:id` |
| **Componentes** | Header, breadcrumb, card com dados completos, mapa/link do local, link para comunidade, botões de ação |
| **Dados exibidos** | Título, descrição completa, data, horários (início e fim), local (com link de mapa se presencial), tipo, link online (se aplicável), comunidade (link), organizador |
| **Ações do usuário** | Editar (organizador), Excluir (organizador), Voltar, Ver comunidade |
| **Navegação** | Editar → `/eventos/:id/editar`, Comunidade → `/comunidades/:id` |

#### Tela: Formulário de Evento (Criar/Editar)

| Item | Descrição |
|------|-----------|
| **Rota** | `/eventos/novo` ou `/eventos/:id/editar` |
| **Componentes** | Header, breadcrumb, formulário com campos, seletor de comunidade (dropdown), seletor de tipo, botões Salvar e Cancelar, mensagens de validação |
| **Dados exibidos** | Campos: título, descrição (textarea), data (datepicker), hora início, hora fim, local, tipo (radio/select), URL online (condicional), comunidade (dropdown com comunidades do usuário) |
| **Ações do usuário** | Preencher campos, selecionar comunidade, selecionar tipo, submeter, cancelar |
| **Navegação** | Salvar com sucesso → `/eventos/:id`, Cancelar → voltar à página anterior |

### 3.5 Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| RN-EVT-01 | Campos obrigatórios: `titulo`, `descricao`, `data`, `hora_inicio`, `local`, `tipo`, `comunidade_id` |
| RN-EVT-02 | O campo `titulo` deve ter entre 5 e 200 caracteres |
| RN-EVT-03 | O campo `descricao` deve ter no mínimo 20 caracteres |
| RN-EVT-04 | O campo `data` deve ser uma data futura ou igual à data atual |
| RN-EVT-05 | O campo `hora_fim`, quando informado, deve ser posterior a `hora_inicio` |
| RN-EVT-06 | Se o `tipo` é 'online' ou 'hibrido', o campo `url_online` é obrigatório e deve ser uma URL válida |
| RN-EVT-07 | O usuário só pode criar eventos para comunidades das quais é membro ou organizador |
| RN-EVT-08 | Apenas organizadores da comunidade do evento podem editar ou excluir o evento |
| RN-EVT-09 | Não é permitido criar dois eventos na mesma comunidade com o mesmo título na mesma data |
| RN-EVT-10 | Eventos passados não podem ser editados ou excluídos |
| RN-EVT-11 | Ao excluir um evento, o sistema deve solicitar confirmação do usuário no frontend |

### 3.6 Critérios de Aceitação

#### Funcionalidade: Criar Evento

**Cenário de sucesso:**
```gherkin
Given que o usuário está autenticado como membro da comunidade "DevLimeira"
And está na tela de criação de evento
When preenche título "Meetup JS", descrição com 30 caracteres, data futura "2024-05-10", hora_inicio "19:00", local "Rua A, 100", tipo "presencial", comunidade "DevLimeira"
And clica em "Salvar"
Then o sistema cria o evento com status 201
And associa o evento à comunidade "DevLimeira"
And atribui o usuário como organizador do evento
And redireciona para a página de detalhes do evento
```

**Cenário de erro:**
```gherkin
Given que o usuário está autenticado como membro da comunidade "DevLimeira"
And está na tela de criação de evento
When preenche todos os campos obrigatórios
But informa uma data passada "2023-01-01"
And clica em "Salvar"
Then o sistema retorna erro de validação (400)
And exibe mensagem "A data do evento deve ser futura ou igual à data atual"
And não cria o evento
```

#### Funcionalidade: Listar Eventos

**Cenário de sucesso:**
```gherkin
Given que existem 10 eventos cadastrados de 3 comunidades diferentes
When um visitante acessa GET /api/eventos com filtro comunidade_id="uuid-devlimeira"
Then o sistema retorna status 200
And retorna apenas os eventos da comunidade "DevLimeira"
And cada evento contém título, data, hora, local, tipo e nome da comunidade
```

**Cenário de erro:**
```gherkin
Given que um visitante acessa GET /api/eventos
When informa o parâmetro data_inicio="formato-invalido"
Then o sistema retorna status 400
And retorna mensagem "O parâmetro 'data_inicio' deve estar no formato ISO 8601 (YYYY-MM-DD)"
```

#### Funcionalidade: Editar Evento

**Cenário de sucesso:**
```gherkin
Given que o usuário está autenticado como organizador da comunidade "DEVPIRA"
And existe um evento futuro "Tech Talk" vinculado à comunidade "DEVPIRA"
When envia PUT /api/eventos/:id com novo título "Tech Talk - Edição Especial"
Then o sistema atualiza o título do evento
And retorna status 200 com os dados atualizados
```

**Cenário de erro:**
```gherkin
Given que o usuário está autenticado como membro (não organizador) da comunidade "DEVPIRA"
And existe um evento "Tech Talk" vinculado à comunidade "DEVPIRA"
When tenta enviar PUT /api/eventos/:id com dados de atualização
Then o sistema retorna status 403
And retorna mensagem "Apenas organizadores da comunidade podem editar este evento"
```

#### Funcionalidade: Excluir Evento

**Cenário de sucesso:**
```gherkin
Given que o usuário está autenticado como organizador da comunidade "DevRioClaro"
And existe um evento futuro "Coding Dojo" vinculado à comunidade
When envia DELETE /api/eventos/:id
Then o sistema exclui o evento
And retorna status 204
And o evento não aparece mais na listagem
```

**Cenário de erro:**
```gherkin
Given que o usuário está autenticado como organizador da comunidade "DevRioClaro"
And existe um evento passado "Meetup Antigo" vinculado à comunidade
When tenta enviar DELETE /api/eventos/:id
Then o sistema retorna status 400
And retorna mensagem "Não é possível excluir eventos que já ocorreram"
```

---

## 4. Módulo: Calendário Compartilhado

### 4.1 Descrição

Módulo responsável pela visualização consolidada de eventos de todas as comunidades em formato de calendário. Oferece uma visão temporal compartilhada com filtros por comunidade, cidade, tipo e período, permitindo que qualquer usuário visualize a agenda de eventos de tecnologia da região.

### 4.2 Modelo de Dados

O módulo de Calendário Compartilhado não possui entidades próprias — ele consome dados das entidades **Evento** e **Comunidade** já definidas nos módulos anteriores.

#### Dados consumidos

| Entidade | Campos utilizados | Origem |
|----------|-------------------|--------|
| Evento | id, titulo, data, hora_inicio, hora_fim, local, tipo, comunidade_id | Módulo Registro de Eventos |
| Comunidade | id, nome, cidade | Módulo Cadastro de Comunidades |

#### Relacionamentos utilizados

| Relacionamento | Descrição |
|----------------|-----------|
| Evento → Comunidade (N:1) | Para exibir o nome e cor da comunidade no bloco do evento |

### 4.3 Endpoints da API

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|:------------:|
| GET | `/api/calendario` | Listar eventos para exibição no calendário | Não |

#### GET /api/calendario

Endpoint otimizado para a visualização de calendário. Retorna eventos em formato compacto, agrupáveis por dia, para um intervalo de datas específico.

**Parâmetros de query:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `data_inicio` | date (ISO 8601) | Sim | Início do intervalo de datas (geralmente primeiro dia do mês) |
| `data_fim` | date (ISO 8601) | Sim | Fim do intervalo de datas (geralmente último dia do mês) |
| `comunidade_id` | UUID | Não | Filtrar por comunidade específica |
| `cidade` | string | Não | Filtrar por cidade |
| `tipo` | string | Não | Filtrar por tipo (presencial, online, hibrido) |

**Resposta de sucesso (200 OK):**

```json
{
  "dados": [
    {
      "id": "uuid",
      "titulo": "Meetup React Avançado",
      "data": "2024-03-20",
      "hora_inicio": "19:00",
      "hora_fim": "21:00",
      "tipo": "presencial",
      "comunidade": {
        "id": "uuid",
        "nome": "DevLimeira",
        "cor": "#2E8B57"
      }
    }
  ],
  "periodo": {
    "data_inicio": "2024-03-01",
    "data_fim": "2024-03-31"
  },
  "total_eventos": 12
}
```

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Parâmetros obrigatórios ausentes ou formato inválido (data_inicio e data_fim são obrigatórios) |
| 500 | Erro interno do servidor |

### 4.4 Telas do Frontend

#### Tela: Calendário Mensal

| Item | Descrição |
|------|-----------|
| **Rota** | `/calendario` |
| **Componentes** | Header com navegação, painel de filtros (comunidade, cidade, tipo), checkboxes de comunidade com cores, controles de navegação de mês (anterior/próximo/hoje), grade de calendário mensal (7 colunas × 5-6 linhas), blocos de eventos coloridos por comunidade, popup de detalhes do evento, legenda de cores |
| **Dados exibidos** | Dias do mês, blocos de eventos (título abreviado, cor da comunidade), popup com título completo, data, hora, local, tipo e comunidade |
| **Ações do usuário** | Navegar entre meses (anterior/próximo), voltar ao mês atual ("Hoje"), filtrar por comunidade/cidade/tipo via dropdowns, toggle de visibilidade por comunidade (checkboxes), clicar em evento para ver popup, clicar "Ver Detalhes" no popup para navegar à página do evento |
| **Navegação** | Popup → "Ver Detalhes" → `/eventos/:id` |

### 4.5 Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| RN-CAL-01 | O calendário exibe eventos de todas as comunidades por padrão (sem filtro ativo) |
| RN-CAL-02 | Eventos são representados como blocos coloridos usando a cor associada à comunidade |
| RN-CAL-03 | Se um dia possuir mais de 3 eventos, exibir os 3 primeiros e um indicador "+N mais" clicável |
| RN-CAL-04 | Os filtros são combináveis (comunidade + cidade + tipo podem ser aplicados simultaneamente) |
| RN-CAL-05 | A navegação entre meses preserva os filtros selecionados |
| RN-CAL-06 | O dia atual é destacado visualmente (borda ou fundo diferenciado) |
| RN-CAL-07 | Os parâmetros `data_inicio` e `data_fim` são obrigatórios na chamada à API do calendário |
| RN-CAL-08 | Os filtros aplicados devem ser refletidos na URL como query parameters para permitir compartilhamento de links |
| RN-CAL-09 | O calendário deve ser acessível via teclado (navegação por setas entre dias) |
| RN-CAL-10 | O calendário é acessível para todos os papéis de usuário (visitante, membro, organizador) sem restrição |

### 4.6 Critérios de Aceitação

#### Funcionalidade: Visualizar Calendário Mensal

**Cenário de sucesso:**
```gherkin
Given que existem 5 eventos cadastrados no mês de março de 2024 de 3 comunidades diferentes
When um visitante acessa GET /api/calendario?data_inicio=2024-03-01&data_fim=2024-03-31
Then o sistema retorna status 200
And retorna os 5 eventos com título, data, hora_inicio, hora_fim, tipo e dados da comunidade (nome e cor)
And o total_eventos é 5
```

**Cenário de erro:**
```gherkin
Given que um visitante acessa GET /api/calendario
When não informa os parâmetros obrigatórios data_inicio e data_fim
Then o sistema retorna status 400
And retorna mensagem "Os parâmetros 'data_inicio' e 'data_fim' são obrigatórios"
```

#### Funcionalidade: Filtrar Eventos no Calendário

**Cenário de sucesso:**
```gherkin
Given que existem 10 eventos no mês, sendo 4 da comunidade "DevLimeira" e 6 de outras comunidades
When um visitante acessa GET /api/calendario?data_inicio=2024-03-01&data_fim=2024-03-31&comunidade_id=uuid-devlimeira
Then o sistema retorna status 200
And retorna apenas os 4 eventos da comunidade "DevLimeira"
And o total_eventos é 4
```

**Cenário de erro:**
```gherkin
Given que um visitante acessa GET /api/calendario
When informa data_inicio="2024-03-31" e data_fim="2024-03-01" (fim anterior ao início)
Then o sistema retorna status 400
And retorna mensagem "O parâmetro 'data_fim' deve ser igual ou posterior a 'data_inicio'"
```

---

## 5. Módulo: Gestão de Organizadores

### 5.1 Descrição

Módulo responsável pela gestão de membros e organizadores dentro de cada comunidade. Permite adicionar e remover membros, promover membros a organizadores e rebaixar organizadores a membros. Apenas organizadores da comunidade têm acesso às operações de gestão.

### 5.2 Modelo de Dados

#### Entidade: comunidade_membros (tabela associativa)

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| `comunidade_id` | UUID (FK) | Sim | Referência à comunidade |
| `usuario_id` | UUID (FK) | Sim | Referência ao usuário |
| `papel` | ENUM('organizador', 'membro') | Sim | Papel do usuário na comunidade |
| `adicionado_em` | TIMESTAMP | Sim (auto) | Data de entrada na comunidade |
| `adicionado_por` | UUID (FK) | Sim | Referência ao organizador que adicionou o membro |

#### Entidade: Usuario (referência)

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| `id` | UUID | Sim (auto) | Identificador único |
| `nome` | VARCHAR(100) | Sim | Nome do usuário |
| `email` | VARCHAR(255) | Sim | E-mail do usuário (único) |
| `criado_em` | TIMESTAMP | Sim (auto) | Data de criação da conta |

#### Relacionamentos

| Relacionamento | Tipo | Descrição |
|----------------|------|-----------|
| Comunidade ↔ Usuario | N:M | Muitos usuários podem pertencer a muitas comunidades (via `comunidade_membros`) |
| comunidade_membros → Comunidade | N:1 | Cada registro pertence a uma comunidade |
| comunidade_membros → Usuario | N:1 | Cada registro pertence a um usuário |

### 5.3 Endpoints da API

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|:------------:|
| GET | `/api/comunidades/:id/membros` | Listar membros de uma comunidade | Sim (Membro ou Organizador) |
| POST | `/api/comunidades/:id/membros` | Adicionar membro à comunidade | Sim (Organizador) |
| DELETE | `/api/comunidades/:id/membros/:usuario_id` | Remover membro da comunidade | Sim (Organizador) |
| PATCH | `/api/comunidades/:id/membros/:usuario_id/papel` | Alterar papel do membro (promover/rebaixar) | Sim (Organizador) |

#### GET /api/comunidades/:id/membros

**Parâmetros de rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `id` | UUID | Sim | ID da comunidade |

**Parâmetros de query:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `papel` | string | Não | Filtrar por papel ('organizador' ou 'membro') |
| `pagina` | integer | Não | Número da página (padrão: 1) |
| `limite` | integer | Não | Itens por página (padrão: 20) |

**Resposta de sucesso (200 OK):**

```json
{
  "dados": [
    {
      "usuario_id": "uuid",
      "nome": "João Silva",
      "email": "joao@email.com",
      "papel": "organizador",
      "adicionado_em": "2024-01-10T08:00:00Z"
    },
    {
      "usuario_id": "uuid",
      "nome": "Maria Santos",
      "email": "maria@email.com",
      "papel": "membro",
      "adicionado_em": "2024-02-15T14:30:00Z"
    }
  ],
  "paginacao": {
    "pagina_atual": 1,
    "total_paginas": 1,
    "total_itens": 2,
    "limite": 20
  }
}
```

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 401 | Não autenticado |
| 403 | Sem permissão (visitante não pode ver membros) |
| 404 | Comunidade não encontrada |
| 500 | Erro interno do servidor |

#### POST /api/comunidades/:id/membros

**Headers:** `Authorization: Bearer <token>`

**Parâmetros de rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `id` | UUID | Sim | ID da comunidade |

**Body (JSON):**

```json
{
  "email": "novo.membro@email.com",
  "papel": "membro"
}
```

**Resposta de sucesso (201 Created):**

```json
{
  "usuario_id": "uuid",
  "nome": "Novo Membro",
  "email": "novo.membro@email.com",
  "papel": "membro",
  "comunidade_id": "uuid",
  "adicionado_em": "2024-03-10T10:00:00Z",
  "adicionado_por": "uuid-do-organizador"
}
```

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 201 | Membro adicionado com sucesso |
| 400 | Dados inválidos (email inválido, papel inválido) |
| 401 | Não autenticado |
| 403 | Sem permissão (apenas organizadores podem adicionar membros) |
| 404 | Comunidade não encontrada ou usuário com email não encontrado |
| 409 | Conflito (usuário já é membro desta comunidade) |
| 500 | Erro interno do servidor |

#### DELETE /api/comunidades/:id/membros/:usuario_id

**Headers:** `Authorization: Bearer <token>`

**Parâmetros de rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `id` | UUID | Sim | ID da comunidade |
| `usuario_id` | UUID | Sim | ID do usuário a ser removido |

**Resposta de sucesso (204 No Content):** Sem body.

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 204 | Membro removido com sucesso |
| 401 | Não autenticado |
| 403 | Sem permissão (apenas organizadores podem remover membros) |
| 404 | Comunidade não encontrada ou membro não encontrado na comunidade |
| 422 | Não processável (não é possível remover o último organizador da comunidade) |
| 500 | Erro interno do servidor |

#### PATCH /api/comunidades/:id/membros/:usuario_id/papel

**Headers:** `Authorization: Bearer <token>`

**Parâmetros de rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `id` | UUID | Sim | ID da comunidade |
| `usuario_id` | UUID | Sim | ID do usuário cujo papel será alterado |

**Body (JSON):**

```json
{
  "papel": "organizador"
}
```

**Resposta de sucesso (200 OK):**

```json
{
  "usuario_id": "uuid",
  "nome": "Maria Santos",
  "email": "maria@email.com",
  "papel": "organizador",
  "comunidade_id": "uuid",
  "atualizado_em": "2024-03-15T16:00:00Z"
}
```

**Códigos de status:**

| Código | Descrição |
|--------|-----------|
| 200 | Papel atualizado com sucesso |
| 400 | Dados inválidos (papel deve ser 'organizador' ou 'membro') |
| 401 | Não autenticado |
| 403 | Sem permissão (apenas organizadores podem alterar papéis) |
| 404 | Comunidade não encontrada ou membro não encontrado |
| 422 | Não processável (não é possível rebaixar o último organizador) |
| 500 | Erro interno do servidor |

### 5.4 Telas do Frontend

#### Tela: Gestão de Membros da Comunidade

| Item | Descrição |
|------|-----------|
| **Rota** | `/comunidades/:id/membros` |
| **Componentes** | Header com navegação, breadcrumb, título com nome da comunidade, botão "Adicionar Membro", filtro por papel, tabela/lista de membros, ações por membro (alterar papel, remover) |
| **Dados exibidos** | Nome do membro, email, papel (badge: organizador/membro), data de adição |
| **Ações do usuário** | Adicionar novo membro (abre modal), filtrar por papel, promover membro a organizador, rebaixar organizador a membro, remover membro (com confirmação) |
| **Navegação** | Breadcrumb → `/comunidades/:id`, Modal de adição não altera rota |

#### Tela: Modal de Adição de Membro

| Item | Descrição |
|------|-----------|
| **Rota** | — (modal sobreposto) |
| **Componentes** | Overlay, card modal com campo de email, seletor de papel (dropdown), botões Cancelar e Adicionar |
| **Dados exibidos** | Campo email, dropdown de papel (membro/organizador) |
| **Ações do usuário** | Digitar email do novo membro, selecionar papel, confirmar adição, cancelar |
| **Navegação** | Fecha modal ao confirmar ou cancelar |

### 5.5 Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| RN-ORG-01 | Apenas organizadores da comunidade podem gerenciar membros (adicionar, remover, alterar papel) |
| RN-ORG-02 | Um usuário pode ser membro de múltiplas comunidades simultaneamente |
| RN-ORG-03 | Toda comunidade deve ter pelo menos um organizador — não é possível remover ou rebaixar o último organizador |
| RN-ORG-04 | Ao criar uma comunidade, o criador é automaticamente adicionado como organizador |
| RN-ORG-05 | Não é possível adicionar um usuário que já é membro da comunidade (retorna conflito 409) |
| RN-ORG-06 | O email informado para adição de membro deve corresponder a um usuário cadastrado no sistema |
| RN-ORG-07 | Apenas os papéis 'organizador' e 'membro' são válidos |
| RN-ORG-08 | Visitantes (não autenticados) não podem visualizar a lista de membros de uma comunidade |
| RN-ORG-09 | Membros (não organizadores) podem visualizar a lista de membros mas não podem executar ações de gestão |
| RN-ORG-10 | A remoção de um membro deve solicitar confirmação no frontend antes de executar a exclusão |

### 5.6 Critérios de Aceitação

#### Funcionalidade: Adicionar Membro à Comunidade

**Cenário de sucesso:**
```gherkin
Given que o usuário está autenticado como organizador da comunidade "DEVPIRA"
And existe um usuário cadastrado com email "novo@email.com" que não é membro da comunidade
When envia POST /api/comunidades/:id/membros com email "novo@email.com" e papel "membro"
Then o sistema adiciona o usuário como membro da comunidade
And retorna status 201 com os dados do novo membro
And o membro aparece na listagem de membros da comunidade
```

**Cenário de erro:**
```gherkin
Given que o usuário está autenticado como organizador da comunidade "DEVPIRA"
And o usuário com email "existente@email.com" já é membro da comunidade
When envia POST /api/comunidades/:id/membros com email "existente@email.com"
Then o sistema retorna status 409
And retorna mensagem "Este usuário já é membro desta comunidade"
```

#### Funcionalidade: Promover Membro a Organizador

**Cenário de sucesso:**
```gherkin
Given que o usuário está autenticado como organizador da comunidade "DevLimeira"
And existe um membro "Maria Santos" com papel "membro" na comunidade
When envia PATCH /api/comunidades/:id/membros/:usuario_id/papel com papel "organizador"
Then o sistema atualiza o papel de "Maria Santos" para "organizador"
And retorna status 200 com os dados atualizados
And "Maria Santos" passa a ter permissões de organizador na comunidade
```

**Cenário de erro:**
```gherkin
Given que o usuário está autenticado como membro (não organizador) da comunidade "DevLimeira"
When tenta enviar PATCH /api/comunidades/:id/membros/:usuario_id/papel
Then o sistema retorna status 403
And retorna mensagem "Apenas organizadores podem alterar papéis de membros"
```

#### Funcionalidade: Remover Membro da Comunidade

**Cenário de sucesso:**
```gherkin
Given que o usuário está autenticado como organizador da comunidade "DevRioClaro"
And a comunidade possui 2 organizadores e 3 membros
And "Pedro Lima" é membro da comunidade
When envia DELETE /api/comunidades/:id/membros/:usuario_id para "Pedro Lima"
Then o sistema remove "Pedro Lima" da comunidade
And retorna status 204
And "Pedro Lima" não aparece mais na listagem de membros
```

**Cenário de erro:**
```gherkin
Given que o usuário está autenticado como organizador da comunidade "DevRioClaro"
And a comunidade possui apenas 1 organizador (o próprio usuário)
When tenta enviar DELETE /api/comunidades/:id/membros/:usuario_id para si mesmo
Then o sistema retorna status 422
And retorna mensagem "Não é possível remover o último organizador da comunidade"
```

#### Funcionalidade: Listar Membros da Comunidade

**Cenário de sucesso:**
```gherkin
Given que o usuário está autenticado como membro da comunidade "DevItape"
And a comunidade possui 2 organizadores e 5 membros
When acessa GET /api/comunidades/:id/membros
Then o sistema retorna status 200
And retorna a lista com 7 membros contendo nome, email, papel e data de adição
```

**Cenário de erro:**
```gherkin
Given que o usuário é um visitante (não autenticado)
When tenta acessar GET /api/comunidades/:id/membros
Then o sistema retorna status 401
And retorna mensagem "Autenticação necessária para visualizar membros"
```
