# GSCombat 腾讯云朋友测试服务部署

当前测试部署由 Caddy、Next.js、Fastify 和一个可写 SQLite 工作空间库组成。游戏数据快照继续随
API 镜像只读发布。对外只暴露一个高位 HTTP 端口；Next.js 与 Fastify 不直接暴露到公网。

## 前提

- 一台安装了 Docker Engine 与 Docker Compose plugin 的腾讯云服务器；
- 腾讯云防火墙或安全组放行选定的高位 HTTP 端口。

这个 IP 直连模式仅用于已明确接受明文传输风险的临时测试。正式开放必须改回 HTTPS，并为中国大陆
服务器准备已备案域名。

## 配置

复制示例环境文件并填写真实值：

```bash
cp .env.deploy.example .env
openssl rand -base64 48
```

将生成结果写入 `INVITE_TOKEN_SECRET`。该文件不能提交到版本库。

## 启动

```bash
docker compose build
docker compose up -d
docker compose ps
```

当前测试地址为 `http://服务器公网IP:${PUBLIC_PORT}`。

## 邀请码管理

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
curl -fsS "http://127.0.0.1:${PUBLIC_PORT}/api/backend/health"
```

本地、GitHub `main` 和服务器部署目录必须指向同一个提交 SHA；`.env` 与 `runtime/` 是服务器状态，
不进入版本库。
