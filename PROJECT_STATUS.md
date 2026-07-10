# 项目状态 - 弦动 · 网球兵器谱

## 当前状态

**产品目标**：最终做成网球约球/打球平台，帮助用户找球友、约时间、约场地并组织真实对局。
**当前阶段**：人格测试 H5 是冷启动入口，前端完成并已上线 GitHub Pages。后端完成测试结果记录和校验，等有服务器后部署。
**仓库**：https://github.com/qiaopengjun5162/xiandong-tennis（PUBLIC）
**线上地址**：https://qiaopengjun5162.github.io/xiandong-tennis/
**主线**：`main` 持续通过 CI，当前提交以 `git log` 为准。

## 产品路线

- 当前 MVP：用"网球兵器谱"测试完成传播、兴趣识别、玩家风格标签和结果分享。
- 下一阶段：部署后端，开始沉淀真实用户结果、地区、水平和约球意向数据。
- 后续核心能力：用户档案、约球发布、报名/确认/取消、打球反馈、球友匹配和社区传播。
- 暂未实现：账号体系、场地/时间选择、约球订单或活动生命周期、聊天通知、支付和真实场馆集成。

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
- apps/web/README.md — 前端 H5 的 WASM 生成、本地运行、构建验证和视觉 QA 说明
- PR #9 — 答案完整性、后端结果校验、离线字体构建修复，已合并并部署
- PR #10 — 项目状态文档刷新，已合并
- PR #11 — 本地完整 gate 扩展到 Rust + 前端，已合并
- `just check-all` — 本地完整 gate，覆盖 Rust fmt/clippy/test 与前端 typecheck/lint/WASM/build
- PR 模板与 `pr-body` CI gate — 要求每个 PR 写清摘要、影响边界和真实验证命令
- `docs/frontend-visual-qa.md` — UI 变更截图、交互、响应式和分享海报验收清单
- `docs/operations/manual-gates.md` — 凭据、非本地数据库、部署、代理/证书、GUI 账号状态和私有产物的人工确认边界

## 验证

- `cargo fmt --all -- --check`：ok（2026-07-03）
- `cargo clippy --all-targets --all-features --tests --benches -- -D warnings`：ok（2026-07-03）
- `cargo nextest run --workspace --all-features`：20 passed（2026-07-03）
- `apps/web/node_modules/.bin/tsc --noEmit --project apps/web/tsconfig.json`：ok（2026-07-03）
- `cd apps/web && ./node_modules/.bin/eslint . --ignore-pattern dist --ignore-pattern public/pkg`：ok（2026-07-03）
- `cd apps/web && ./node_modules/.bin/next build --webpack`：ok（2026-07-03）
- `cd apps/web && pnpm build`：ok（2026-07-10，CI 同款默认 Turbopack 构建）
- `node apps/web/e2e/flow.spec.mjs`：ok（2026-07-03，需允许本地监听 `127.0.0.1` 并启动 Chrome）
- `taplo fmt --option reorder_keys=true --check`：当前沙箱会触发 macOS `system-configuration` panic，需在非受限环境或 CI 再确认
- `just check-all`：ok（2026-07-10，覆盖 Rust fmt/clippy/nextest 与前端 typecheck/lint/WASM/Webpack build）
- `pnpm pr:check-body`：本地 fixture 验证 ok（2026-07-10）；CI 会在每个 PR 上执行
- `docs/frontend-visual-qa.md`：文档级流程，随本次 PR body fixture 一起验证
- `docs/operations/manual-gates.md`：文档级流程，随本次文档 PR 验证

## 常用命令

```bash
just wasm                          # 构建 WASM
just check-rust                    # Rust fmt + clippy + test
just check-web                     # 前端 typecheck + lint + WASM + build
just check-all                     # Rust + 前端完整 gate
cd apps/web && pnpm build          # 构建前端
cd apps/web && node e2e/flow.spec.mjs  # E2E
cd apps/web && pnpm dev            # 本地开发
just server                        # 启动后端（需 PostgreSQL）
```
