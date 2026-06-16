# 开发日志 - 弦动 · 网球兵器谱 MVP

## 2026-06-16 会话记录

### 已完成

- Rust WASM 核心：题目、计分、人格数据、WASM 绑定
- Next.js H5 前端：欢迎页、答题页、结果页、分享海报
- Axum 后端：结果提交 API、PostgreSQL 持久化
- 工程化：Cargo/pnpm workspace、Justfile、README、CLAUDE.md
- 代码质量：`cargo fmt`、`cargo clippy -D warnings`、17 个测试全部通过
- 前端静态构建成功

### 遇到的问题与解决方法

#### 1. sqlx `query_as!` macro 编译需要数据库连接

**现象：**
```
error: set DATABASE_URL to use query macros online, or run cargo sqlx prepare
```

**原因：**
sqlx 的宏在编译时会连接数据库校验 SQL。

**解决：**
将 `crates/server/src/routes/results.rs` 中的 `sqlx::query_as!` 改为 `sqlx::query_as` 函数，编译时不再校验，运行时仍然通过 `sqlx::migrate!` 自动建表。

#### 2. Next.js 16 + Turbopack 无法直接 import public 下的 WASM 文件

**现象：**
```
Module not found: Can't resolve '../../public/pkg/xiandong_tennis_core.js'
```

**原因：**
Turbopack 会尝试解析动态 import 的模块，而 wasm-pack 生成的胶水文件位于 `public/` 下，不应被打包。

**解决：**
在 `apps/web/lib/wasm.ts` 中使用 `/* webpackIgnore: true */` 让 bundler 跳过该模块，运行时浏览器直接从 `/pkg/xiandong_tennis_core.js` 加载；同时使用 `// @ts-ignore` 绕过 TypeScript 对绝对路径模块的类型检查。

#### 3. node_modules 被误提交

**现象：**
`git add -A` 把 `node_modules` 和 `packages/core/node_modules` 一起提交了。

**原因：**
根目录 `.gitignore` 最初只排除了 `target/`，没有排除 `node_modules/`。

**解决：**
在根目录 `.gitignore` 添加 `**/node_modules/` 和 `.pnpm-store/`，并 `git rm -rf` 已跟踪的 node_modules 文件。

#### 4. shadcn init 创建的项目名为 `next-app` 而非 `web`

**现象：**
`pnpm dlx shadcn@latest init --template next` 在当前目录创建了 `next-app/`。

**原因：**
该命令在已有目录下初始化时不会使用 `--base-color` 等参数，且默认项目名为 `next-app`。

**解决：**
`mv next-app web`，并修改 `apps/web/package.json` 中的 `name` 为 `web`。

#### 5. `.worktrees/tennis-personality/apps/web/apps/web/public/pkg/.gitignore` 错误路径

**现象：**
由于 Bash working directory 在 `apps/web` 和 worktree root 之间漂移，`git add` 时创建了嵌套路径。

**原因：**
Bash 的当前目录在多次 `cd apps/web` 后未切回根目录，导致相对路径解析错误。

**解决：**
后续所有跨目录命令都使用绝对路径 `/Users/qiaopengjun/.../tennis-personality/...`；修复时 `git rm` 错误路径并重新创建正确路径的 `.gitignore`。

#### 6. Docker 拉取 PostgreSQL 镜像失败

**现象：**
```
Error response from daemon: Get "https://registry-1.docker.io/v2/": Bad Gateway
```

**原因：**
OrbStack 虽已启动，但 daemon 访问 Docker Hub 时遇到网关错误；本地 7890 代理对 Docker daemon 无效。

**解决：**
改用本地 Homebrew 安装的 PostgreSQL 17。发现 5432 端口已被占用，使用现有实例并创建 `xiandong` 用户/数据库。后端联调成功：
```bash
DATABASE_URL=postgres://xiandong:xiandong@localhost:5432/xiandong cargo run -p xiandong-server
curl -X POST http://localhost:8080/api/results -d '{"answers":[...],"result_type":"SHIELD"}'
# 返回 {"createdAt":"...","id":1,"resultType":"SHIELD"}
```

#### 7. GitHub push 失败：历史提交中包含 >100MB 的 node_modules 文件

**现象：**
```
remote: error: File node_modules/.../next-swc.darwin-arm64.node is 116.10 MB; this exceeds GitHub's file size limit
```

**原因：**
早期提交误把 `node_modules` 纳入版本控制，即使后续 `.gitignore` 已修复，历史记录里仍有大文件。

**解决：**
使用 `git filter-branch` 重写历史，移除所有 `node_modules`、`dist`、`.next` 目录，然后 `--force-with-lease` 推送。随后创建 PR #1。

#### 8. 前端 dist 目录被误提交

**现象：**
`pnpm build` 后 `apps/web/dist/` 被 `git add -A` 提交。

**原因：**
`apps/web/.gitignore` 默认忽略 `/.next/` 和 `/out/`，但没有忽略 `/dist/`（Next.js 16 静态导出默认使用 `dist` 当 `distDir: 'dist'` 时）。

**解决：**
在 `apps/web/.gitignore` 添加 `/dist/`，并 `git rm -rf apps/web/dist`。

#### 8. prettier 自动格式化导致未提交的 diff

**现象：**
提交后 `git status` 仍显示多个 TSX/TS 文件被修改。

**原因：**
VS Code / Prettier 在保存时自动将单引号改为双引号、调整 import 换行等。

**解决：**
统一运行 prettier 后一次性提交 `style(web): apply prettier formatting`。

### 待办

- [x] 后端联调（本地 PostgreSQL）
- [x] 创建 GitHub 仓库并提交 PR #1
- [ ] 在浏览器中完成一次完整答题流程验证
- [ ] 验证分享海报下载
- [ ] 配置 CI/CD（GitHub Actions）
- [ ] 部署到服务器或静态托管

### 参考链接

- PR #1: https://github.com/qiaopengjun5162/xiandong-tennis/pull/1
- 仓库: https://github.com/qiaopengjun5162/xiandong-tennis

### 常用命令速查

```bash
just wasm        # 构建 WASM
just server      # 启动后端（需 DATABASE_URL）
just web         # 启动前端
just test        # 运行 Rust 测试
just fmt         # 格式化
just clippy      # 静态检查
just check-all   # fmt + clippy + test
```
