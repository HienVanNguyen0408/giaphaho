# Implementation Plan: Website Gia Phả Họ Phùng Bát Tràng

**Branch**: `001-gia-pha-ho-phung-bat-trang` | **Date**: 2026-05-05 | **Spec**: `task-prompts/ke_hoach.md`
**Input**: Feature plan from `task-prompts/ke_hoach.md`

## Summary

Fullstack genealogy website for the Phùng Bát Tràng family clan. A Next.js 14 frontend (public + admin in one project) calls a Node.js + Express + TypeScript REST API backed by MongoDB Atlas via Prisma ORM. Features include an interactive family tree (ReactFlow), news/video CMS, role-based admin dashboard (SUPER_ADMIN / CHI_ADMIN), rich text editing (Tiptap), and Cloudinary image uploads.

Frontend guidelines: `/frontend-design`
Backend guidelines: `/nodejs-backend-patterns`

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no untyped `any`); Node.js LTS (≥ 20)
**Primary Dependencies**:
- Backend: Express 4, Prisma 5, JWT (jsonwebtoken), bcrypt, cors, zod (validation)
- Frontend: Next.js 14 (App Router), Tailwind CSS, Shadcn/ui, @xyflow/react, Tiptap, Cloudinary SDK
**Storage**: MongoDB Atlas + Prisma ORM (provider = "mongodb")
**Testing**: Vitest + Supertest (backend); Vitest + React Testing Library (frontend); Playwright (E2E)
**Target Platform**: Web — Frontend → Vercel; Backend → Railway (or VPS)
**Project Type**: Web application (monorepo with `backend/` + `frontend/` sub-projects)
**Performance Goals**: Core Web Vitals — LCP < 2.5 s, INP < 200 ms, CLS < 0.1; Lighthouse ≥ 80
**Constraints**: Mobile responsive (sm/md/lg breakpoints); WCAG 2.1 AA; JWT auth with HTTP-only cookies
**Scale/Scope**: Family genealogy site; multi-branch admin roles; ~hundreds of members initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-Centered Design | ✅ PASS | Concrete user flows defined (tree browsing, news reading, admin CRUD); WCAG 2.1 AA enforced in all UI components |
| II. Component-First Architecture | ✅ PASS | Components split into `public/`, `admin/`, `shared/` — each self-contained with local styles/state/tests |
| III. Test-First Development | ⚠️ VIOLATION JUSTIFIED | Original roadmap placed tests last (Phase 6.3). **CORRECTED**: TDD order enforced in tasks.md — tests written before each module implementation. Tasks must follow red→green→refactor. |
| IV. Performance by Default | ✅ PASS | ISR with TTLs (home 1h, news 30m); `next/image`; no render-blocking; Lighthouse CI gate at ≥ 80 |
| V. Simplicity & Maintainability | ✅ PASS | No premature abstractions; YAGNI; TypeScript strict; clean monorepo |

**Technology Deviation**:
- Original plan specified Jest for backend tests → **corrected to Vitest** (aligns with constitution Testing Standard)

**Complexity Tracking**:

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle III — test ordering corrected | Non-negotiable per constitution | Cannot ship untested backend services or frontend components |
| Two sub-projects (backend/ + frontend/) | Frontend is Next.js; backend is pure Express API — different runtimes, different deploy targets | A single project would mix Next.js API routes with Express, creating confusion and deployment fragility |

## Project Structure

### Documentation (this feature)

```text
specs/001-gia-pha-ho-phung-bat-trang/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── routes/          # Express routers
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic (tested directly)
│   ├── middlewares/     # auth, role, logger
│   ├── utils/           # jwt, bcrypt, response helpers
│   └── app.ts           # App bootstrap
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   ├── unit/            # Service-layer Vitest tests
│   └── integration/     # Supertest API tests
├── .env.example
├── tsconfig.json
└── package.json

frontend/
├── app/
│   ├── (public)/        # Header + Footer layout
│   └── admin/           # Admin routes
├── components/
│   ├── public/
│   ├── admin/
│   └── shared/
├── lib/
│   └── api.ts           # Fetch wrapper
├── types/
│   └── index.ts
├── middleware.ts         # JWT guard for /admin/*
├── tests/
│   ├── unit/            # Vitest + RTL component tests
│   └── e2e/             # Playwright flows
├── .env.local
└── package.json
```

**Structure Decision**: Option 2 (Web application) — separate `backend/` and `frontend/` sub-projects sharing a git monorepo. No shared packages needed at this scale.
