# Agenda Tech — Backend Laravel

Versão Laravel do backend do Agenda Tech, com os **mesmos endpoints** da [versão Django](../django/README.md) (veja o [rotas.md](rotas.md) de cada uma para comparar lado a lado). Assim como a versão Django, este backend funciona de **duas formas ao mesmo tempo**:

- **Sem API** — páginas HTML server-rendered (login, cadastro, listagem e formulários de comunidades/eventos), prontas para uso no navegador.
- **Com API** — endpoints REST em `/api/`, para um frontend separado (ex.: React) consumir.

Banco de dados: **SQLite** por padrão (arquivo `database/database.sqlite`), assim como a versão Django. Basta trocar `DB_CONNECTION` no `.env` para migrar para **MySQL** no futuro — sem mudar código.

## Principais diferenças de implementação em relação à versão Django

- **Autenticação da API**: em vez do Sanctum, foi implementado um guard Bearer simples (`App\Models\Token` + `Auth::viaRequest` em `AppServiceProvider`), espelhando o model `Token` e o `AuthBearer` (django-ninja `HttpBearer`) do backend Django. Fluxo idêntico: `POST /api/auth/token` com `username`/`password` retorna um token que deve ser enviado em `Authorization: Bearer <token>`.
- **Regras de negócio**: centralizadas nos models (`App\Models\Comunidade` e `App\Models\Evento`, no evento `saving`), assim como o backend Django centraliza em `Comunidade.clean()`/`Evento.clean()`. Web e API reutilizam exatamente as mesmas regras.
- **IDs**: UUID como chave primária em `users`, `comunidades` e `eventos` (via `HasUuids`), igual à versão Django.
- **Sem painel administrativo**: não há equivalente ao Django Admin — veja [rotas.md](rotas.md) para alternativas (`php artisan tinker`, cliente de banco de dados).
- **Sem barra final nas rotas**: o Laravel ignora barra final na definição de rotas, então os caminhos são `/comunidades`, `/eventos/{evento}` etc. (sem a barra final usada pela versão Django).

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar — Linux / macOS](#como-rodar--linux--macos)
- [Como rodar — Windows](#como-rodar--windows)
- [Acessando o sistema](#acessando-o-sistema)
- [Rotas do projeto](#rotas-do-projeto)
- [Rodando os testes](#rodando-os-testes)
- [Trocando para MySQL](#trocando-para-mysql)
- [Problemas comuns](#problemas-comuns)

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar com |
|---|---|---|
| PHP | 8.2 (recomendado 8.3+) | `php --version` |
| Composer | 2.x | `composer --version` |
| Git | qualquer recente | `git --version` |

> Este projeto foi criado com Laravel 13, que exige PHP 8.2+.

O PHP precisa das seguintes extensões habilitadas (a maioria já vem ativa em instalações padrão do PHP; distribuições minimalistas podem exigir pacotes extras):

| Extensão | Para quê é usada | Pacote Ubuntu/Debian (exemplo) |
|---|---|---|
| `pdo_sqlite` | Banco de dados SQLite (padrão do projeto) | `php-sqlite3` |
| `mbstring`, `tokenizer`, `ctype`, `filter`, `json`, `libxml` | Requeridas pelo próprio framework | geralmente já vêm com o `php-cli` |
| `dom`, `xmlwriter` | Exigidas pelo PHPUnit (só para rodar os testes) | `php-xml` |

Se `composer install` reclamar de alguma extensão ausente, instale o pacote correspondente do seu sistema (ex.: `sudo apt install php-sqlite3 php-xml`) e rode novamente.

---

## Estrutura de pastas

```
backend/laravel/
├── composer.json       # dependências do projeto
├── vendor/              # dependências instaladas (criado por você, não vai para o git)
├── .env.example         # modelo de configuração — copie para .env
├── artisan              # CLI do Laravel
├── app/
│   ├── Models/           # Comunidade, ComunidadeMembro, Evento, Token, User
│   ├── Http/
│   │   ├── Controllers/         # controllers das páginas web (auth, comunidades, eventos)
│   │   ├── Controllers/Api/     # controllers da API REST
│   │   ├── Requests/            # Form Requests (validação de presença/tipo)
│   │   └── Resources/           # JsonResource (formato das respostas da API)
│   └── Support/Permissions.php  # checagens de organizador/membro (usada por web e API)
├── database/
│   ├── migrations/      # schema do banco (users, comunidades, comunidade_membros, eventos, tokens)
│   ├── factories/        # factories usadas pelos testes
│   └── database.sqlite   # banco SQLite de desenvolvimento (criado por você, não vai para o git)
├── routes/
│   ├── web.php           # rotas das páginas HTML
│   └── api.php           # rotas da API REST
├── resources/views/      # templates Blade
└── tests/
    ├── Feature/Api/       # testes de integração da API
    ├── Feature/Web/       # testes de integração das páginas web
    └── Unit/Models/       # testes das regras de negócio nos models
```

Todos os comandos abaixo (`artisan`, `composer`, `php vendor/bin/phpunit`) devem ser executados de dentro de `backend/laravel/`.

---

## Como rodar — Linux / macOS

Abra um terminal na raiz do repositório (`AgendaTech/`) e execute:

```bash
cd backend/laravel

# 1. Instalar as dependências
composer install

# 2. Criar o arquivo de configuração local a partir do modelo
cp .env.example .env

# 3. Gerar a chave de criptografia da aplicação
php artisan key:generate

# 4. Criar o arquivo do banco SQLite
touch database/database.sqlite

# 5. Criar as tabelas no banco
php artisan migrate

# 6. Subir o servidor de desenvolvimento
php artisan serve
```

Isso deixa o site disponível em `http://127.0.0.1:8000`. Para criar um usuário de teste, use `/cadastro` pelo navegador ou `php artisan tinker`:

```php
\App\Models\User::create([
    'username' => 'admin',
    'email' => 'admin@example.com',
    'first_name' => 'Admin',
    'password' => \Illuminate\Support\Facades\Hash::make('SenhaForte123!'),
]);
```

---

## Como rodar — Windows

Os passos são os mesmos; a única diferença é como criar o arquivo do banco SQLite (o `touch` do Linux/macOS não existe no Windows).

### PowerShell

```powershell
cd backend\laravel

composer install
copy .env.example .env
php artisan key:generate
New-Item -ItemType File -Path database\database.sqlite -Force
php artisan migrate
php artisan serve
```

### Prompt de Comando (cmd.exe)

```bat
cd backend\laravel

composer install
copy .env.example .env
php artisan key:generate
type nul > database\database.sqlite
php artisan migrate
php artisan serve
```

---

## Acessando o sistema

Com `php artisan serve` em execução:

| O quê | Endereço |
|---|---|
| Site (sem API) — listagem de comunidades | http://127.0.0.1:8000/comunidades |
| Cadastro de novo usuário | http://127.0.0.1:8000/cadastro |
| Login | http://127.0.0.1:8000/login |
| API REST | http://127.0.0.1:8000/api |

Fluxo básico para testar tudo manualmente:
1. Acesse `/cadastro` e crie uma conta (isso já faz login automaticamente).
2. Clique em **"+ Nova comunidade"**, preencha o formulário — você vira organizador dela automaticamente.
3. Clique em **"+ Novo evento"** dentro da comunidade criada.
4. Acesse `/comunidades` e `/eventos` para ver as listagens públicas (com busca e filtros).

Para usar a API, obtenha um token e envie-o em todas as chamadas autenticadas:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "SenhaForte123!"}'

curl http://127.0.0.1:8000/api/comunidades \
  -H "Authorization: Bearer <token-recebido-acima>"
```

---

## Rotas do projeto

Para conhecer todas as rotas disponíveis (páginas HTML e endpoints da API REST), com uma breve descrição de cada uma, veja [rotas.md](rotas.md).

---

## Rodando os testes

De dentro de `backend/laravel/`:

```bash
php artisan test
```

ou diretamente com o PHPUnit:

```bash
php vendor/bin/phpunit
```

Os testes rodam contra um banco SQLite em memória (configurado em `phpunit.xml`), então não afetam o `database/database.sqlite` usado em desenvolvimento. A suíte cobre:

- `tests/Unit/Models` — regras de negócio dos models `Comunidade` e `Evento` (tamanhos mínimos, formatos de contato/logo, unicidade, ordenação).
- `tests/Feature/Api` — autenticação por token, CRUD de comunidades e eventos via API (status codes, permissões, paginação).
- `tests/Feature/Web` — cadastro/login/logout e CRUD de comunidades/eventos via formulários HTML (redirecionamentos, permissões).

> **Nota sobre este ambiente de desenvolvimento**: a suíte foi escrita e revisada estaticamente (`php -l` em todos os arquivos, `php artisan route:list` para validar as rotas), mas não pôde ser executada de ponta a ponta na máquina onde este projeto foi gerado, pois faltam as extensões `pdo_sqlite`, `dom` e `xmlwriter` no PHP instalado ali. Instale-as (veja [Pré-requisitos](#pré-requisitos)) e rode `php artisan test` para validar.

---

## Trocando para MySQL

O projeto usa SQLite por padrão para facilitar o desenvolvimento local, mas já está preparado para MySQL. Basta editar `backend/laravel/.env` com as credenciais do seu banco:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=agendatech
DB_USERNAME=root
DB_PASSWORD=sua_senha
```

Depois, crie o banco e rode as migrations:

```bash
mysql -u root -p -e "CREATE DATABASE agendatech CHARACTER SET utf8mb4;"
php artisan migrate
```

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `could not find driver` ao rodar `migrate` | Falta a extensão `pdo_sqlite` (ou `pdo_mysql`, se estiver usando MySQL) | Instale o pacote da extensão do seu sistema (ex.: `sudo apt install php-sqlite3`) e reinicie o terminal |
| `PHPUnit requires the "dom", ... extensions` | Faltam as extensões `dom`/`xmlwriter`, exigidas só pelo PHPUnit | Instale o pacote `php-xml` do seu sistema |
| `Class "DOMDocument" not found` ao rodar qualquer comando `artisan` | Mesma causa acima — o Laravel usa a extensão `dom` para formatar mensagens no terminal | Instale `php-xml`; o comando em si costuma ter funcionado mesmo com o erro de exibição (confira o resultado antes de assumir falha) |
| Página em branco ou erro 500 | `APP_KEY` não gerada | Rode `php artisan key:generate` |
| Erro de CSRF ao logar/cadastrar pelo navegador | Cookies antigos de outra execução do servidor | Limpe os cookies do site ou use uma aba anônima |
| Porta 8000 já em uso | Outro processo já está rodando nela | Suba em outra porta: `php artisan serve --port=8001` |
