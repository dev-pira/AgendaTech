# Agenda Tech — Backend Django

Versão "plena" do backend do Agenda Tech: um sistema Django completo que funciona de **duas formas ao mesmo tempo**:

- **Sem API** — páginas HTML server-rendered (login, cadastro, listagem e formulários de comunidades/eventos), prontas para uso no navegador.
- **Com API** — endpoints REST (`django-ninja`) em `/api/`, com documentação interativa em `/api/docs`, para um frontend separado (ex.: React) consumir.

Banco de dados: **SQLite** por padrão. As credenciais de conexão são lidas via `python-decouple` a partir de um arquivo `.env`, então trocar para **PostgreSQL** no futuro é só editar esse arquivo — sem mudar código.

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar — Linux / macOS](#como-rodar--linux--macos)
- [Como rodar — Windows](#como-rodar--windows)
- [Acessando o sistema](#acessando-o-sistema)
- [Rotas do projeto](#rotas-do-projeto)
- [Rodando os testes](#rodando-os-testes)
- [Trocando para PostgreSQL](#trocando-para-postgresql)
- [Problemas comuns](#problemas-comuns)

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar com |
|---|---|---|
| Python | 3.12 | `python3 --version` (Linux/macOS) ou `python --version` (Windows) |
| Git | qualquer recente | `git --version` |

> Django 6 exige Python 3.12 ou superior. Se o seu `python3 --version` mostrar algo menor que 3.12, instale uma versão mais nova antes de continuar (via [python.org](https://www.python.org/downloads/), `pyenv`, ou o instalador do seu sistema).

---

## Estrutura de pastas

```
backend/django/
├── requirements.txt   # dependências do projeto
├── venv/              # ambiente virtual (criado por você, não vai para o git)
└── src/                # código-fonte Django
    ├── manage.py
    ├── .env.example    # modelo de configuração — copie para .env
    ├── agendatech/     # settings, urls, wsgi do projeto
    └── core/           # app com models, views, api, templates e testes
```

Todos os comandos abaixo (`manage.py`, `pytest`) devem ser executados de dentro de `backend/django/src/`, com a virtualenv ativada.

---

## Como rodar — Linux / macOS

Abra um terminal na raiz do repositório (`AgendaTech/`) e execute:

```bash
cd backend/django

# 1. Criar o ambiente virtual
python3 -m venv venv

# 2. Ativar o ambiente virtual
source venv/bin/activate

# 3. Instalar as dependências
pip install -r requirements.txt

# 4. Entrar na pasta do código-fonte
cd src

# 5. Criar o arquivo de configuração local a partir do modelo
cp .env.example .env

# 6. Criar as tabelas no banco SQLite
python manage.py migrate

# 7. Criar um usuário para testar o login e o Django admin
python manage.py createsuperuser

# 8. Subir o servidor de desenvolvimento
python manage.py runserver
```

Quando `(venv)` aparecer no início do prompt, o ambiente virtual está ativo. Para desativar a qualquer momento, rode `deactivate`.

---

## Como rodar — Windows

Os passos são os mesmos, mudando apenas como o ambiente virtual é ativado. Escolha o terminal que você usa:

### PowerShell

```powershell
cd backend\django

# 1. Criar o ambiente virtual
python -m venv venv

# 2. Ativar o ambiente virtual
.\venv\Scripts\Activate.ps1

# 3. Instalar as dependências
pip install -r requirements.txt

# 4. Entrar na pasta do código-fonte
cd src

# 5. Criar o arquivo de configuração local a partir do modelo
copy .env.example .env

# 6. Criar as tabelas no banco SQLite
python manage.py migrate

# 7. Criar um usuário para testar o login e o Django admin
python manage.py createsuperuser

# 8. Subir o servidor de desenvolvimento
python manage.py runserver
```

> Se o PowerShell bloquear a ativação com um erro sobre "execution policies", rode uma vez (como o próprio usuário, não precisa ser administrador):
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

### Prompt de Comando (cmd.exe)

```bat
cd backend\django

python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
cd src
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## Acessando o sistema

Com `python manage.py runserver` em execução:

| O quê | Endereço |
|---|---|
| Site (sem API) — listagem de comunidades | http://127.0.0.1:8000/ |
| Cadastro de novo usuário | http://127.0.0.1:8000/cadastro/ |
| Login | http://127.0.0.1:8000/login/ |
| Django admin | http://127.0.0.1:8000/admin/ |
| API REST | http://127.0.0.1:8000/api/ |
| Documentação interativa da API (Swagger) | http://127.0.0.1:8000/api/docs |

Fluxo básico para testar tudo manualmente:
1. Acesse `/cadastro/` e crie uma conta (isso já faz login automaticamente).
2. Clique em **"+ Nova comunidade"**, preencha o formulário — você vira organizador dela automaticamente.
3. Clique em **"+ Novo evento"** dentro da comunidade criada.
4. Acesse `/comunidades/` e `/eventos/` para ver as listagens públicas (com busca e filtros).

---

## Rotas do projeto

Para conhecer todas as rotas disponíveis (páginas HTML, Django admin e endpoints da API REST), com uma breve descrição de cada uma, veja [rotas.md](rotas.md). É um bom ponto de partida para quem está chegando agora no projeto.

---

## Rodando os testes

Com a virtualenv ativada e dentro de `backend/django/src/`:

```bash
pytest
```

Para ver o relatório com mais detalhes por teste:

```bash
pytest -v
```

### Cobertura de testes (opcional)

Se quiser medir cobertura de código, instale o `coverage` e rode:

```bash
pip install coverage
coverage run -m pytest
coverage report
coverage html   # gera relatório navegável em htmlcov/index.html
```

---

## Trocando para PostgreSQL

O projeto usa SQLite por padrão para facilitar o desenvolvimento local, mas já está preparado para PostgreSQL. Basta editar `backend/django/src/.env` (nunca o `settings.py`) com as credenciais do seu banco:

```dotenv
DB_ENGINE=django.db.backends.postgresql
DB_NAME=agendatech
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
```

Depois, instale o driver do PostgreSQL na virtualenv e rode as migrations de novo:

```bash
pip install psycopg[binary]
python manage.py migrate
```

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `python3: command not found` (Windows) | No Windows o comando geralmente é `python`, não `python3` | Use `python` em vez de `python3` |
| `ModuleNotFoundError: No module named 'django'` | A virtualenv não está ativada, ou as dependências não foram instaladas | Confirme que `(venv)` aparece no prompt e rode `pip install -r requirements.txt` novamente |
| `django.core.exceptions.ImproperlyConfigured` ao rodar `manage.py` | Está rodando o comando de fora da pasta `src/` | Sempre rode `manage.py`/`pytest` de dentro de `backend/django/src/` |
| Erro de CSRF ao logar/cadastrar pelo navegador | Cookies antigos de outra execução do servidor | Limpe os cookies do site ou use uma aba anônima |
| Porta 8000 já em uso | Outro processo já está rodando nela | Suba em outra porta: `python manage.py runserver 8001` |
