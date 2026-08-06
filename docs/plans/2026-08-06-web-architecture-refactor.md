# ARCH-005 Web 功能目录重构实施计划

## 目标

将 Web 的配置工作空间和计算工作台从两个巨型客户端组件重组为按功能归属的模块，同时保持：

- `/` 与 `/calculate` 的现有页面流程、文案和 DOM 语义；
- 本地配置、云端同步、首次迁移、冲突停止和重新加载行为；
- 伤害指标、辅助指标、效果选择和武器精炼比较请求协议；
- 现有 CSS 类名与视觉布局；
- 不引入新的全局状态系统。

## 目标目录

```text
apps/web/
├── app/
│   ├── page.tsx
│   └── calculate/page.tsx
├── features/
│   ├── build-editor/
│   ├── build-library/
│   ├── party/
│   ├── workspace-session/
│   ├── calculation-setup/
│   └── calculation-report/
├── components/
│   └── ui/
├── lib/
│   ├── api/
│   ├── formatting/
│   └── workspace/
└── test/
    ├── integration/
    └── system/
```

目录允许根据实际职责增加同一功能内的文件，但不允许重新形成一个承载所有职责的聚合模块。

## 依赖方向

```text
app routes
  -> feature controllers
    -> feature components/hooks
      -> components/ui + lib
        -> contracts
```

- `app` 只负责 Next.js 路由组合和服务端数据注入。
- 功能模块之间通过显式 Props 或稳定的领域类型协作。
- `components/ui` 不依赖任何具体功能模块。
- `lib` 不依赖 React 页面或功能组件。
- 云端同步只属于 `workspace-session`，计算工作台不得写入云端工作空间。

## 实施阶段

### 阶段 1：纯展示与格式化

- 输出：数字、百分比、元素和公式格式化工具进入 `lib/formatting`；伤害轨迹、轮转轨迹、辅助指标和结果报告进入 `calculation-report`。
- 验证：Web 类型检查和现有计算页面测试通过。

### 阶段 2：Build 与圣遗物编辑

- 输出：`BuildEditor`、`ArtifactEditor`、编辑常量和转换逻辑进入 `build-editor`。
- 验证：配置页能够继续新建、编辑和保存完整角色配置。

### 阶段 3：配置库、导入和队伍

- 输出：配置库、导入面板、角色配置管理和四人队伍选择形成独立组件。
- 验证：JSON、展示柜、手动初始化、配置删除和队伍替换流程保持一致。

### 阶段 4：云端会话与同步

- 输出：邀请码会话、昵称和云端同步队列进入 `workspace-session` Hook/组件。
- 验证：首次迁移、400 毫秒合并保存、401、409、重载和退出流程保持一致。

### 阶段 5：计算设置与 Controller

- 输出：计算对象、指标、敌人、Buff 和效果选择进入 `calculation-setup`；页面 Controller 只协调状态和请求。
- 验证：伤害和辅助指标的请求体及展示顺序不变。

### 阶段 6：测试与架构守卫

- 输出：Web 测试迁入包根 `test`，增加路由、功能和底层模块的依赖方向守卫。
- 验证：Web 全量测试、全仓类型检查、构建和测试通过。

## 风险控制

- 先移动纯函数和纯组件，再移动状态；每阶段都运行 Web 类型检查和集成测试。
- 初始重构不将 Controller 状态改写为全局 Store，也不顺带修改 UI。
- 云端同步队列整体迁移，不拆散 revision、pending document、停止标志和定时器。
- 计算对象切换仍由 Controller 原子清理动作、辅助指标、效果选择和旧结果。
- 保留页面级集成测试作为行为契约，架构测试只补目录和依赖边界。
