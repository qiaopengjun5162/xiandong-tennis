# 开发日志 - 弦动 · 网球兵器谱 MVP

## 2026-07-10 会话记录（PR 质量门禁）

### 已完成

- 参考 `/Users/qiaopengjun/Code/qintopia/qintopia-agent-os` 的 PR 模板和 PR body 检查方式，吸收轻量 PR 质量门禁。
- 新增 `.github/PULL_REQUEST_TEMPLATE.md`，要求 PR 填写变更摘要、计划、影响区域、验证命令、生产边界、架构/工具边界和变更记录。
- 新增 `tools/ci/check-pr-body.mjs` 和 `pnpm pr:check-body`，CI 会拒绝空模板、未勾选影响项或缺少验证命令的 PR。
- 更新 build workflow、README、README.zh.md、CONTRIBUTING.md、CLAUDE.md、AGENTS.md、PROJECT_STATUS.md。

### 验证

- `GITHUB_EVENT_NAME=pull_request GITHUB_EVENT_PATH=/private/tmp/xiandong-pr-body-check/empty-event.json node tools/ci/check-pr-body.mjs`：按预期失败，拒绝空 PR body
- `GITHUB_EVENT_NAME=pull_request GITHUB_EVENT_PATH=/private/tmp/xiandong-pr-body-check/valid-event.json node tools/ci/check-pr-body.mjs`：ok
- `GITHUB_EVENT_NAME=pull_request GITHUB_EVENT_PATH=/private/tmp/xiandong-pr-body-check/valid-event.json pnpm pr:check-body`：ok
- `node tools/ci/check-pr-body.mjs`：ok，非 pull_request 事件跳过
- `just check-all`：ok

### 取舍

- 只吸收 qintopia-agent-os 的“PR 证据门禁”实践，不引入它的大型 agents/skills/runtime/deploy 结构，避免把当前 MVP 复杂化。

### 遇到的问题与解决方法

#### 1. checkbox 正则误转义

**现象：**
有效 fixture 中的 `- [x]` 一开始被误判为未勾选。

**解决：**
修正 `tools/ci/check-pr-body.mjs` 中 checkbox 正则，重跑空/有效 fixture 后结果符合预期。

## 2026-07-10 会话记录

### 已完成

- 将 `just check-all` 从 Rust-only 检查扩展为完整本地 gate：Rust fmt/clippy/nextest，加前端 typecheck/lint、WASM 构建和 Webpack 生产构建。
- 新增 `just check-rust` 与 `just check-web`，方便分层验证。
- 更新 README、README.zh.md、CONTRIBUTING.md、CLAUDE.md、AGENTS.md、PROJECT_STATUS.md，修正本地完整检查范围和当前部署状态。

### 验证

- `cargo fmt --all -- --check`：ok
- `cargo clippy --all-targets --all-features --tests --benches -- -D warnings`：ok（`sqlx-postgres` 有 future-incompat 依赖提示）
- `cargo nextest run --workspace --all-features`：20 passed
- `cd apps/web && pnpm typecheck`：ok
- `cd apps/web && pnpm lint`：ok
- `wasm-pack build crates/tennis-core --target web --out-dir ../../apps/web/public/pkg`：ok
- `cd apps/web && pnpm exec next build --webpack`：ok
- `cd apps/web && pnpm build`：ok
- `just check-all`：ok

### 遇到的问题与解决方法

#### 1. `just check-all` 名称与实际覆盖范围不一致

**现象：**
`PROJECT_STATUS.md` 和 `CLAUDE.md` 把 `just check-all` 描述为完整提交前检查，但 `Justfile` 只执行 Rust fmt、Clippy 和 nextest，漏掉前端类型检查、lint 和构建。

**解决：**
保留 Rust-only 的 `check-rust`，新增 `check-web`，再让 `check-all` 串联两者。前端本地构建使用 `next build --webpack`，避免当前受限沙箱下默认 Turbopack 构建不稳定。

#### 2. pnpm 在无网络沙箱下无法完成签名校验

**现象：**
直接运行 `pnpm typecheck` / `pnpm lint` 时，项目声明的 `pnpm@9.0.0` 触发包源签名校验；无网络沙箱返回 `fetch failed`。

**解决：**
带网络权限重跑后 typecheck、lint 和 `just check-all` 全部通过。后续本地受限环境遇到同类报错时，优先确认 pnpm 版本切换/签名校验是否被网络阻断。

## 2026-07-03 会话记录

### 已完成

