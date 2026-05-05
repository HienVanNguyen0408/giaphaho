# Kế Hoạch Phát Triển – Website Gia Phả Họ Phùng Bát Tràng

**Tech Stack:** Next.js 14 · Node.js (Express) · MongoDB · Prisma ORM

---

## Tổng Quan Kiến Trúc

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │   Next.js 14  –  Port: 3000  –  Repo: frontend   │   │
│  │                                                  │   │
│  │   Route group (public)    Route group (admin)    │   │
│  │   /          /gia-pha     /admin/login            │   │
│  │   /tin-tuc   /video       /admin/gia-pha          │   │
│  │   /tim-kiem  /thanh-vien  /admin/tin-tuc  ...     │   │
│  └──────────────────────┬───────────────────────────┘   │
└─────────────────────────┼────────────────────────────────┘
                          │  HTTP/REST API
                          ▼
┌──────────────────────────────────────────────────────────┐
│                      BACKEND                             │
│                                                          │
│  ┌────────────────────────────────────────────────┐      │
│  │   API Server                                   │      │
│  │   Node.js + Express + TypeScript               │      │
│  │   Port: 8080  –  Repo: backend                 │      │
│  └──────────────────┬─────────────────────────────┘      │
│                     ▼                                    │
│  ┌────────────────────────────────────────────────┐      │
│  │   MongoDB Atlas  +  Prisma ORM                 │      │
│  └────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

**Cấu trúc repo:**
```
giaphaho/
├── backend/          # Node.js + Express API
└── frontend/         # Next.js – gộp User + Admin cùng project
```

---

# BACKEND

