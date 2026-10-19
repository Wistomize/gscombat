## 1. 配置验证与入口复用

- [x] 1.1 新增工作区必要配置解析器，生产及管理命令拒绝缺失/空白/短密钥、已知默认/示例值和临时/内存库；保持调用配置优先且有效密钥不被改写。验证：startup 集成切片覆盖 options/env 冲突、默认值、空白、显式内存和合法文件路径。
- [x] 1.2 `buildApp` 前置校验，`manage-invites.ts` 复用严格规则，开发/测试 API 保留便利默认值。验证：无效配置加不可用游戏库仍优先报配置错误且不创建工作区；管理命令隔离子进程缺配拒绝、合法配置可创建与再次验证原邀请码。

## 2. 资源失败路径

- [x] 2.1 组合根初始化失败关闭已经成功取得的资源；WorkspaceStore 构造中途失败释放本连接，不掩盖原始错误。验证：真实 SQLite 的打开失败、Schema 初始化失败与正常关闭集成切片；必要时监视真实 close 方法，不用假数据库代替资源流程。
- [x] 2.2 覆盖启动初始化及监听失败，输出不含密钥的可操作错误并非零退出，监听失败关闭应用。验证：隔离子进程的缺配置和端口占用场景，不读取部署 .env，不改变源码端口默认值。

## 3. 兼容性与文档

- [x] 3.1 真实临时文件库验证合法生产配置、邀请码登录、已有 Cookie 及保存文档/revision 在原配置重启后保留；复用工作区集成测试验证隔离及旧写冲突。命令：`pnpm --filter @gscombat/api test test/integration/startup.test.ts test/integration/workspace-sync.test.ts test/integration/app.test.ts test/system/layer-boundary.test.ts`。
- [x] 3.2 更新中英文开发/部署说明：开发 API 默认值与管理命令严格要求分开；示例用随机生成而非把公开占位字符串当作真实密钥；部署沿用旧密钥及原文件，不自动轮换。验证：与现有 Compose 环境变量、挂载、管理命令静态对照，检查文档链接，不修改实际 .env/runtime。
- [x] 3.3 验收后更新 ARCH-015 台账、架构说明和实现记录，区分已修复、未部署、未归档。验证：本变更所有任务和实际证据一致，不将 ARCH-013 或其他台账任务顺带标记完成。

## 4. 比例适当的交付门禁

- [x] 4.1 运行 `pnpm --filter @gscombat/api typecheck`、`pnpm --filter @gscombat/api test` 和 `pnpm --filter @gscombat/api build`，记录真实结果。范围仅 API 启动和文档，批准本任务集即采用此窄化门禁；未修改域包/契约/生成资产，不重复全角色测试或重新生成数据。若实施扩大工作区或公开契约范围，先更新方案，再执行根目录 `pnpm typecheck`、`pnpm test`、`pnpm build` 及适用生成检查。
- [x] 4.2 运行 `openspec validate harden-production-api-startup --strict`、`git diff --check`，核查 diff/status 保留既有文档改动；确认没有 Schema/凭据算法/计算输出变化。无另行授权不提交、推送、部署或归档。
