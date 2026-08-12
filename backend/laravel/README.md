# Agenda Tech — Backend Laravel

Backend do Agenda Tech em Laravel. Funciona de **duas formas ao mesmo tempo**:

- **Sem API** — páginas HTML server-rendered (login, cadastro, listagem e formulários de
  comunidades/eventos), prontas para uso no navegador.
- **Com API** — endpoints REST em `/api/`, para um frontend separado (React) consumir. Ver
  [`frontend/README.md`](../../frontend/README.md).

Principais decisões de implementação:

- **Autenticação da API**: JWT stateless (`App\Support\JwtService` + guard customizado
  `bearer-token` registrado em `AppServiceProvider`). `POST /api/auth/token` com
  `username`/`password` retorna um token que deve ser enviado em `Authorization: Bearer <token>`.
- **Regras de negócio**: centralizadas nos models (`App\Models\Comunidade` e `App\Models\Evento`,
  no evento `saving`), reaproveitadas tanto pelas páginas web quanto pela API.
- **IDs**: UUID como chave primária em `users`, `comunidades` e `eventos` (via `HasUuids`).
- **Sem painel administrativo**: veja [rotas.md](rotas.md) para alternativas (`php artisan
  tinker`, cliente de banco de dados).
- **Sem barra final nas rotas**: `/comunidades`, `/eventos/{evento}` etc.

