# 项目状态 - 弦动 · 网球兵器谱

> 本文件用于快速恢复上下文。每次重大进展后更新，避免下次会话重复读取全部文件。

## 当前状态

**阶段**：三个关键 bug 已修复（上一题闪现、微信分享、海报名字覆盖），本地验证全绿，已推送到 GitHub `49fc75d8`，等待 Pages 部署。  
**仓库**：https://github.com/qiaopengjun5162/xiandong-tennis（PUBLIC）  
**线上地址**：https://qiaopengjun5162.github.io/xiandong-tennis/  
**分支**：`main`（`49fc75d8`）  
**工作区**：`/Users/qiaopengjun/Code/Rust/xiandong-tennis/`

## 已完成

- [x] Rust WASM 核心：16 题题库、计分规则、8 种兵器人格、17 个测试全绿
- [x] Next.js H5 前端
  - 视觉复刻为 `网球项目/tennis_weapon.html` 风格
  - 选中自动下一题，保留「上一题」和「重测」
  - 结果页：复制文案、复制链接、一键系统分享、下载兵器卡 PNG
  - 支持 URL 参数 `?r=KEY` 直接查看结果
  - WASM 在欢迎页预加载，消除点击开始测试后的等待
  - E2E 流程测试（`apps/web/e2e/flow.spec.mjs`）
- [x] Axum 后端：`POST /api/results` + PostgreSQL 持久化（仅本地跑通）
- [x] CI/CD：build + deploy 到 GitHub Pages，全部绿灯
- [x] 工程化：Cargo workspace + pnpm workspace、Justfile、pre-commit

## 最新提交修复的 Bug

1. **上一题闪现**：移除了之前的 `useEffect` 自动前进逻辑，改为 `handleSelect` 内联同步跳转，不会再闪现回当前题。
2. **微信转发失败**：检测微信内置浏览器 UA（MicroMessenger），自动降级为复制分享文案，不再调用不可靠的 navigator.share。
3. **海报 PNG 名字被覆盖**：ShareCard 的 emoji 和名字增加了 `mb-4`/`mb-3` 和 `leading-tight`/`leading-none`，html2canvas 渲染时不再重叠。

## 验证结果

- `cargo test --workspace`：17 个测试通过
- `cargo clippy -D warnings`：通过
- `pnpm typecheck` / `pnpm lint` / `pnpm build`：通过
- `node apps/web/e2e/flow.spec.mjs`：通过（欢迎→16题自动→结果→下载/复制）

## 已知问题

- Docker Hub 本地不可用，PostgreSQL 使用 Homebrew 版本。
- WASM 加载用 `/* webpackIgnore: true */`，绕过 Turbopack 限制。
- 后端 API 只在本地跑通，线上未部署服务器。

## 常用命令

```bash
just wasm                          # 构建 WASM
just check-all                     # fmt + clippy + test
cd apps/web && pnpm build          # 构建前端
cd apps/web && node e2e/flow.spec.mjs  # 运行 E2E
```

## 上次会话摘要

2026-06-16（本次会话）：
- 前端视觉从 shadcn 暗色模板完全迁移到 `网球项目/tennis_weapon.html` 羊皮纸风格。
- 修复 WASM options tuple 导致选项空白和 radio 全选 bug。
- 答题交互改为选中自动下一题。
- 结果页新增：复制文案、复制链接、一键系统分享、下载 PNG。
- 修复上一题闪现、微信分享降级、海报名字覆盖。
- 全局 CSS oklch→hex 修复 html2canvas 报错。
- WASM 在欢迎页预加载。
- E2E 自动测试脚本覆盖完整流程。
- 推送 `49fc75d8`，CI build + deploy 全绿。
