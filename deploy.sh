#!/usr/bin/env bash
# Publica o site da Bianchi Engenharia na VPS (site estático em nginx, atrás do Traefik com HTTPS).
# Uso:  ./deploy.sh IP_DA_VPS                 (ex.: ./deploy.sh 200.141.22.95)
set -euo pipefail

SERVIDOR="${1:?Informe o IP da VPS. Ex.: ./deploy.sh 200.141.22.95}"
USUARIO="${USUARIO:-root}"
DESTINO="/opt/bianchi"
DOMINIO="${DOMINIO:-bianchi.kldstudio.com.br}"
PASTA="$(cd "$(dirname "$0")" && pwd)"
SSH="ssh -o ServerAliveInterval=30 $USUARIO@$SERVIDOR"
COMPOSE="DOMINIO=$DOMINIO docker compose -p bianchi -f docker-compose.prod.yml"

echo "→ Copiando o site para $DESTINO"
$SSH "mkdir -p $DESTINO && cd $DESTINO && find . -mindepth 1 -maxdepth 1 ! -name logs -exec rm -rf {} +"
tar -C "$PASTA" --exclude=.git --exclude=./logs -czf - . | $SSH "tar -C $DESTINO -xzf -"

echo "→ Construindo e subindo"
$SSH "cd $DESTINO && mkdir -p logs && touch logs/acesso.log && $COMPOSE build --pull && $COMPOSE up -d --remove-orphans && docker image prune -f >/dev/null"
$SSH "cd $DESTINO && $COMPOSE ps --format 'table {{.Service}}\t{{.Status}}'"
$SSH "command -v fail2ban-client >/dev/null && fail2ban-client reload >/dev/null 2>&1 && echo '  fail2ban recarregado (lendo /opt/*/logs/acesso.log)'" || true

echo ""
echo "✓ Publicado: https://$DOMINIO  (o certificado pode levar 1 minuto na primeira vez)"