- 修复答完最后一题时 React 闭包读取旧 `answers`，导致最后一题可能未进入计分/提交的问题。
- 将前端答案提交调整为固定 16 槽结构；跳过题以 `null` 表示，计分只过滤有效 A/B/C/D。
- 后端 `POST /api/results` 入库前重新按 `tennis-core` 计算结果，并拒绝与答案不匹配的 `result_type`。
- 移除 `next/font/google`，改用本地系统中文字体栈，避免生产构建依赖 Google Fonts 网络请求。
- 更新 README、README.zh.md、CLAUDE.md、AGENTS.md、PROJECT_STATUS.md，记录答案槽位、后端校验和字体构建约束。

### 验证

- `cargo test -p xiandong-server routes::results::tests`：3 passed
- `cargo fmt --all -- --check`：ok
- `cargo clippy --all-targets --all-features --tests --benches -- -D warnings`：ok
- `cargo nextest run --workspace --all-features`：20 passed
- `apps/web/node_modules/.bin/tsc --noEmit --project apps/web/tsconfig.json`：ok
- `cd apps/web && ./node_modules/.bin/eslint . --ignore-pattern dist --ignore-pattern public/pkg`：ok
- `cd apps/web && ./node_modules/.bin/next build --webpack`：ok
- `node apps/web/e2e/flow.spec.mjs`：ok（需允许本地监听 `127.0.0.1` 并启动 Chrome）

### 遇到的问题与解决方法

#### 1. E2E 脚本读取旧静态产物

**现象：**
`node apps/web/e2e/flow.spec.mjs` 直接服务 `apps/web/dist`，源码变更后未重新构建时，测试不会覆盖当前源码。

**解决：**
在 E2E 中补充结果提交拦截断言；后续验证完整前端流程前必须先执行 `pnpm build` 生成新的 `dist`。

#### 2. Google Fonts 导致离线生产构建失败

**现象：**
`next build` 在受限网络下拉取 `Geist` / `Geist Mono` 失败。

**解决：**
从 `apps/web/app/layout.tsx` 移除 `next/font/google`，在 `globals.css` 中使用系统中文字体栈。

#### 3. 沙箱限制导致默认 Turbopack 构建和 E2E 端口监听失败

**现象：**
默认 `next build` 在 Turbopack 处理 CSS 时尝试创建进程并绑定端口，当前受限沙箱返回 `Operation not permitted`；E2E 静态服务器监听 `127.0.0.1` 也会在沙箱中 `listen EPERM`。

**解决：**
用 Next.js 16 官方支持的 `next build --webpack` 完成生产构建验证；E2E 在允许本地监听和启动 Chrome 的环境中运行。E2E 脚本已添加 server `error` 处理，避免监听失败时假通过。

#### 4. taplo 在当前沙箱中 panic

**现象：**
`taplo fmt --option reorder_keys=true --check` 触发 `system-configuration` 的 `Attempted to create a NULL object` panic。

**解决：**
本次未修改 TOML；Rust 与前端 gate 已完整验证。TOML 格式需要在非受限本机环境或 CI 中复核。

## 2026-06-16 会话记录

### 已完成

- Rust WASM 核心：题目、计分、人格数据、WASM 绑定
- Next.js H5 前端：欢迎页、答题页、结果页、分享海报
- Axum 后端：结果提交 API、PostgreSQL 持久化
- 工程化：Cargo/pnpm workspace、Justfile、README、CLAUDE.md
- 代码质量：`cargo fmt`、`cargo clippy -D warnings`、17 个测试全部通过
- 前端静态构建成功

### 遇到的问题与解决方法

#### 1. sqlx `query_as!` macro 编译需要数据库连接

**现象：**
```
error: set DATABASE_URL to use query macros online, or run cargo sqlx prepare
```

**原因：**
sqlx 的宏在编译时会连接数据库校验 SQL。

**解决：**
将 `crates/server/src/routes/results.rs` 中的 `sqlx::query_as!` 改为 `sqlx::query_as` 函数，编译时不再校验，运行时仍然通过 `sqlx::migrate!` 自动建表。

#### 2. Next.js 16 + Turbopack 无法直接 import public 下的 WASM 文件

**现象：**
```
Module not found: Can't resolve '../../public/pkg/xiandong_tennis_core.js'
```

**原因：**
Turbopack 会尝试解析动态 import 的模块，而 wasm-pack 生成的胶水文件位于 `public/` 下，不应被打包。

**解决：**
在 `apps/web/lib/wasm.ts` 中使用 `/* webpackIgnore: true */` 让 bundler 跳过该模块，运行时浏览器直接从 `/pkg/xiandong_tennis_core.js` 加载；同时使用 `// @ts-ignore` 绕过 TypeScript 对绝对路径模块的类型检查。

