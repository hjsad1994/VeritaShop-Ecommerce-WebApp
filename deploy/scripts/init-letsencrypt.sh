#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DEPLOY_DIR=$(dirname "$SCRIPT_DIR")
COMPOSE_FILE="$DEPLOY_DIR/docker-compose.prod.yml"
ENV_FILE="$DEPLOY_DIR/.env"
CERTBOT_DIR="$DEPLOY_DIR/certbot/conf"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy deploy/.env.example to deploy/.env first."
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

if [ -z "${FRONTEND_DOMAIN:-}" ] || [ -z "${BACKEND_DOMAIN:-}" ]; then
  echo "FRONTEND_DOMAIN and BACKEND_DOMAIN must be set in $ENV_FILE."
  exit 1
fi

create_dummy_cert() {
  domain="$1"
  live_path="$CERTBOT_DIR/live/$domain"
  marker_path="$live_path/.dummy-cert"

  if [ -f "$live_path/fullchain.pem" ] && [ -f "$live_path/privkey.pem" ]; then
    return 0
  fi

  mkdir -p "$live_path"
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$live_path/privkey.pem" \
    -out "$live_path/fullchain.pem" \
    -subj "/CN=localhost"
  touch "$marker_path"
}

cleanup_dummy_cert() {
  domain="$1"

  if [ ! -f "$CERTBOT_DIR/live/$domain/.dummy-cert" ]; then
    return 0
  fi

  rm -rf \
    "$CERTBOT_DIR/live/$domain" \
    "$CERTBOT_DIR/archive/$domain" \
    "$CERTBOT_DIR/renewal/$domain.conf"
}

request_cert() {
  domain="$1"

  if [ -n "${LETSENCRYPT_EMAIL:-}" ]; then
    email_args="--email ${LETSENCRYPT_EMAIL}"
  else
    email_args="--register-unsafely-without-email"
  fi

  if [ "${CERTBOT_STAGING:-0}" != "0" ]; then
    staging_args="--staging"
  else
    staging_args=""
  fi

  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm certbot \
    certonly --webroot -w /var/www/certbot \
    $staging_args \
    $email_args \
    --agree-tos \
    --rsa-key-size 4096 \
    --force-renewal \
    -d "$domain"
}

mkdir -p "$CERTBOT_DIR"

create_dummy_cert "$FRONTEND_DOMAIN"
create_dummy_cert "$BACKEND_DOMAIN"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d backend frontend nginx

cleanup_dummy_cert "$FRONTEND_DOMAIN"
cleanup_dummy_cert "$BACKEND_DOMAIN"

request_cert "$FRONTEND_DOMAIN"
request_cert "$BACKEND_DOMAIN"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec nginx nginx -s reload
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d certbot

echo "Certificates issued and nginx reloaded."
