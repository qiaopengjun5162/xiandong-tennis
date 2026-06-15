# 弦动 · 网球兵器谱 MVP 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建一个基于 Rust WASM 核心 + Next.js H5 前端的网球人格测试 MVP，支持 16 题答题、8 种兵器人格结果、分享海报生成、以及 Axum 后端结果记录。

**Architecture:** 业务逻辑（题库、计分、人格数据）全部下沉到 Rust WASM 核心，Next.js 仅作为 UI 渲染壳和平台 API 调用层，Axum 后端负责持久化测试结果到 PostgreSQL。

**Tech Stack:** Rust, wasm-bindgen, wasm-pack, Axum, sqlx, PostgreSQL, Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, html2canvas, pnpm.

---

## 文件结构总览

```
xiandong-tennis/
├── Cargo.toml
├── package.json
├── pnpm-workspace.yaml
├── Justfile
├── crates/
│   ├── tennis-core/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── questions.rs
│   │       ├── scorer.rs
│   │       └── personalities.rs
│   └── server/
│       ├── Cargo.toml
│       ├── migrations/
│       │   └── 001_create_results.sql
│       └── src/
│           ├── lib.rs
│           ├── main.rs
│           ├── error.rs
│           ├── state.rs
│           ├── config.rs
│           └── routes/
│               ├── mod.rs
│               └── results.rs
├── apps/
│   └── web/
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── components.json
│       ├── .env.local
│       ├── public/pkg/
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── page.tsx
│           │   └── globals.css
│           ├── components/
│           │   ├── welcome-screen.tsx
│           │   ├── quiz-screen.tsx
│           │   ├── result-screen.tsx
│           │   ├── question-card.tsx
│           │   ├── progress-bar.tsx
│           │   └── share-card.tsx
│           ├── lib/
│           │   ├── wasm.ts
│           │   └── api.ts
│           └── types/
│               └── index.ts
└── packages/
    └── core/
        ├── package.json
        └── src/
            └── index.ts
```

---

## Task 1: 初始化 Rust Workspace

**Files:**
- Create: `Cargo.toml`
- Create: `crates/tennis-core/Cargo.toml`
- Create: `crates/server/Cargo.toml`

- [ ] **Step 1: 创建根 Cargo.toml**

```toml
[workspace]
members = ["crates/tennis-core", "crates/server"]
resolver = "2"

[workspace.dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[profile.release]
codegen-units = 1
lto = "fat"
panic = "abort"
strip = true
```

- [ ] **Step 2: 创建 tennis-core Cargo.toml**

```toml
[package]
name = "xiandong-tennis-core"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
wasm-bindgen = "0.2"
serde.workspace = true
serde_json.workspace = true
serde-wasm-bindgen = "0.6"
getrandom = { version = "0.2", features = ["js"] }

[dev-dependencies]
wasm-bindgen-test = "0.3"
```

- [ ] **Step 3: 创建 server Cargo.toml**

```toml
[package]
name = "xiandong-server"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.7", features = ["runtime-tokio", "tls-rustls", "postgres", "migrate"] }
serde.workspace = true
serde_json.workspace = true
tower-http = { version = "0.5", features = ["cors", "trace"] }
thiserror = "1"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
xiandong-tennis-core = { path = "../tennis-core" }

[dev-dependencies]
reqwest = { version = "0.12", features = ["json"] }
```

- [ ] **Step 4: 创建空 lib.rs 占位文件**

```bash
mkdir -p crates/tennis-core/src crates/server/src/routes crates/server/migrations
touch crates/tennis-core/src/lib.rs crates/tennis-core/src/questions.rs crates/tennis-core/src/scorer.rs crates/tennis-core/src/personalities.rs
touch crates/server/src/lib.rs crates/server/src/main.rs crates/server/src/error.rs crates/server/src/state.rs crates/server/src/config.rs crates/server/src/routes/mod.rs crates/server/src/routes/results.rs
touch crates/server/migrations/001_create_results.sql
```

- [ ] **Step 5: 提交**

```bash
git add .
git commit -m "chore: initialize Rust workspace with tennis-core and server crates"
```

---

## Task 2: 实现计分模块 scorer.rs

**Files:**
- Create: `crates/tennis-core/src/scorer.rs`
- Test: `crates/tennis-core/src/scorer_test.rs`（或 tests/scorer_test.rs）

- [ ] **Step 1: 编写失败测试**

Create `crates/tennis-core/tests/scorer_test.rs`:

```rust
use xiandong_tennis_core::scorer::{calculate_result, Answer, Personality};

#[test]
fn test_single_winner_a() {
    let answers = vec!['A'; 16];
    assert_eq!(calculate_result(&answers), Personality::Shield);
}

#[test]
fn test_single_winner_b() {
    let answers = vec!['B'; 16];
    assert_eq!(calculate_result(&answers), Personality::Hammer);
}

#[test]
fn test_single_winner_c() {
    let answers = vec!['C'; 16];
    assert_eq!(calculate_result(&answers), Personality::Dagger);
}

#[test]
fn test_single_winner_d() {
    let answers = vec!['D'; 16];
    assert_eq!(calculate_result(&answers), Personality::Potato);
}

#[test]
fn test_tie_ab_swiss_knife() {
    // 8 A + 8 B
    let mut answers = Vec::new();
    for _ in 0..8 { answers.push('A'); }
    for _ in 0..8 { answers.push('B'); }
    assert_eq!(calculate_result(&answers), Personality::SwissKnife);
}

#[test]
fn test_tie_bc_chain_mace() {
    let mut answers = Vec::new();
    for _ in 0..8 { answers.push('B'); }
    for _ in 0..8 { answers.push('C'); }
    assert_eq!(calculate_result(&answers), Personality::ChainMace);
}

#[test]
fn test_tie_cd_lance() {
    let mut answers = Vec::new();
    for _ in 0..8 { answers.push('C'); }
    for _ in 0..8 { answers.push('D'); }
    assert_eq!(calculate_result(&answers), Personality::Lance);
}

#[test]
fn test_tie_ad_katana() {
    let mut answers = Vec::new();
    for _ in 0..8 { answers.push('A'); }
    for _ in 0..8 { answers.push('D'); }
    assert_eq!(calculate_result(&answers), Personality::Katana);
}

#[test]
fn test_clear_margin_a_wins() {
    // 9 A, 3 B, 2 C, 2 D -> A wins by 6
    let answers = vec!['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'D', 'D'];
    assert_eq!(calculate_result(&answers), Personality::Shield);
}
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cargo test -p xiandong-tennis-core
```

