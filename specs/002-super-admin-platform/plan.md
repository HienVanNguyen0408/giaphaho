# Implementation Plan: Super Admin Platform

**Branch**: `feature/super_admin` | **Date**: 2026-05-15
**Mục tiêu**: Xây dựng hệ thống quản lý nền tảng gia phả đa tenant — Super Admin quản lý danh sách các họ, cấp license (vĩnh viễn / thuê bao), quản lý theme và thông tin từng họ.

---

## Kiến trúc tổng quan

```
Monorepo
├── backend/          ← REST API cho từng họ (giữ nguyên)
├── frontend/         ← Client + Admin cho từng họ (giữ nguyên)
├── platform-api/     ← NEW: Node.js + Express 5 + TypeScript
└── super-admin/      ← NEW: Next.js 16 Dashboard Super Admin
```

### Hai loại license

| Loại | Mô tả | Hosting | Super Admin quản lý |
|------|-------|---------|----------------------|
| **PERMANENT** | Cấp source code + license key, họ tự host | Server riêng của họ | Chỉ key + download log |
| **SUBSCRIPTION** | Thuê bao tháng/năm, provider host | Subdomain `[code].giaphaho.vn` | Theme, data, thông tin, gia hạn |

---

## Phase 1 — Platform API: Scaffold + Auth

**Thư mục**: `platform-api/`

### 1.1 Scaffold project

- Khởi tạo `platform-api/` với Express 5 + TypeScript
- Cấu trúc thư mục:
  ```
  platform-api/
  ├── src/
  │   ├── routes/
  │   ├── controllers/
  │   ├── services/
  │   ├── middlewares/
  │   ├── lib/
  │   │   └── prisma.ts
  │   └── app.ts
  ├── prisma/
  │   ├── schema.prisma
  │   └── seed.ts
  ├── tests/
  │   ├── unit/
  │   └── integration/
  ├── .env.example
  ├── tsconfig.json
  └── package.json
  ```
- Scripts: `dev`, `build`, `test`, `lint`, `db:push`, `db:seed`
- Cài dependencies: express, prisma, @prisma/client, jsonwebtoken, bcrypt, cookie-parser, cors, zod, dotenv, ts-node-dev

### 1.2 Prisma Schema + MongoDB

Kết nối database riêng (tách khỏi DB của `backend/`):

