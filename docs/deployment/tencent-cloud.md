# GSCombat 腾讯云朋友测试服务部署

当前部署由 Caddy、Next.js、Fastify 和一个可写 SQLite 工作空间库组成。游戏数据快照继续随 API
镜像只读发布。Caddy 通过备案域名提供 HTTPS，Next.js 与 Fastify 不直接暴露到公网。

## 前提

- 一台安装了 Docker Engine 与 Docker Compose plugin 的腾讯云服务器；
- 腾讯云防火墙或安全组放行 TCP 80、443 端口；
- 域名 A 记录指向服务器公网 IP，并已完成中国大陆 ICP 备案。

## 配置

复制示例环境文件并填写真实值：

```bash
cp .env.deploy.example .env
openssl rand -base64 48
```

将生成结果写入 `INVITE_TOKEN_SECRET`，并确认 `PUBLIC_DOMAIN=gscombat.online`。该文件不能提交到
版本库。

## 启动

```bash
docker compose build
docker compose up -d
docker compose ps
```

正式地址为 `https://gscombat.online`。Caddy 会自动申请、续期 TLS 证书，并将 HTTP 请求重定向到
HTTPS。

## 邀请码管理

邀请码仅用于可选的云端保存和多端同步。没有邀请码的访客直接使用浏览器本机缓存，不会创建服务器工作空间。

创建邀请码时，明文只输出一次：

```bash
docker compose exec api node apps/api/dist/manage-invites.js create 朋友名称
```

查看不含明文的邀请码清单：

```bash
docker compose exec api node apps/api/dist/manage-invites.js list
```

撤销邀请码后，由它签发的现有 Cookie 会话也会立即失效：

```bash
docker compose exec api node apps/api/dist/manage-invites.js revoke INVITE_ID
```

## 数据与备份

工作空间数据库位于宿主机 `runtime/workspace/workspaces.sqlite`。备份时应使用 SQLite 在线备份或
`VACUUM INTO`，不要在持续写入时直接复制单个主数据库文件。首版只运行一个 API 实例；迁移到
PostgreSQL 前不要横向扩容 API 写入端。

## 版本一致性

部署目录应是 Git 仓库，并只部署已经推送到 GitHub `main` 的提交。发布后同时核对：

```bash
git rev-parse HEAD
git ls-remote origin refs/heads/main
docker compose ps
curl -fsS https://gscombat.online/api/backend/health
```

本地、GitHub `main` 和服务器部署目录必须指向同一个提交 SHA；`.env` 与 `runtime/` 是服务器状态，
不进入版本库。