## Cấu Trúc Thư Mục

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.route.ts
│   │   ├── member.route.ts
│   │   ├── news.route.ts
│   │   ├── video.route.ts
│   │   ├── section.route.ts
│   │   ├── footer.route.ts
│   │   ├── notification.route.ts
│   │   ├── activity-log.route.ts
│   │   └── search.route.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── member.controller.ts
│   │   ├── news.controller.ts
│   │   ├── video.controller.ts
│   │   ├── section.controller.ts
│   │   ├── footer.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── activity-log.controller.ts
│   │   └── search.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── member.service.ts
│   │   ├── news.service.ts
│   │   ├── video.service.ts
│   │   ├── section.service.ts
│   │   ├── footer.service.ts
│   │   ├── notification.service.ts
│   │   └── search.service.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts        # Verify JWT
│   │   ├── role.middleware.ts        # Kiểm tra quyền
│   │   └── logger.middleware.ts      # Ghi activity log tự động
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── bcrypt.ts
│   │   └── response.ts               # Chuẩn hoá response format
│   ├── types/
│   │   └── index.ts
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .env.example
├── tsconfig.json
└── package.json
```

## API Endpoints

### Auth
```
POST   /api/auth/login               # Đăng nhập
POST   /api/auth/logout              # Đăng xuất
GET    /api/auth/me                  # Lấy thông tin user hiện tại
```

### Member (Gia phả)
```
GET    /api/members                  # Lấy toàn bộ cây (tree structure)
GET    /api/members/:id              # Chi tiết 1 thành viên
POST   /api/members                  # Thêm mới [ADMIN]
PUT    /api/members/:id              # Cập nhật [ADMIN]
DELETE /api/members/:id              # Xóa [SUPER_ADMIN]
```

### News (Tin tức)
```
GET    /api/news                     # Danh sách (phân trang)
GET    /api/news/pinned              # Tin nổi bật
GET    /api/news/:slug               # Chi tiết theo slug
POST   /api/news                     # Tạo [ADMIN]
PUT    /api/news/:id                 # Sửa [ADMIN]
DELETE /api/news/:id                 # Xóa [ADMIN]
PATCH  /api/news/:id/pin             # Ghim/bỏ ghim [ADMIN]
```

### Video
```
GET    /api/videos                   # Danh sách
POST   /api/videos                   # Thêm [ADMIN]
PUT    /api/videos/:id               # Sửa [ADMIN]
DELETE /api/videos/:id               # Xóa [ADMIN]
PATCH  /api/videos/reorder           # Sắp xếp thứ tự [ADMIN]
```

### Section động
```
GET    /api/sections                 # Lấy danh sách
POST   /api/sections                 # Tạo mới [ADMIN]
PUT    /api/sections/:id             # Cập nhật [ADMIN]
PATCH  /api/sections/:id/toggle      # Bật/tắt [ADMIN]
DELETE /api/sections/:id             # Xóa [ADMIN]
```

### Các endpoint khác
```
GET    /api/footer                   # Lấy config footer
PUT    /api/footer                   # Cập nhật [ADMIN]
GET    /api/notifications            # Danh sách thông báo
PATCH  /api/notifications/:id/read   # Đánh dấu đã đọc
GET    /api/activity-logs            # Lịch sử thay đổi [SUPER_ADMIN]
GET    /api/search?q=                # Tìm kiếm tổng hợp
```

## Database Schema (Prisma + MongoDB)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// ====== AUTH ======
model User {
  id        String        @id @default(auto()) @map("_id") @db.ObjectId
  username  String        @unique
  password  String
  role      Role          @default(CHI_ADMIN)
  chiId     String?       @db.ObjectId
  createdAt DateTime      @default(now())
  logs      ActivityLog[]
}

enum Role {
  SUPER_ADMIN
  CHI_ADMIN
}

// ====== GIA PHẢ ======
model Member {
  id           String    @id @default(auto()) @map("_id") @db.ObjectId
  fullName     String
  avatar       String?
  birthYear    Int?
  deathYear    Int?
  gender       String?
  bio          String?
  achievements String[]
  parentId     String?   @db.ObjectId
  parent       Member?   @relation("MemberChildren", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  children     Member[]  @relation("MemberChildren")
  chiId        String?   @db.ObjectId
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

// ====== TIN TỨC ======
model News {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  slug        String   @unique
  content     String
  thumbnail   String?
  isPinned    Boolean  @default(false)
  publishedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ====== VIDEO ======
model Video {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  title        String
  youtubeUrl   String
  thumbnailUrl String?
  order        Int      @default(0)
  createdAt    DateTime @default(now())
}

// ====== SECTION ĐỘNG ======
model Section {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  newsId    String?  @db.ObjectId
  isActive  Boolean  @default(true)
  order     Int      @default(0)
  createdAt DateTime @default(now())
}

// ====== FOOTER ======
model FooterConfig {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  contact     String
  description String
  copyright   String
}

// ====== NOTIFICATION ======
model Notification {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  message   String
  type      String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

// ====== ACTIVITY LOG ======
model ActivityLog {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id])
  action    String
  target    String
  targetId  String?
  detail    String?
  createdAt DateTime @default(now())
}
```

---

# FRONTEND (User + Admin – 1 project)

> User public dùng route gốc, Admin dashboard dùng route `/admin/*`. Dùng Next.js route groups để tách layout mà không tách project.

## Cấu Trúc Thư Mục