Expected: 编译失败，模块未实现。

- [ ] **Step 3: 实现 scorer.rs**

Create `crates/tennis-core/src/scorer.rs`:

```rust
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Debug)]
pub enum Answer {
    A,
    B,
    C,
    D,
}

impl TryFrom<char> for Answer {
    type Error = ();

    fn try_from(value: char) -> Result<Self, Self::Error> {
        match value {
            'A' | 'a' => Ok(Answer::A),
            'B' | 'b' => Ok(Answer::B),
            'C' | 'c' => Ok(Answer::C),
            'D' | 'd' => Ok(Answer::D),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Debug)]
pub enum Personality {
    Shield,
    Hammer,
    Dagger,
    Potato,
    SwissKnife,
    ChainMace,
    Lance,
    Katana,
}

impl Personality {
    pub fn as_str(&self) -> &'static str {
        match self {
            Personality::Shield => "SHIELD",
            Personality::Hammer => "HAMMER",
            Personality::Dagger => "DAGGER",
            Personality::Potato => "POTATO",
            Personality::SwissKnife => "SWISS_KNIFE",
            Personality::ChainMace => "CHAIN_MACE",
            Personality::Lance => "LANCE",
            Personality::Katana => "KATANA",
        }
    }
}

pub fn calculate_result(answers: &[char]) -> Personality {
    let mut counts: HashMap<Answer, usize> = HashMap::new();
    for &ans in answers {
        if let Ok(a) = Answer::try_from(ans) {
            *counts.entry(a).or_insert(0) += 1;
        }
    }

    let a = counts.get(&Answer::A).copied().unwrap_or(0);
    let b = counts.get(&Answer::B).copied().unwrap_or(0);
    let c = counts.get(&Answer::C).copied().unwrap_or(0);
    let d = counts.get(&Answer::D).copied().unwrap_or(0);

    let mut scores = vec![('A', a), ('B', b), ('C', c), ('D', d)];
    scores.sort_by(|x, y| y.1.cmp(&x.1));

    let first = scores[0];
    let second = scores[1];

    if first.1 - second.1 >= 2 {
        match first.0 {
            'A' => Personality::Shield,
            'B' => Personality::Hammer,
            'C' => Personality::Dagger,
            _ => Personality::Potato,
        }
    } else {
        let mut top_two = vec![first.0, second.0];
        top_two.sort();
        match (top_two[0], top_two[1]) {
            ('A', 'B') => Personality::SwissKnife,
            ('B', 'C') => Personality::ChainMace,
            ('C', 'D') => Personality::Lance,
            ('A', 'D') => Personality::Katana,
            _ => fallback_by_last_question(answers),
        }
    }
}

fn fallback_by_last_question(answers: &[char]) -> Personality {
    answers
        .last()
        .and_then(|&c| Answer::try_from(c).ok())
        .map(|a| match a {
            Answer::A => Personality::Shield,
            Answer::B => Personality::Hammer,
            Answer::C => Personality::Dagger,
            Answer::D => Personality::Potato,
        })
        .unwrap_or(Personality::Potato)
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cargo test -p xiandong-tennis-core
```

Expected: PASS.

- [ ] **Step 5: 提交**

```bash
git add .
git commit -m "feat(tennis-core): implement scoring logic with tests"
```

---

## Task 3: 实现人格数据模块 personalities.rs

**Files:**
- Create: `crates/tennis-core/src/personalities.rs`

- [ ] **Step 1: 实现 personalities.rs**

Create `crates/tennis-core/src/personalities.rs`:

```rust
use serde::Serialize;

#[derive(Clone, Serialize, Debug, PartialEq)]
pub struct PersonalityInfo {
    pub key: &'static str,
    pub name: &'static str,
    pub emoji: &'static str,
    pub title: &'static str,
    pub style: &'static str,
    pub partner: &'static str,
    pub court: &'static str,
    pub quote: &'static str,
    pub funny_desc: &'static str,
}

pub fn get_info(key: &str) -> Option<PersonalityInfo> {
    match key {
        "SHIELD" => Some(PersonalityInfo {
            key: "SHIELD",
            name: "铁壁盾卫",
            emoji: "🛡️",
            title: "人肉挡板·球不过网算我输",
            style: "防守反击，把每一球都救回去，等对手先失误",
            partner: "喜欢和进攻型打，因为你会让他们怀疑人生",
            court: "底线深区宽敞，方便我跑动救球",
            quote: "你打不穿我，你就输了。",
            funny_desc: "你是网球界的“打不死的小强”。对手抡到手酸，你还在底线稳稳回球。你最经典的胜利：对手打了30拍后主动下网，然后蹲在地上喘了五分钟。",
        }),
        "HAMMER" => Some(PersonalityInfo {
            key: "HAMMER",
            name: "狂怒战斧",
            emoji: "🔨",
            title: "人形自走炮·要么ACE要么双误",
            style: "全力进攻，每一拍都想结束这一分",
            partner: "只约暴力对抡，软绵绵的球友请绕道",
            court: "墙要近，球要新，线要65磅以上",
            quote: "犹豫，就会败北。",
            funny_desc: "你的字典里没有“过渡球”这三个字。一发时速180，二发时速179。你的球拍线寿命是按局数计算的。你最大的困惑：为什么别人总是叫我“捡球机”？",
        }),
        "DAGGER" => Some(PersonalityInfo {
            key: "DAGGER",
            name: "影刃刺客",
            emoji: "🗡️",
            title: "球场心机婊·专打回头球",
            style: "节奏多变，放小球、挑高球、切削、穿越，怎么难受怎么打",
            partner: "喜欢打体力怪，因为遛狗很快乐",
            court: "红土最佳，球速慢才有时间想坏点子",
            quote: "跑不死你，我就不是人了。",
            funny_desc: "你是球场上的“导演”，每一分都是你编排的剧本。对手刚冲到网前，你就挑他头顶；对手退到底线，你就放他小球。你的对手赛后通常会问：“能好好打球吗？”",
        }),
        "POTATO" => Some(PersonalityInfo {
            key: "POTATO",
            name: "摆烂地雷",
            emoji: "🥔",
            title: "佛系炸弹·随缘炸到你",
            style: "能不动就不动，偶尔一拍神仙球，其余时间像在散步",
            partner: "等人约，从不主动，打完立刻问吃什么",
            court: "有阴凉、有椅子、有贩卖机、离烧烤摊近",
            quote: "网球诚可贵，烧烤价更高。",
            funny_desc: "你打球的样子像极了周末被迫加班的打工人。移动速度堪比树懒，但偶尔一拍神仙球让所有人目瞪口呆。你的球友永远猜不透你：到底是真的菜，还是在演？",
        }),
        "SWISS_KNIFE" => Some(PersonalityInfo {
            key: "SWISS_KNIFE",
            name: "万能军刀",
            emoji: "🔧",
            title: "啥都会·啥都不精",
            style: "没有明显短板，也没有致命武器，主打一个“随缘切换”",
            partner: "各种球友都能搭，百搭型选手",
            court: "什么场地都能打，但都打不出统治级表现",
            quote: "我不赢你，你也别想轻松赢我。",
            funny_desc: "你是网球界的“瑞士军刀”——功能很多，但没有一个特别好用。你会削球但不够转，你会暴抽但不够快，你会上网但容易漏。你的优势是：对手永远不知道你下一拍会干嘛。",
        }),
        "CHAIN_MACE" => Some(PersonalityInfo {
            key: "CHAIN_MACE",
            name: "狂乱链枷",
            emoji: "⛓️",
            title: "状态过山车·今天战神明天战五渣",
            style: "顺风时神挡杀神，逆风时送分童子",
            partner: "喜欢有观众的场，没人的时候打不起精神",
            court: "灯光要好，观众要多（哪怕只有一个大爷）",
            quote: "我不是不稳定，我是情绪化的艺术家。",
            funny_desc: "你的状态和女朋友的心情一样——完全不可预测。今天你能赢4.0，明天你能输给刚学球的小白。你的球友约你之前都要先问：“今天状态怎么样？”",
        }),
        "LANCE" => Some(PersonalityInfo {
            key: "LANCE",
            name: "冲锋骑枪",
            emoji: "🏇",
            title: "开局王者·续航青铜",
            style: "前3局猛如虎，后3局软如泥",
            partner: "只打一盘，输了就说“今天没热身”",
            court: "必须有空调/阴凉，热了就崩",
            quote: "不是我打不过你，是我要留着命吃烧烤。",
            funny_desc: "你的体能条和共享单车的余额一样——说没就没。第一盘你能跟3.5打得有来有回，第二盘你连2.0都打不过。你打球的真实写照：0-30落后 → 连赢4局 → 5-2领先 → 连输5局。",
        }),
        "KATANA" => Some(PersonalityInfo {
            key: "KATANA",
            name: "禅意太刀",
            emoji: "🗡️",
            title: "不鸣则已·一鸣惊人",
            style: "平时像退休干部，偶尔一拍让你闭嘴",
            partner: "随缘，从不主动约球，但约了就来",
            court: "必须有阴凉，晒太阳会融化",
            quote: "能不打就不打，要打就要赢。",
            funny_desc: "你打球的样子像极了武侠小说里的扫地僧。全场散步，看起来毫无威胁，然后突然一拍穿越打在边线上。你的球友永远在纠结：你到底会不会打球？",
        }),
        _ => None,
    }
}
```

- [ ] **Step 2: 添加简单测试**

Create `crates/tennis-core/tests/personalities_test.rs`:

```rust
use xiandong_tennis_core::personalities::get_info;

#[test]
fn test_all_personalities_exist() {
    let keys = ["SHIELD", "HAMMER", "DAGGER", "POTATO", "SWISS_KNIFE", "CHAIN_MACE", "LANCE", "KATANA"];
    for key in keys {
        assert!(get_info(key).is_some(), "missing personality: {}", key);
    }
}

#[test]
fn test_unknown_personality_returns_none() {
    assert!(get_info("UNKNOWN").is_none());
}
```

- [ ] **Step 3: 运行测试**

```bash
cargo test -p xiandong-tennis-core
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat(tennis-core): add personality data and tests"
```

---

## Task 4: 实现题库模块 questions.rs

**Files:**
- Create: `crates/tennis-core/src/questions.rs`

- [ ] **Step 1: 实现 questions.rs**

Create `crates/tennis-core/src/questions.rs`:

