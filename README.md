# 弦动 · 网球兵器谱
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

![GitHub release (latest by date)](https://img.shields.io/github/v/release/qiaopengjun5162/xiandong-tennis)
![GitHub license](https://img.shields.io/github/license/qiaopengjun5162/xiandong-tennis)
![Rust](https://img.shields.io/badge/Rust-1.88.0-orange?logo=rust)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)

## Chinese Documentation

中文文档请参阅 [README.zh.md](README.zh.md)。

## Overview

`xiandong-tennis` is a weapon-themed tennis personality quiz H5 app. It identifies a player's "court weapon" through 16 fun questions and generates a shareable poster.

The project is intentionally split so that the core logic can be reused across Web and future WeChat Mini Program clients:

- **Rust WASM core** (`crates/tennis-core`): questions, scoring, and personality data.
- **Next.js H5 frontend** (`apps/web`): quiz flow, result screen, and poster generation.
- **Axum backend** (`crates/server`): persists quiz results to PostgreSQL.

## Features

- 16 weapon-themed tennis questions.
- 8 personality results: Shield, Hammer, Dagger, Potato, Swiss Knife, Chain Mace, Lance, Katana.
- Rust WASM core shared across platforms.
- Share poster generation via `html2canvas`.
- Backend result recording with Axum + sqlx + PostgreSQL; the API recomputes the result from submitted answers before persisting.

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/)
- [Node.js](https://nodejs.org/) + [pnpm](https://pnpm.io/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
- PostgreSQL (local or Docker)

### Run Locally

```bash
# 1. Start PostgreSQL
docker run -d -e POSTGRES_USER=xiandong -e POSTGRES_PASSWORD=xiandong -e POSTGRES_DB=xiandong -p 5432:5432 postgres:16

# 2. Install frontend dependencies
pnpm install

# 3. Build the WASM core
just wasm

# 4. Start the backend
just server

# 5. In another terminal, start the frontend
just web
```

Open http://localhost:3000 and take the quiz.

## Project Structure

```
xiandong-tennis/
├── crates/tennis-core    # Rust WASM core (questions + scoring + personalities)
├── crates/server         # Axum backend API
├── apps/web              # Next.js H5 frontend
├── packages/core         # Shared TypeScript types
├── Justfile              # Common development tasks
├── README.md             # This file
├── README.zh.md          # Chinese documentation
├── CONTRIBUTING.md       # Contribution guidelines
├── CLAUDE.md             # Project architecture and commands
└── DEVLOG.md             # Development log
```

## Development Workflow

```bash
just test        # Run Rust tests
just fmt         # Format Rust + TOML
just clippy      # Run Clippy lints
just check-rust  # fmt + clippy + Rust tests
just check-web   # frontend typecheck + lint + WASM build + production build
just check-all   # full Rust + frontend gate
pnpm pr:check-body # validate filled PR template in CI
```

Skipped quiz answers are submitted as `null` slots so every stored result keeps the fixed 16-question shape while scoring still uses only valid `A`/`B`/`C`/`D` answers.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to report issues, submit pull requests, or improve the project.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/qiaopengjun5162"><img src="https://avatars.githubusercontent.com/u/124650229?v=4?s=100" width="100px;" alt="Paxon Qiao 乔鹏军"/><br /><sub><b>Paxon Qiao 乔鹏军</b></sub></a><br /><a href="#content-qiaopengjun5162" title="Content">🖋</a> <a href="#code-qiaopengjun5162" title="Code">💻</a> <a href="#doc-qiaopengjun5162" title="Documentation">📖</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

This project is licensed under the [MIT License](LICENSE).
