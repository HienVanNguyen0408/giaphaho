# Data Model: Website Gia Phả Họ Phùng Bát Tràng

## Entities Overview

| Entity | Collection | Purpose |
|--------|-----------|---------|
| User | users | Admin accounts (SUPER_ADMIN / CHI_ADMIN) |
| Member | members | Genealogy tree nodes |
| News | news | News/blog articles |
| Video | videos | YouTube video embeds |
| Section | sections | Dynamic homepage sections |
| FooterConfig | footerConfigs | Global footer content |
| Notification | notifications | System notifications |
| ActivityLog | activityLogs | Audit trail |

---

## Prisma Schema (MongoDB)

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
  password  String        // bcrypt hash
  role      Role          @default(CHI_ADMIN)
  chiId     String?       @db.ObjectId   // branch scope for CHI_ADMIN
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
  avatar       String?   // Cloudinary URL
  birthYear    Int?
  deathYear    Int?
  gender       String?   // "male" | "female" | null
  bio          String?
  achievements String[]  // list of achievement strings
  parentId     String?   @db.ObjectId
  parent       Member?   @relation("MemberChildren", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  children     Member[]  @relation("MemberChildren")
  chiId        String?   @db.ObjectId   // which branch this member belongs to
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

// ====== TIN TỨC ======
model News {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  slug        String   @unique   // auto-generated from title, URL-safe
  content     String             // rich text HTML from Tiptap
  thumbnail   String?            // Cloudinary URL
  isPinned    Boolean  @default(false)
  publishedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ====== VIDEO ======
model Video {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  title        String
  youtubeUrl   String   // full YouTube watch URL or embed URL
  thumbnailUrl String?  // auto-extracted or manually set
  order        Int      @default(0)   // display order (lower = first)
  createdAt    DateTime @default(now())
}

// ====== SECTION ĐỘNG ======
model Section {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  newsId    String?  @db.ObjectId   // optional linked news article
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
  // Single-row table (only one document should exist)
}

// ====== NOTIFICATION ======
model Notification {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  message   String
  type      String   // e.g., "member_added", "news_published"
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

// ====== ACTIVITY LOG ======
model ActivityLog {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id])
  action    String   // HTTP method: POST, PUT, DELETE, PATCH
  target    String   // resource name: "member", "news", "video", etc.
  targetId  String?  // ID of the affected document
  detail    String?  // human-readable summary
  createdAt DateTime @default(now())
}
```

---

## Entity Details

### User

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | ObjectId | PK, auto | |
| username | String | UNIQUE, required | Login credential |
| password | String | required | bcrypt(rounds=12) hash |
| role | Role enum | default CHI_ADMIN | SUPER_ADMIN or CHI_ADMIN |
| chiId | ObjectId? | nullable | Scope for CHI_ADMIN; null = all branches |
| createdAt | DateTime | auto | |

**Validation rules**:
- `username`: 3–50 chars, alphanumeric + underscore
- `password` (raw): 8+ chars, enforced at registration only
- Only one SUPER_ADMIN can be created via seed (additional SUPER_ADMINs only via SUPER_ADMIN action)

---

### Member

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | ObjectId | PK, auto | |
| fullName | String | required, 1–200 chars | |
| avatar | String? | nullable | Cloudinary URL |
| birthYear | Int? | nullable, 1000–current year | |
| deathYear | Int? | nullable, ≥ birthYear if set | |
| gender | String? | "male"\|"female"\|null | |
| bio | String? | nullable, max 5000 chars | |
| achievements | String[] | default [] | |
| parentId | ObjectId? | nullable, FK → Member | Self-referential parent |
| chiId | ObjectId? | nullable | Branch membership |
| createdAt | DateTime | auto | |
| updatedAt | DateTime | auto | |

**State transitions**: None (no status field)
**Relationships**: `parent` (0..1) ↔ `children` (0..N) — tree structure

---

### News

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | ObjectId | PK, auto | |
| title | String | required, 1–300 chars | |
| slug | String | UNIQUE, required | Auto-generated: slugify(title) |
| content | String | required | HTML from Tiptap |
| thumbnail | String? | nullable | Cloudinary URL |
| isPinned | Boolean | default false | Max 1 pinned recommended |
| publishedAt | DateTime | default now | |
| updatedAt | DateTime | auto | |

**Slug generation**: `title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')` + suffix if duplicate.

---

### Video

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | ObjectId | PK, auto | |
| title | String | required, 1–200 chars | |
| youtubeUrl | String | required | Validated as YouTube URL |
| thumbnailUrl | String? | nullable | Auto: `https://img.youtube.com/vi/{videoId}/hqdefault.jpg` |
| order | Int | default 0 | Lower = displayed first |
| createdAt | DateTime | auto | |

---

### Section

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | ObjectId | PK, auto | |
| name | String | required | Display name for section |
| newsId | ObjectId? | nullable | Optional linked article |
| isActive | Boolean | default true | Toggled by admin |
| order | Int | default 0 | Display order |
| createdAt | DateTime | auto | |

---

### FooterConfig

| Field | Type | Notes |
|-------|------|-------|
| id | ObjectId | Single document |
| contact | String | Phone/email contact info |
| description | String | About text |
| copyright | String | e.g., "© 2026 Dòng họ Phùng Bát Tràng" |

**Note**: Only one document exists. `GET /api/footer` returns it; if absent, create on first `PUT`.

---

### Notification

| Field | Type | Notes |
|-------|------|-------|
| id | ObjectId | |
| message | String | Human-readable notification text |
| type | String | Event type: "member_added", "news_published", etc. |
| isRead | Boolean | default false |
| createdAt | DateTime | auto |

---

### ActivityLog

| Field | Type | Notes |
|-------|------|-------|
| id | ObjectId | |
| userId | ObjectId | FK → User |
| action | String | HTTP method or custom action name |
| target | String | Resource type ("member", "news", …) |
| targetId | String? | Affected document ID |
| detail | String? | Optional human-readable summary |
| createdAt | DateTime | auto |

---

## Indexes (beyond Prisma unique constraints)

| Collection | Index | Type | Purpose |
|-----------|-------|------|---------|
| members | fullName | text | Search |
| news | title, content | text | Search |
| videos | title | text | Search |
| members | parentId | regular | Tree traversal |
| members | chiId | regular | Branch filtering |
| activityLogs | userId | regular | User history queries |
| notifications | isRead | regular | Unread badge count |

*Create via `prisma.$runCommandRaw` or MongoDB Atlas UI after `prisma db push`.*

---

## Seed Data

`prisma/seed.ts` should create:
1. One SUPER_ADMIN user: `{ username: "admin", password: bcrypt("changeme123"), role: "SUPER_ADMIN" }`
2. One root Member (founder of the clan)
3. One FooterConfig document
4. 2–3 sample News articles
5. 1–2 sample Videos
