# 项目状态 - 弦动 · 网球兵器谱

> 本文件用于快速恢复上下文。每次重大进展后更新，避免下次会话重复读取全部文件。

## 当前状态

**阶段**：MVP 已实现并合并到 `main` 分支，开源项目文件已补齐，仓库已公开。  
**仓库**：https://github.com/qiaopengjun5162/xiandong-tennis（PUBLIC）  
**分支**：`main`（最新提交待 PR #4 合并后更新）  
**工作区**：原始目录 `/Users/qiaopengjun/Code/Rust/xiandong-tennis/`

## 已完成

- [x] Rust WASM 核心（`crates/tennis-core`）
  - 16 题武器版题库
  - 计分规则 + 8 种兵器人格
  - WASM 绑定暴露
  - 17 个测试全部通过
- [x] Next.js H5 前端（`apps/web`）
  - 欢迎页 / 答题页 / 结果页
  - html2canvas 分享海报
  - 静态构建成功
- [x] Axum 后端（`crates/server`）
  - `POST /api/results` 接口
  - PostgreSQL 持久化
  - 本地 PostgreSQL 联调成功
- [x] 工程化
  - Cargo workspace + pnpm workspace
  - Justfile
  - `cargo fmt` / `cargo clippy -D warnings` 通过
- [x] 文档
  - README.md / README.zh.md
  - CONTRIBUTING.md
  - CODE_OF_CONDUCT.md
  - CLAUDE.md
  - DEVLOG.md
  - AGENTS.md
- [x] CI/CD
  - `.github/workflows/build.yml`
  - `cliff.toml`
  - 修复 `taplo fmt --check` 失败（PR #2）
- [x] 开源合规
  - MIT LICENSE
  - `.all-contributorsrc`
  - 仓库已设为 PUBLIC
- [x] 开发体验
  - `.pre-commit-config.yaml`（PR #3）

## 关键文件位置

| 内容 | 路径 |
|------|------|
| 项目状态快照 | `PROJECT_STATUS.md` |
| 项目架构与命令 | `CLAUDE.md` |
| 开发日志与踩坑记录 | `DEVLOG.md` |
| 英文 README | `README.md` |
| 中文 README | `README.zh.md` |
| 贡献指南 | `CONTRIBUTING.md` |
| Agent 提示词 | `AGENTS.md` |
| CI/CD | `.github/workflows/build.yml` |
| pre-commit 配置 | `.pre-commit-config.yaml` |
| 常用命令 | `Justfile` |
| WASM 核心 | `crates/tennis-core/src/` |
| 后端 | `crates/server/src/` |
| 前端 | `apps/web/` |
| 共享类型 | `packages/core/src/index.ts` |

## 验证结果

- `cargo test --workspace`：17 个测试通过
- `cargo clippy --all-targets --all-features --tests --benches -- -D warnings`：通过
- `pnpm build`（前端静态构建）：成功
- 后端 API 联调：本地 PostgreSQL 上 `POST /api/results` 返回 `{"id":1,"resultType":"SHIELD","createdAt":"..."}`

## 已知问题

- Docker Hub 在本地无法访问（Bad Gateway），开发中使用的是本地 Homebrew PostgreSQL。
- 前端 WASM 加载使用 `/* webpackIgnore: true */` + `// @ts-ignore`，这是为了绕过 Turbopack 对 `public/pkg` 下 JS 模块的打包限制。

## 待办

- [ ] 浏览器中完整跑一遍答题流程
- [ ] 验证分享海报下载
- [ ] 验证 CI 在 GitHub Actions 中跑通
- [ ] 部署到服务器或静态托管
- [ ] 补充前端测试（可选）

## 常用命令

```bash
just wasm        # 构建 WASM 核心
just server      # 启动后端（需 DATABASE_URL）
just web         # 启动前端
just test        # 运行 Rust 测试
just fmt         # 格式化 Rust + TOML
just clippy      # 静态检查
just check-all   # fmt + clippy + test
```

## 环境变量

后端：
```env
DATABASE_URL=postgres://xiandong:xiandong@localhost:5432/xiandong
PORT=8080
```

前端：
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 上次会话摘要

2026-06-16：
- 完成 MVP 全部功能，合并 PR #1。
- 补齐开源项目文件（README 中英文、CONTRIBUTING、CODE_OF_CONDUCT、LICENSE、AGENTS、all-contributors、CI/CD、cliff.toml）。
- 修复 CI 中 `taplo fmt --check` 失败（PR #2）。
- 添加 `.pre-commit-config.yaml`（PR #3）。
- 仓库已设为 PUBLIC。