```
frontend/
├── app/
│   ├── (public)/                     # Layout: Header + Footer
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Trang chủ  /
│   │   ├── gia-pha/
│   │   │   └── page.tsx              # /gia-pha
│   │   ├── thanh-vien/
│   │   │   └── [id]/page.tsx         # /thanh-vien/[id]
│   │   ├── tin-tuc/
│   │   │   ├── page.tsx              # /tin-tuc
│   │   │   └── [slug]/page.tsx       # /tin-tuc/[slug]
│   │   ├── video/
│   │   │   └── page.tsx              # /video
│   │   └── tim-kiem/
│   │       └── page.tsx              # /tim-kiem
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx              # /admin/login
│   │   └── (dashboard)/              # Layout: Sidebar + TopBar
│   │       ├── layout.tsx
│   │       ├── page.tsx              # /admin  – Dashboard
│   │       ├── gia-pha/
│   │       │   ├── page.tsx          # /admin/gia-pha
│   │       │   └── [id]/page.tsx     # /admin/gia-pha/[id]
│   │       ├── tin-tuc/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── video/
│   │       │   └── page.tsx
│   │       ├── section/
│   │       │   └── page.tsx
│   │       ├── footer/
│   │       │   └── page.tsx
│   │       ├── activity-log/
│   │       │   └── page.tsx
│   │       └── notification/
│   │           └── page.tsx
│   ├── layout.tsx                    # Root layout (font, providers)
│   └── globals.css
├── components/
│   ├── public/                       # Components cho phần public
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── TinNoiBat.tsx
│   │   │   ├── ThanhTichSection.tsx
│   │   │   ├── TinTucSection.tsx
│   │   │   ├── VideoSection.tsx
│   │   │   └── DynamicSection.tsx
│   │   └── gia-pha/
│   │       └── FamilyTree.tsx
│   ├── admin/                        # Components cho dashboard
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── gia-pha/
│   │   │   └── MemberForm.tsx
│   │   └── editor/
│   │       └── RichTextEditor.tsx    # Tiptap
│   └── shared/                       # Dùng chung cả 2 phần
│       ├── SearchBar.tsx
│       ├── DataTable.tsx
│       └── ConfirmDialog.tsx
├── middleware.ts                      # Chặn /admin/* nếu chưa auth
├── lib/
│   └── api.ts
├── types/
│   └── index.ts
├── .env.local
└── package.json
```

## Routes & Render Mode

| Route | Render Mode | Mô tả |
|---|---|---|
| `/` | ISR (1h) | Hero, Tin nổi bật, Thành tích, Tin tức, Video, Section động |
| `/gia-pha` | CSR | Cây phả hệ interactive – zoom, pan, phân cấp |
| `/thanh-vien/[id]` | SSR | Avatar, thông tin, thành tích, liên kết cha/con |
| `/tin-tuc` | SSG | Danh sách bài viết |
| `/tin-tuc/[slug]` | ISR (30m) | Nội dung bài viết đầy đủ |
| `/video` | ISR (1h) | Danh sách video YouTube |
| `/tim-kiem` | CSR | Tìm kiếm thành viên, bài viết, video |
| `/admin/login` | CSR | Đăng nhập admin |
| `/admin` | CSR | Dashboard thống kê |
| `/admin/*` | CSR | Toàn bộ chức năng quản trị |

## Chức Năng Admin

| Module | Chức năng | Phân quyền |
|---|---|---|
| Đăng nhập | JWT login/logout | Tất cả |
| Dashboard | Thống kê tổng quan | Admin tổng, Chi trưởng |
| Quản lý gia phả | Thêm/sửa/xóa thành viên, gán quan hệ | Admin tổng, Chi trưởng (theo chi) |
| Quản lý tin tức | CRUD bài viết, rich text editor, ghim bài | Admin tổng |
| Quản lý video | Nhúng YouTube, sắp xếp thứ tự | Admin tổng |
| Section trang chủ | Tạo/bật/tắt section động | Admin tổng |
| Footer config | Chỉnh sửa thông tin liên hệ, bản quyền | Admin tổng |
| Notification | Xem danh sách thông báo thay đổi | Tất cả |
| Activity Log | Xem lịch sử ai sửa gì, lúc nào | Admin tổng |

## Phân Quyền

```
Role: SUPER_ADMIN
  → Toàn quyền mọi chức năng
  → Quản lý tất cả chi họ

Role: CHI_ADMIN (trực hệ theo chi)
  → Chỉ thêm/sửa thành viên thuộc chi mình
  → Không xóa, không quản lý tin tức/video
```

---

# LỘ TRÌNH PHÁT TRIỂN

## Phase 1 – Dựng Khung Backend (Tuần 1)

> Mục tiêu: Backend chạy được, kết nối DB, auth hoạt động, có seed data.

