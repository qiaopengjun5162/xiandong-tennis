# AGENTS.md

## Project Shape

- `xiandong-tennis` is a tennis personality quiz MVP built with Rust WASM core + Next.js H5 frontend + Axum backend.
- Business logic (questions, scoring, personality data) lives in `crates/tennis-core` and is exposed via `wasm-bindgen`.
- `apps/web` is a thin UI shell: it loads the WASM module, renders screens, generates share posters, and talks to the backend.
- `crates/server` is a small Axum API that persists quiz results to PostgreSQL.

## Commands

- Format Rust: `cargo fmt --all`
- Format TOML: `taplo fmt --option reorder_keys=true`
- Check: `cargo clippy --all-targets --all-features --tests --benches -- -D warnings`
- Test Rust: `cargo nextest run --workspace --all-features`
- Build WASM: `wasm-pack build crates/tennis-core --target web --out-dir ../../apps/web/public/pkg`
- Check frontend: `cd apps/web && pnpm typecheck && pnpm lint`
- Build frontend locally: `cd apps/web && pnpm exec next build --webpack`
- Run backend: `DATABASE_URL=postgres://xiandong:xiandong@localhost:5432/xiandong cargo run -p xiandong-server`
- Run frontend: `cd apps/web && pnpm dev`
- Full gate: `just check-all`

## Production Standard

- Treat this as a production-grade MVP, not a throwaway demo.
- Every behavior change in `crates/tennis-core` must have a corresponding test in `crates/tennis-core/tests/`.
- Review changes for correctness, error handling, test coverage, documentation drift, and build/release impact before committing.
- Any user-facing UI text, API change, build command, or workflow file must be reflected in `README.md`, `README.zh.md`, `CLAUDE.md`, and `DEVLOG.md` when relevant.
- Prefer small, complete changes that can be formatted, tested, committed, and pushed in the same session.
- Do not leave known broken workflows undocumented. If a local tool is missing, record the exact blocker and the manual verification used instead.

## Implementation Notes

- The WASM glue is loaded from `/pkg/xiandong_tennis_core.js` at runtime; bundlers must ignore it via `/* webpackIgnore: true */`.
- `apps/web/public/pkg/` is gitignored; developers must run `just wasm` after cloning or pulling core changes.
- Quiz answers use a fixed 16-slot shape across frontend and backend; skipped answers are represented as `null`, while scoring filters to valid `A`/`B`/`C`/`D` answers.
- The backend must recompute `result_type` from submitted answers before persisting so stats cannot be polluted by arbitrary client values.
- The frontend intentionally avoids `next/font/google`; production builds must not require remote Google Fonts access.
- `sqlx::query_as!` macros are intentionally avoided in the server to remove the compile-time database dependency; schema migrations run automatically on startup.
- Scoring rules are defined by the product team and documented in `CLAUDE.md`.
- PR CI jobs must not reference tag-only container actions.
- Pushing a `v*` tag triggers `.github/workflows/build.yml` release jobs.
- `just check-all` intentionally includes Rust checks plus frontend typecheck, lint, WASM build, and local Webpack production build; CI still runs the default `pnpm build`.
- Local sandbox verification should prefer `next build --webpack` because default Next/Turbopack builds can fail when the sandbox denies local port/process operations.

## Change Recording

- Update `DEVLOG.md` whenever code, documentation, configuration, build scripts, or workflow files change.
- Each record should include the concrete files or areas changed, validation commands, problems encountered, and how they were resolved.
- If a commit uses `--no-verify`, record the exact hook blocker and the checks that were run manually.