```prisma
model PlatformAdmin {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  email        String        @unique
  password     String        // bcrypt hash
  name         String
  role         String        @default("SUPER_ADMIN") // SUPER_ADMIN | SUPPORT
  activityLogs ActivityLog[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Clan {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  name         String
  code         String        @unique  // slug, dùng làm subdomain
  licenseType  String        // PERMANENT | SUBSCRIPTION
  status       String        @default("ACTIVE") // ACTIVE | SUSPENDED | EXPIRED
  subdomain    String?       // subscription: "ho-nguyen.giaphaho.vn"
  contactName  String?
  contactEmail String?
  contactPhone String?
  address      String?
  notes        String?
  licenses     License[]
  theme        Theme?
  activityLogs ActivityLog[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model License {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  clan          Clan      @relation(fields: [clanId], references: [id])
  clanId        String    @db.ObjectId
  type          String    // PERMANENT | SUBSCRIPTION
  key           String    @unique
  activatedAt   DateTime?
  expiresAt     DateTime? // null = vĩnh viễn
  isRevoked     Boolean   @default(false)
  downloadCount Int       @default(0)
  maxDownloads  Int       @default(3)  // permanent only
  downloadLogs  DownloadLog[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model DownloadLog {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  license     License  @relation(fields: [licenseId], references: [id])
  licenseId   String   @db.ObjectId
  ip          String?
  userAgent   String?
  token       String   @unique  // signed token dùng 1 lần
  usedAt      DateTime?
  expiresAt   DateTime
  createdAt   DateTime @default(now())
}

model Theme {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  clan         Clan     @relation(fields: [clanId], references: [id])
  clanId       String   @unique @db.ObjectId
  primaryColor String   @default("#8B0000")
  accentColor  String   @default("#6B0000")
  logo         String?  // Cloudinary URL
  favicon      String?  // Cloudinary URL
  fontFamily   String   @default("Be Vietnam Pro")
  customCss    String?
  updatedAt    DateTime @updatedAt
}

model ActivityLog {
  id        String         @id @default(auto()) @map("_id") @db.ObjectId
  clan      Clan?          @relation(fields: [clanId], references: [id])
  clanId    String?        @db.ObjectId
  admin     PlatformAdmin? @relation(fields: [adminId], references: [id])
  adminId   String?        @db.ObjectId
  action    String         // CREATE_CLAN | UPDATE_CLAN | SUSPEND_CLAN | GENERATE_LICENSE | REVOKE_LICENSE | UPDATE_THEME | GENERATE_DOWNLOAD | RENEW_LICENSE
  detail    Json?
  createdAt DateTime       @default(now())
}

model Notification {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  clanId    String?  @db.ObjectId
  type      String   // LICENSE_EXPIRY_WARNING | LICENSE_EXPIRED | CLAN_SUSPENDED
  message   String
  isRead    Boolean  @default(false)
  sentEmail Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### 1.3 Auth routes

```
POST /api/auth/login          ← email + password → JWT HTTP-only cookie
POST /api/auth/logout         ← clear cookie
GET  /api/auth/me             ← thông tin admin đang đăng nhập
```

- Middleware `authenticate` kiểm tra cookie `platform_token`
- Middleware `requireRole` kiểm tra role SUPER_ADMIN / SUPPORT

### 1.4 Seed

- Tạo 1 PlatformAdmin mặc định (email/password từ env)
- Tạo 2-3 Clan mẫu (1 PERMANENT, 1-2 SUBSCRIPTION) với license + theme

### 1.5 Env vars

```env
DATABASE_URL=                     # MongoDB Atlas — DB riêng cho platform
JWT_SECRET=                       # min 32 chars
PORT=8090
SUPER_ADMIN_DEFAULT_EMAIL=
SUPER_ADMIN_DEFAULT_PASSWORD=
FRONTEND_SUPER_ADMIN_URL=http://localhost:3001
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=                        # gửi email cảnh báo license
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

---

## Phase 2 — Platform API: Clan + License CRUD

**Thư mục**: `platform-api/`

### 2.1 Clan routes

```
GET    /api/clans                           ← danh sách, filter: status/licenseType, search: name/code, pagination
POST   /api/clans                           ← tạo họ mới (tự generate license key đầu tiên)
GET    /api/clans/:id                       ← chi tiết họ (kèm license hiện tại + theme)
PATCH  /api/clans/:id                       ← cập nhật thông tin
PATCH  /api/clans/:id/status               ← ACTIVE | SUSPENDED
DELETE /api/clans/:id                       ← xóa họ (soft delete)
```

### 2.2 License routes

```
POST   /api/clans/:id/license/generate      ← tạo license key mới (UUID v4)
PATCH  /api/clans/:id/license/:lid/revoke   ← thu hồi license
POST   /api/clans/:id/license/:lid/renew    ← gia hạn subscription (thêm N tháng/năm)
GET    /api/clans/:id/license/history       ← toàn bộ lịch sử license của họ
```

### 2.3 License validation (public — gọi từ backend của từng họ)

```
POST   /api/license/validate                ← body: { key }
                                            ← response: { valid, type, expiresAt, clanCode, status }
```

- Rate limit: 10 req/phút per IP
- Không cần auth super admin
- Log lần validate cuối vào License

### 2.4 Download package (PERMANENT)

```
POST   /api/clans/:id/download/generate     ← tạo signed download token (7 ngày)
GET    /api/download/:token                 ← verify token → redirect signed URL → tăng downloadCount
```

- Nếu `downloadCount >= maxDownloads` → trả 403
- Log IP + userAgent vào DownloadLog

### 2.5 Validation (Zod)

- Validate toàn bộ request body với Zod schema
- Trả lỗi chuẩn: `{ success: false, error: { code, message, details } }`

---