### 1.1 Khởi tạo dự án
- [ ] Tạo folder `backend/`, init Node.js + TypeScript
- [ ] Cài Express, Prisma, JWT, bcrypt, cors, dotenv
- [ ] Setup `tsconfig.json`, scripts `dev` / `build`
- [ ] Cấu hình ESLint + Prettier

### 1.2 Kết nối Database
- [ ] Tạo MongoDB Atlas cluster
- [ ] Viết `prisma/schema.prisma` (toàn bộ models)
- [ ] Chạy `prisma generate` + `prisma db push`
- [ ] Viết `prisma/seed.ts` – tạo SUPER_ADMIN mặc định + data mẫu

### 1.3 Nền tảng server
- [ ] Setup `app.ts`: cors, json parser, routes mount
- [ ] Viết `response.ts` – chuẩn hoá `{ success, data, message }`
- [ ] Viết `auth.middleware.ts` – verify JWT
- [ ] Viết `role.middleware.ts` – kiểm tra SUPER_ADMIN / CHI_ADMIN
- [ ] Viết `logger.middleware.ts` – tự động ghi ActivityLog sau mỗi mutation

### 1.4 Auth API
- [ ] `POST /api/auth/login` – trả JWT
- [ ] `POST /api/auth/logout`
- [ ] `GET  /api/auth/me`
- [ ] Test bằng Postman / Thunder Client

---

## Phase 2 – Dựng Khung Frontend (Tuần 2)

> Mục tiêu: 1 project Next.js, routing đúng cả public lẫn admin, layout cơ bản, kết nối được API.

### 2.1 Khởi tạo project (`frontend/`)
- [ ] Init Next.js 14 App Router + TypeScript
- [ ] Cài Tailwind CSS + Shadcn/ui
- [ ] Setup `lib/api.ts` – wrapper fetch với base URL từ env
- [ ] Tạo `types/index.ts` – định nghĩa Member, News, Video, Section
- [ ] Setup biến môi trường `.env.local`: `NEXT_PUBLIC_API_URL`

### 2.2 Phần Public
- [ ] Dựng root layout: font, providers
- [ ] Dựng `(public)/layout.tsx`: `Header.tsx` + `Footer.tsx`
- [ ] Tạo các file page rỗng (placeholder):
  - `/` · `/gia-pha` · `/thanh-vien/[id]`
  - `/tin-tuc` · `/tin-tuc/[slug]` · `/video` · `/tim-kiem`

### 2.3 Phần Admin
- [ ] Tạo trang `app/admin/login/page.tsx` – form đăng nhập
- [ ] Dựng `app/admin/(dashboard)/layout.tsx`: `Sidebar.tsx` + `TopBar.tsx`
- [ ] Tạo các file page rỗng cho tất cả `/admin/*` routes
- [ ] Setup `middleware.ts` – kiểm tra cookie JWT, redirect `/admin/login` nếu chưa auth (chỉ apply cho path `/admin/*`, không ảnh hưởng public)

---

## Phase 3 – Backend Tính Năng Tổng Quan (Tuần 3)

> Mục tiêu: Toàn bộ CRUD cơ bản của các module chính hoạt động đúng.

### 3.1 Member API
- [ ] `GET    /api/members` – trả cây phả hệ dạng nested tree
- [ ] `GET    /api/members/:id` – chi tiết + populate parent/children
- [ ] `POST   /api/members` – thêm thành viên (ADMIN)
- [ ] `PUT    /api/members/:id` – sửa (ADMIN, CHI_ADMIN chỉ chi mình)
- [ ] `DELETE /api/members/:id` – xóa (SUPER_ADMIN)

### 3.2 News API
- [ ] `GET    /api/news` – danh sách, phân trang (`?page=&limit=`)
- [ ] `GET    /api/news/pinned` – tin ghim
- [ ] `GET    /api/news/:slug` – chi tiết
- [ ] `POST   /api/news` – tạo, tự gen slug từ title
- [ ] `PUT    /api/news/:id`
- [ ] `DELETE /api/news/:id`
- [ ] `PATCH  /api/news/:id/pin`

