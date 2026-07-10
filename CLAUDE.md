# CLAUDE.md - 弦动 · 网球兵器谱

## 项目简介

最终目标是做一个网球约球/打球平台，帮助用户找球友、约时间、约场地，并组织真实线下对局。

当前已经实现的是网球人格测试 H5，作为网球社区/约球平台的冷启动入口，用于传播、识别玩家风格、沉淀初始标签，并把用户引向后续约球流程。

当前仓库还没有实现账号体系、约球发布、报名确认、聊天通知、支付或场馆集成；这些属于测试入口跑通后的后续产品能力。

## 技术栈

- 核心：Rust + wasm-bindgen（题目、计分、人格数据）
- 前端：Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- 后端：Rust + Axum + sqlx + PostgreSQL
- 部署：前端 GitHub Pages；后端待服务器部署

## 架构

```mermaid
flowchart LR
    Browser[用户手机浏览器]
    Web[Next.js H5\nlocalhost:3000]
    Api[Axum API\nlocalhost:8080]
    Wasm[Rust WASM 核心\ncrates/tennis-core]
    Db[(PostgreSQL)]

    Browser --> Web
    Web -- WASM 调用 --> Wasm
    Web -- POST /api/results --> Api
    Api -- 持久化 --> Db
```

## 答题流程

```mermaid
flowchart TD
    Welcome[欢迎页] -- 开始测试 --> Quiz[答题页 16 题]
    Quiz -- 答完第 16 题 --> Result[结果页]
    Result -- 重新淬炼 --> Welcome
    Result -- 生成兵器卡 --> Poster[分享海报 PNG]
```

## 约球产品路线

当前人格测试负责冷启动和玩家风格标签，场地库负责承接到真实打球场景。后续约球能力应围绕用户档案、场地选择、约球发布、报名确认、取消和打球反馈逐步展开。

当前已新增场地只读 API：

- `GET /api/venues`：场地列表，支持 `area`、`q`、`limit`
- `GET /api/venues/areas`：已导入场地片区及数量

场地数据来源可参考 `docs/product/venue-directory.md`；截图里的手机号、微信号等联系方式不能直接作为 seed 数据提交。

## 计分规则

1. 前端保留固定 16 题答案槽位；跳过题为 `null`，计分只统计有效 A/B/C/D。
2. 最高项比第二名多 2 个及以上：
   - A → 铁壁盾卫
   - B → 狂怒战斧
   - C → 影刃刺客
   - D → 摆烂地雷
3. 前两名差距小于 2：
   - A+B → 万能军刀
   - B+C → 狂乱链枷
   - C+D → 冲锋骑枪
   - A+D → 禅意太刀
4. 三向并列等未覆盖情况：以第 16 题答案为准。
5. 后端入库前必须用同一套 Rust core 规则重新计算 `result_type` 并校验客户端提交值。

## 常用命令

```bash
just wasm        # 构建 WASM 核心
just server      # 启动后端
just web         # 启动前端
just dev         # 一键启动完整环境（手动分别启动）
just test        # 运行所有 Rust 测试
just fmt         # 格式化 Rust + TOML
just clippy      # 运行 Clippy
just check-rust  # Rust 格式化 + Clippy + 测试
just check-web   # 前端类型检查 + lint + WASM 构建 + 生产构建
just check-all   # Rust + 前端完整提交前检查
pnpm pr:check-body # CI 中校验 PR 模板填写完整
```

## 开发工作流

1. 每次修改后运行 `cargo fmt` 和 `cargo clippy`。
2. 测试使用 `cargo nextest run`。
3. 提交前运行 `just check-all`。
4. 重大变更后更新本文档和 README。

## 架构原则

- 业务逻辑全部下沉到 Rust WASM。
- TypeScript 只做 UI 渲染和平台 API 调用。
- 前端生产构建不依赖 `next/font/google`，避免 CI/国内网络环境因 Google Fonts 拉取失败。
- 本地受限沙箱内优先用 `next build --webpack` 验证生产构建；CI 仍跑默认 `pnpm build`。
- PR 必须写清变更摘要、影响边界和验证命令；CI 会拒绝空模板 PR。
- UI 变更按 `docs/frontend-visual-qa.md` 做截图/录屏验收，并填写 PR 的 `Visual Evidence`。
- 凭据、非本地数据库、生产部署、系统代理/证书、GUI 账号状态和私有产物按 `docs/operations/manual-gates.md` 走人工确认。
- 场地联系方式属于运营/隐私敏感数据，必须先清洗和确认来源边界；仓库内只提交公开可复核的场地元数据。
- 后续微信小程序可复用同一套 WASM 核心。

## 环境变量

后端 `crates/server/.env`：

```env
DATABASE_URL=postgres://xiandong:xiandong@localhost:5432/xiandong
PORT=8080
```

前端 `apps/web/.env.local`：

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```
