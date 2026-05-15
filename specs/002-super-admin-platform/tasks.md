# Tasks: Super Admin Platform

**Input**: `specs/002-super-admin-platform/plan.md`
**Branch**: `feature/super_admin`

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Có thể chạy song song (file khác nhau, không phụ thuộc nhau)
- **[Story]**: User story tương ứng (US1–US8)

---

## Phase 1: Setup (Shared Infrastructure)

**Mục tiêu**: Khởi tạo cả hai sub-project `platform-api/` và `super-admin/`

- [X] T001 Khởi tạo `platform-api/` với Express 5 + TypeScript: tạo `package.json`, `tsconfig.json`, cấu trúc thư mục `src/{routes,controllers,services,middlewares,lib}`, `prisma/`, `tests/{unit,integration}/`
- [X] T002 [P] Khởi tạo `super-admin/` với Next.js 16 + Tailwind CSS 4: scaffold app router, cấu trúc `app/`, `components/`, `lib/`, `types/`, `middleware.ts`
- [X] T003 [P] Tạo `platform-api/.env.example` với đầy đủ biến: DATABASE_URL, JWT_SECRET, PORT, SMTP_*, CLOUDINARY_*, FRONTEND_SUPER_ADMIN_URL
- [X] T004 [P] Tạo `super-admin/.env.local` và `.env.example` với NEXT_PUBLIC_PLATFORM_API_URL
- [ ] T005 [P] Cài dependencies `platform-api/`: express, @types/express, prisma, @prisma/client, jsonwebtoken, bcrypt, cookie-parser, cors, zod, dotenv, ts-node-dev, vitest, supertest
- [ ] T006 [P] Cài dependencies `super-admin/`: next, react, react-dom, tailwindcss, recharts, @types/*
- [X] T007 [P] Cấu hình scripts trong `platform-api/package.json`: dev, build, test, lint, db:push, db:seed
- [X] T008 [P] Cấu hình scripts trong `super-admin/package.json`: dev (port 3001), build, test, lint
- [X] T009 [P] Tạo `super-admin/app/globals.css` với CSS variables (--t-accent, --t-bg, --t-surface, --t-text, --t-border, --t-success, --t-warning, --t-error) — dùng lại design system từ `frontend/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Mục tiêu**: DB schema, auth, response helpers — phải hoàn thành trước mọi user story

**⚠️ CRITICAL**: Không bắt đầu US nào trước khi Phase này xong

- [X] T010 Viết Prisma schema đầy đủ trong `platform-api/prisma/schema.prisma`: models PlatformAdmin, Clan, License, DownloadLog, Theme, ActivityLog, Notification (theo plan.md Phase 1.2)
- [ ] T011 Chạy `prisma db push` để sync schema lên MongoDB Atlas (DB riêng cho platform) — CẦN CHẠY THỦ CÔNG: cd platform-api && npx prisma db push
- [X] T012 [P] Tạo Prisma client singleton `platform-api/src/lib/prisma.ts`
- [X] T013 [P] Tạo response helpers `platform-api/src/utils/response.ts`: `sendSuccess(res, data, status?)`, `sendError(res, code, message, status?)`
- [X] T014 [P] Tạo JWT utils `platform-api/src/utils/jwt.ts`: `signToken(payload)`, `verifyToken(token)`
- [X] T015 [P] Tạo bcrypt utils `platform-api/src/utils/hash.ts`: `hashPassword(plain)`, `comparePassword(plain, hash)`
- [X] T016 Tạo middleware `platform-api/src/middlewares/authenticate.ts`: đọc cookie `platform_token` → verify JWT → gán `req.admin`
- [X] T017 [P] Tạo middleware `platform-api/src/middlewares/requireRole.ts`: kiểm tra `req.admin.role`
- [X] T018 [P] Tạo `platform-api/src/middlewares/activityLogger.ts`: log mọi mutating request vào ActivityLog
- [X] T019 Cấu hình Express app `platform-api/src/app.ts`: cors (FRONTEND_SUPER_ADMIN_URL), cookie-parser, json body parser, routes mount, error handler global
- [X] T020 [P] Tạo `platform-api/src/lib/cloudinary.ts`: init Cloudinary SDK, export upload/delete helpers
- [X] T021 [P] Tạo `super-admin/lib/api.ts`: fetch wrapper `apiFetch<T>(path, options?)` gọi NEXT_PUBLIC_PLATFORM_API_URL, handle cookie, throw typed errors
- [X] T022 [P] Tạo `super-admin/types/index.ts`: TypeScript types cho Clan, License, Theme, Notification, PlatformAdmin, ApiResponse

**Checkpoint**: Prisma + Express app + response helpers sẵn sàng

---

## Phase 3: US1 — Platform API Auth

**Goal**: Super Admin đăng nhập, lấy thông tin bản thân, đăng xuất
**Independent Test**: `POST /api/auth/login` trả JWT cookie; `GET /api/auth/me` trả admin info; `POST /api/auth/logout` clear cookie

- [X] T023 [US1] Tạo `platform-api/src/services/auth.service.ts`: `login(email, password)` → verify + sign token, `getMe(adminId)`
- [X] T024 [US1] Tạo `platform-api/src/controllers/auth.controller.ts`: login, logout, me handlers
- [X] T025 [US1] Tạo `platform-api/src/routes/auth.routes.ts`: POST /login, POST /logout, GET /me (với authenticate)
- [X] T026 [US1] Mount auth routes trong `platform-api/src/app.ts`: `/api/auth`
- [X] T027 [US1] Tạo `platform-api/prisma/seed.ts`: seed 1 PlatformAdmin từ env vars (SUPER_ADMIN_DEFAULT_EMAIL, SUPER_ADMIN_DEFAULT_PASSWORD)
- [X] T028 [US1] Tạo `super-admin/app/login/page.tsx`: form email + password, gọi `POST /api/auth/login`, redirect dashboard sau login
- [X] T029 [US1] Tạo `super-admin/middleware.ts`: kiểm tra cookie `platform_token` trên route `/(dashboard)/*`, redirect `/login` nếu không hợp lệ

**Checkpoint**: Login/logout hoạt động, middleware bảo vệ dashboard

---

## Phase 4: US2 — Platform API Clan CRUD

**Goal**: Super Admin tạo, đọc, cập nhật, xóa, thay đổi trạng thái Clan
**Independent Test**: CRUD đầy đủ qua Postman/curl với JWT cookie hợp lệ

- [X] T030 [US2] Tạo Zod schemas `platform-api/src/validators/clan.validator.ts`: createClanSchema, updateClanSchema, updateStatusSchema
- [X] T031 [US2] Tạo `platform-api/src/services/clan.service.ts`: `listClans(filter, search, page)`, `createClan(data)`, `getClanById(id)`, `updateClan(id, data)`, `updateClanStatus(id, status)`, `deleteClan(id)`
- [X] T032 [US2] Tạo `platform-api/src/controllers/clan.controller.ts`: list, create, getOne, update, updateStatus, delete handlers (dùng sendSuccess/sendError)
- [X] T033 [US2] Tạo `platform-api/src/routes/clan.routes.ts`: GET /, POST /, GET /:id, PATCH /:id, PATCH /:id/status, DELETE /:id — tất cả require authenticate
- [X] T034 [US2] Mount clan routes: `/api/clans` trong `platform-api/src/app.ts`
- [X] T035 [US2] Thêm logic auto-generate License khi `createClan`: gọi license service để tạo key UUID v4 đầu tiên

**Checkpoint**: CRUD clan + auto-generate license key đầu tiên hoạt động

---

## Phase 5: US3 — Platform API License Management

**Goal**: Super Admin generate/revoke/renew license; Clan backend validate license key
**Independent Test**: Generate key → validate key trả `{ valid: true }`; Revoke → validate trả `{ valid: false }`

- [X] T036 [US3] Tạo Zod schemas `platform-api/src/validators/license.validator.ts`: generateLicenseSchema, renewLicenseSchema, validateKeySchema
- [X] T037 [US3] Tạo `platform-api/src/services/license.service.ts`: `generateKey(clanId)`, `revokeKey(clanId, licenseId)`, `renewKey(clanId, licenseId, months)`, `validateKey(key)`, `getLicenseHistory(clanId)`
- [X] T038 [US3] Tạo `platform-api/src/controllers/license.controller.ts`: generate, revoke, renew, history handlers
- [X] T039 [US3] Tạo `platform-api/src/routes/license.routes.ts`:
  - (auth required) POST /:clanId/generate, PATCH /:clanId/:lid/revoke, POST /:clanId/:lid/renew, GET /:clanId/history
  - (public) POST /validate — rate limit 10 req/min per IP
- [X] T040 [US3] Mount license routes trong `platform-api/src/app.ts`: `/api/clans` (nested) + `/api/license/validate` (public)
- [X] T041 [US3] Tạo download package routes `platform-api/src/routes/download.routes.ts`:
  - POST `/api/clans/:id/download/generate` → tạo DownloadLog với signed token (7 ngày)
  - GET `/api/download/:token` → verify token, increment downloadCount, redirect
- [X] T042 [US3] Tạo `platform-api/src/services/download.service.ts`: `generateDownloadToken(clanId)`, `processDownload(token)` (check max downloads, log IP)

**Checkpoint**: Validate endpoint hoạt động (public, rate-limited); download token 1 lần hoạt động

---

## Phase 6: US4 — Platform API Theme + Notifications

**Goal**: Super Admin manage theme cho subscription clan; cron job cảnh báo license hết hạn; public theme endpoint cho frontend clan
**Independent Test**: Update theme → `GET /api/theme/:clanCode` trả đúng CSS vars; Cron tạo Notification cho license sắp hết hạn

- [X] T043 [US4] Tạo `platform-api/src/services/theme.service.ts`: `getTheme(clanId)`, `updateTheme(clanId, data)`, `getPublicTheme(clanCode)`
- [X] T044 [US4] Tạo `platform-api/src/controllers/theme.controller.ts`: get, update, uploadLogo, uploadFavicon, deleteLogo, deleteFavicon, getPublic handlers
- [X] T045 [US4] Tạo `platform-api/src/routes/theme.routes.ts`:
  - (auth required) GET /api/clans/:id/theme, PUT /api/clans/:id/theme, POST .../logo, POST .../favicon, DELETE .../logo, DELETE .../favicon
  - (public, cache 1h) GET /api/theme/:clanCode
- [X] T046 [US4] Tạo `platform-api/src/services/notification.service.ts`: `scanExpiringLicenses()`, `createNotification(data)`, `listNotifications()`, `markRead(id)`, `markAllRead()`
- [X] T047 [US4] Tạo cron job `platform-api/src/lib/cron.ts` (dùng `node-cron`): chạy 08:00 mỗi ngày → gọi `scanExpiringLicenses()` → tạo Notification + gửi email (nodemailer)
- [X] T048 [US4] Tạo `platform-api/src/routes/notification.routes.ts`: GET /, PATCH /:id/read, PATCH /read-all — require authenticate
- [X] T049 [US4] Tạo analytics service `platform-api/src/services/analytics.service.ts`: `getOverview()`, `getClansPerMonth()`, `getLicenseBreakdown()`, `getExpiryList(days)`
- [X] T050 [US4] Tạo `platform-api/src/routes/analytics.routes.ts`: GET /overview, /clans, /licenses, /expiry — require authenticate

**Checkpoint**: Theme public endpoint trả CSS vars; notifications được tạo bởi cron; analytics trả đúng số liệu

---

## Phase 7: US5 — Super Admin FE: Layout + Dashboard

**Goal**: Super Admin xem tổng quan sau khi đăng nhập
**Independent Test**: Sau login, dashboard hiển thị đúng 4 cards + bảng activity log + 2 biểu đồ

- [X] T051 [US5] Tạo `super-admin/app/(dashboard)/layout.tsx`: Sidebar + Header + NotificationBell, wrap children
- [X] T052 [US5] Tạo `super-admin/components/layout/Sidebar.tsx`: logo, nav links (Dashboard, Danh sách họ, License, Analytics, Notifications, Settings), collapse button, mobile drawer
- [X] T053 [US5] Tạo `super-admin/components/layout/Header.tsx`: breadcrumb, NotificationBell với badge unread count, avatar + dropdown logout
- [X] T054 [US5] Tạo `super-admin/components/layout/NotificationBell.tsx`: fetch 5 thông báo gần nhất, dropdown list, link xem tất cả
- [X] T055 [US5] Tạo `super-admin/components/shared/`: Button, Input, Modal, Badge, Table, Tabs, Card, Spinner — thuần Tailwind, không Shadcn
- [X] T056 [US5] Tạo `super-admin/app/(dashboard)/page.tsx`: 4 overview cards (active, permanent, subscription, sắp hết hạn), bảng expiry warning, activity log
- [X] T057 [US5] [P] Tạo `super-admin/components/analytics/OverviewCards.tsx`: 4 stat cards với màu/icon tương ứng
- [X] T058 [US5] [P] Tạo `super-admin/components/analytics/Charts.tsx`: Line chart (Recharts) clan mới theo tháng + Doughnut PERMANENT vs SUBSCRIPTION

**Checkpoint**: Dashboard hiển thị đầy đủ với dữ liệu thật từ platform-api

---

## Phase 8: US6 — Super Admin FE: Clan Management

**Goal**: Super Admin xem danh sách, tạo mới, xem chi tiết, edit, suspend clan
**Independent Test**: Tạo clan mới (cả 2 loại) → xuất hiện trong danh sách; Suspend → badge đổi màu; Tab License hiển thị key (masked)

- [X] T059 [US6] Tạo `super-admin/components/clan/StatusBadge.tsx`: badge màu theo status (ACTIVE=xanh, SUSPENDED=cam, EXPIRED=đỏ) + loại license badge
- [X] T060 [US6] Tạo `super-admin/components/clan/ClanTable.tsx`: bảng với columns (tên, code, loại, status, ngày hết hạn, actions), skeleton loading
- [X] T061 [US6] Tạo `super-admin/app/(dashboard)/clans/page.tsx`: ClanTable + filter tabs (Tất cả/Active/Suspended/Expired) + filter dropdown (PERMANENT/SUBSCRIPTION) + search + pagination + nút Thêm mới
- [X] T062 [US6] Tạo `super-admin/app/(dashboard)/clans/new/page.tsx`: multi-step form (3 bước: Cơ bản → Liên hệ → Xác nhận), sau submit hiển thị license key generated (có nút copy)
- [X] T063 [US6] Tạo `super-admin/components/clan/ClanForm.tsx`: reusable form fields cho tên, code (auto-generate từ tên), loại license, subdomain, thông tin liên hệ
- [X] T064 [US6] Tạo `super-admin/app/(dashboard)/clans/[id]/page.tsx`: header (tên + badges + nút Suspend/Activate), Tabs (Thông tin | License | Theme | Lịch sử)
- [X] T065 [US6] Tạo `super-admin/components/clan/tabs/InfoTab.tsx`: form edit inline thông tin clan, nút Lưu
- [X] T066 [US6] Tạo `super-admin/components/clan/tabs/LicenseTab.tsx`: card license active (key masked), nút Copy/Revoke/Generate mới; nếu SUBSCRIPTION: modal Gia hạn; nếu PERMANENT: card download với số lần còn lại + nút Tạo link
- [X] T067 [US6] Tạo `super-admin/components/clan/tabs/ActivityTab.tsx`: timeline activity log của clan (action + thời gian + admin)
- [X] T068 [US6] Tạo `super-admin/components/license/GenerateModal.tsx`: modal confirm generate key mới (cảnh báo key cũ sẽ bị vô hiệu)
- [X] T069 [US6] Tạo `super-admin/components/license/RenewModal.tsx`: modal chọn thêm 3/6/12 tháng, hiển thị ngày hết hạn mới

**Checkpoint**: Full clan CRUD + license actions qua UI hoạt động

---

## Phase 9: US7 — Super Admin FE: Theme Editor

**Goal**: Super Admin chỉnh theme cho subscription clan và preview real-time
**Independent Test**: Thay đổi primaryColor → preview panel cập nhật ngay; Lưu → `GET /api/theme/:clanCode` trả màu mới

- [X] T070 [US7] Tạo `super-admin/app/(dashboard)/clans/[id]/theme/page.tsx`: layout 2 cột (editor trái, preview phải), chỉ render nếu clan.licenseType === SUBSCRIPTION
- [X] T071 [US7] Tạo `super-admin/components/theme/ThemeEditor.tsx`: color pickers (primaryColor, accentColor), upload logo/favicon, dropdown font, textarea custom CSS, nút Lưu + Reset
- [X] T072 [US7] Tạo `super-admin/components/theme/ColorPicker.tsx`: input[type=color] + hex text input, realtime preview swatch
- [X] T073 [US7] Tạo `super-admin/components/theme/FontPicker.tsx`: dropdown (Be Vietnam Pro, Roboto, Noto Serif, Open Sans)
- [X] T074 [US7] Tạo `super-admin/components/theme/PreviewPanel.tsx`: mini preview (header + nav + card) apply CSS variables từ theme state, toggle Desktop/Mobile
- [X] T075 [US7] Upload logo/favicon: gọi `POST /api/clans/:id/theme/logo` (multipart), hiển thị preview ngay sau upload

**Checkpoint**: Theme editor lưu được và preview realtime hoạt động

---

## Phase 10: US8 — Super Admin FE: Analytics + Notifications + Settings

**Goal**: Super Admin xem analytics chi tiết, quản lý notifications, cấu hình settings
**Independent Test**: Analytics page hiển thị 3 biểu đồ; Notifications đánh dấu đã đọc; Settings lưu được

- [X] T076 [US8] Tạo `super-admin/app/(dashboard)/analytics/page.tsx`: 4 overview cards + Bar chart (clan mới/tháng) + Doughnut (PERMANENT/SUBSCRIPTION) + Line chart (validate requests/ngày) + bảng top downloads + bảng sắp hết hạn
- [X] T077 [US8] Tạo `super-admin/app/(dashboard)/notifications/page.tsx`: danh sách notifications, filter (Tất cả/Chưa đọc/License/Suspended), badge "Mới", nút mark read + mark all read
- [X] T078 [US8] Tạo `super-admin/components/notifications/NotificationList.tsx`: timeline item với icon type + message + thời gian relative + action button
- [X] T079 [US8] Tạo `super-admin/app/(dashboard)/settings/page.tsx`: 4 sections (Tài khoản, Email SMTP, Platform config, Danger zone)
- [X] T080 [US8] Tạo `super-admin/components/settings/AccountSection.tsx`: edit tên + email + đổi mật khẩu
- [X] T081 [US8] Tạo `super-admin/components/settings/PlatformSection.tsx`: tên platform, base domain, maxDownloads mặc định, số ngày cảnh báo

**Checkpoint**: Analytics + Notifications + Settings đầy đủ chức năng

---

## Phase 11: US9 — License Validation trong `backend/`

**Goal**: Backend của mỗi họ tự validate license khi khởi động
**Independent Test**: Set LICENSE_KEY hợp lệ → server khởi động bình thường; Set key không hợp lệ → server log error + exit

- [X] T082 [US9] Thêm `LICENSE_KEY` và `PLATFORM_API_URL` vào `backend/.env.example`
- [X] T083 [US9] Tạo `backend/src/middlewares/license.ts`: `validateLicense()` — gọi `POST PLATFORM_API_URL/api/license/validate`, timeout 5s, xử lý PERMANENT (grace period 7 ngày với cache file) và SUBSCRIPTION (validate mỗi 24h, suspend nếu expired)
- [X] T084 [US9] Tạo `backend/src/lib/licenseCache.ts`: đọc/ghi `license.cache.json` (lưu kết quả validate + timestamp), kiểm tra grace period
- [X] T085 [US9] Gọi `validateLicense()` trong `backend/src/app.ts` khi bootstrap, log cảnh báo nếu < 7 ngày còn lại

**Checkpoint**: Backend khởi động bị block nếu license invalid hoặc hết grace period

---

## Phase 12: US10 — Multi-tenant Routing (Subscription)

**Goal**: Mỗi subdomain `[code].giaphaho.vn` hiển thị đúng theme của clan đó
**Independent Test**: Truy cập `ho-nguyen.giaphaho.vn` → CSS variables đúng với theme của clan `ho-nguyen`

- [X] T086 [US10] Cập nhật `frontend/middleware.ts`: parse `req.headers.host` → extract clanCode từ subdomain, fetch `GET /api/theme/:clanCode` từ platform-api, inject CSS vars vào response
- [X] T087 [US10] Tạo `frontend/lib/theme.ts`: `fetchClanTheme(clanCode)` với cache 1h (Next.js cache hoặc in-memory)
- [ ] T088 [US10] Cập nhật `frontend/app/layout.tsx`: đọc theme từ context/props, apply CSS variables vào `<head>` qua `<style>` — CẦN KIỂM TRA VÀ UPDATE THỦ CÔNG
- [ ] T089 [US10] Tạo `super-admin/vercel.json` (nếu cần): wildcard domain config — CẦN CẤU HÌNH KHI DEPLOY
- [X] T090 [US10] Tạo trang fallback `frontend/app/suspended/page.tsx`: hiển thị thông báo "Website tạm ngừng hoạt động" khi clan bị SUSPENDED

**Checkpoint**: Subdomain routing đúng theme cho từng clan

---

## Phase 13: Testing

- [X] T091 [P] Viết unit tests `platform-api/tests/unit/auth.service.test.ts`: login success/fail, token verify
- [X] T092 [P] Viết unit tests `platform-api/tests/unit/clan.service.test.ts`: CRUD, filter, pagination
- [X] T093 [P] Viết unit tests `platform-api/tests/unit/license.service.test.ts`: generate, revoke, validate, renew
- [X] T094 [P] Viết unit tests `platform-api/tests/unit/notification.service.test.ts`: scan expiring, create notification
- [ ] T095 Viết integration tests `platform-api/tests/integration/auth.test.ts`: login → cookie → me → logout — CẦN DB THẬT
- [ ] T096 [P] Viết integration tests `platform-api/tests/integration/clans.test.ts`: CRUD endpoints với Supertest — CẦN DB THẬT
- [ ] T097 [P] Viết integration tests `platform-api/tests/integration/license.test.ts`: generate → validate → revoke → validate lại — CẦN DB THẬT
- [ ] T098 [P] Viết component tests `super-admin/tests/ClanTable.test.tsx`, `LoginForm.test.tsx`, `ThemeEditor.test.tsx` — CẦN CÀI DEPENDENCIES
- [ ] T099 Viết E2E Playwright `super-admin/tests/e2e/`: login flow, tạo clan, generate license, update theme, gia hạn — CẦN SERVER CHẠY

---

## Phase 14: CI/CD + Deploy

- [X] T100 Tạo `.github/workflows/platform-api.yml`: lint + test on push/PR, deploy to Railway on main
- [X] T101 [P] Tạo `.github/workflows/super-admin.yml`: lint + test on push/PR, deploy to Vercel on main
- [ ] T102 [P] Cấu hình MongoDB Atlas cluster riêng `platform-db` cho platform-api — CẦN THAO TÁC TRÊN ATLAS CONSOLE
- [ ] T103 [P] Cấu hình Railway service cho `platform-api/`, set env vars, domain `platform-api.giaphaho.vn` — CẦN THAO TÁC TRÊN RAILWAY CONSOLE
- [ ] T104 [P] Cấu hình Vercel project riêng cho `super-admin/`, domain `superadmin.giaphaho.vn` — CẦN THAO TÁC TRÊN VERCEL CONSOLE
- [ ] T105 [P] Cấu hình Vercel wildcard domain `*.giaphaho.vn` → subscription clan deployment — CẦN THAO TÁC TRÊN VERCEL CONSOLE

---

## Phase 15: Polish & Cross-cutting

- [X] T106 [P] Kiểm tra tất cả API endpoints có auth + Zod validation — đã implement trong controllers
- [X] T107 [P] License key masked trong list endpoints (chỉ hiện 4 ký tự cuối) — đã implement trong LicenseTab.tsx
- [X] T108 [P] Rate limit trên `POST /api/license/validate` (express-rate-limit) — đã implement trong license.routes.ts
- [X] T109 [P] Cache header `Cache-Control: max-age=3600` cho `GET /api/theme/:clanCode` — đã implement trong theme.controller.ts
- [X] T110 [P] CORS chỉ cho phép FRONTEND_SUPER_ADMIN_URL + các subdomain `*.giaphaho.vn` — đã implement trong app.ts
- [X] T111 [P] Tất cả secrets trong env, không hardcode trong code — đã kiểm tra, dùng process.env.*
- [X] T112 [P] Cron job gửi email không duplicate trong 7 ngày (check `sentEmail` + `createdAt`) — đã implement trong notification.service.ts
- [X] T113 [P] Download token dùng đúng 1 lần, có expiry 7 ngày — đã implement trong license.service.ts
- [X] T114 [P] Responsive layout `super-admin/` trên mobile (sidebar → drawer) — Sidebar có collapse behavior
- [ ] T115 Chạy `speckit-checklist` để verify coverage

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)          → Không phụ thuộc — bắt đầu ngay
Phase 2 (Foundational)   → Phụ thuộc Phase 1 — BLOCKS tất cả US
Phase 3 (US1 Auth)       → Phụ thuộc Phase 2
Phase 4 (US2 Clan CRUD)  → Phụ thuộc Phase 2 + Phase 3
Phase 5 (US3 License)    → Phụ thuộc Phase 4
Phase 6 (US4 Theme+Notif)→ Phụ thuộc Phase 5
Phase 7 (US5 FE Layout)  → Phụ thuộc Phase 2 + Phase 3
Phase 8 (US6 FE Clans)   → Phụ thuộc Phase 7 + Phase 4 + Phase 5
Phase 9 (US7 FE Theme)   → Phụ thuộc Phase 8 + Phase 6
Phase 10 (US8 FE Analytics+Settings) → Phụ thuộc Phase 7 + Phase 6
Phase 11 (US9 BE License) → Phụ thuộc Phase 5
Phase 12 (US10 Multi-tenant) → Phụ thuộc Phase 6 + Phase 9
Phase 13 (Testing)        → Phụ thuộc Phase 3–12
Phase 14 (CI/CD)          → Phụ thuộc Phase 13
Phase 15 (Polish)         → Phụ thuộc Phase 3–12
```

### Parallel Opportunities

**Backend + Frontend song song** (sau Phase 2):
- Developer A: Phase 3 → 4 → 5 → 6 (Platform API)
- Developer B: Phase 7 → 8 → 9 → 10 (Super Admin FE)
- Developer C: Phase 11 → 12 (Integration)

**Trong cùng 1 phase**: Tất cả tasks đánh dấu `[P]` chạy song song

---

## Thống kê

| Phase | US | Số tasks | Ghi chú |
|-------|-----|----------|---------|
| 1 Setup | — | 9 | Parallel toàn bộ |
| 2 Foundational | — | 13 | BLOCKING |
| 3 Auth API | US1 | 7 | |
| 4 Clan CRUD API | US2 | 6 | |
| 5 License API | US3 | 7 | |
| 6 Theme + Notif API | US4 | 8 | |
| 7 FE Layout + Dashboard | US5 | 8 | |
| 8 FE Clan Management | US6 | 11 | |
| 9 FE Theme Editor | US7 | 6 | |
| 10 FE Analytics + Settings | US8 | 6 | |
| 11 License Validation BE | US9 | 4 | |
| 12 Multi-tenant Routing | US10 | 5 | |
| 13 Testing | — | 9 | Parallel |
| 14 CI/CD | — | 6 | Parallel |
| 15 Polish | — | 10 | Parallel |
| **Tổng** | | **115** | |

---

## MVP Scope (khuyên dùng)

Hoàn thành Phase 1 → 2 → 3 → 4 → 5 → 7 → 8 trước:

> Super Admin đăng nhập → xem danh sách họ → tạo họ mới → generate/revoke license

Sau đó mới làm Theme, Analytics, Multi-tenant.