### 3.3 Video API
- [ ] `GET    /api/videos`
- [ ] `POST   /api/videos`
- [ ] `PUT    /api/videos/:id`
- [ ] `DELETE /api/videos/:id`
- [ ] `PATCH  /api/videos/reorder` – nhận array id theo thứ tự mới

### 3.4 Các API phụ
- [ ] Section: CRUD + toggle `isActive`
- [ ] Footer: GET + PUT
- [ ] Notification: GET danh sách + PATCH đánh dấu đã đọc
- [ ] Activity Log: GET (SUPER_ADMIN)
- [ ] Search: `GET /api/search?q=` tìm trong member + news + video

---

## Phase 4 – Frontend Tính Năng Tổng Quan (Tuần 4)

> Mục tiêu: Các trang hiển thị được dữ liệu thực từ API, layout hoàn chỉnh.

### 4.1 Phần Public – Màn hình chính
- [ ] **Trang chủ** – gọi API news (pinned + latest 3), videos (3), sections
  - HeroSection: ảnh dòng họ + nút CTA
  - TinNoiBat: card tin được ghim
  - ThanhTichSection: hiển thị achievements từ members
  - TinTucSection: 3 tin mới + link xem thêm
  - VideoSection: 3 video YouTube embed
  - DynamicSection: render theo config sections
- [ ] **Danh sách tin tức** – SSG, pagination
- [ ] **Chi tiết tin tức** – ISR 30m, render rich text HTML

### 4.2 Phần Public – Màn hình phụ
- [ ] **Trang video** – grid video + YouTube iframe
- [ ] **Trang tìm kiếm** – CSR, debounce input → gọi `/api/search`

### 4.3 Phần Admin – Auth & Layout
- [ ] Form login → gọi API → lưu JWT vào cookie
- [ ] Middleware chặn route nếu chưa auth
- [ ] TopBar: hiển thị tên user + nút logout
- [ ] Sidebar: menu navigation đầy đủ các module

### 4.4 Phần Admin – CRUD cơ bản
- [ ] **Tin tức**: DataTable danh sách + form tạo/sửa + nút xóa/ghim
- [ ] **Video**: DataTable + form nhúng YouTube URL + drag-to-reorder
- [ ] **Section**: toggle bật/tắt + sắp xếp thứ tự
- [ ] **Footer**: form chỉnh contact, description, copyright
- [ ] **Notification**: danh sách + đánh dấu đọc
- [ ] **Activity Log**: bảng lịch sử (SUPER_ADMIN)

---

## Phase 5 – Tính Năng Chi Tiết (Tuần 5–6)

> Mục tiêu: Hoàn thiện các tính năng phức tạp – cây gia phả, quản lý thành viên, phân quyền chi tiết.

### 5.1 Cây Gia Phả (Public)
- [ ] Cài `@xyflow/react` (ReactFlow)
- [ ] Component `FamilyTree.tsx`:
  - Nhận dữ liệu tree từ API, convert sang ReactFlow nodes/edges
  - Zoom in/out bằng scroll
  - Pan bằng chuột kéo / touch
  - Click node → mở Drawer/Modal thông tin thành viên
  - Hiển thị avatar + tên + năm sinh/mất trên node
- [ ] Xử lý cây lớn: lazy load các nhánh khi expand

### 5.2 Hồ Sơ Thành Viên (Public)
- [ ] Avatar, họ tên, năm sinh, năm mất
- [ ] Tab/Section: Thông tin · Quan hệ · Thành tích
- [ ] Liên kết clickable đến cha, mẹ, vợ/chồng, con cái
- [ ] SSR để SEO đúng cho từng thành viên

### 5.3 Quản Lý Thành Viên (Admin)
- [ ] DataTable thành viên: search + filter theo chi
- [ ] Form thêm/sửa thành viên:
  - Upload avatar → Cloudinary
  - Chọn cha/mẹ từ dropdown (search autocomplete)
  - Thêm/xóa achievements (dynamic list)
  - Chọn chi họ (CHI_ADMIN chỉ thấy chi mình)
