# Manual Gates

This project is small, but it still touches user-facing pages, GitHub Pages deployment, PostgreSQL data, local browser state, and share artifacts. Use this file before any workflow that could affect credentials, external services, production state, or private local outputs.

## Must Require Explicit Confirmation

- Pushing a `v*` release tag or changing release workflow behavior.
- Deploying or reconfiguring GitHub Pages outside the normal reviewed CI path.
- Running migrations or write operations against any non-local PostgreSQL database.
- Reading, storing, or using real `.env`, `DATABASE_URL`, tokens, cookies, QR secrets, or account credentials.
- Starting GUI/browser automation that depends on an already signed-in account.
- Opening or operating WeChat, browser share UI, wallet UI, or any third-party account UI on the user's behalf.
- Installing or trusting certificates, changing system proxy settings, or starting intercepting proxies.
- Publishing, redistributing, or committing exported third-party/user-generated content.

## Never Do

- Do not print secrets, cookies, database URLs with passwords, auth keys, QR login secrets, or raw credential JSON in chat, logs, reports, or committed files.
- Do not commit local `.env` files, database dumps, generated archives, screenshots with private data, downloaded third-party content, logs, caches, or request dumps.
- Do not bypass login, paywalls, deleted content, private content, or platform permission checks.
- Do not leave system proxy settings or local interceptors enabled after a run.
- Do not describe a destructive or production-affecting action as "verified" unless it actually ran against the intended target and the result was observed.

## Output Artifact Discipline

- Keep local verification artifacts under `/private/tmp`, the system temp directory, or another ignored path unless the artifact is intentionally sanitized documentation.
- For batch-like outputs, write an index or manifest with `source`, `command`, `generated_at`, `status`, and `error` fields so failures are visible.
- Store failures separately instead of hiding them in prose; for example, use `errors.json` or a clearly labeled failure section in `DEVLOG.md`.
- If an artifact must be committed, remove credentials, private URLs, account identifiers, request headers, cookies, and user-specific paths first.

## Safe Prompts

Use short, explicit prompts when a manual gate is needed:

```text
这个步骤会写入非本地数据库。请确认目标 DATABASE_URL 和是否继续。
```

```text
这个步骤需要你自己操作微信/浏览器登录界面。我不会点击或代你操作；你完成后告诉我“已完成”。
```

```text
这个步骤会临时修改系统代理或信任证书。确认后我会先记录当前状态，结束后恢复。
```
