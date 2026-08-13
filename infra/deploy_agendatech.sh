#!/usr/bin/env bash
set -euo pipefail

# Script de deploy do BACKEND, rodado no servidor king.host (~/deploy_agendatech.sh).
#
# Versionado aqui a partir de 13/08/2026 só pra ter historico/revisao no
# Git - a copia que realmente roda continua sendo a do $HOME do servidor
# (fora do repo, nunca foi assim por acidente). Se editar aqui, tem que
# copiar manualmente pro servidor tambem (nao ha deploy automatico desse
# proprio script). Idealmente a copia do servidor deveria ser atualizada
# A PARTIR daqui (fonte da verdade = repo), nao o contrario - mas isso e
# so uma recomendacao por enquanto, nao esta automatizado.
#
# Motivo de versionar agora: em 12-13/08/2026 esse script apagou o
# frontend React (~/www/agendatech/app/, publicado separadamente via FTP
# - ver deploy-frontend.yml) porque o passo de "limpar a webroot antes de
# publicar" so conhecia ".well-known" e "erros" como excecoes. Corrigido
# adicionando "app" a lista. Ver issue relacionada e docs/deploy.md.

REPO_URL="https://github.com/dev-pira/AgendaTech.git"
BRANCH="main"
APP_DIR="$HOME/apps/agendatech"
LARAVEL_DIR="$APP_DIR/backend/laravel"
WEB_DIR="$HOME/www/agendatech"
PHP_BIN="/usr/local/php/8.2/bin/php"
export PHPRC="/etc/opt/remi/php82/php.ini"
COMPOSER="$HOME/composer.phar"
LAST_DEPLOY_FILE="$HOME/.agendatech_last_deploy"

echo "==> Deploy AgendaTech: $(date)"

if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin "$BRANCH"
  git rev-parse HEAD > "$LAST_DEPLOY_FILE"
  git reset --hard "origin/$BRANCH"
else
  mkdir -p "$(dirname "$APP_DIR")"
  git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "==> Commit atual: $(git rev-parse HEAD)"

cd "$LARAVEL_DIR"

if [ ! -f .env ]; then
  echo "!! .env não encontrado, copiando .env.example — revise manualmente."
  cp .env.example .env
fi

echo "==> composer install"
"$PHP_BIN" "$COMPOSER" install --no-dev --optimize-autoloader --no-interaction

if ! grep -q "^APP_KEY=base64" .env 2>/dev/null; then
  "$PHP_BIN" artisan key:generate --force
fi

echo "==> limpando cache de config (evita usar .env desatualizado)"
"$PHP_BIN" artisan config:clear

echo "==> migrate"
"$PHP_BIN" artisan migrate --force

echo "==> cache"
"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan route:cache
"$PHP_BIN" artisan view:cache

chmod -R ug+rwX storage bootstrap/cache

echo "==> publicando public/ no webroot"
shopt -s dotglob nullglob
for item in "$WEB_DIR"/*; do
  base="${item##*/}"
  # "app" = frontend React, publicado separadamente via FTP
  # (deploy-frontend.yml) - NAO apagar aqui, senao todo deploy de
  # backend derruba o frontend junto (aconteceu em 12/08/2026).
  if [ "$base" != ".well-known" ] && [ "$base" != "erros" ] && [ "$base" != "app" ]; then
    rm -rf "$item"
  fi
done
shopt -u dotglob nullglob
cp -a "$LARAVEL_DIR/public/." "$WEB_DIR/"

sed -i \
  -e "s#__DIR__\.'/\.\./vendor/autoload\.php'#'$LARAVEL_DIR/vendor/autoload.php'#" \
  -e "s#__DIR__\.'/\.\./bootstrap/app\.php'#'$LARAVEL_DIR/bootstrap/app.php'#" \
  -e "s#__DIR__\.'/\.\./storage/framework/maintenance\.php'#'$LARAVEL_DIR/storage/framework/maintenance.php'#" \
  "$WEB_DIR/index.php"

echo "==> Deploy concluído: $(date)"