## Phase 3 — Platform API: Theme + Notifications

**Thư mục**: `platform-api/`

### 3.1 Theme routes

```
GET    /api/clans/:id/theme                 ← lấy theme config (auth required)
PUT    /api/clans/:id/theme                 ← cập nhật theme (subscription only)
POST   /api/clans/:id/theme/logo            ← upload logo → Cloudinary
POST   /api/clans/:id/theme/favicon         ← upload favicon → Cloudinary
DELETE /api/clans/:id/theme/logo            ← xóa logo
DELETE /api/clans/:id/theme/favicon         ← xóa favicon
```

### 3.2 Theme public endpoint (gọi từ frontend clan)

```
GET    /api/theme/:clanCode                 ← public, không cần auth, cache 1h
                                            ← response: CSS variables JSON
```

### 3.3 Notification system

**Cron job** (chạy mỗi ngày 08:00):
- Quét tất cả license SUBSCRIPTION còn active
- Nếu `expiresAt` trong vòng 30 ngày → tạo Notification type `LICENSE_EXPIRY_WARNING`
- Nếu `expiresAt` đã qua → update status clan thành EXPIRED, tạo `LICENSE_EXPIRED`
- Gửi email cảnh báo tới `contactEmail` của clan (nếu chưa gửi trong 7 ngày)

```
GET    /api/notifications                   ← danh sách thông báo (unread first)
PATCH  /api/notifications/:id/read          ← đánh dấu đã đọc
PATCH  /api/notifications/read-all          ← đánh dấu tất cả đã đọc
```

### 3.4 Analytics endpoint

```
GET    /api/analytics/overview              ← tổng số clan, active/expired/suspended, sắp hết hạn
GET    /api/analytics/clans                 ← clan mới theo tháng (12 tháng gần nhất)
GET    /api/analytics/licenses              ← breakdown PERMANENT vs SUBSCRIPTION
GET    /api/analytics/expiry                ← danh sách clan sắp hết hạn (30 ngày)
```

---

## Phase 4 — Super Admin Frontend: Scaffold + Auth

**Thư mục**: `super-admin/`

### 4.1 Scaffold Next.js project

```
super-admin/
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← sidebar + header + notification bell
│   │   ├── page.tsx            ← overview dashboard
│   │   ├── clans/
│   │   ├── licenses/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── settings/
│   └── layout.tsx              ← root layout, font, ThemeProvider
├── components/
│   ├── layout/                 ← Sidebar, Header, NotificationBell
│   ├── clan/                   ← ClanTable, ClanCard, ClanForm, StatusBadge
│   ├── license/                ← LicenseCard, LicenseHistory, GenerateModal
│   ├── theme/                  ← ThemeEditor, ColorPicker, FontPicker
│   ├── analytics/              ← OverviewCards, Charts
│   └── shared/                 ← Button, Input, Modal, Badge, Table, Tabs
├── lib/
│   ├── api.ts                  ← fetch wrapper → platform-api
│   └── utils.ts
├── types/
│   └── index.ts
├── middleware.ts               ← JWT guard /dashboard/*
├── .env.local
└── package.json
```

- Dùng lại CSS variables từ `frontend/app/globals.css` (design system nhất quán)
- Font: Be Vietnam Pro (giống frontend)
- Không dùng Shadcn/ui — build component thuần Tailwind (giữ nhẹ)

### 4.2 Login page (`/login`)

- Form: Email + Password
- Gọi `POST /api/auth/login` → lưu cookie `platform_token`
- Hiển thị lỗi inline
- Redirect `/` sau login thành công

### 4.3 Middleware auth

- Kiểm tra `platform_token` cookie trên mọi route `/dashboard/*` (hoặc `/(dashboard)/*`)
- Redirect `/login` nếu không có token hoặc token hết hạn

### 4.4 Layout dashboard

- **Sidebar** (desktop): logo, nav links với icon, collapse button
- **Sidebar** (mobile): drawer overlay
- **Header**: breadcrumb, notification bell (badge số unread), avatar + dropdown logout
- **Notification bell**: dropdown 5 thông báo gần nhất, link xem tất cả

