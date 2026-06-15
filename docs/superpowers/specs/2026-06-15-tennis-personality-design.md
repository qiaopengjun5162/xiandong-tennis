# 弦动 · 网球兵器谱 MVP 设计文档

**日期**: 2026-06-15  
**状态**: 已确认，待实施  
**目标用户**: 西安本地网球微信群球友  

---

## 1. 目标

打造一个手机端 H5 网球人格测试（武器版），通过趣味答题生成用户的“球场兵器”标签，用于在微信群/朋友圈裂变传播，为后续网球社区/约球平台沉淀种子用户。

本阶段仅验证“测试是否好玩、是否有人愿意分享”，不做完整约球匹配系统。

## 2. 范围

### 2.1 本次做（MVP）

- Rust WASM 核心模块：16 题题库、计分规则、8 种武器人格数据
- Next.js H5 前端：答题流程、结果展示、分享海报
- Axum 后端：接收并存储测试结果到 PostgreSQL
- 本地开发环境跑通，可用 ngrok 给老板演示

### 2.2 本次不做

- 用户登录、账号体系
- 约球匹配、即时通讯
- 动物版切换
- 球场数据接入
- 支付、会员、抽成等商业化功能
- 后台管理界面
- 微信小程序（架构预留，逻辑层可复用 WASM）

## 3. 用户与场景

- **主要用户**: 西安本地网球爱好者，已有 3-5 个微信群、数百人基础
- **使用场景**: 在微信群收到测试链接 → 答题 → 看到结果 → 截图发朋友圈/群
- **核心痛点**: 找球友难、水平不匹配（后续平台阶段解决，本次仅验证流量）

## 4. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 跨端核心 | Rust + wasm-bindgen | 题库、计分、人格数据，Web 和小程序共用 |
| H5 前端 | Next.js 15 + TypeScript | App Router，调用 WASM 核心 |
| UI | Tailwind CSS + shadcn/ui | 按需使用 Button、Card、Progress、RadioGroup |
| 包管理器 | pnpm + Cargo | 前端 pnpm，Rust cargo |
| 海报生成 | html2canvas | 结果页 DOM 转图片，支持长按保存 |
| 后端 | Rust + Axum + sqlx | 轻量 API 服务 |
| 数据库 | PostgreSQL | 本地 Docker 启动，便于后续上云 |
| 部署 | 本地开发 | MVP 先本地跑通，后续再选服务器 |

## 5. 架构

```
用户手机浏览器
    │
    ▼
┌─────────────────┐      ┌─────────────────┐
│   Next.js H5    │      │   Axum API      │
│   (本地 3000)   │ ───▶ │   (本地 8080)   │
│                 │      │                 │
│  - UI 渲染       │      │  - POST /results │
│  - 调用 WASM 核心│      │  - PostgreSQL   │
│  - 海报生成      │      │                 │
└─────────────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Rust WASM 核心  │
│  crates/tennis   │
│                 │
│  - 16 道题目    │
│  - 计分规则     │
│  - 8 种人格数据 │
└─────────────────┘
```

**90/10 Rust-TS 架构原则**：业务算法、数据、状态机全部下沉到 Rust WASM；TypeScript 只做 UI 渲染、平台 API 调用和 HTTP 搬运。

## 6. 目录结构

```
xiandong-tennis/
├── Cargo.toml                    # Rust workspace
├── package.json                  # pnpm workspace
├── pnpm-workspace.yaml
├── Justfile                      # 常用命令
├── crates/
│   ├── tennis-core/              # WASM 核心：题目 + 计分 + 人格数据
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── questions.rs      # 16 道题
│   │       ├── scorer.rs         # 计分规则
│   │       └── personalities.rs  # 8 种人格信息
│   └── server/                   # Axum 后端
│       ├── Cargo.toml
│       ├── migrations/
│       └── src/
│           ├── main.rs
│           ├── routes/
│           └── models/
├── apps/
│   └── web/                      # Next.js H5
│       ├── package.json
│       ├── public/pkg/           # WASM 构建输出
│       └── src/
│           ├── app/
│           ├── components/
│           └── lib/wasm.ts       # WASM 加载器
└── packages/
    └── core/                     # 共享 TS 类型
```

## 7. 数据模型

### 7.1 Rust 核心类型（WASM 暴露）

```rust
#[derive(Clone, Copy, PartialEq)]
pub enum OptionValue { A, B, C, D }

#[derive(Clone)]
pub struct Question {
    pub id: usize,
    pub text: &'static str,
    pub options: [(&'static str, OptionValue); 4],
}

#[derive(Clone, Copy, PartialEq)]
pub enum WeaponPersonality {
    Shield,      // 铁壁盾卫
    Hammer,      // 狂怒战斧
    Dagger,      // 影刃刺客
    Potato,      // 摆烂地雷
    SwissKnife,  // 万能军刀
    ChainMace,   // 狂乱链枷
    Lance,       // 冲锋骑枪
    Katana,      // 禅意太刀
}
```

### 7.2 WASM 导出函数

```rust
#[wasm_bindgen]
pub fn get_questions() -> JsValue;

#[wasm_bindgen]
pub fn calculate_result(answers_json: &str) -> JsValue;

#[wasm_bindgen]
pub fn get_personality_info(personality: &str) -> JsValue;
```

### 7.3 数据库表（PostgreSQL）