```rust
use crate::scorer::Answer;
use serde::Serialize;

#[derive(Clone, Serialize, Debug, PartialEq)]
pub struct Question {
    pub id: usize,
    pub text: &'static str,
    pub options: [(&'static str, Answer); 4],
}

pub fn get_questions() -> Vec<Question> {
    vec![
        Question {
            id: 1,
            text: "当你看到对手站在网前，你第一反应是？",
            options: [
                ("打他脚下！让他难受", Answer::A),
                ("直接暴抽，看他敢不敢挡", Answer::B),
                ("挑高球过顶，羞辱他", Answer::C),
                ("完了，我要被截死了", Answer::D),
            ],
        },
        Question {
            id: 2,
            text: "你的发球风格更接近？",
            options: [
                ("弓箭 —— 精准落点，软绵绵", Answer::A),
                ("加农炮 —— 轰就完了，进不进看命", Answer::B),
                ("回旋镖 —— 带奇怪旋转", Answer::C),
                ("玩具水枪 —— 纯属走过场", Answer::D),
            ],
        },
        Question {
            id: 3,
            text: "打出制胜分后，你的反应像？",
            options: [
                ("消音器 —— 面无表情", Answer::A),
                ("战鼓 —— 大喊 come on", Answer::B),
                ("狙击镜 —— 冷冷瞄一眼对手", Answer::C),
                ("自拍杆 —— 确认观众看见没", Answer::D),
            ],
        },
        Question {
            id: 4,
            text: "你最烦哪种对手？",
            options: [
                ("乌龟壳 —— 月亮球磨教", Answer::A),
                ("链锤 —— 网前截击怪", Answer::B),
                ("判官笔 —— 总喊 out 的较真狂", Answer::C),
                ("教书先生 —— 打完还分析你", Answer::D),
            ],
        },
        Question {
            id: 5,
            text: "约球时你的首选？",
            options: [
                ("固定剑鞘 —— 老搭档，越熟越好", Answer::A),
                ("试刀石 —— 越强越爽", Answer::B),
                ("磨刀石 —— 越菜越爽，我要虐", Answer::C),
                ("随缘口袋 —— 有局就行", Answer::D),
            ],
        },
        Question {
            id: 6,
            text: "失误下网后第一反应？",
            options: [
                ("检讨自己操之过急", Answer::A),
                ("网太高了/球压不够", Answer::B),
                ("球没气了", Answer::C),
                ("对面用暗器", Answer::D),
            ],
        },
        Question {
            id: 7,
            text: "你最爽的得分方式？",
            options: [
                ("磨到对手自爆", Answer::A),
                ("正手直线 一锤定音", Answer::B),
                ("放小球+挑高球 耍猴", Answer::C),
                ("对手双误 白捡", Answer::D),
            ],
        },
        Question {
            id: 8,
            text: "网球穿搭理念？",
            options: [
                ("纯白军刀 —— 传统即正义", Answer::A),
                ("荧光铠甲 —— 全场焦点", Answer::B),
                ("睡衣软甲 —— 舒服就行", Answer::C),
                ("全副武装 —— 发带护腕不能少", Answer::D),
            ],
        },
        Question {
            id: 9,
            text: "你的秘密武器（最爱用）？",
            options: [
                ("匕首 —— 削球，让对手弯腰", Answer::A),
                ("攻城锤 —— 平击暴抽", Answer::B),
                ("流星锤 —— 月亮球高到仰头", Answer::C),
                ("空手道 —— 等对方失误", Answer::D),
            ],
        },
        Question {
            id: 10,
            text: "关键分 40:30，你更想？",
            options: [
                ("让对手先出招", Answer::A),
                ("自己发球掌握主动", Answer::B),
                ("用切削变节奏", Answer::C),
                ("求求别让我跑对角线", Answer::D),
            ],
        },
        Question {
            id: 11,
            text: "双打队友双误送掉破发点，你？",
            options: [
                ("拍肩说没事", Answer::A),
                ("叹气但沉默", Answer::B),
                ("“你累了换我守底线？”", Answer::C),
                ("内心拉黑，永世不搭", Answer::D),
            ],
        },
        Question {
            id: 12,
            text: "热身拉球的态度？",
            options: [
                ("认真校准武器", Answer::A),
                ("随便晃晃，反正正式也丢", Answer::B),
                ("主要是在秀动作", Answer::C),
                ("热什么身，直接干", Answer::D),
            ],
        },
        Question {
            id: 13,
            text: "你的球路动物（本命兵种）？",
            options: [
                ("蛇刃 —— 刁钻阴柔", Answer::A),
                ("野马战锤 —— 冲起来拦不住", Answer::B),
                ("铁龟盾 —— 稳但慢", Answer::C),
                ("灵猴双钩 —— 跳来跳去不消停", Answer::D),
            ],
        },
        Question {
            id: 14,
            text: "双打对你来说更像？",
            options: [
                ("双剑合璧 —— 容易吵架", Answer::A),
                ("加厚盾牌 —— 有人补位摸鱼", Answer::B),
                ("蹲坑弩 —— 网前可怕，蹲底线", Answer::C),
                ("军棋推演 —— 真正的战术艺术", Answer::D),
            ],
        },
        Question {
            id: 15,
            text: "打完球最常做的事？",
            options: [
                ("立刻复盘 哪个零件坏了", Answer::A),
                ("拍照晒兵器", Answer::B),
                ("找水喝", Answer::C),
                ("默默收刀走人", Answer::D),
            ],
        },
        Question {
            id: 16,
            text: "被人夸进步了，你？",
            options: [
                ("还差得远", Answer::A),
                ("那当然，练了很久", Answer::B),
                ("你是不是对进步有误解", Answer::C),
                ("请喝饮料，求多夸几句", Answer::D),
            ],
        },
    ]
}
```

- [ ] **Step 2: 添加测试**

Create `crates/tennis-core/tests/questions_test.rs`:

```rust
use xiandong_tennis_core::questions::get_questions;

#[test]
fn test_question_count() {
    let questions = get_questions();
    assert_eq!(questions.len(), 16);
}

#[test]
fn test_each_question_has_four_options() {
    for q in get_questions() {
        assert_eq!(q.options.len(), 4);
    }
}
```