- [ ] Xóa thành viên (SUPER_ADMIN): confirm dialog, xử lý cascade

### 5.4 Rich Text Editor (Admin)
- [ ] Tích hợp Tiptap vào form bài viết
  - Heading, bold, italic, link, image, list
  - Upload ảnh inline → Cloudinary
- [ ] Preview bài viết trước khi lưu

### 5.5 Dashboard Thống Kê (Admin)
- [ ] Số thành viên tổng / theo từng chi
- [ ] Số bài viết, số video
- [ ] Hoạt động gần đây (5 logs mới nhất)
- [ ] Thông báo chưa đọc (badge)

### 5.6 Phân Quyền Chi Tiết
- [ ] Backend: middleware kiểm tra `chiId` khi CHI_ADMIN thao tác member
- [ ] Frontend admin: ẩn/disable các nút/menu không có quyền
- [ ] Error message rõ ràng khi vượt quyền (403)

---

## Phase 6 – Hoàn Thiện & Deploy (Tuần 7)

### 6.1 Responsive & UI Polish
- [ ] Mobile responsive toàn bộ phần public (breakpoint sm/md/lg)
- [ ] Mobile responsive phần admin (sidebar collapse)
- [ ] Loading skeleton cho các section fetch dữ liệu
- [ ] Empty state khi không có dữ liệu

### 6.2 SEO & Performance
- [ ] `metadata` đúng cho từng trang (title, description, OG image)
- [ ] `sitemap.xml` tự động generate
- [ ] `robots.txt`
- [ ] Image optimization với `next/image`
- [ ] Lighthouse score ≥ 80

### 6.3 Testing
- [ ] Unit test service layer backend (Jest)
- [ ] Integration test các API endpoint chính
- [ ] E2E smoke test flow: login admin → tạo bài viết → xem trên trang public

### 6.4 Deploy
- [ ] **Backend** → Railway (hoặc VPS): Dockerfile, env vars
- [ ] **Frontend** → Vercel: 1 project duy nhất, env `NEXT_PUBLIC_API_URL` production
  - Public: domain chính (vd: `giaphahophung.vn`)
  - Admin: cùng domain, path `/admin` (bảo vệ bằng middleware)
- [ ] MongoDB Atlas: whitelist IP server
- [ ] HTTPS, domain config

### 6.5 Bàn giao
- [ ] Hướng dẫn sử dụng admin (PDF/Notion)
- [ ] Tài khoản SUPER_ADMIN ban đầu
- [ ] Seed data thật (thành viên, bài viết mẫu)

---

# CÔNG NGHỆ & THƯ VIỆN

| Hạng mục | Công nghệ |
|---|---|
| Frontend framework | Next.js 14 (App Router) |
| UI component | Shadcn/ui + Tailwind CSS |
| Cây gia phả | `@xyflow/react` (ReactFlow) |
| Rich text editor | Tiptap |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Upload ảnh | Cloudinary |
| Deploy FE | Vercel |
| Deploy BE | Railway hoặc VPS |

---

# TỔNG KẾT TIMELINE

| Phase | Nội dung | Thời gian |
|---|---|---|
| **Phase 1** | Dựng khung Backend | Tuần 1 |
| **Phase 2** | Dựng khung Frontend (User + Admin) | Tuần 2 |
| **Phase 3** | Backend – tính năng tổng quan (CRUD) | Tuần 3 |
| **Phase 4** | Frontend – tính năng tổng quan | Tuần 4 |
| **Phase 5** | Tính năng chi tiết (cây phả, thành viên, phân quyền) | Tuần 5–6 |
| **Phase 6** | Hoàn thiện, test, deploy | Tuần 7 |

---

*Tài liệu kế hoạch – Website Gia Phả Họ Phùng Bát Tràng*