Banco de dados: **SQLite** em desenvolvimento e nos testes (arquivo `database/database.sqlite`,
banco em memória no PHPUnit); **PostgreSQL 13** em produção (stack oficial, ver
[`docs/stack.md`](../../docs/stack.md)) — veja [Banco de dados](#banco-de-dados-sqlite-em-dev-postgresql-em-produção).

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar — Linux / macOS](#como-rodar--linux--macos)
- [Como rodar — Windows](#como-rodar--windows)
- [Acessando o sistema](#acessando-o-sistema)
- [Rotas do projeto](#rotas-do-projeto)
- [Rodando os testes](#rodando-os-testes)
- [Cobertura de testes](#cobertura-de-testes)
- [Banco de dados: SQLite em dev, PostgreSQL em produção](#banco-de-dados-sqlite-em-dev-postgresql-em-produção)
- [Problemas comuns](#problemas-comuns)

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar com |
|---|---|---|
| PHP | 8.2 (recomendado 8.3+) | `php --version` |
| Composer | 2.x | `composer --version` |
| Git | qualquer recente | `git --version` |

> Este projeto usa Laravel 12, que exige PHP 8.2+.

O PHP precisa das seguintes extensões habilitadas (a maioria já vem ativa em instalações padrão;
distribuições minimalistas podem exigir pacotes extras):

| Extensão | Para quê é usada | Pacote Ubuntu/Debian (exemplo) |
|---|---|---|
| `pdo_sqlite` | Banco de dados SQLite (padrão de dev/testes) | `php-sqlite3` |
| `pdo_pgsql` | Só necessária se você for apontar `DB_CONNECTION` para PostgreSQL localmente | `php-pgsql` |
| `mbstring`, `tokenizer`, `ctype`, `filter`, `json`, `libxml` | Requeridas pelo próprio framework | geralmente já vêm com o `php-cli` |
| `dom`, `xmlwriter` | Exigidas pelo PHPUnit (só para rodar os testes) | `php-xml` |
| `pcov` (ou `xdebug`) | Só necessária para `php artisan test --coverage` (ver [Cobertura de testes](#cobertura-de-testes)) | `php-pcov` / `php-xdebug` |

Se `composer install` reclamar de alguma extensão ausente, instale o pacote correspondente do seu
sistema (ex.: `sudo apt install php-sqlite3 php-xml`) e rode novamente.

---

## Estrutura de pastas

```
backend/laravel/
├── composer.json       # dependências do projeto
├── vendor/              # dependências instaladas (criado por você, não vai para o git)
├── .env.example         # modelo de configuração — copie para .env
├── artisan              # CLI do Laravel
├── app/
│   ├── Models/           # Comunidade, ComunidadeMembro, Evento, User
│   ├── Http/
│   │   ├── Controllers/         # controllers das páginas web (auth, comunidades, eventos)
│   │   ├── Controllers/Api/     # controllers da API REST
│   │   ├── Requests/            # Form Requests (validação de presença/tipo)
│   │   └── Resources/           # JsonResource (formato das respostas da API)
│   └── Support/
│       ├── JwtService.php       # emissão/verificação do token JWT usado pela API
│       └── Permissions.php      # checagens de organizador/membro (usada por web e API)
├── database/
│   ├── migrations/      # schema do banco (users, comunidades, comunidade_membros, eventos)
│   ├── factories/        # factories usadas pelos testes
│   └── database.sqlite   # banco SQLite de desenvolvimento (criado por você, não vai para o git)
├── routes/
│   ├── web.php           # rotas das páginas HTML
│   └── api.php           # rotas da API REST
├── resources/views/      # templates Blade (CSS embutido no layout, sem build step)
└── tests/
    ├── Feature/Api/       # testes de integração da API
    ├── Feature/Web/       # testes de integração das páginas web
    └── Unit/Models/       # testes das regras de negócio nos models
```

Todos os comandos abaixo (`artisan`, `composer`, `php vendor/bin/phpunit`) devem ser executados de
dentro de `backend/laravel/`.

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

Isso deixa o site disponível em `http://127.0.0.1:8000`. Para criar um usuário de teste, use
`/cadastro` pelo navegador ou `php artisan tinker`:

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

Os passos são os mesmos; a única diferença é como criar o arquivo do banco SQLite (o `touch` do
Linux/macOS não existe no Windows).

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
2. Clique em **"+ Nova comunidade"**, preencha o formulário — você vira organizador dela
   automaticamente.
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

Para conhecer todas as rotas disponíveis (páginas HTML e endpoints da API REST), com uma breve
descrição de cada uma, veja [rotas.md](rotas.md).

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

Os testes rodam contra um banco SQLite em memória (configurado em `phpunit.xml`), então não
afetam o `database/database.sqlite` usado em desenvolvimento. A suíte cobre:

- `tests/Unit/Models` — regras de negócio dos models `Comunidade` e `Evento` (tamanhos mínimos,
  formatos de contato/logo, unicidade, ordenação).
- `tests/Feature/Api` — autenticação por token, CRUD de comunidades e eventos via API (status
  codes, permissões, paginação), envelope de erros, gatilho de deploy.
- `tests/Feature/Web` — cadastro/login/logout e CRUD de comunidades/eventos via formulários HTML
  (redirecionamentos, permissões).

---

## Cobertura de testes

`php artisan test --coverage` mede quais linhas de `app/` são exercitadas pelos testes (o
`<source>` de `phpunit.xml` já está configurado para isso) e imprime a % por arquivo e o total no
final:

```
  Http/Controllers/Api/ComunidadeController ............. 83, 117, 120 / 94.3%
  Models/Comunidade ............................................... 85 / 97.2%
  ...
  ────────────────────────────────────────────────────────────────────────────
                                                                 Total: 93.1 %
```

Isso exige um **driver de coverage** instalado no PHP (Xdebug ou PCOV) — sem ele o comando falha
com `Code coverage driver not available`. Recomendamos **PCOV**: é feito só para coverage, então é
bem mais rápido que o Xdebug para rodar a suíte inteira (o Xdebug também faz step-debugging, o que
adiciona overhead que não interessa aqui).

### Linux

```bash
# Ubuntu/Debian — troque "8.5" pela sua versão de PHP (`php --version`)
sudo apt-get install -y php8.5-pcov

# confirma que carregou
php -m | grep -i pcov

cd backend/laravel
php artisan test --coverage
```

Se o pacote `phpX.Y-pcov` não existir no seu repositório (versões muito novas de PHP), use o PECL:

```bash
sudo pecl install pcov
echo "extension=pcov.so" | sudo tee /etc/php/$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')/cli/conf.d/20-pcov.ini
```

### Windows

Instalações nativas de PHP no Windows não têm gerenciador de pacotes equivalente ao `apt` — o
processo é baixar a DLL certa para a sua build de PHP:

1. Descubra a versão/arquitetura/thread-safety do seu PHP: `php -v` (ex.: `PHP 8.3.x (cli)
   (built: ...) (NTS x64)` ou similar).
2. Baixe a DLL do PCOV compatível em https://pecl.php.net/package/pcov (escolha a versão que bate
   com o `php -v` do passo 1) e coloque o arquivo `php_pcov.dll` na pasta `ext\` da sua instalação
   de PHP.
3. Abra o `php.ini` usado pelo CLI (confirme o caminho com `php --ini`) e adicione:
   ```ini
   extension=pcov
   pcov.enabled=1
   ```
4. Confirme que carregou e rode os testes:
   ```powershell
   php -m | findstr pcov
   cd backend\laravel
   php artisan test --coverage
   ```

> Se preferir não mexer em DLLs manualmente: qualquer distribuição de PHP para Windows que já
> venha com Xdebug pré-instalado (comum em stacks como Laravel Herd ou XAMPP mais recentes)
> também funciona — o comando é o mesmo, `php artisan test --coverage`, só troque
> `pcov.enabled=1` por `xdebug.mode=coverage` no `php.ini`. Para achar a DLL certa do Xdebug, cole
> a saída de `php -i` no assistente oficial em https://xdebug.org/wizard.

### Falhar o build abaixo de um limite

Para usar em CI ou antes de um PR, `--min` faz o comando retornar erro se a cobertura total ficar
abaixo do valor informado:

```bash
php artisan test --coverage --min=80
```

---

## Banco de dados: SQLite em dev, PostgreSQL em produção

O projeto usa **SQLite** por padrão em desenvolvimento (simplicidade, zero setup) e nos testes
(banco em memória). Em produção, a stack oficial é **PostgreSQL 13** (ver
[`docs/stack.md`](../../docs/stack.md)) — o código já é escrito para funcionar nos dois sem
alterações (regras de negócio que dependem de comparação case-insensitive, por exemplo, usam
`LOWER()` em vez de depender de collation específica de um banco).

Para rodar localmente contra PostgreSQL em vez de SQLite, edite `backend/laravel/.env`:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=agendatech
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
```

Depois, crie o banco e rode as migrations:

```bash
psql -U postgres -c "CREATE DATABASE agendatech;"
php artisan migrate
```

Se não tiver PostgreSQL instalado localmente, um jeito rápido de subir uma instância descartável
para testar é via Docker:

```bash
docker run --rm -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=sua_senha -e POSTGRES_DB=agendatech \
  postgres:13
```

> Isso é independente do `docker-compose.yml` na raiz do repositório, que hoje sobe infraestrutura
> de uma versão anterior do backend (Node/Prisma) — ainda não foi atualizado para este backend
> Laravel.

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `could not find driver` ao rodar `migrate` | Falta a extensão `pdo_sqlite` (ou `pdo_pgsql`, se estiver usando PostgreSQL) | Instale o pacote da extensão do seu sistema (ex.: `sudo apt install php-sqlite3`) e reinicie o terminal |
| `PHPUnit requires the "dom", ... extensions` | Faltam as extensões `dom`/`xmlwriter`, exigidas só pelo PHPUnit | Instale o pacote `php-xml` do seu sistema |
| `Class "DOMDocument" not found` ao rodar qualquer comando `artisan` | Mesma causa acima — o Laravel usa a extensão `dom` para formatar mensagens no terminal | Instale `php-xml`; o comando em si costuma ter funcionado mesmo com o erro de exibição (confira o resultado antes de assumir falha) |
| `Code coverage driver not available` ao rodar `test --coverage` | Falta Xdebug ou PCOV | Veja [Cobertura de testes](#cobertura-de-testes) |
| Página em branco ou erro 500 | `APP_KEY` não gerada | Rode `php artisan key:generate` |
| Erro de CSRF ao logar/cadastrar pelo navegador | Cookies antigos de outra execução do servidor | Limpe os cookies do site ou use uma aba anônima |
| Porta 8000 já em uso | Outro processo já está rodando nela | Suba em outra porta: `php artisan serve --port=8001` |
