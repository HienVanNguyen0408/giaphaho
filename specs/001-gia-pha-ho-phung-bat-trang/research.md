# Research: Website Gia Phả Họ Phùng Bát Tràng

## 1. Backend Testing Framework

**Decision**: Vitest (not Jest)
**Rationale**: Constitution mandates Vitest across the entire codebase. Vitest runs in the same ecosystem as the frontend tests, offers ESM-native execution, and is compatible with Supertest for HTTP integration testing. Jest would require separate config and introduces two test runners into the monorepo.
**Alternatives considered**: Jest — rejected because it conflicts with the constitution's Technology Standards.
**How**: Backend `package.json` sets `"test": "vitest run"`. `vitest.config.ts` targets `src/**` and `tests/**`.

---

## 2. Prisma + MongoDB Specifics

**Decision**: Prisma 5 with `provider = "mongodb"` and ObjectId IDs
**Rationale**: MongoDB's Prisma provider requires `@db.ObjectId` on all ID fields and foreign keys. Self-referential relations (Member → parent/children) need `onDelete: NoAction, onUpdate: NoAction` to avoid MongoDB cascade limitation. No migration history is generated — use `prisma db push` for schema sync.
**Alternatives considered**: Mongoose — rejected because Prisma gives TypeScript-safe generated client and aligns with existing plan.
**Gotchas**:
- `prisma migrate` is not supported for MongoDB; use `prisma db push`
- `@unique` on embedded arrays is not supported — slug uniqueness for News enforced at application level too
- Prisma does not support `JOIN`-style eager loading across collections; tree queries must be recursive or batch-loaded

---

## 3. Family Tree: @xyflow/react (ReactFlow v12)

**Decision**: `@xyflow/react` (the v12 rebranded package)
**Rationale**: `@xyflow/react` is the current package name for ReactFlow v12+. It is production-stable, supports custom node renderers, zoom/pan out of the box, and has first-class TypeScript types.
**Alternatives considered**: D3-tree — more control but significantly more code; not worth it at this scale.
**Implementation approach**:
- `GET /api/members` returns a flat array with `{ id, fullName, parentId, avatar, birthYear, deathYear }`
- Frontend converts flat list → `{ nodes: Node[], edges: Edge[] }` using a utility function
- Nodes render avatar + name + years; edges represent parent-child relationships
- Lazy expansion deferred to Phase 5 (initially load full tree, optimize if > 500 nodes)

---

## 4. Tiptap Rich Text Editor

**Decision**: Tiptap v2 with StarterKit + Image extension + Cloudinary upload
**Rationale**: Tiptap is the plan's specified editor. The StarterKit covers all required formatting (heading, bold, italic, link, list). The Image extension handles inline images. Custom upload handler calls Cloudinary's upload API and inserts the returned URL.
**Alternatives considered**: Quill — older, less maintained; CKEditor — heavier bundle.
**Implementation**: `RichTextEditor.tsx` wraps `useEditor` from `@tiptap/react`. Image upload: file input → `FormData` → `/api/upload` (backend proxy) → Cloudinary → URL inserted in editor.

---

## 5. Cloudinary Image Upload

**Decision**: Server-side signed upload via backend proxy endpoint
**Rationale**: Cloudinary credentials must not be exposed to the browser. A backend `/api/upload` endpoint signs the upload request and forwards to Cloudinary. This also allows server-side validation (file type, size).
**Alternatives considered**: Unsigned upload widget (client-side) — rejected because it exposes API key.
**Flow**: Frontend sends file → `POST /api/upload` (multipart) → backend uses `cloudinary.v2.uploader.upload()` → returns `{ url, publicId }` → frontend stores URL in form state.

---

## 6. Authentication: JWT + HTTP-only Cookie

**Decision**: JWT stored in HTTP-only cookie (not localStorage)
**Rationale**: HTTP-only cookies prevent XSS access. Next.js middleware reads cookies server-side to protect `/admin/*` routes. The backend sets the cookie on login response (`Set-Cookie: token=…; HttpOnly; Secure; SameSite=Strict`).
**Alternatives considered**: localStorage — rejected due to XSS risk; Next-Auth — overkill for a simple username/password auth.
**Frontend middleware**: `middleware.ts` checks for the `token` cookie; if absent, redirects to `/admin/login`. Applies only to `matcher: ['/admin/:path*']`.

---

## 7. Activity Log Auto-Capture

**Decision**: Express middleware (`logger.middleware.ts`) writes to `ActivityLog` after each mutating request
**Rationale**: Auto-capture via middleware avoids duplicating log logic in every controller. The middleware runs `next()` first, then on response finish (`res.on('finish', ...)`) writes the log if status < 400.
**Data captured**: `userId` (from decoded JWT), `action` (HTTP method), `target` (route path), `targetId` (from `req.params.id`), `detail` (req body summary).

---

## 8. Search Implementation

**Decision**: MongoDB text index via Prisma raw queries
**Rationale**: MongoDB supports `$text` search on indexed string fields. For the initial scale (hundreds of members, dozens of articles), a native text index is sufficient and avoids adding a dedicated search service.
**Alternatives considered**: Elasticsearch / Typesense — rejected as premature for this scale.
**Implementation**: Create text indexes on `Member.fullName`, `News.title + content`, `Video.title`. `GET /api/search?q=` runs three parallel Prisma `$queryRaw` calls and merges results.

---

## 9. Role-Based Access Control (RBAC)

**Decision**: Two roles (SUPER_ADMIN, CHI_ADMIN) enforced at middleware level
**Rationale**: The constitution requires WCAG and user-centered design; the spec requires chi-scoped data isolation. Middleware checks `req.user.role` and, for CHI_ADMIN operations on members, also verifies `req.user.chiId === member.chiId`.
**Frontend**: Sidebar menu items and action buttons are conditionally rendered based on role stored in auth context.

---

## 10. Deploy Strategy

**Decision**: Frontend → Vercel, Backend → Railway
**Rationale**: Vercel is the canonical Next.js deployment platform (ISR, Edge Middleware native). Railway handles Node.js + environment variables simply with Dockerfile support.
**MongoDB Atlas**: Whitelist Railway's static IP (or use Railway's IP proxying). Set `DATABASE_URL` in Railway env.
**Environment variables**:
- Backend: `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `PORT=8080`
- Frontend: `NEXT_PUBLIC_API_URL` (Railway domain)