#### 3. node_modules 被误提交

**现象：**
`git add -A` 把 `node_modules` 和 `packages/core/node_modules` 一起提交了。

**原因：**
根目录 `.gitignore` 最初只排除了 `target/`，没有排除 `node_modules/`。

**解决：**
在根目录 `.gitignore` 添加 `**/node_modules/` 和 `.pnpm-store/`，并 `git rm -rf` 已跟踪的 node_modules 文件。

#### 4. shadcn init 创建的项目名为 `next-app` 而非 `web`

**现象：**
`pnpm dlx shadcn@latest init --template next` 在当前目录创建了 `next-app/`。

**原因：**
该命令在已有目录下初始化时不会使用 `--base-color` 等参数，且默认项目名为 `next-app`。

**解决：**
`mv next-app web`，并修改 `apps/web/package.json` 中的 `name` 为 `web`。

#### 5. `.worktrees/tennis-personality/apps/web/apps/web/public/pkg/.gitignore` 错误路径

**现象：**
由于 Bash working directory 在 `apps/web` 和 worktree root 之间漂移，`git add` 时创建了嵌套路径。

**原因：**
Bash 的当前目录在多次 `cd apps/web` 后未切回根目录，导致相对路径解析错误。

**解决：**
后续所有跨目录命令都使用绝对路径 `/Users/qiaopengjun/.../tennis-personality/...`；修复时 `git rm` 错误路径并重新创建正确路径的 `.gitignore`。

#### 6. Docker 拉取 PostgreSQL 镜像失败

**现象：**
```
Error response from daemon: Get "https://registry-1.docker.io/v2/": Bad Gateway
```

**原因：**
OrbStack 虽已启动，但 daemon 访问 Docker Hub 时遇到网关错误；本地 7890 代理对 Docker daemon 无效。

**解决：**
改用本地 Homebrew 安装的 PostgreSQL 17。发现 5432 端口已被占用，使用现有实例并创建 `xiandong` 用户/数据库。后端联调成功：
```bash
DATABASE_URL=postgres://xiandong:xiandong@localhost:5432/xiandong cargo run -p xiandong-server
curl -X POST http://localhost:8080/api/results -d '{"answers":[...],"result_type":"SHIELD"}'
# 返回 {"createdAt":"...","id":1,"resultType":"SHIELD"}
```

#### 7. GitHub push 失败：历史提交中包含 >100MB 的 node_modules 文件

**现象：**
```
remote: error: File node_modules/.../next-swc.darwin-arm64.node is 116.10 MB; this exceeds GitHub's file size limit
```

**原因：**
早期提交误把 `node_modules` 纳入版本控制，即使后续 `.gitignore` 已修复，历史记录里仍有大文件。

**解决：**
使用 `git filter-branch` 重写历史，移除所有 `node_modules`、`dist`、`.next` 目录，然后 `--force-with-lease` 推送。随后创建 PR #1。

#### 8. 前端 dist 目录被误提交

**现象：**
`pnpm build` 后 `apps/web/dist/` 被 `git add -A` 提交。

**原因：**
`apps/web/.gitignore` 默认忽略 `/.next/` 和 `/out/`，但没有忽略 `/dist/`（Next.js 16 静态导出默认使用 `dist` 当 `distDir: 'dist'` 时）。

**解决：**
在 `apps/web/.gitignore` 添加 `/dist/`，并 `git rm -rf apps/web/dist`。

#### 8. prettier 自动格式化导致未提交的 diff

**现象：**
提交后 `git status` 仍显示多个 TSX/TS 文件被修改。

**原因：**
VS Code / Prettier 在保存时自动将单引号改为双引号、调整 import 换行等。

**解决：**
统一运行 prettier 后一次性提交 `style(web): apply prettier formatting`。

### 待办

- [x] 后端联调（本地 PostgreSQL）
- [x] 创建 GitHub 仓库并提交 PR #1
- [ ] 在浏览器中完成一次完整答题流程验证
- [ ] 验证分享海报下载
- [x] 配置 CI/CD（GitHub Actions）
- [ ] 部署到服务器或静态托管

### 参考链接

- PR #1: https://github.com/qiaopengjun5162/xiandong-tennis/pull/1
- 仓库: https://github.com/qiaopengjun5162/xiandong-tennis

### 常用命令速查

```bash
just wasm        # 构建 WASM
just server      # 启动后端（需 DATABASE_URL）
just web         # 启动前端
just test        # 运行 Rust 测试
just fmt         # 格式化
just clippy      # 静态检查
just check-all   # fmt + clippy + test
```
