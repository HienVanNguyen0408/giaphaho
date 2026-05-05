# Tasks: Website Gia Phả Họ Phùng Bát Tràng

**Input**: Design documents from `specs/001-gia-pha-ho-phung-bat-trang/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅

**Tests**: Included per constitution Principle III (TDD — NON-NEGOTIABLE). Tests must FAIL before implementation.

**Coding guidelines**:
- Frontend: follow `/frontend-design` skill guidelines
- Backend: follow `/nodejs-backend-patterns` skill guidelines

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story label (US1–US10)
- All tasks include exact file paths

## Path Conventions

- Backend: `backend/src/`, `backend/tests/`, `backend/prisma/`
- Frontend: `frontend/app/`, `frontend/components/`, `frontend/lib/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo skeleton, tooling, and CI scaffolding — no business logic

- [x] T001 Create monorepo root with `backend/` and `frontend/` directories and root `.gitignore` (node_modules, .env, dist, .next, .turbo)
- [x] T002 [P] Initialize backend Node.js + TypeScript project: `npm init`, install express, prisma, @prisma/client, jsonwebtoken, bcrypt, cors, dotenv, zod, cloudinary, multer, and their @types in `backend/package.json`
- [x] T003 [P] Initialize frontend with `npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir` and install shadcn/ui in `frontend/package.json`
- [x] T004 [P] Configure backend TypeScript in `backend/tsconfig.json` (strict: true, target: ES2022, module: NodeNext, outDir: dist)
- [x] T005 [P] Configure Vitest for backend with Supertest in `backend/vitest.config.ts` and add `"test": "vitest run"` to `backend/package.json`
- [x] T006 [P] Configure Vitest + React Testing Library for frontend in `frontend/vitest.config.ts` and add `"test": "vitest run"` to `frontend/package.json`
- [x] T007 [P] Configure Playwright for E2E in `frontend/playwright.config.ts` (baseURL: http://localhost:3000, browsers: chromium)
- [x] T008 [P] Configure ESLint + Prettier for backend in `backend/.eslintrc.json` and `backend/.prettierrc`
- [x] T009 [P] Configure ESLint for frontend (already scaffolded by create-next-app, verify `frontend/.eslintrc.json`)
- [x] T010 [P] Create backend environment template in `backend/.env.example` (DATABASE_URL, JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, PORT=8080)
- [x] T011 [P] Create frontend environment template in `frontend/.env.local.example` (NEXT_PUBLIC_API_URL=http://localhost:8080)
- [x] T012 Add npm scripts to `backend/package.json`: `dev` (ts-node-dev), `build` (tsc), `start` (node dist/app.js), `db:push` (prisma db push), `db:seed` (ts-node prisma/seed.ts)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure and frontend base that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [x] T013 Write complete Prisma schema with all 8 models (User, Member, News, Video, Section, FooterConfig, Notification, ActivityLog) in `backend/prisma/schema.prisma` per `data-model.md`
- [x] T014 Run `npx prisma generate` then `npx prisma db push` to sync schema with MongoDB Atlas (document as setup step)
- [x] T015 [P] Create response utility with `success()` and `error()` envelope helpers in `backend/src/utils/response.ts`
- [x] T016 [P] Create JWT utility (`signToken`, `verifyToken`) using `jsonwebtoken` in `backend/src/utils/jwt.ts`
- [x] T017 [P] Create bcrypt utility (`hashPassword`, `comparePassword`) with rounds=12 in `backend/src/utils/bcrypt.ts`
- [x] T018 Create auth middleware that reads `token` cookie and attaches decoded user to `req.user` in `backend/src/middlewares/auth.middleware.ts`
- [x] T019 Create role middleware factory `requireRole(...roles: Role[])` that checks `req.user.role` and returns 403 if insufficient in `backend/src/middlewares/role.middleware.ts`
- [x] T020 Create logger middleware that writes ActivityLog after each mutating request (POST/PUT/PATCH/DELETE, status < 400) via `res.on('finish', ...)` in `backend/src/middlewares/logger.middleware.ts`
- [x] T021 Create global error handling middleware that returns `{ success: false, message }` in `backend/src/middlewares/error.middleware.ts`
- [x] T022 Create `backend/src/app.ts` bootstrapping Express with CORS (whitelist frontend URL), JSON parser, cookie-parser, all route mounts, and error middleware
- [x] T023 Create seed script: SUPER_ADMIN user + root Member + FooterConfig + 2 sample News + 2 sample Videos in `backend/prisma/seed.ts`

### Frontend Foundation

- [x] T024 [P] Create TypeScript interfaces for all API types (Member, News, Video, Section, FooterConfig, Notification, ActivityLog, User, PaginatedResponse) in `frontend/types/index.ts`
- [x] T025 [P] Create typed `apiFetch` wrapper that reads `NEXT_PUBLIC_API_URL`, sets `credentials: 'include'`, and throws on non-2xx in `frontend/lib/api.ts`
- [x] T026 [P] Create typed API client functions (one per endpoint from `contracts/api.md`) in `frontend/lib/api.ts` (extend the same file)
- [x] T027 Create Next.js middleware guarding `/admin/*`: checks for `token` cookie; if absent redirects to `/admin/login` in `frontend/middleware.ts`
- [x] T028 Create root layout with Vietnamese font (Be Vietnam Pro via `next/font/google`), global CSS vars, and `<Providers>` wrapper in `frontend/app/layout.tsx` and `frontend/app/globals.css`

**Checkpoint**: Backend server starts on port 8080, seed runs successfully, frontend dev server starts on port 3000

---

## Phase 3: User Story 1 - Public Homepage & Navigation (Priority: P1) 🎯 MVP

**Goal**: Visitors can browse the full homepage with hero, pinned news, achievements, latest news, videos, and dynamic sections — fully responsive

**Independent Test**: Start both servers; navigate to `http://localhost:3000`; all 6 sections render with data from the API; no layout shifts on mobile

### Tests for User Story 1 ⚠️ Write these FIRST — confirm they FAIL before implementing

- [x] T029 [P] [US1] Write Vitest integration test for `GET /api/news/pinned` returns pinned news array in `backend/tests/integration/news.pinned.test.ts`
- [x] T030 [P] [US1] Write Vitest integration test for `GET /api/sections` returns only active sections ordered by `order` in `backend/tests/integration/sections.list.test.ts`
- [x] T031 [P] [US1] Write Vitest integration test for `GET /api/videos` returns videos ordered by `order ASC` in `backend/tests/integration/videos.list.test.ts`
- [x] T032 [P] [US1] Write RTL test: `<HeroSection />` renders heading and CTA button in `frontend/tests/unit/HeroSection.test.tsx`
- [x] T033 [P] [US1] Write RTL test: `<TinNoiBat news={[mockNews]} />` renders news card with title and thumbnail in `frontend/tests/unit/TinNoiBat.test.tsx`
- [x] T034 [P] [US1] Write Playwright E2E: homepage at `/` loads all 6 sections without errors in `frontend/tests/e2e/homepage.spec.ts`

### Backend for User Story 1

- [x] T035 [US1] Implement `getPinned()` in `backend/src/services/news.service.ts`
- [x] T036 [US1] Implement `getActiveOrdered()` in `backend/src/services/section.service.ts`
- [x] T037 [US1] Implement `getAllOrdered()` in `backend/src/services/video.service.ts`
- [x] T038 [US1] Add `GET /api/news/pinned`, `GET /api/sections`, `GET /api/videos` handlers to `backend/src/controllers/news.controller.ts`, `backend/src/controllers/section.controller.ts`, `backend/src/controllers/video.controller.ts`
- [x] T039 [US1] Create route files for news, sections, videos and mount them in app.ts: `backend/src/routes/news.route.ts`, `backend/src/routes/section.route.ts`, `backend/src/routes/video.route.ts`

### Frontend for User Story 1

- [x] T040 [P] [US1] Create `<Header />` with site logo, nav links (Trang chủ, Gia phả, Tin tức, Video, Tìm kiếm), mobile hamburger menu in `frontend/components/public/layout/Header.tsx`
- [x] T041 [P] [US1] Create `<Footer />` that fetches `GET /api/footer` and displays contact/description/copyright in `frontend/components/public/layout/Footer.tsx`
- [x] T042 [US1] Create `(public)/layout.tsx` composing `<Header />` + `{children}` + `<Footer />` in `frontend/app/(public)/layout.tsx`
- [x] T043 [P] [US1] Create `<HeroSection />` with full-width banner image, family name heading, and CTA button in `frontend/components/public/home/HeroSection.tsx`
- [x] T044 [P] [US1] Create `<TinNoiBat news={News[]} />` rendering pinned news as a featured card in `frontend/components/public/home/TinNoiBat.tsx`
- [x] T045 [P] [US1] Create `<ThanhTichSection />` showing aggregated achievements from member data in `frontend/components/public/home/ThanhTichSection.tsx`
- [x] T046 [P] [US1] Create `<TinTucSection news={News[]} />` showing 3 latest news cards with "Xem thêm" link in `frontend/components/public/home/TinTucSection.tsx`
- [x] T047 [P] [US1] Create `<VideoSection videos={Video[]} />` showing 3 YouTube embeds in `frontend/components/public/home/VideoSection.tsx`
- [x] T048 [P] [US1] Create `<DynamicSection sections={Section[]} />` rendering active sections in order in `frontend/components/public/home/DynamicSection.tsx`
- [x] T049 [US1] Create homepage `page.tsx` with `revalidate = 3600` that fetches pinned news, 3 videos, active sections, and renders all home components in `frontend/app/(public)/page.tsx`

**Checkpoint**: Navigate to `/`; all sections visible and responsive; Lighthouse mobile score ≥ 80

---

## Phase 4: User Story 2 - Family Tree & Member Profiles (Priority: P2)

**Goal**: Visitors can explore the interactive ReactFlow genealogy tree, click nodes for details, and view full member profiles at `/thanh-vien/:id` with SSR

**Independent Test**: Navigate to `/gia-pha`; tree renders nodes with avatars and names connected by edges; click a node; detail panel opens; navigate to `/thanh-vien/:id` directly; SSR page loads with correct metadata

### Tests for User Story 2 ⚠️ Write FIRST — confirm FAIL before implementing

- [x] T050 [P] [US2] Write Vitest integration test for `GET /api/members` returns flat array with id, fullName, parentId, avatar, birthYear, deathYear in `backend/tests/integration/members.list.test.ts`
- [x] T051 [P] [US2] Write Vitest integration test for `GET /api/members/:id` returns member with populated parent and children in `backend/tests/integration/members.detail.test.ts`
- [x] T052 [P] [US2] Write unit test for `flatToFlowGraph(members)` converts flat array → `{nodes, edges}` correctly in `frontend/tests/unit/treeUtils.test.ts`
- [x] T053 [P] [US2] Write Playwright E2E: `/gia-pha` renders at least one node; clicking it opens member detail panel in `frontend/tests/e2e/family-tree.spec.ts`

### Backend for User Story 2

- [x] T054 [US2] Implement `getAll()` (flat array for tree, select only tree fields) and `getById()` (full detail with parent/children) in `backend/src/services/member.service.ts`
- [x] T055 [US2] Add `GET /api/members` and `GET /api/members/:id` handlers to `backend/src/controllers/member.controller.ts`
- [x] T056 [US2] Create `backend/src/routes/member.route.ts` and mount in app.ts

### Frontend for User Story 2

- [x] T057 [US2] Install `@xyflow/react` in `frontend/package.json`
- [x] T058 [US2] Create `flatToFlowGraph(members: Member[]): { nodes: Node[], edges: Edge[] }` utility in `frontend/lib/treeUtils.ts`
- [x] T059 [US2] Create `<FamilyTree />` component: fetches `GET /api/members`, converts to nodes/edges, renders ReactFlow with zoom/pan, custom MemberNode renderer (avatar + name + years), click-to-open-drawer in `frontend/components/public/gia-pha/FamilyTree.tsx`
- [x] T060 [US2] Create `/gia-pha` page (CSR, dynamic, wraps `<FamilyTree />`) in `frontend/app/(public)/gia-pha/page.tsx`
- [x] T061 [US2] Create `/thanh-vien/[id]` page (SSR): `generateMetadata()` for SEO, displays avatar, bio, achievements, parent/children links in `frontend/app/(public)/thanh-vien/[id]/page.tsx`

**Checkpoint**: `/gia-pha` shows tree with seed data members; clicking a node opens detail; `/thanh-vien/:id` page has correct `<title>` and renders full profile

---

## Phase 5: User Story 3 - News & Articles Browsing (Priority: P3)

**Goal**: Visitors browse paginated news at `/tin-tuc` (SSG) and read full articles at `/tin-tuc/:slug` (ISR 30m)

**Independent Test**: Navigate to `/tin-tuc`; see paginated article cards; click one; navigate to article page; rich-text HTML renders correctly

### Tests for User Story 3 ⚠️ Write FIRST — confirm FAIL

- [x] T062 [P] [US3] Write Vitest integration test for `GET /api/news?page=1&limit=10` returns paginated response with `items, total, page, totalPages` in `backend/tests/integration/news.list.test.ts`
- [x] T063 [P] [US3] Write Vitest integration test for `GET /api/news/:slug` returns full article with content field in `backend/tests/integration/news.slug.test.ts`
- [x] T064 [P] [US3] Write Playwright E2E: `/tin-tuc` lists articles; clicking article navigates to correct slug page in `frontend/tests/e2e/news.spec.ts`

### Backend for User Story 3

- [x] T065 [US3] Add `getList(page, limit)` with pagination and `getBySlug(slug)` to `backend/src/services/news.service.ts`
- [x] T066 [US3] Add `GET /api/news` (paginated) and `GET /api/news/:slug` handlers to `backend/src/controllers/news.controller.ts` (extend existing file)

### Frontend for User Story 3

- [x] T067 [US3] Create `/tin-tuc` page (SSG) with paginated article card list in `frontend/app/(public)/tin-tuc/page.tsx`
- [x] T068 [US3] Create `/tin-tuc/[slug]` page (ISR, `revalidate = 1800`) with `generateMetadata()` and Tiptap HTML rendering in `frontend/app/(public)/tin-tuc/[slug]/page.tsx`

**Checkpoint**: `/tin-tuc` shows seed articles; article detail page renders rich-text HTML; page metadata (title, OG) is correct

---

## Phase 6: User Story 4 - Video Gallery (Priority: P4)

**Goal**: Visitors view an ordered YouTube video grid at `/video`

**Independent Test**: Navigate to `/video`; see responsive grid of YouTube iframes ordered by `order` field

### Tests for User Story 4 ⚠️ Write FIRST — confirm FAIL

- [x] T069 [P] [US4] Write Playwright E2E: `/video` renders at least one YouTube iframe with correct `src` in `frontend/tests/e2e/videos.spec.ts`

### Frontend for User Story 4

- [x] T070 [US4] Create `/video` page (ISR, `revalidate = 3600`) that fetches `GET /api/videos` and renders a responsive grid of YouTube iframes in `frontend/app/(public)/video/page.tsx`

**Checkpoint**: `/video` shows seeded videos in correct order

---

## Phase 7: User Story 5 - Admin Authentication (Priority: P5)

**Goal**: Admins log in via `/admin/login`, get JWT cookie, access dashboard; unauthenticated visits to `/admin/*` redirect to login

**Independent Test**: POST to `/api/auth/login` with seed credentials → 200 + cookie set. Navigate to `/admin` → dashboard loads. Clear cookie → redirect to `/admin/login`

### Tests for User Story 5 ⚠️ Write FIRST — confirm FAIL

- [x] T071 [P] [US5] Write Vitest integration test for `POST /api/auth/login` (valid creds → 200 + Set-Cookie; invalid → 401) in `backend/tests/integration/auth.login.test.ts`
- [x] T072 [P] [US5] Write Vitest integration test for `GET /api/auth/me` (valid cookie → 200 with user; no cookie → 401) in `backend/tests/integration/auth.me.test.ts`
- [x] T073 [P] [US5] Write Playwright E2E: login with seed credentials → redirected to `/admin`; logout → redirected to `/admin/login`; visit `/admin` without session → redirected to `/admin/login` in `frontend/tests/e2e/admin-auth.spec.ts`

### Backend for User Story 5

- [x] T074 [US5] Implement `login(username, password)` in `backend/src/services/auth.service.ts` (bcrypt compare, sign JWT, return user object)
- [x] T075 [US5] Implement auth controller: `POST /api/auth/login` (set HttpOnly cookie), `POST /api/auth/logout` (clear cookie), `GET /api/auth/me` (return req.user) in `backend/src/controllers/auth.controller.ts`
- [x] T076 [US5] Create `backend/src/routes/auth.route.ts` and mount in app.ts

### Frontend for User Story 5

- [x] T077 [US5] Create `AdminAuthContext` with user state, login/logout helpers, and `useAdminAuth` hook in `frontend/components/admin/providers/AdminAuthProvider.tsx`
- [x] T078 [US5] Create `/admin/login` page with username/password form; on submit calls `POST /api/auth/login`; on success redirects to `/admin` in `frontend/app/admin/login/page.tsx`
- [x] T079 [US5] Create `<Sidebar />` with nav links to all admin modules; role-aware hiding of SUPER_ADMIN-only items in `frontend/components/admin/layout/Sidebar.tsx`
- [x] T080 [US5] Create `<TopBar />` showing logged-in username, unread notification badge, and logout button in `frontend/components/admin/layout/TopBar.tsx`
- [x] T081 [US5] Create admin dashboard layout composing `<Sidebar />` + `<TopBar />` + `{children}` in `frontend/app/admin/(dashboard)/layout.tsx`
- [x] T082 [US5] Create admin dashboard home page (placeholder stats cards — wired to real data in US10) in `frontend/app/admin/(dashboard)/page.tsx`

**Checkpoint**: Login with `admin / changeme123` → `/admin` dashboard loads; logout → `/admin/login`; direct visit to `/admin/gia-pha` without session → redirect

---

## Phase 8: User Story 6 - Admin Genealogy Management (Priority: P6)

**Goal**: SUPER_ADMIN/CHI_ADMIN can create, edit, and delete family members; CHI_ADMIN scoped to own branch; avatar uploaded to Cloudinary

**Independent Test**: Create a member with avatar, bio, achievements, parent link → appears in `GET /api/members`; CHI_ADMIN with different chiId cannot edit another branch member (403)

### Tests for User Story 6 ⚠️ Write FIRST — confirm FAIL

- [x] T083 [P] [US6] Write Vitest integration test for `POST /api/members` (SUPER_ADMIN creates member → 201; CHI_ADMIN creates for own chiId → 201; CHI_ADMIN different chiId → 403) in `backend/tests/integration/members.create.test.ts`
- [x] T084 [P] [US6] Write Vitest integration test for `PUT /api/members/:id` CHI_ADMIN scope restriction → 403 when chiId mismatch in `backend/tests/integration/members.update.test.ts`
- [x] T085 [P] [US6] Write Vitest integration test for `DELETE /api/members/:id` (SUPER_ADMIN → 204; CHI_ADMIN → 403) in `backend/tests/integration/members.delete.test.ts`
- [x] T086 [P] [US6] Write Vitest unit test for `POST /api/upload` accepts image file, returns `{url, publicId}` (mock Cloudinary) in `backend/tests/unit/upload.test.ts`

### Backend for User Story 6

- [x] T087 [US6] Add `create()`, `update()` (with CHI_ADMIN chiId check), `delete()` (orphan children) to `backend/src/services/member.service.ts`
- [x] T088 [US6] Add `POST /api/members`, `PUT /api/members/:id`, `DELETE /api/members/:id` (requireRole SUPER_ADMIN) to `backend/src/controllers/member.controller.ts`
- [x] T089 [US6] Create Cloudinary upload controller: `POST /api/upload` (multer + cloudinary.v2.uploader.upload, max 5MB, image types only) in `backend/src/controllers/upload.controller.ts`
- [x] T090 [US6] Create `backend/src/routes/upload.route.ts` and mount in app.ts

### Frontend for User Story 6

- [x] T091 [US6] Create shared `<DataTable<T> />` with columns prop, search input, and pagination in `frontend/components/shared/DataTable.tsx`
- [x] T092 [US6] Create shared `<ConfirmDialog />` with title, message, and confirm/cancel callbacks in `frontend/components/shared/ConfirmDialog.tsx`
- [x] T093 [US6] Create `<MemberForm />`: avatar upload (→ `POST /api/upload`), fullName, birthYear, deathYear, gender, bio, achievements dynamic list, parent autocomplete dropdown, chiId selector (CHI_ADMIN sees only own chi) in `frontend/components/admin/gia-pha/MemberForm.tsx`
- [x] T094 [US6] Create admin genealogy list page with `<DataTable />` showing members with search/filter by chi, "Add" and "Edit" buttons in `frontend/app/admin/(dashboard)/gia-pha/page.tsx`
- [x] T095 [US6] Create admin member create/edit page embedding `<MemberForm />` in `frontend/app/admin/(dashboard)/gia-pha/[id]/page.tsx`

**Checkpoint**: SUPER_ADMIN adds member with avatar → member appears in `/gia-pha` tree; CHI_ADMIN cannot edit another branch member; delete with confirm dialog works

---

## Phase 9: User Story 7 - Admin News Management (Priority: P7)

**Goal**: SUPER_ADMIN can create/edit/delete articles with Tiptap editor; pin/unpin articles; slugs auto-generated

**Independent Test**: Create article with Tiptap content including an inline image → saved; appears on public `/tin-tuc`; pin toggle works; delete removes article

### Tests for User Story 7 ⚠️ Write FIRST — confirm FAIL

- [x] T096 [P] [US7] Write Vitest integration test for `POST /api/news` auto-generates unique slug from title; duplicate title gets suffix in `backend/tests/integration/news.create.test.ts`
- [x] T097 [P] [US7] Write Vitest integration test for `PATCH /api/news/:id/pin` toggles `isPinned` correctly in `backend/tests/integration/news.pin.test.ts`
- [x] T098 [P] [US7] Write Playwright E2E: create article via admin form → verify it appears on `/tin-tuc` in `frontend/tests/e2e/admin-news.spec.ts`

### Backend for User Story 7

- [x] T099 [US7] Add `create()` (with slug auto-generation + collision handling), `update()`, `delete()`, `togglePin()` to `backend/src/services/news.service.ts`
- [x] T100 [US7] Add `POST /api/news`, `PUT /api/news/:id`, `DELETE /api/news/:id`, `PATCH /api/news/:id/pin` to `backend/src/controllers/news.controller.ts` (all requireRole SUPER_ADMIN)

### Frontend for User Story 7

- [x] T101 [US7] Install Tiptap packages: `@tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link` in `frontend/package.json`
- [x] T102 [US7] Create `<RichTextEditor value onChange />` wrapping `useEditor` with StarterKit + Image + Link extensions; image upload handler calls `POST /api/upload` in `frontend/components/admin/editor/RichTextEditor.tsx`
- [x] T103 [US7] Create admin news list page: `<DataTable />` with pin toggle button and delete (with `<ConfirmDialog />`) in `frontend/app/admin/(dashboard)/tin-tuc/page.tsx`
- [x] T104 [US7] Create admin news create/edit page with title input, thumbnail upload, `<RichTextEditor />`, preview mode, submit in `frontend/app/admin/(dashboard)/tin-tuc/[id]/page.tsx`

**Checkpoint**: Create article → appears on `/tin-tuc`; pin → appears in hero; Tiptap image upload works

---

## Phase 10: User Story 8 - Admin Video & Section Management (Priority: P8)

**Goal**: SUPER_ADMIN manages videos (add/edit/delete/drag-reorder) and homepage sections (create/toggle/delete)

**Independent Test**: Add video with YouTube URL → thumbnail auto-populated; drag to reorder → new order reflected on `/video`; toggle section off → disappears from `/`

### Tests for User Story 8 ⚠️ Write FIRST — confirm FAIL

- [x] T105 [P] [US8] Write Vitest integration test for `PATCH /api/videos/reorder` updates `order` field for all provided IDs in `backend/tests/integration/videos.reorder.test.ts`
- [x] T106 [P] [US8] Write Vitest integration test for `PATCH /api/sections/:id/toggle` flips `isActive` correctly in `backend/tests/integration/sections.toggle.test.ts`

### Backend for User Story 8

- [x] T107 [US8] Add `create()`, `update()`, `delete()`, `reorder(orderedIds[])` to `backend/src/services/video.service.ts`
- [x] T108 [US8] Add `POST /api/videos`, `PUT /api/videos/:id`, `DELETE /api/videos/:id`, `PATCH /api/videos/reorder` to `backend/src/controllers/video.controller.ts` (all requireRole SUPER_ADMIN)
- [x] T109 [US8] Add `create()`, `update()`, `delete()`, `toggle()` to `backend/src/services/section.service.ts`
- [x] T110 [US8] Add `POST /api/sections`, `PUT /api/sections/:id`, `DELETE /api/sections/:id`, `PATCH /api/sections/:id/toggle` to `backend/src/controllers/section.controller.ts` (all requireRole SUPER_ADMIN)

### Frontend for User Story 8

- [x] T111 [US8] Install `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` in `frontend/package.json`
- [x] T112 [US8] Create admin video management page: DataTable with drag-to-reorder (`@dnd-kit/sortable`), YouTube URL input with thumbnail auto-population (extract video ID → `https://img.youtube.com/vi/{id}/hqdefault.jpg`), add/edit/delete in `frontend/app/admin/(dashboard)/video/page.tsx`
- [x] T113 [US8] Create admin section management page: list with toggle switch, order input, add/delete in `frontend/app/admin/(dashboard)/section/page.tsx`

**Checkpoint**: Drag-reorder videos → reflected on `/video`; toggle section → homepage updates after revalidation

---

## Phase 11: User Story 9 - Search (Priority: P9)

**Goal**: Visitors type at `/tim-kiem` and see debounced real-time results across members, news, and videos

**Independent Test**: Navigate to `/tim-kiem`; type "Phùng" → results appear in < 400ms; typing quickly triggers only one API call; empty query shows no results

### Tests for User Story 9 ⚠️ Write FIRST — confirm FAIL

- [x] T114 [P] [US9] Write Vitest integration test for `GET /api/search?q=Phùng` returns `{ members[], news[], videos[] }` with matches in `backend/tests/integration/search.test.ts`
- [x] T115 [P] [US9] Write Vitest unit test: empty query (`q.length < 2`) returns empty results without hitting DB in `backend/tests/unit/search.service.test.ts`
- [x] T116 [P] [US9] Write Playwright E2E: type in search box → debounce → results appear; count of API calls = 1 for rapid typing in `frontend/tests/e2e/search.spec.ts`

### Backend for User Story 9

- [x] T117 [US9] Create MongoDB text indexes on `members.fullName`, `news.title + content`, `videos.title` via `backend/prisma/indexes.ts` using `prisma.$runCommandRaw`
- [x] T118 [US9] Implement `search(q: string)` running parallel Prisma `findMany` text queries and merging results in `backend/src/services/search.service.ts`
- [x] T119 [US9] Create `GET /api/search?q=` controller (validate q ≥ 2 chars) in `backend/src/controllers/search.controller.ts`
- [x] T120 [US9] Create `backend/src/routes/search.route.ts` and mount in app.ts

### Frontend for User Story 9

- [x] T121 [US9] Create `<SearchBar />` with debounced (300ms) controlled input; calls parent `onSearch(q)` callback in `frontend/components/shared/SearchBar.tsx`
- [x] T122 [US9] Create `/tim-kiem` page (CSR): uses `<SearchBar />` with `useSearchParams`; on query calls `GET /api/search`; renders members/news/videos result sections with empty state in `frontend/app/(public)/tim-kiem/page.tsx`

**Checkpoint**: Search "Phùng" → seed member appears in results; search empty → no API calls; short query (1 char) → no results

---

## Phase 12: User Story 10 - Admin Dashboard, Footer & Notifications (Priority: P10)

**Goal**: Admin dashboard shows stats; SUPER_ADMIN edits footer; all admins see notifications; SUPER_ADMIN views activity logs

**Independent Test**: Dashboard shows correct member/news/video counts; editing footer updates public footer on next load; adding a member creates a notification; activity log shows paginated admin actions

### Tests for User Story 10 ⚠️ Write FIRST — confirm FAIL

- [x] T123 [P] [US10] Write Vitest integration test for `GET /api/dashboard` returns `{totalMembers, totalNews, totalVideos, unreadNotifications, recentLogs}` in `backend/tests/integration/dashboard.test.ts`
- [x] T124 [P] [US10] Write Vitest integration test for `PUT /api/footer` upserts and `GET /api/footer` returns updated values in `backend/tests/integration/footer.test.ts`
- [x] T125 [P] [US10] Write Vitest integration test for `GET /api/notifications` returns list; `PATCH /api/notifications/:id/read` sets `isRead=true` in `backend/tests/integration/notifications.test.ts`
- [x] T126 [P] [US10] Write Vitest integration test for `GET /api/activity-logs` requires SUPER_ADMIN; CHI_ADMIN gets 403 in `backend/tests/integration/activity-logs.test.ts`

### Backend for User Story 10

- [x] T127 [US10] Implement `getStats()` aggregating counts and last 5 logs in `backend/src/services/dashboard.service.ts`
- [x] T128 [US10] Implement `get()` + `upsert()` in `backend/src/services/footer.service.ts`
- [x] T129 [US10] Implement `getAll()` + `markRead()` in `backend/src/services/notification.service.ts`
- [x] T130 [US10] Implement `getAll(page, limit)` with user populate in `backend/src/services/activity-log.service.ts`
- [x] T131 [US10] Create controllers and routes for dashboard (`/api/dashboard`), footer (`/api/footer`), notifications (`/api/notifications`), activity-logs (`/api/activity-logs`) in `backend/src/controllers/` and `backend/src/routes/`

### Frontend for User Story 10

- [x] T132 [US10] Wire admin dashboard `page.tsx` to call `GET /api/dashboard` and display real stats cards (total members by chi, news, videos, unread badge, recent log list) in `frontend/app/admin/(dashboard)/page.tsx`
- [x] T133 [US10] Create admin footer edit page with contact/description/copyright form calling `PUT /api/footer` in `frontend/app/admin/(dashboard)/footer/page.tsx`
- [x] T134 [US10] Create admin notifications page: list of notifications with "mark as read" action in `frontend/app/admin/(dashboard)/notification/page.tsx`
- [x] T135 [US10] Create admin activity-log page (SUPER_ADMIN only guard): paginated table with user, action, target, detail, timestamp in `frontend/app/admin/(dashboard)/activity-log/page.tsx`

**Checkpoint**: Dashboard shows real counts; footer edit updates public site; activity log shows all admin mutations captured by logger middleware

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: SEO, performance, accessibility, deploy preparation

- [x] T136 [P] Add `generateMetadata()` to all public pages (title, description, OG image) in `frontend/app/(public)/page.tsx`, `frontend/app/(public)/tin-tuc/[slug]/page.tsx`, `frontend/app/(public)/thanh-vien/[id]/page.tsx`
- [x] T137 [P] Add `sitemap.xml` generation (members, news slugs, static routes) in `frontend/app/sitemap.ts`
- [x] T138 [P] Add `robots.txt` allowing public routes, disallowing `/admin/*` in `frontend/app/robots.ts`
- [x] T139 [P] Add skeleton loading components for all async data sections (news list, tree, videos) in `frontend/app/(public)/tin-tuc/loading.tsx`, `frontend/app/(public)/video/loading.tsx`, `frontend/app/(public)/thanh-vien/[id]/loading.tsx`
- [x] T140 [P] Add empty state component for all list views (no articles, no members, no videos) in `frontend/components/shared/EmptyState.tsx`
- [x] T141 Audit all public pages for WCAG 2.1 AA: add `aria-label`, `alt` text, keyboard navigation, focus indicators — use axe-core assertions in Playwright tests in `frontend/tests/e2e/accessibility.test.ts`
- [x] T142 [P] Verify Lighthouse CI: run `lhci autorun` against homepage, `/tin-tuc`, `/gia-pha` and confirm score ≥ 80 (document in `frontend/.lighthouserc.json`)
- [x] T143 Ensure admin sidebar collapses on mobile (responsive Sidebar with hamburger toggle) in `frontend/components/admin/layout/Sidebar.tsx`
- [x] T144 [P] Create `backend/Dockerfile` (node:20-alpine, copy dist/, expose 8080)
- [x] T145 [P] Create `frontend/vercel.json` with headers config (CSP, X-Frame-Options) and rewrites if needed
- [x] T146 Run full E2E smoke test flow: login as SUPER_ADMIN → add member → verify on `/gia-pha` → create article → verify on `/tin-tuc` → logout in `frontend/tests/e2e/smoke.test.ts`
- [x] T147 Update `quickstart.md` with any final corrections to setup steps or env vars

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Stories (Phase 3–12)**: All depend on Phase 2 completion
  - US1–US4 (public features): no mutual dependencies, can proceed in parallel after Phase 2
  - US5 (admin auth): no dependency on US1–US4; can proceed in parallel
  - US6–US8 (admin CRUD): depend on US5 (admin auth must exist); can proceed in parallel
  - US9 (search): no dependency on other stories
  - US10 (dashboard/settings): depends on US5; all entity data must exist (Phase 2 Foundational + US6–US8 for full data)
- **Polish (Phase 13)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Depends On | Notes |
|-------|-----------|-------|
| US1 (Homepage) | Phase 2 | Independent |
| US2 (Family Tree) | Phase 2 | Independent |
| US3 (News) | Phase 2 | Independent |
| US4 (Video Gallery) | Phase 2 | Independent — reuses video service from US1 |
| US5 (Admin Auth) | Phase 2 | Independent |
| US6 (Admin Members) | US5 | Needs admin layout from US5 |
| US7 (Admin News) | US5 | Needs admin layout from US5 |
| US8 (Admin Video/Sections) | US5 | Needs admin layout from US5 |
| US9 (Search) | Phase 2 | Independent |
| US10 (Dashboard) | US5, US6–US8 | Needs entity data; stats only accurate after CRUD works |

### Within Each User Story

1. Tests MUST be written and confirmed FAILING before implementation (constitution Principle III)
2. Backend: services → controllers → routes
3. Frontend: types/API calls already in Phase 2 → components → pages
4. Full story checkpoint before moving to next priority

---

## Parallel Execution Examples

### Phase 2 Parallel Batch

```
Parallel: T015 (response.ts) + T016 (jwt.ts) + T017 (bcrypt.ts) + T024 (types) + T025 (api.ts)
Then sequential: T018 (auth middleware) → T019 (role middleware) → T020 (logger middleware) → T022 (app.ts)
```

### US1 Test Batch (all parallel)

```
Parallel: T029 + T030 + T031 (backend integration tests)
Parallel: T032 + T033 (frontend RTL tests)
Then: T034 (E2E — needs both servers)
```

### US1 Frontend Components (all parallel after T042 layout)

```
After T042 (layout): Parallel T043 + T044 + T045 + T046 + T047 + T048 + T049
Then: T049 (homepage page.tsx — composes all components)
```

### US6 + US7 + US8 (after US5 completes)

```
Parallel: US6 (T083-T095) + US7 (T096-T104) + US8 (T105-T113)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — **CRITICAL blocker**
3. Complete Phase 3: US1 (Homepage)
4. **STOP and VALIDATE**: public homepage fully functional
5. Demo to stakeholders; deploy to Vercel + Railway preview

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → **MVP: homepage live**
3. US2 → family tree browsable
4. US3 + US4 → content browsing complete (public site done)
5. US5 → admin login works
6. US6 → family members manageable
7. US7 → news CMS live
8. US8 → videos and sections manageable (admin complete)
9. US9 → search enabled
10. US10 → dashboard and settings complete
11. Polish → production-ready

### Parallel Team Strategy

With 2 developers after Phase 2:
- Dev A: US1 (Homepage) → US2 (Family Tree) → US3+US4 (Content browsing)
- Dev B: US5 (Admin Auth) → US6 (Admin Members) → US7 (Admin News) → US8 (Admin Video)
- Merge after US4 and US8 complete; US9 + US10 + Polish together

---

## Notes

- `[P]` tasks touch different files with no shared incomplete dependencies — safe to run in parallel
- `[Story]` label maps each task to its user story for traceability
- Each story has its own backend service methods + controller additions + frontend components + page — fully independent slice
- TDD: test tasks appear before implementation within every phase
- Commit after each checkpoint; tag release after each user story completes in production
- Slug collision: `NewsService.create()` must handle duplicate slugs by appending `-2`, `-3`, etc.
- CHI_ADMIN scope: enforced in both backend middleware and frontend UI (hide/disable unavailable actions)
- Backend route `PATCH /api/videos/reorder` must be registered BEFORE `PUT /api/videos/:id` in Express to prevent route shadowing