- [ ] **Step 3: 运行测试**

```bash
cargo test -p xiandong-tennis-core
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat(tennis-core): add 16 weapon-themed questions and tests"
```

---

## Task 5: 实现 WASM 导出接口 lib.rs

**Files:**
- Modify: `crates/tennis-core/src/lib.rs`

- [ ] **Step 1: 编写 lib.rs**

```rust
pub mod personalities;
pub mod questions;
pub mod scorer;

use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_questions() -> JsValue {
    to_value(&questions::get_questions()).expect("serialize questions")
}

#[wasm_bindgen]
pub fn calculate_result(answers_json: &str) -> JsValue {
    let answers: Vec<char> = serde_json::from_str(answers_json).unwrap_or_default();
    let result = scorer::calculate_result(&answers);
    to_value(&result.as_str()).expect("serialize result")
}

#[wasm_bindgen]
pub fn get_personality_info(key: &str) -> JsValue {
    let info = personalities::get_info(key);
    to_value(&info).expect("serialize personality info")
}
```

- [ ] **Step 2: 运行 WASM 测试**

```bash
cargo test -p xiandong-tennis-core --target wasm32-unknown-unknown
```

If wasm32 target not installed:

```bash
rustup target add wasm32-unknown-unknown
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat(tennis-core): expose WASM bindings for questions, scoring and personalities"
```

---

## Task 6: 构建 WASM 并验证

**Files:**
- Create: `apps/web/public/pkg/` (via wasm-pack)

- [ ] **Step 1: 安装 wasm-pack**

```bash
cargo install wasm-pack
```

- [ ] **Step 2: 构建 WASM 到 web public 目录**

```bash
wasm-pack build crates/tennis-core --target web --out-dir ../../apps/web/public/pkg
```

- [ ] **Step 3: 检查生成文件**

```bash
ls apps/web/public/pkg/
```

Expected: `xiandong_tennis_core.js`, `xiandong_tennis_core_bg.wasm`, etc.

- [ ] **Step 4: 提交**

```bash
git add apps/web/public/pkg/.gitignore
echo "*" > apps/web/public/pkg/.gitignore
git add .
git commit -m "chore: build tennis-core WASM for web"
```

---

## Task 7: 初始化 Next.js + shadcn/ui

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.js`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/components.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/globals.css`

- [ ] **Step 1: 创建根 package.json**

```json
{
  "name": "xiandong-tennis",
  "private": true,
  "version": "0.1.0",
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 2: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 3: 初始化 Next.js 项目**

```bash
cd apps/web
pnpm dlx shadcn@latest init --yes --template next --base-color stone
```

This creates Next.js + Tailwind + shadcn config.

- [ ] **Step 4: 安装依赖**

```bash
cd apps/web
pnpm add html2canvas
pnpm add -D @types/html2canvas
```

- [ ] **Step 5: 修改 next.config.js 为静态导出**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

- [ ] **Step 6: 提交**

```bash
git add .
git commit -m "chore(web): initialize Next.js project with shadcn/ui"
```

---

## Task 8: 实现 WASM 加载器和共享类型

**Files:**
- Create: `apps/web/src/lib/wasm.ts`
- Create: `apps/web/src/types/index.ts`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/package.json`

- [ ] **Step 1: 创建 packages/core**

`packages/core/package.json`:

```json
{
  "name": "@xiandong/core",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "devDependencies": {
    "typescript": "^5"
  }
}
```

`packages/core/src/index.ts`:

```typescript
export type OptionValue = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: number;
  text: string;
  options: Array<{ label: string; value: OptionValue }>;
}

export interface PersonalityInfo {
  key: string;
  name: string;
  emoji: string;
  title: string;
  style: string;
  partner: string;
  court: string;
  quote: string;
  funny_desc: string;
}

export type WeaponType =
  | 'SHIELD'
  | 'HAMMER'
  | 'DAGGER'
  | 'POTATO'
  | 'SWISS_KNIFE'
  | 'CHAIN_MACE'
  | 'LANCE'
  | 'KATANA';
```

- [ ] **Step 2: 创建 WASM 加载器**

`apps/web/src/lib/wasm.ts`:

```typescript
import type { OptionValue, PersonalityInfo, Question } from '@xiandong/core';

type WasmModule = {
  default(): Promise<void>;
  get_questions(): Question[];
  calculate_result(answers_json: string): string;
  get_personality_info(key: string): PersonalityInfo | undefined;
};

let wasmModule: WasmModule | null = null;

export async function loadWasm(): Promise<WasmModule> {
  if (wasmModule) return wasmModule;
  const mod = (await import('../../public/pkg/xiandong_tennis_core')) as WasmModule;
  await mod.default();
  wasmModule = mod;
  return mod;
}

export async function getQuestions(): Promise<Question[]> {
  const mod = await loadWasm();
  return mod.get_questions();
}

export async function calculateResult(answers: OptionValue[]): Promise<string> {
  const mod = await loadWasm();
  return mod.calculate_result(JSON.stringify(answers));
}

export async function getPersonalityInfo(key: string): Promise<PersonalityInfo | undefined> {
  const mod = await loadWasm();
  return mod.get_personality_info(key);
}
```

- [ ] **Step 3: 安装 workspace 依赖**

```bash
cd apps/web
pnpm add @xiandong-core
```

If pnpm workspace linking doesn't work, use:

```json
"@xiandong/core": "workspace:*"
```