### 4.5 Env vars

```env
NEXT_PUBLIC_PLATFORM_API_URL=http://localhost:8090
```

---

## Phase 5 — Super Admin Frontend: Dashboard Overview

**Thư mục**: `super-admin/`

### 5.1 Overview cards

- Tổng số họ đang active
- Số họ PERMANENT / SUBSCRIPTION
- Số họ SUSPENDED
- Số license sắp hết hạn (≤ 30 ngày) — màu cảnh báo

### 5.2 Bảng họ sắp hết hạn

- Tên họ, ngày hết hạn, số ngày còn lại, nút Gia hạn nhanh

### 5.3 Activity log gần đây

- 10 hoạt động gần nhất (action + clan + thời gian)

### 5.4 Biểu đồ

- Line chart: Số clan mới theo tháng (12 tháng)
- Doughnut chart: PERMANENT vs SUBSCRIPTION

---

## Phase 6 — Super Admin Frontend: Clan Management

**Thư mục**: `super-admin/`

### 6.1 Danh sách họ (`/clans`)

- Bảng: Tên họ, Code, Loại, Trạng thái, Ngày hết hạn, Ngày tạo, Actions
- Filter tabs: Tất cả / Active / Suspended / Expired
- Filter dropdown: PERMANENT / SUBSCRIPTION
- Search input: theo tên hoặc code
- Pagination
- Nút **Thêm họ mới**

### 6.2 Tạo họ mới (`/clans/new`)

- Bước 1 — Thông tin cơ bản:
  - Tên họ (ví dụ: Họ Nguyễn Bát Tràng)
  - Code/slug (ví dụ: ho-nguyen-bat-trang) — tự generate từ tên, cho sửa
  - Loại license: PERMANENT | SUBSCRIPTION
  - Nếu SUBSCRIPTION: subdomain (tự điền từ code), ngày bắt đầu, thời hạn (3/6/12 tháng)
- Bước 2 — Thông tin liên hệ:
  - Tên người liên hệ, Email, Số điện thoại, Địa chỉ
- Bước 3 — Xác nhận:
  - Hiển thị tóm tắt + license key đã generate
  - Nút Copy license key
  - Submit

### 6.3 Chi tiết họ (`/clans/[id]`)

- Header: Tên họ + Code + badge Loại + badge Trạng thái + nút Suspend/Activate
- Tabs: **Thông tin** | **License** | **Theme** (ẩn nếu PERMANENT) | **Lịch sử**

**Tab Thông tin**:
- Form edit: tên, email, phone, địa chỉ, ghi chú
- Nút Lưu thay đổi

**Tab License**:
- Card license hiện tại: key (masked ***), loại, ngày tạo, ngày hết hạn, trạng thái
- Nút: Copy key, Revoke, Generate key mới
- Nếu SUBSCRIPTION: nút Gia hạn (modal chọn thêm N tháng)
- Nếu PERMANENT: card Download — số lần còn lại (N/3), nút Tạo link download
- Bảng lịch sử license

**Tab Lịch sử** (Activity Log):
- Timeline các action: tạo họ, generate key, revoke, update theme, suspend...

---

## Phase 7 — Super Admin Frontend: Theme Editor

**Thư mục**: `super-admin/`
**Chỉ hiển thị cho SUBSCRIPTION clans**

### 7.1 Theme editor UI (`/clans/[id]/theme`)

- Layout 2 cột: **Cài đặt** (trái) | **Preview** (phải)
- **Color pickers**:
  - Màu chủ đạo (`primaryColor`)
  - Màu phụ (`accentColor`)
  - Preview swatch realtime
- **Upload logo**: drag & drop, preview, xóa
- **Upload favicon**: drag & drop, preview, xóa
- **Font chữ**: dropdown (Be Vietnam Pro, Roboto, Noto Serif, ...)
- **Custom CSS**: textarea với monospace font
- Nút **Lưu** + **Reset về mặc định**

### 7.2 Preview panel

