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

# Format Rust and TOML files.
fmt:
	cargo fmt --all
	taplo fmt --option reorder_keys=true

# Run Clippy lints on all targets.
clippy:
	cargo clippy --all-targets --all-features --tests --benches -- -D warnings

# Full pre-commit checks.
check-all: fmt clippy test
