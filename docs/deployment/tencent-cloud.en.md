# Deploying a GSCombat friend-testing service on Tencent Cloud

The current test deployment combines Caddy, Next.js, Fastify, and a writable SQLite workspace database. The pinned
game-data snapshot is shipped read-only in the API image. Only one high-numbered HTTP port is exposed publicly.

This IP-only mode is suitable only for temporary testing where plaintext transport is explicitly accepted. Use HTTPS
and an appropriately registered domain before a public production launch in mainland China.

## Prerequisites and configuration

- A Tencent Cloud server with Docker Engine and the Docker Compose plugin.
- A security-group rule allowing the selected high-numbered TCP port.

```bash
cp .env.deploy.example .env
openssl rand -base64 48
```

Place the generated value in `INVITE_TOKEN_SECRET`. Never commit `.env`.

## Start and inspect

```bash
docker compose build
docker compose up -d
docker compose ps
```

The test URL is `http://PUBLIC_IP:${PUBLIC_PORT}`.

## Invite management

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
curl -fsS "http://127.0.0.1:${PUBLIC_PORT}/api/backend/health"
```

Local, GitHub `main`, and the server deployment must resolve to the same commit SHA. `.env` and `runtime/` are server
state and remain outside Git.
