# Deploying a GSCombat friend-testing service on Tencent Cloud

The deployment combines Caddy, Next.js, Fastify, and a writable SQLite workspace database. The pinned game-data
snapshot is shipped read-only in the API image. Caddy serves the filed public domain over HTTPS; Next.js and Fastify
are not exposed directly.

## Prerequisites and configuration

- A Tencent Cloud server with Docker Engine and the Docker Compose plugin.
- Security-group rules allowing TCP ports 80 and 443.
- A domain A record pointing at the server public IP and a completed mainland China ICP filing.

```bash
cp .env.deploy.example .env
openssl rand -base64 48
```

Place the generated value in `INVITE_TOKEN_SECRET` and confirm `PUBLIC_DOMAIN=gscombat.online`. Never commit `.env`.

## Start and inspect

```bash
docker compose build
docker compose up -d
docker compose ps
```

The production URL is `https://gscombat.online`. Caddy automatically obtains and renews its TLS certificate and
redirects HTTP traffic to HTTPS.

## Invite management

Invite codes are optional and only enable cloud persistence and cross-device synchronization. Visitors without a
code use browser-local storage and do not create server-side workspaces.

An invite code is printed only when it is created:

```bash
docker compose exec api node apps/api/dist/manage-invites.js create friend-name
docker compose exec api node apps/api/dist/manage-invites.js list
docker compose exec api node apps/api/dist/manage-invites.js revoke INVITE_ID
```

Revoking an invite also invalidates sessions issued for its workspace.

## Data, backup, and release identity

The workspace database is `runtime/workspace/workspaces.sqlite` on the host. Use SQLite online backup or
`VACUUM INTO`; do not copy only the main database file while writes are active. Run one API writer until the service
migrates to PostgreSQL.

Deploy only commits already pushed to GitHub `main`, then verify:

```bash
git rev-parse HEAD
git ls-remote origin refs/heads/main
docker compose ps
curl -fsS https://gscombat.online/api/backend/health
```

Local, GitHub `main`, and the server deployment must resolve to the same commit SHA. `.env` and `runtime/` are server
state and remain outside Git.