- Mini preview hiển thị header + nav + một card nội dung mẫu
- Apply CSS variables từ theme config đang chỉnh (không cần save)
- Responsive toggle: Desktop / Mobile

---

## Phase 8 — Super Admin Frontend: Analytics

**Thư mục**: `super-admin/`

### 8.1 Trang Analytics (`/analytics`)

- **Cards tổng quan**: tổng clan, active, expired, sắp hết hạn
- **Biểu đồ 1**: Bar chart — số clan mới mỗi tháng trong 12 tháng
- **Biểu đồ 2**: Doughnut — PERMANENT vs SUBSCRIPTION
- **Biểu đồ 3**: Line chart — số validate license request theo ngày (30 ngày)
- **Bảng**: Top 10 clan download nhiều nhất (PERMANENT)
- **Bảng**: Clan sắp hết hạn trong 30 ngày (sort theo ngày hết hạn)

---

## Phase 9 — Super Admin Frontend: Notifications + Settings

**Thư mục**: `super-admin/`

### 9.1 Trang Notifications (`/notifications`)

- Danh sách thông báo (unread trước, có badge "Mới")
- Filter: Tất cả / Chưa đọc / License hết hạn / Đã tạm dừng
- Mỗi item: icon type + message + thời gian + nút đánh dấu đã đọc
- Nút **Đánh dấu tất cả đã đọc**

### 9.2 Trang Settings (`/settings`)

- **Thông tin tài khoản**: tên, email, đổi mật khẩu
- **Cài đặt email**: SMTP config (hiển thị masked, nút Test email)
- **Cài đặt platform**:
  - Tên platform
  - Base domain (giaphaho.vn)
  - Max downloads mặc định cho PERMANENT license
  - Số ngày cảnh báo trước khi hết hạn (mặc định 30)
- **Danger zone**: Reset seed data (chỉ dev)

---

## Phase 10 — License Validation trong `backend/` của từng họ

**Thư mục**: `backend/`

### 10.1 Env var mới

Thêm vào `backend/.env.example`:
```env
LICENSE_KEY=                      # cấp bởi platform super admin
PLATFORM_API_URL=https://platform-api.giaphaho.vn
```

### 10.2 License validation middleware

File `backend/src/middlewares/license.ts`:

**Permanent license**:
- Validate khi server khởi động bằng cách gọi `POST /api/license/validate`
- Cache kết quả vào `license.cache.json` (local file)
- Nếu platform API không reach được → đọc cache, cho phép chạy trong grace period 7 ngày
- Sau 7 ngày offline → log error + process.exit(1)

**Subscription license**:
- Validate khi server khởi động
- Tạo cron job validate lại mỗi 24h
- Nếu license hết hạn hoặc bị revoke → trả 503 cho mọi API request
- Log cảnh báo khi < 7 ngày còn lại

### 10.3 Graceful degradation

- Không block app khi platform API chậm (timeout 5s)
- Chỉ exit khi chắc chắn license invalid (response 4xx từ platform)

---

## Phase 11 — Multi-tenant Routing (Subscription)

**Phụ thuộc**: Phase 3 + Phase 7 hoàn thành

### 11.1 Frontend middleware đọc subdomain

Trong `frontend/middleware.ts` (của subscription clan):
- Parse `req.headers.host` → extract `clanCode`
- Gọi `GET platform-api/api/theme/:clanCode` (cache 1h)
- Inject CSS variables vào response headers
- Nếu clan SUSPENDED → redirect trang thông báo

