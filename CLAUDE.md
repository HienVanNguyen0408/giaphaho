# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at `specs/001-gia-pha-ho-phung-bat-trang/plan.md`
<!-- SPECKIT END -->

## Project Overview

Fullstack genealogy website for the Phùng Bát Tràng family clan. Git monorepo with two independent sub-projects:

- **`backend/`** — Express 5 + TypeScript REST API, MongoDB Atlas via Prisma ORM, JWT auth (HTTP-only cookies)
- **`frontend/`** — Next.js 16 (App Router), Tailwind CSS 4, React 19

Deploy targets: Frontend → Vercel; Backend → Railway/VPS.

## Commands

### Backend (`cd backend`)
```bash
npm run dev           # ts-node-dev, loads .env.dev
npm run build         # prisma generate + tsc → dist/
npm run test          # vitest run (unit + integration)
npm run test:watch    # vitest interactive
npm run lint          # eslint src --ext .ts
npm run db:push       # push schema to MongoDB Atlas
npm run db:seed       # seed with ts-node prisma/seed.ts
npm run db:seed-chinhanh  # seed branch (chi) data
```

Run a single test file:
```bash
npx vitest run tests/unit/member.service.test.ts
```

### Frontend (`cd frontend`)
```bash
npm run dev           # next dev (port 3000)
npm run build         # next build
npm run test          # vitest run (unit/component tests in tests/unit/)
npm run test:e2e      # playwright test
npm run lint          # next lint
```

## Architecture

### Backend request flow
```
Express app (src/app.ts)
  → activityLogger middleware (logs all mutating requests)
  → routes/  (thin routers, apply authenticate + requireRole)
  → controllers/  (parse req, call service, sendSuccess/sendError)
  → services/  (all business logic; directly testable)
  → Prisma client (src/lib/prisma.ts)
```

Auth uses JWT stored in an HTTP-only cookie (`token`). The `authenticate` middleware reads `req.cookies.token`. Role guard is `requireRole(Role.SUPER_ADMIN)` or `requireRole(Role.CHI_ADMIN)`.

Env loading: `src/app.ts` loads `.env.dev` in development and `.env` in production, then falls back to `.env` for anything not already set.

Required env vars (see `backend/.env.example`):
```
DATABASE_URL          # MongoDB Atlas connection string
JWT_SECRET            # min 32 chars
CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
PORT                  # default 8080
FRONTEND_URL          # comma-separated list for CORS
```

### Frontend request flow

Browser calls go through a transparent Next.js API proxy at `app/proxy/[...path]/route.ts` (`/proxy/*` → backend). Server-side calls hit the backend directly via `NEXT_PUBLIC_API_URL`. All calls use the typed wrapper in `frontend/lib/api.ts` (`apiFetch<T>`).

SSE (Server-Sent Events) for long-running jobs (e.g. member stats recalculation) goes via `subscribeRecalculateEvents()` in `lib/api.ts`.

### App Router layout
```
app/
  layout.tsx                  # root: ThemeProvider, Be Vietnam Pro font
  (public)/                   # header + footer layout
    layout.tsx
    gia-pha/                  # interactive family tree (ReactFlow + dagre)
    thanh-vien/               # member listing
    tim-kiem/                 # search
    tin-tuc/                  # news
    video/                    # videos
  admin/                      # protected admin area
    login/
    (dashboard)/              # dashboard layout, requires auth
      ...
```

Admin auth is enforced by `frontend/middleware.ts` (JWT check on `/admin/*`).

### Components
```
components/
  public/    # public-facing UI
  admin/     # admin dashboard UI
  shared/    # used in both
  providers/ # ThemeProvider (wraps root layout)
```

### Data models (Prisma / MongoDB)
Key models: `User` (auth, roles), `Member` (tree nodes — self-referential via `parentId`), `News`, `Video`, `Section` (homepage blocks), `FooterConfig`, `Notification`, `ActivityLog`, `AnalyticsEvent`.

`Member` tree is a self-referential MongoDB document tree. `generation` and `descendantsCount` are denormalized counters recalculated via the `/api/members/recalculate-stats` SSE endpoint.

## Frontend color rules (enforced)

**Never hardcode colors.** Always use CSS custom properties from `app/globals.css`. Key variables:

| Variable | Purpose |
|---|---|
| `--t-accent` | Primary brand red (#8B0000) |
| `--t-bg` / `--t-surface` / `--t-surface-2` | Backgrounds |
| `--t-text` / `--t-text-2` / `--t-text-3` | Text hierarchy |
| `--t-border` | Borders |
| `--t-success` / `--t-warning` / `--t-error` / `--t-info` | Semantic colors |
| `--t-nav-*` / `--t-footer-*` | Nav and footer tokens |

For alpha variants use `color-mix(in oklch, var(--t-accent) 25%, transparent)` instead of raw `rgba`.

Tailwind brand colors (e.g. `bg-red-700`) must use `bg-[var(--t-accent)]` instead.

## Important notes

- **Next.js version**: This is Next.js 16 — APIs and conventions may differ from training data. Read `node_modules/next/dist/docs/` before writing Next.js-specific code.
- **TypeScript**: strict mode, no untyped `any`.
- **Prisma provider**: `mongodb` — no migrations, use `prisma db push`.
- **Tests**: backend uses Vitest + Supertest; frontend uses Vitest + React Testing Library + jsdom; E2E uses Playwright.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->