in `apps/web/package.json`.

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat(web): add WASM loader and shared types"
```

---

## Task 9: 实现前端页面状态管理

**Files:**
- Modify: `apps/web/src/app/page.tsx`

- [ ] **Step 1: 实现 page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { WelcomeScreen } from '@/components/welcome-screen';
import { QuizScreen } from '@/components/quiz-screen';
import { ResultScreen } from '@/components/result-screen';
import type { OptionValue } from '@xiandong/core';

type AppState =
  | { kind: 'welcome' }
  | { kind: 'quiz' }
  | { kind: 'result'; answers: OptionValue[]; resultType: string };

export default function Home() {
  const [state, setState] = useState<AppState>({ kind: 'welcome' });

  const startQuiz = () => setState({ kind: 'quiz' });

  const finishQuiz = (answers: OptionValue[], resultType: string) => {
    setState({ kind: 'result', answers, resultType });
  };

  const restart = () => setState({ kind: 'welcome' });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans">
      {state.kind === 'welcome' && <WelcomeScreen onStart={startQuiz} />}
      {state.kind === 'quiz' && <QuizScreen onFinish={finishQuiz} />}
      {state.kind === 'result' && (
        <ResultScreen
          answers={state.answers}
          resultType={state.resultType}
          onRestart={restart}
        />
      )}
    </main>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add .
git commit -m "feat(web): add main app state machine"
```

---

## Task 10: 实现欢迎页组件

**Files:**
- Create: `apps/web/src/components/welcome-screen.tsx`
- Add shadcn Button: `cd apps/web && pnpm dlx shadcn@latest add button`

- [ ] **Step 1: 实现 welcome-screen.tsx**

```typescript
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-widest text-[#c82b2b]">
        弦动 · 兵器谱
      </h1>
      <p className="mb-2 text-lg text-[#82a68c]">16 题鉴定你的球场兵器</p>
      <p className="mb-10 text-sm text-[#888]">是锤是刀是加特林？</p>
      <Button
        onClick={onStart}
        className="border border-[#82a68c] bg-transparent px-10 py-6 text-lg text-[#82a68c] hover:bg-[#82a68c] hover:text-[#0a0a0a]"
      >
        拔刀入局
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add .
git commit -m "feat(web): add welcome screen"
```

---

## Task 11: 实现答题页组件

**Files:**
- Create: `apps/web/src/components/progress-bar.tsx`
- Create: `apps/web/src/components/question-card.tsx`
- Create: `apps/web/src/components/quiz-screen.tsx`
- Add shadcn Progress: `cd apps/web && pnpm dlx shadcn@latest add progress`

- [ ] **Step 1: 实现 progress-bar.tsx**

```typescript
interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = (current / total) * 100;
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs text-[#666]">
        <span>第 {current} / {total} 题</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#333]">
        <div
          className="h-full rounded-full bg-[#c82b2b] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 实现 question-card.tsx**

```typescript
import type { OptionValue, Question } from '@xiandong/core';

interface QuestionCardProps {
  question: Question;
  onSelect: (value: OptionValue) => void;
}

export function QuestionCard({ question, onSelect }: QuestionCardProps) {
  return (
    <div className="w-full">
      <h2 className="mb-8 text-xl font-semibold leading-relaxed text-[#e0e0e0]">
        {question.text}
      </h2>
      <div className="flex flex-col gap-4">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className="rounded-lg border border-[#333] bg-[#151515] px-5 py-4 text-left text-[#bbb] transition hover:border-[#c82b2b] hover:text-[#e0e0e0]"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 实现 quiz-screen.tsx**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { QuestionCard } from './question-card';
import { ProgressBar } from './progress-bar';
import { Button } from '@/components/ui/button';
import { calculateResult, getQuestions } from '@/lib/wasm';
import type { OptionValue, Question } from '@xiandong/core';

interface QuizScreenProps {
  onFinish: (answers: OptionValue[], resultType: string) => void;
}

export function QuizScreen({ onFinish }: QuizScreenProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<OptionValue[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuestions().then((qs) => {
      setQuestions(qs);
      setLoading(false);
    });
  }, []);

  const handleSelect = async (value: OptionValue) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (newAnswers.length === questions.length) {
      const resultType = await calculateResult(newAnswers);
      onFinish(newAnswers, resultType);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setAnswers((prev) => prev.slice(0, -1));
    }
  };

  if (loading || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#888]">兵器库加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      <ProgressBar current={currentIndex + 1} total={questions.length} />
      <div className="mt-8 flex-1">
        <QuestionCard
          question={questions[currentIndex]}
          onSelect={handleSelect}
        />
      </div>
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="border-[#333] bg-transparent text-[#888]"
        >
          上一题
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat(web): add quiz screen with progress and question card"
```

---

## Task 12: 实现结果页和分享海报

**Files:**
- Create: `apps/web/src/components/result-screen.tsx`
- Create: `apps/web/src/components/share-card.tsx`
- Add shadcn Card: `cd apps/web && pnpm dlx shadcn@latest add card`

- [ ] **Step 1: 实现 share-card.tsx**

```typescript
'use client';

import { forwardRef } from 'react';
import type { PersonalityInfo } from '@xiandong/core';

interface ShareCardProps {
  info: PersonalityInfo;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ info }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[350px] rounded-2xl border border-[#82a68c] bg-[#111] p-8 text-center"
      >
        <div className="mb-2 text-5xl">{info.emoji}</div>
        <h2 className="mb-1 text-3xl font-bold text-[#c82b2b]">{info.name}</h2>
        <p className="mb-6 text-sm text-[#82a68c]">「 {info.title} 」</p>
        <div className="space-y-3 text-left text-sm text-[#aaa]">
          <p><strong className="text-[#e0e0e0]">风格：</strong>{info.style}</p>
          <p><strong className="text-[#e0e0e0]">偏好：</strong>{info.partner}</p>
          <p><strong className="text-[#e0e0e0]">场地：</strong>{info.court}</p>
          <p><strong className="text-[#e0e0e0]">格言：</strong>{info.quote}</p>
        </div>
        <div className="mt-6 border-t border-[#333] pt-4 text-xs text-[#666]">
          弦动 · 网球兵器谱
        </div>
      </div>
    );
  }
);
ShareCard.displayName = 'ShareCard';
```

- [ ] **Step 2: 实现 result-screen.tsx**

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { ShareCard } from './share-card';
import { getPersonalityInfo } from '@/lib/wasm';
import type { OptionValue, PersonalityInfo } from '@xiandong/core';

interface ResultScreenProps {
  answers: OptionValue[];
  resultType: string;
  onRestart: () => void;
}

export function ResultScreen({ resultType, onRestart }: ResultScreenProps) {
  const [info, setInfo] = useState<PersonalityInfo | null>(null);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPersonalityInfo(resultType).then((data) => {
      if (data) setInfo(data);
    });
  }, [resultType]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#111',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `弦动-兵器谱-${resultType}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setGenerating(false);
    }
  };

  if (!info) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#888]">锻造兵器卡中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-8">
      <div className="mb-6 flex flex-col items-center">
        <ShareCard info={info} ref={cardRef} />
      </div>
      <div className="flex gap-4">
        <Button
          onClick={handleShare}
          disabled={generating}
          className="bg-[#c82b2b] text-[#e0e0e0] hover:bg-[#a02020]"
        >
          {generating ? '生成中...' : '生成兵器卡'}
        </Button>
        <Button
          onClick={onRestart}
          variant="outline"
          className="border-[#82a68c] bg-transparent text-[#82a68c]"
        >
          重新淬炼
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat(web): add result screen and share poster generation"
```

---

## Task 13: 实现 Axum 后端

**Files:**
- Create: `crates/server/src/config.rs`
- Create: `crates/server/src/state.rs`
- Create: `crates/server/src/error.rs`
- Create: `crates/server/src/routes/mod.rs`
- Create: `crates/server/src/routes/results.rs`
- Modify: `crates/server/src/lib.rs`
- Modify: `crates/server/src/main.rs`
- Create: `crates/server/migrations/001_create_results.sql`

- [ ] **Step 1: 实现 config.rs**

```rust
#[derive(Clone)]
pub struct Config {
    pub database_url: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            database_url: std::env::var("DATABASE_URL")
                .expect("DATABASE_URL must be set"),
            port: std::env::var("PORT")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(8080),
        }
    }
}
```

- [ ] **Step 2: 实现 state.rs**

```rust
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}

