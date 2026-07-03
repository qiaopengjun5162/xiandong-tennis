# 项目状态 - 弦动 · 网球兵器谱

## 当前状态

**阶段**：前端完成，已上线 GitHub Pages。后端完成开发并补充结果校验，等有服务器后部署。
**仓库**：https://github.com/qiaopengjun5162/xiandong-tennis（PUBLIC）
**线上地址**：https://qiaopengjun5162.github.io/xiandong-tennis/
**分支**：`main`（工作区有本地修复改动，提交前以 `git status --short --branch` 为准）

## 前端

- 视觉：羊皮纸米色风格，复刻自 `网球项目/tennis_weapon.html`
- 答题：点击选项选中 + 300ms 后自动下一题，支持"跳过"和"上一题"
- 跳过题：以 `null` 保留 16 题槽位，计分只统计有效答案，避免后端提交少于 16 项
- 结果页：揭晓时网球弹跳动画
- 分享：复制文案、复制结果链接、一键系统分享（微信自动降级为复制）、下载兵器卡 PNG
- 支持 URL 参数 `?r=KEY` 直接查看结果
- WASM 在欢迎页预加载
- E2E 测试覆盖完整流程：`apps/web/e2e/flow.spec.mjs`

## 后端

接口已开发完成，本地调试过 PostgreSQL，待服务器部署；提交结果时会按答案重新计算 `result_type`：
- `POST /api/results` — 提交结果
- `GET /api/results/stats` — 兵器分布统计
- `GET /api/results/latest` — 最近 10 条
- `GET /health` — 健康检查

## 文档

- CONTRIBUTING.md — 贡献指南（含项目结构和开发命令）
- CODE_OF_CONDUCT.md — Contributor Covenant 2.1

## 验证

- `cargo fmt --all -- --check`：ok（2026-07-03）
- `cargo clippy --all-targets --all-features --tests --benches -- -D warnings`：ok（2026-07-03）
- `cargo nextest run --workspace --all-features`：20 passed（2026-07-03）
- `apps/web/node_modules/.bin/tsc --noEmit --project apps/web/tsconfig.json`：ok（2026-07-03）
- `cd apps/web && ./node_modules/.bin/eslint . --ignore-pattern dist --ignore-pattern public/pkg`：ok（2026-07-03）
- `cd apps/web && ./node_modules/.bin/next build --webpack`：ok（2026-07-03）
- `node apps/web/e2e/flow.spec.mjs`：ok（2026-07-03，需允许本地监听 `127.0.0.1` 并启动 Chrome）
- `taplo fmt --option reorder_keys=true --check`：当前沙箱会触发 macOS `system-configuration` panic，需在非受限环境或 CI 再确认

## 常用命令

```bash
just wasm                          # 构建 WASM
just check-all                     # fmt + clippy + test
cd apps/web && pnpm build          # 构建前端
cd apps/web && node e2e/flow.spec.mjs  # E2E
cd apps/web && pnpm dev            # 本地开发
just server                        # 启动后端（需 PostgreSQL）
```
