# Agenda Tech — Backend Ruby on Rails

Versão Ruby on Rails do backend do Agenda Tech, com os **mesmos endpoints** das versões [Django](../django/README.md) e [Laravel](../laravel/README.md) (veja o [rotas.md](rotas.md) de cada uma para comparar lado a lado). Assim como as outras duas, este backend funciona de **duas formas ao mesmo tempo**:

- **Sem API** — páginas HTML server-rendered (login, cadastro, listagem e formulários de comunidades/eventos), prontas para uso no navegador.
- **Com API** — endpoints REST em `/api/`, para um frontend separado (ex.: React) consumir.

Banco de dados: **MySQL** por padrão (diferente das outras duas versões, que usam SQLite por padrão — ver [Trocando de banco](#trocando-de-banco)).

## Principais diferenças de implementação em relação às versões Django/Laravel

- **Sem gem de autenticação**: em vez de Devise, a sessão web usa `has_secure_password` (bcrypt) + `session[:user_id]` puro, e a API usa um guard Bearer simples (model `Token` + `Api::BaseController#current_user`), espelhando o `Token`/`AuthBearer` (django-ninja `HttpBearer`) da versão Django e o guard customizado da versão Laravel.
- **Regras de negócio**: centralizadas nos models (`app/models/comunidade.rb` e `app/models/evento.rb`, via `validates`/`validate` e callbacks), assim como as outras duas versões centralizam a validação de "forma" no model. Regras que dependem de *quando* a ação acontece (data futura só na criação, bloqueio de evento passado, permissões) ficam nos controllers — porque só se aplicam a algumas ações, não a todo `save` (ver comentário no topo de `app/models/evento.rb`).
- **IDs**: UUID como chave primária em `users`, `comunidades` e `eventos`. Diferente do Postgres, o MySQL não tem um tipo de coluna UUID nativo, então usamos uma string(36) preenchida em Ruby antes de criar o registro — ver `app/models/concerns/uuid_primary_key.rb`.
- **Sem painel administrativo**: não há equivalente ao Django Admin — veja [rotas.md](rotas.md) para alternativas (`bin/rails console`, cliente MySQL).
- **Sem barra final nas rotas**: assim como a versão Laravel, os caminhos são `/comunidades`, `/eventos/:id` etc. (sem a barra final usada pela versão Django).
- **Sem `config/credentials.yml.enc`**: o `secret_key_base` vem da variável de ambiente `SECRET_KEY_BASE` (ver `.env.example`) em vez do sistema de credenciais criptografadas padrão do Rails — é obrigatória em **todos** os ambientes, incluindo development, senão a aplicação nem sobe (ver [Problemas comuns](#problemas-comuns)).
- **`bin/rails generate` não substitui este código**: os arquivos de config/boot (`config/application.rb`, `config/boot.rb`, `config/environment.rb`, `bin/rails` etc.) foram escritos à mão seguindo o template padrão do Rails 7.1, porque o ambiente onde este projeto foi gerado não tinha os headers de compilação do Ruby disponíveis para instalar a gem `rails`. Depois de instalados (`ruby3.2-dev` + `libmysqlclient-dev`), `bundle install`, `bin/rails db:create db:migrate` e o boot do servidor foram testados e funcionam normalmente.

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar — Linux / macOS](#como-rodar--linux--macos)
- [Como rodar — Windows](#como-rodar--windows)
- [Acessando o sistema](#acessando-o-sistema)
- [Rotas do projeto](#rotas-do-projeto)
- [Rodando os testes](#rodando-os-testes)
- [Trocando de banco](#trocando-de-banco)
- [Problemas comuns](#problemas-comuns)

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar com |
|---|---|---|
| Ruby | 3.2 | `ruby -v` |
| Bundler | 2.x (vem com o Ruby) | `bundle -v` |
| MySQL Server | 8.0 | `mysql --version` |
| Git | qualquer recente | `git --version` |

Além do interpretador Ruby, o sistema precisa dos **headers de desenvolvimento** do Ruby e do cliente MySQL, usados para compilar as gems nativas (`mysql2`, `bcrypt`, e dependências internas do próprio Rails como `bigdecimal`):

| Pacote (Ubuntu/Debian) | Para quê é usado |
|---|---|
| `ruby3.2-dev` (ou a versão do seu Ruby) | Compilar qualquer gem com extensão nativa — sem isso, `bundle install` falha logo nas dependências do próprio Rails |
| `libmysqlclient-dev` | Compilar a gem `mysql2` |

```bash
sudo apt-get install -y ruby3.2-dev libmysqlclient-dev
```

> Em macOS com Homebrew, o Ruby instalado via `brew install ruby` já vem com os headers; para MySQL use `brew install mysql-client` e configure `bundle config build.mysql2 --with-mysql-dir=$(brew --prefix mysql-client)` antes do `bundle install`.

---

## Estrutura de pastas

```
backend/rails/
├── Gemfile              # dependências do projeto (Gemfile.lock já vem resolvido)
├── .env.example          # modelo de configuração — copie para .env
├── bin/rails, bin/setup  # CLI do Rails
├── app/
│   ├── models/            # User, Token, Comunidade, ComunidadeMembro, Evento
│   ├── controllers/        # controllers das páginas web (sessions, registrations, comunidades, eventos)
│   ├── controllers/api/    # controllers da API REST
│   └── services/           # Permissions (checagens de organizador/membro, usada por web e API)
├── config/
│   ├── routes.rb          # todas as rotas (web + /api)
│   ├── database.yml       # configuração do MySQL (lida de variáveis de ambiente)
│   └── environments/       # config por ambiente (development/test/production)
├── db/migrate/            # schema do banco (users, comunidades, comunidade_membros, eventos, tokens)
├── app/views/              # templates ERB
└── test/
    ├── models/             # testes das regras de negócio nos models
    └── integration/
        ├── api/            # testes de integração da API
        └── web/            # testes de integração das páginas web
```

Todos os comandos abaixo (`bin/rails`, `bundle`, `bin/rails test`) devem ser executados de dentro de `backend/rails/`.

---

## Como rodar — Linux / macOS

Abra um terminal na raiz do repositório (`AgendaTech/`) e execute:

```bash
cd backend/rails

# 1. Instalar as dependências
bundle install

# 2. Criar o arquivo de configuração local a partir do modelo
cp .env.example .env

# 3. Editar o .env: coloque o usuário/senha do seu MySQL local em
#    DB_USERNAME/DB_PASSWORD, e gere um valor para SECRET_KEY_BASE
#    (obrigatório em todos os ambientes, incluindo development):
ruby -rsecurerandom -e 'puts SecureRandom.hex(64)'
# copie a saída para SECRET_KEY_BASE= no .env

# 4. Criar o banco de dados MySQL e as tabelas
bin/rails db:create db:migrate

# 5. Subir o servidor de desenvolvimento
bin/rails server
```

> Se `bundle install` falhar com um erro de permissão (não conseguir escrever no
> diretório de gems do sistema), rode `bundle config set --local path 'vendor/bundle'`
> antes — isso instala as gems dentro do próprio projeto, sem precisar de root.

Isso deixa o site disponível em `http://127.0.0.1:3000`. Para criar um usuário de teste, use `/cadastro` pelo navegador ou `bin/rails console`:

```ruby
User.create!(
  username: "admin",
  email: "admin@example.com",
  first_name: "Admin",
  password: "SenhaForte123!"
)
```

---

## Como rodar — Windows

Recomendamos usar o **WSL2** (Windows Subsystem for Linux) com Ubuntu para desenvolver com Rails no Windows — é o caminho oficialmente recomendado pela comunidade Rails, já que a compilação de gems nativas é bem mais simples em Linux. Dentro do WSL2, siga os mesmos passos da seção [Linux / macOS](#como-rodar--linux--macos).

Se preferir instalar diretamente no Windows, use o [RubyInstaller com DevKit](https://rubyinstaller.org/) (já inclui os headers de compilação) e um servidor MySQL local, depois rode os mesmos comandos acima no PowerShell.

---

## Acessando o sistema

Com `bin/rails server` em execução:

| O quê | Endereço |
|---|---|
| Site (sem API) — listagem de comunidades | http://127.0.0.1:3000/comunidades |
| Cadastro de novo usuário | http://127.0.0.1:3000/cadastro |
| Login | http://127.0.0.1:3000/login |
| API REST | http://127.0.0.1:3000/api |

Fluxo básico para testar tudo manualmente:
1. Acesse `/cadastro` e crie uma conta (isso já faz login automaticamente).
2. Clique em **"+ Nova comunidade"**, preencha o formulário — você vira organizador dela automaticamente.
3. Clique em **"+ Novo evento"** dentro da comunidade criada.
4. Acesse `/comunidades` e `/eventos` para ver as listagens públicas (com busca e filtros).

Para usar a API, obtenha um token e envie-o em todas as chamadas autenticadas:

```bash
curl -X POST http://127.0.0.1:3000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "SenhaForte123!"}'

curl http://127.0.0.1:3000/api/comunidades \
  -H "Authorization: Bearer <token-recebido-acima>"
```

---

## Rotas do projeto

Para conhecer todas as rotas disponíveis (páginas HTML e endpoints da API REST), com uma breve descrição de cada uma, veja [rotas.md](rotas.md).

---

## Rodando os testes

De dentro de `backend/rails/`, crie o banco de teste e rode a suíte:

```bash
bin/rails db:test:prepare
bin/rails test
```

A suíte usa uma transação por teste (desfeita automaticamente ao final — nenhum dado de teste fica no banco) e roda em paralelo por padrão. Ela cobre:

- `test/models` — regras de negócio dos models `User`, `Comunidade` e `Evento` (tamanhos mínimos, formatos de contato/logo, unicidade, autenticação).
- `test/integration/api` — autenticação por token, CRUD de comunidades e eventos via API (status codes, permissões, paginação).
- `test/integration/web` — cadastro/login/logout e CRUD de comunidades/eventos via formulários HTML (redirecionamentos, permissões).

> **Nota sobre este ambiente de desenvolvimento**: a suíte foi escrita e revisada estaticamente — `ruby -c` em 100% dos arquivos `.rb`, mais uma checagem manual da sintaxe ERB das views — e o `Gemfile`/`Gemfile.lock` foram validados com `bundle lock` (resolução de dependências real, sem erros). Porém a suíte não pôde ser **executada** de ponta a ponta na máquina onde este projeto foi gerado: faltam os pacotes `ruby3.2-dev` e `libmysqlclient-dev` (ver [Pré-requisitos](#pré-requisitos)), sem os quais nem `bundle install` completa (a própria gem `bigdecimal`, dependência interna do Rails, precisa compilar). Instale-os e rode `bin/rails test` para validar.

---

## Trocando de banco

O projeto usa MySQL por padrão (diferente das versões Django e Laravel, que usam SQLite). Para usar outro adapter — por exemplo PostgreSQL —, troque a gem no `Gemfile`:

```ruby
# Gemfile
gem "pg", "~> 1.5"   # em vez de gem "mysql2"
```

E o adapter em `config/database.yml`:

```yaml
default: &default
  adapter: postgresql
  # ... demais chaves continuam iguais
```

Depois rode `bundle install` e `bin/rails db:create db:migrate` novamente.

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `mkmf.rb can't find header files for ruby` ao rodar `bundle install` | Falta a extensão de desenvolvimento do Ruby (`ruby3.2-dev`) | Instale o pacote do seu sistema (ex.: `sudo apt install ruby3.2-dev`) e rode `bundle install` de novo |
| Erro ao compilar a gem `mysql2` | Falta `libmysqlclient-dev` | Instale o pacote (ex.: `sudo apt install libmysqlclient-dev`) e rode `bundle install` de novo |
| `bundle install` falha tentando escrever em `/var/lib/gems/...` (erro de permissão) | Bundler está tentando instalar as gems no diretório global do sistema, que normalmente exige root | Rode `bundle config set --local path 'vendor/bundle'` e depois `bundle install` de novo — instala as gems dentro do projeto |
| `ArgumentError: secret_key_base for development environment must be a type of String` | `SECRET_KEY_BASE` não foi definida no `.env` | Gere uma com `ruby -rsecurerandom -e 'puts SecureRandom.hex(64)'` e cole em `SECRET_KEY_BASE=` no `.env` (é obrigatória em todos os ambientes nesta versão, não só produção) |
| `Mysql2::Error::ConnectionError` | MySQL não está rodando, ou credenciais erradas no `.env` | Confirme que o serviço MySQL está ativo (`sudo systemctl status mysql`) e que `DB_USERNAME`/`DB_PASSWORD` no `.env` batem com o seu usuário MySQL |
| `ActiveRecord::NoDatabaseError` | Banco ainda não foi criado | Rode `bin/rails db:create db:migrate` |
| Página em branco ou erro 500 | Geralmente algum detalhe de configuração faltando — rode com `RAILS_ENV=development` e olhe `log/development.log` | Verifique o log; em desenvolvimento o Rails também mostra a stack trace completa no navegador |
| Erro de CSRF ao logar/cadastrar pelo navegador | Cookies antigos de outra execução do servidor | Limpe os cookies do site ou use uma aba anônima |
| Porta 3000 já em uso | Outro processo já está rodando nela | Suba em outra porta: `bin/rails server -p 3001` |
