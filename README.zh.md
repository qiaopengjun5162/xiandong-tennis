# 弦动 · 网球兵器谱

![GitHub release (latest by date)](https://img.shields.io/github/v/release/qiaopengjun5162/xiandong-tennis)
![GitHub license](https://img.shields.io/github/license/qiaopengjun5162/xiandong-tennis)
![Rust](https://img.shields.io/badge/Rust-1.88.0-orange?logo=rust)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)

## 概览

`弦动 · 网球兵器谱` 是一个以武器为主题的网球人格测试 H5 应用。通过 16 道趣味题目鉴定用户的"球场兵器"，并生成可分享的海报。

项目采用分层架构，核心逻辑可以复用到 Web 端和未来的微信小程序端：

- **Rust WASM 核心**（`crates/tennis-core`）：题库、计分规则、人格数据。
- **Next.js H5 前端**（`apps/web`）：答题流程、结果展示、海报生成。
- **Axum 后端**（`crates/server`）：将测试结果持久化到 PostgreSQL。

## 功能

- 16 道武器主题网球题。
- 8 种人格结果：铁壁盾卫、狂怒战斧、影刃刺客、摆烂地雷、万能军刀、狂乱链枷、冲锋骑枪、禅意太刀。
- Rust WASM 核心跨端复用。
- 使用 `html2canvas` 生成分享海报。
- 后端通过 Axum + sqlx + PostgreSQL 记录结果，并在入库前按答案重新计算校验结果类型。

## 快速开始

### 前置要求

- [Rust](https://rustup.rs/)
- [Node.js](https://nodejs.org/) + [pnpm](https://pnpm.io/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
- PostgreSQL（本地或 Docker）

### 本地运行

```bash
# 1. 启动 PostgreSQL
docker run -d -e POSTGRES_USER=xiandong -e POSTGRES_PASSWORD=xiandong -e POSTGRES_DB=xiandong -p 5432:5432 postgres:16

# 2. 安装前端依赖
pnpm install

# 3. 构建 WASM 核心
just wasm

# 4. 启动后端
just server

# 5. 另开一个终端启动前端
just web
```

打开 http://localhost:3000 即可答题。

## 项目结构

```
xiandong-tennis/
├── crates/tennis-core    # Rust WASM 核心（题目、计分、人格数据）
├── crates/server         # Axum 后端 API
├── apps/web              # Next.js H5 前端
├── packages/core         # 共享 TypeScript 类型
├── Justfile              # 常用开发命令
├── README.md             # 英文文档
├── README.zh.md          # 本文件（中文文档）
├── CONTRIBUTING.md       # 贡献指南
├── CLAUDE.md             # 项目架构与命令速查
└── DEVLOG.md             # 开发日志
```

## 开发工作流

```bash
just test        # 运行 Rust 测试
just fmt         # 格式化 Rust + TOML
just clippy      # 运行 Clippy 检查
just check-all   # fmt + clippy + test
```

跳过题会以 `null` 槽位提交，因此每条记录都保留固定 16 题结构；计分仍只统计有效的 `A`/`B`/`C`/`D` 答案。

## 贡献

我们欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何报告问题、提交拉取请求或改进项目。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。
