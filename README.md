# 弦动 · 网球兵器谱

网球人格测试 H5，基于 Rust WASM 核心 + Next.js 前端 + Axum 后端。

## 快速开始

```bash
# 1. 启动 PostgreSQL
docker run -d -e POSTGRES_USER=xiandong -e POSTGRES_PASSWORD=xiandong -e POSTGRES_DB=xiandong -p 5432:5432 postgres:16

# 2. 构建 WASM
wasm-pack build crates/tennis-core --target web --out-dir ../../apps/web/public/pkg

# 3. 启动后端
cargo run -p xiandong-server

# 4. 启动前端
cd apps/web && pnpm dev
```

## 项目结构

```
xiandong-tennis/
├── crates/tennis-core    # Rust WASM 核心（题目、计分、人格数据）
├── crates/server         # Axum 后端 API
├── apps/web              # Next.js H5 前端
└── packages/core         # 共享 TypeScript 类型
```

## 技术栈

- 核心：Rust + wasm-bindgen
- 前端：Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- 后端：Rust + Axum + sqlx + PostgreSQL
- 构建：pnpm workspace + Cargo workspace

## 许可证

MIT