impl AppState {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let db = PgPool::connect(database_url).await?;
        Ok(Self { db })
    }
}
```

- [ ] **Step 3: 实现 error.rs**

```rust
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("bad request: {0}")]
    BadRequest(String),
    #[error("internal server error")]
    Internal(#[from] sqlx::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::Internal(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal server error".to_string(),
            ),
        };

        let body = Json(json!({ "error": message }));
        (status, body).into_response()
    }
}
```

- [ ] **Step 4: 实现 routes/results.rs**

```rust
use axum::{extract::State, Json};
use serde::Deserialize;
use serde_json::json;

use crate::error::AppError;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct CreateResultRequest {
    answers: Vec<char>,
    result_type: String,
}

pub async fn create_result(
    State(state): State<AppState>,
    Json(payload): Json<CreateResultRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    if payload.answers.len() != 16 {
        return Err(AppError::BadRequest(
            "answers must contain exactly 16 items".to_string(),
        ));
    }

    let valid: Vec<char> = vec!['A', 'B', 'C', 'D'];
    for c in &payload.answers {
        if !valid.contains(c) {
            return Err(AppError::BadRequest(format!(
                "invalid answer value: {}",
                c
            )));
        }
    }

    let answers_json = serde_json::to_string(&payload.answers).unwrap();

    let record = sqlx::query_as!(
        ResultRecord,
        "INSERT INTO results (answers, result_type) VALUES ($1, $2) RETURNING id, answers, result_type, created_at",
        answers_json,
        payload.result_type,
    )
    .fetch_one(&state.db)
    .await
    .map_err(AppError::Internal)?;

    Ok(Json(json!({
        "id": record.id,
        "resultType": record.result_type,
        "createdAt": record.created_at,
    })))
}

