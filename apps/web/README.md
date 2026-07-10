# xiandong-tennis web

`apps/web` is the Next.js H5 shell for `xiandong-tennis`. It keeps UI and platform I/O in TypeScript while quiz questions, scoring, and personality data stay in the Rust WASM core.

## Responsibilities

- Load `/pkg/xiandong_tennis_core.js` at runtime with `webpackIgnore`.
- Render the welcome, quiz, result, sharing, and poster screens.
- Preserve the fixed 16-slot answer shape, using `null` for skipped questions.
- Submit results to the Axum API when available without blocking the user flow.
- Build a static export for GitHub Pages under the `/xiandong-tennis` base path.

## Generated WASM

`public/pkg/` is generated and gitignored. Do not edit it by hand.

```bash
just wasm
```

Run this from the repository root after changing `crates/tennis-core` or before building the frontend from a fresh checkout.

## Local Development

```bash
pnpm install
just wasm
cd apps/web
pnpm dev
```

The frontend defaults to `http://localhost:8080` for API calls. To point it at another backend, set `NEXT_PUBLIC_API_URL` before starting or building the app.

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080 pnpm dev
```

## Verification

```bash
cd apps/web
pnpm typecheck
pnpm lint
pnpm exec next build --webpack
pnpm build
```

Use `next build --webpack` for deterministic local sandbox verification. CI still runs the default `pnpm build`.

The E2E smoke test serves the static `dist/` output, so build first:

```bash
cd apps/web
pnpm build
node e2e/flow.spec.mjs
```

The E2E script needs permission to bind `127.0.0.1` and launch Chrome.

## UI QA

UI-affecting changes must follow [`../../docs/frontend-visual-qa.md`](../../docs/frontend-visual-qa.md) and fill the PR template's `Visual Evidence` section. The share poster should be checked separately because it is rendered through `html2canvas`.

## Production Notes

- Production builds must not depend on `next/font/google` or remote Google Fonts.
- The static export writes to `dist/`.
- `basePath` and `assetPrefix` are `/xiandong-tennis` in production and empty in development.
