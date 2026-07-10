# Build the Rust WASM core for the web frontend.
wasm:
	wasm-pack build crates/tennis-core --target web --out-dir ../../apps/web/public/pkg

# Run the Axum backend server.
server:
	cargo run -p xiandong-server

# Run the Next.js frontend development server.
web:
	cd apps/web && pnpm dev

# Build WASM and start the backend (frontend must be started separately).
dev:
	just wasm && just server & just web

# Run all Rust tests.
test:
	cargo nextest run --workspace --all-features

# Run Rust tests for the WASM core only.
test-core:
	cargo nextest run -p xiandong-tennis-core

# Run frontend type checking.
web-typecheck:
	cd apps/web && pnpm typecheck

# Run frontend lint checks.
web-lint:
	cd apps/web && pnpm lint

# Build the frontend using Webpack for deterministic local verification.
web-build: wasm
	cd apps/web && pnpm exec next build --webpack

# Format Rust and TOML files.
fmt:
	cargo fmt --all
	taplo fmt --option reorder_keys=true

# Run Clippy lints on all targets.
clippy:
	cargo clippy --all-targets --all-features --tests --benches -- -D warnings

# Full Rust checks.
check-rust: fmt clippy test

# Full frontend checks.
check-web: web-typecheck web-lint web-build

# Full pre-commit checks.
check-all: check-rust check-web