### 11.2 Vercel wildcard domain

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/$1" }
  ]
}
```

- Cấu hình wildcard `*.giaphaho.vn` → cùng 1 Next.js deployment
- Mỗi clan subscription dùng chung deployment, phân biệt bằng subdomain

### 11.3 Backend routing cho subscription

- Header `X-Clan-Code` được gửi từ frontend
- Middleware trong backend đọc header để load đúng config của clan
- Hoặc mỗi clan subscription deploy backend riêng trên Railway (đơn giản hơn ban đầu)

---

## Phase 12 — Testing

**Thư mục**: `platform-api/tests/`, `super-admin/tests/`

### 12.1 Platform API — Unit tests (Vitest)

- `auth.service.test.ts` — login, token generation, me
- `clan.service.test.ts` — CRUD, filter, pagination
- `license.service.test.ts` — generate key, revoke, validate, renew
- `theme.service.test.ts` — get, update, upload
- `notification.service.test.ts` — cron logic, expiry detection

### 12.2 Platform API — Integration tests (Supertest)

- `auth.test.ts` — login success/fail, cookie, logout
- `clans.test.ts` — CRUD endpoints, status change
- `license.test.ts` — generate, revoke, validate endpoint
- `download.test.ts` — token generate, download limit

### 12.3 Super Admin FE — Component tests (Vitest + RTL)

- `ClanTable.test.tsx`
- `LicenseCard.test.tsx`
- `ThemeEditor.test.tsx`
- `LoginForm.test.tsx`

### 12.4 E2E tests (Playwright)

- Login flow
- Tạo clan mới (cả 2 loại)
- Generate + revoke license
- Cập nhật theme
- Gia hạn subscription

---

## Phase 13 — CI/CD + Deploy

### 13.1 GitHub Actions

```yaml
# .github/workflows/platform-api.yml
on: [push, pull_request]
jobs:
  test:
    - npm run lint
    - npm run test
  deploy:
    - Deploy lên Railway (main branch only)

# .github/workflows/super-admin.yml
on: [push, pull_request]
jobs:
  test:
    - npm run lint
    - npm run test
  deploy:
    - Deploy lên Vercel (main branch only)
```

### 13.2 Deploy targets

| Service | Platform | URL | Notes |
|---------|----------|-----|-------|
| `platform-api/` | Railway | `platform-api.giaphaho.vn` | DB riêng MongoDB Atlas |
| `super-admin/` | Vercel | `superadmin.giaphaho.vn` | Project riêng trên Vercel |
| Clan SUBSCRIPTION | Vercel wildcard | `[code].giaphaho.vn` | Dùng chung deployment `frontend/` |
| Clan PERMANENT | Server riêng của họ | Domain riêng | Tự deploy |

### 13.3 Environment setup

- `platform-api/` Railway: set env vars qua Railway dashboard
- `super-admin/` Vercel: set `NEXT_PUBLIC_PLATFORM_API_URL`
- MongoDB Atlas: tạo DB cluster riêng `platform-db`
- Cloudinary: dùng chung account, folder riêng `platform/`

---

## Thứ tự triển khai

```
Phase 1   Platform API: Scaffold + Auth                  (2 ngày)
Phase 2   Platform API: Clan + License CRUD              (3 ngày)
Phase 3   Platform API: Theme + Notifications            (2 ngày)
Phase 4   Super Admin FE: Scaffold + Auth                (2 ngày)
Phase 5   Super Admin FE: Dashboard Overview             (2 ngày)
Phase 6   Super Admin FE: Clan Management                (4 ngày)
Phase 7   Super Admin FE: Theme Editor                   (2 ngày)
Phase 8   Super Admin FE: Analytics                      (2 ngày)
Phase 9   Super Admin FE: Notifications + Settings       (2 ngày)
Phase 10  License Validation trong backend/              (1 ngày)
Phase 11  Multi-tenant Routing (Subscription)            (3 ngày)
Phase 12  Testing                                        (3 ngày)
Phase 13  CI/CD + Deploy                                 (2 ngày)
─────────────────────────────────────────────────────────────────
Tổng ước tính                                            ~30 ngày
```

---

## Checklist trước khi ship

- [ ] Tất cả API endpoint có auth + validation Zod
- [ ] License key không bao giờ trả về plain text trong list endpoint (masked)
- [ ] Rate limit trên `/api/license/validate`
- [ ] Download token dùng 1 lần, có expiry
- [ ] Cron job gửi email không gửi duplicate trong 7 ngày
- [ ] Theme public endpoint có cache header
- [ ] Tất cả secrets trong env, không hardcode
- [ ] CORS chỉ cho phép domain super-admin + các subdomain clan
- [ ] Tests pass CI trước khi merge