```sql
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  answers TEXT NOT NULL,        -- JSON 数组，如 ["A","B","C",...]
  result_type TEXT NOT NULL,    -- 武器人格枚举
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 8. API 设计

### 8.1 提交测试结果

```
POST /api/results
Content-Type: application/json

{
  "answers": ["A", "B", "C", "D", ...],  // 长度 16
  "resultType": "HAMMER"
}
```

响应：

```json
{
  "id": 42,
  "resultType": "HAMMER",
  "createdAt": "2026-06-15T10:30:00Z"
}
```

### 8.2 错误处理

- 答案长度不是 16：返回 `400 Bad Request`
- 包含非法选项值：返回 `400 Bad Request`
- 服务端异常：返回 `500 Internal Server Error`，前端静默忽略，不影响用户体验

## 9. 前端状态与页面

### 9.1 页面状态机

```
Welcome（欢迎页）
   │
   ▼
Quiz（答题页，16 题顺序展示）
   │
   ▼
Result（结果页 + 分享海报 + 重测按钮）
```

### 9.2 欢迎页

- 标题：弦动 · 网球兵器谱
- 副标题：16 题鉴定你的球场兵器
- CTA：开始测试

### 9.3 答题页

- 顶部进度条（当前题号 / 16）
- 题目文本
- 4 个单选选项（A/B/C/D）
- 选择后自动进入下一题
- 支持返回上一题修改

### 9.4 结果页

- 武器人格名称 + 称号
- 打球风格、约球偏好、场地要求、搞笑解析、人生格言
- “生成我的兵器卡”按钮 → 调用 html2canvas 生成图片
- “重新测试”按钮

## 10. 计分规则

计分逻辑放在 `crates/tennis-core/src/scorer.rs`，由 WASM 暴露给前端：

1. 统计 16 题中 A/B/C/D 各自数量
2. 如果最高项比第二名多 2 个及以上：
   - A 最多 → 铁壁盾卫
   - B 最多 → 狂怒战斧
   - C 最多 → 影刃刺客
   - D 最多 → 摆烂地雷
3. 如果前两名差距小于 2：
   - A+B → 万能军刀
   - B+C → 狂乱链枷
   - C+D → 冲锋骑枪
   - A+D → 禅意太刀
4. 三向并列等边界情况：以第 16 题答案为准，映射关系为 A→铁壁盾卫、B→狂怒战斧、C→影刃刺客、D→摆烂地雷

## 11. 部署与开发

### 11.1 本地开发环境

启动 PostgreSQL：

```bash
docker run -d \
  -e POSTGRES_USER=xiandong \
  -e POSTGRES_PASSWORD=xiandong \
  -e POSTGRES_DB=xiandong \
  -p 5432:5432 postgres:16
```

### 11.2 构建与运行

```bash
# 构建 WASM 核心（输出到 web public 目录）
wasm-pack build crates/tennis-core --target web --out-dir ../../apps/web/public/pkg

# 启动后端
cargo run -p xiandong-server

# 启动前端
cd apps/web && pnpm dev
```

### 11.3 Justfile 命令

```justfile
wasm:    # 构建 WASM 核心
    wasm-pack build crates/tennis-core --target web --out-dir ../../apps/web/public/pkg

server:    # 启动后端
    cargo run -p xiandong-server

web:    # 启动前端
    cd apps/web && pnpm dev

dev:    # 一键启动完整环境
    just wasm && just server & just web
```

### 11.4 给老板演示

- **ngrok**：`ngrok http 3000`
- **localtunnel**：`npx localtunnel --port 3000`
- **同一局域网**：直接用本机 IP 访问

### 11.5 环境变量

前端（`apps/web/.env.local`）：

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

后端（`crates/server/.env`）：

```
DATABASE_URL=postgres://xiandong:xiandong@localhost:5432/xiandong
PORT=8080
```

## 12. 时间计划

| 任务 | 预估时间 |
|------|---------|
| 项目初始化 + workspace + Justfile | 0.5 天 |
| Rust WASM 核心（题目 + 计分 + 人格数据） | 0.5 天 |
| Next.js 前端（答题 + 结果页） | 1 天 |
| 海报生成 + 移动端适配 | 0.5 天 |
| Axum 后端 + PostgreSQL + sqlx | 0.5 天 |
| 联调 + 测试 + 修细节 | 0.5 天 |
| **总计** | **2-3 天** |

## 13. 风险与假设

- **假设 1**: 用户愿意在朋友圈分享测试结果。需通过海报质量和社交文案验证。
- **假设 2**: 现有微信群能支撑起第一波传播。如群内参与度低，需转向小红书/抖音引流。
- **风险 1**: html2canvas 在部分微信内置浏览器中生成海报有兼容性问题，需真机测试。
- **风险 2**: WASM 在低端安卓机上首次加载可能较慢，需做加载态兜底。
- **风险 3**: 后端记录结果可能受用户隐私顾虑影响，需在页面底部说明数据用途。

## 14. 后续方向（非本次范围）

- 动物版测试切换
- 用户注册与网球水平自评
- 基于位置和水平的球友匹配
- 接入西安 69 个球场数据
- 教练/培训撮合
- 商业化：会员、订场返点、品牌合作

## 15. 产品形态演进（非本次范围）

- **MVP 阶段**：H5 网页，分享链路最短，无需审核
- **验证后**：微信小程序（Taro + React + 同一套 WASM 核心）
- **成熟后**：原生 App（Tauri / Dioxus）

---

**下一步**: 基于本文档制定详细实施计划并开始开发。