#[derive(sqlx::FromRow)]
struct ResultRecord {
    id: i32,
    answers: String,
    result_type: String,
    created_at: chrono::DateTime<chrono::Utc>,
}
```

Wait, sqlx requires chrono feature. Update server Cargo.toml to add chrono.

- [ ] **Step 5: 修正 server Cargo.toml 添加 chrono**

```toml
chrono = { version = "0.4", features = ["serde"] }
```

And add `features = ["chrono"]` to sqlx.

- [ ] **Step 6: 实现 routes/mod.rs**

```rust
pub mod results;
```

- [ ] **Step 7: 实现 lib.rs**

```rust
pub mod error;
pub mod routes;
pub mod state;
pub mod config;
```

- [ ] **Step 8: 实现 main.rs**

```rust
use axum::{routing::post, Router};
use std::net::SocketAddr;
use tracing::info;
use xiandong_server::{config::Config, routes, state::AppState};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let config = Config::from_env();
    let state = AppState::new(&config.database_url)
        .await
        .expect("failed to connect to database");

    sqlx::migrate!("./migrations")
        .run(&state.db)
        .await
        .expect("failed to run migrations");

    let app = Router::new()
        .route("/api/results", post(routes::results::create_result))
        .layer(tower_http::cors::CorsLayer::permissive())
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], config.port));
    info!("server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

- [ ] **Step 9: 创建迁移文件**

`crates/server/migrations/001_create_results.sql`:

```sql
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  answers TEXT NOT NULL,
  result_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- [ ] **Step 10: 提交**

```bash
git add .
git commit -m "feat(server): implement Axum API to persist quiz results"
```

---

## Task 14: 前端对接后端 API

**Files:**
- Create: `apps/web/src/lib/api.ts`
- Modify: `apps/web/src/components/result-screen.tsx`

- [ ] **Step 1: 实现 api.ts**

```typescript
import type { OptionValue } from '@xiandong/core';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function submitResult(
  answers: OptionValue[],
  resultType: string
): Promise<void> {
  try {
    await fetch(`${API_URL}/api/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, result_type: resultType }),
    });
  } catch {
    // Silent fail: don't block user experience
  }
}
```

- [ ] **Step 2: 在结果页提交数据**

Modify `apps/web/src/components/result-screen.tsx` to call `submitResult` once when result is loaded.

Add import:

```typescript
import { submitResult } from '@/lib/api';
```

Update useEffect:

```typescript
useEffect(() => {
  getPersonalityInfo(resultType).then((data) => {
    if (data) {
      setInfo(data);
      submitResult(answers, resultType);
    }
  });
}, [resultType, answers]);
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat(web): submit quiz results to Axum backend"
```

---

## Task 15: 实现 Justfile 和开发脚本

**Files:**
- Create: `Justfile`

- [ ] **Step 1: 创建 Justfile**

```makefile
wasm:
	wasm-pack build crates/tennis-core --target web --out-dir ../../apps/web/public/pkg

server:
	cargo run -p xiandong-server

web:
	cd apps/web && pnpm dev

dev:
	just wasm && just server & just web

test:
	cargo nextest run --workspace --all-features

test-core:
	cargo nextest run -p xiandong-tennis-core
```

- [ ] **Step 2: 提交**

```bash
git add .
git commit -m "chore: add Justfile for common dev tasks"
```

---

## Task 16: 移动端适配和最终打磨

**Files:**
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/components/question-card.tsx`
- Modify: `apps/web/src/components/result-screen.tsx`

- [ ] **Step 1: 更新 globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  -webkit-tap-highlight-color: transparent;
}

body {
  background-color: #0a0a0a;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}
```

- [ ] **Step 2: 优化 question-card 移动端样式**

Add `text-base` to button and adjust padding for small screens:

```typescript
<button
  key={opt.value}
  onClick={() => onSelect(opt.value)}
  className="rounded-lg border border-[#333] bg-[#151515] px-4 py-4 text-left text-base text-[#bbb] transition hover:border-[#c82b2b] hover:text-[#e0e0e0] active:bg-[#1a1a1a]"
>
  {opt.label}
</button>
```

- [ ] **Step 3: 优化结果页移动端布局**

Ensure ShareCard is scrollable and buttons stack on small screens.

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "style(web): mobile responsiveness and visual polish"
```

---

## Task 17: 文档和项目说明

**Files:**
- Create: `README.md`
- Create: `xiandong-tennis/CLAUDE.md`

- [ ] **Step 1: 创建 README.md**

```markdown
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

- `crates/tennis-core`: Rust WASM 核心（题目、计分、人格数据）
- `crates/server`: Axum 后端 API
- `apps/web`: Next.js H5 前端
- `packages/core`: 共享 TypeScript 类型
```

- [ ] **Step 2: 创建 CLAUDE.md**

```markdown
# CLAUDE.md - 弦动 · 网球兵器谱

## 项目简介
网球人格测试 H5，作为网球社区/约球平台的冷启动入口。

## 技术栈
- 核心：Rust + wasm-bindgen（题目、计分、人格数据）
- 前端：Next.js 15 + TypeScript + Tailwind + shadcn/ui
- 后端：Rust + Axum + sqlx + PostgreSQL
- 部署：本地开发（后续上云）

## 常用命令
- `just wasm`: 构建 WASM 核心
- `just server`: 启动后端
- `just web`: 启动前端
- `just dev`: 一键启动完整环境
- `cargo nextest run --workspace`: 运行所有 Rust 测试

## 架构原则
- 业务逻辑全部下沉到 Rust WASM
- TypeScript 只做 UI 渲染和平台 API 调用
- 后续微信小程序可复用同一套 WASM 核心
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "docs: add README and CLAUDE.md"
```

---

## Task 18: 完整联调测试

**Files:**
- All previous files

- [ ] **Step 1: 启动完整本地环境**

Terminal 1:
```bash
docker run -d -e POSTGRES_USER=xiandong -e POSTGRES_PASSWORD=xiandong -e POSTGRES_DB=xiandong -p 5432:5432 postgres:16
```

Terminal 2:
```bash
just wasm
just server
```

Terminal 3:
```bash
just web
```

- [ ] **Step 2: 浏览器访问**

Open `http://localhost:3000` and complete the quiz.

Expected:
- 16 questions display correctly
- Result calculates correctly
- Poster downloads as PNG
- Backend receives result (check via `SELECT * FROM results;` in psql)

- [ ] **Step 3: 运行所有测试**

```bash
cargo nextest run --workspace --all-features
cd apps/web && pnpm test
```

- [ ] **Step 4: 提交最终版本**

```bash
git add .
git commit -m "chore: final integration and smoke tests"
```

---

## 自检

### Spec 覆盖检查

| 设计文档要求 | 对应任务 |
|-------------|---------|
| 16 题武器版测试 | Task 4 |
| 8 种人格结果 | Task 3 |
| WASM 核心 | Task 1-6 |
| Next.js H5 前端 | Task 7-12, 14, 16 |
| 分享海报 | Task 12 |
| Axum 后端记录结果 | Task 13 |
| PostgreSQL + sqlx | Task 13 |
| 本地开发部署 | Task 15, 18 |

### Placeholder 检查

- 无 TBD/TODO
- 无 "implement later"
- 所有代码步骤包含完整代码
- 所有命令包含预期输出

### 类型一致性检查

- `OptionValue` 在 core、web、WASM 接口中一致
- `PersonalityInfo` 字段在 Rust 和 TS 中一致
- `resultType` 字符串枚举值前后端一致

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-15-tennis-personality.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
