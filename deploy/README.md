# Production deployment

This folder contains a production Docker setup for:

- Frontend: `https://demo-shop.honeysocial.click`
- Backend API: `https://demo-api.honeysocial.click`
- AI service: `https://api-ai.honeysocial.click/predict`

## Files

- `docker-compose.prod.yml`: backend, frontend, nginx, certbot
- `.env`: deploy-time environment values used by Docker Compose
- `../backend/.env.production`: backend env for direct production runs
- `../frontend/.env.production`: frontend env for direct production builds/runs
- `nginx/conf.d/veritashop.conf`: reverse proxy and TLS virtual hosts
- `scripts/init-letsencrypt.sh`: bootstrap Let's Encrypt certificates

## Before you deploy

1. Point both DNS records to the server IP:
   - `demo-shop.honeysocial.click`
   - `demo-api.honeysocial.click`
2. Open inbound ports `80` and `443` on the server firewall/security group.
3. Review `deploy/.env` and set `LETSENCRYPT_EMAIL` if you want certificate expiry notices.

## Start services

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build backend frontend
```

## Issue SSL certificates

```bash
chmod +x deploy/scripts/init-letsencrypt.sh
./deploy/scripts/init-letsencrypt.sh
```

The script will:

- create temporary self-signed certs so nginx can start,
- request real Let's Encrypt certs for both domains,
- reload nginx,
- start the background `certbot` renewal container.

## Full stack

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
```

## App env files

- Docker Compose deploy uses `deploy/.env`
- Direct backend deploy can use `backend/.env.production`
- Direct frontend build can use `frontend/.env.production`

## Useful commands

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env ps
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env logs -f nginx
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env logs -f backend
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env logs -f frontend
```
