# Quickstart: Website Gia Phả Họ Phùng Bát Tràng

## Prerequisites

- Node.js ≥ 20 LTS
- npm ≥ 10
- MongoDB Atlas account (free tier OK for dev)
- Cloudinary account (free tier OK)
- Git

---

## 1. Clone & Bootstrap

```bash
git clone <repo-url> giaphaho
cd giaphaho
```

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/giaphaho?retryWrites=true&w=majority"
JWT_SECRET="your-secret-key-min-32-chars"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
PORT=8080
```

Initialize the database:
```bash
npx prisma generate
npx prisma db push
npm run db:seed         # uses tsx internally
```

Start dev server:
```bash
npm run dev
# → http://localhost:8080
```

Default SUPER_ADMIN credentials created by seed:
- **username**: `admin`
- **password**: `changeme123`

---

## 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Start dev server:
```bash
npm run dev
# → http://localhost:3000
```

Admin panel: `http://localhost:3000/admin/login`

---

## 4. Run Tests

### Backend (Vitest + Supertest)
```bash
cd backend
npm test          # unit + integration tests
npm run test:watch
```

### Frontend (Vitest + RTL)
```bash
cd frontend
npm test
```

### E2E (Playwright)
```bash
cd frontend
npx playwright install --with-deps
npm run test:e2e   # requires both servers running
```

---

## 5. Key NPM Scripts

| Directory | Command | Description |
|-----------|---------|-------------|
| backend | `npm run dev` | ts-node-dev watch mode |
| backend | `npm run build` | tsc compile to dist/ |
| backend | `npm start` | Run compiled dist/app.js |
| backend | `npm test` | Vitest run |
| backend | `npm run db:push` | prisma db push |
| backend | `npm run db:seed` | Run seed.ts |
| frontend | `npm run dev` | Next.js dev server |
| frontend | `npm run build` | Next.js production build |
| frontend | `npm start` | Next.js production server |
| frontend | `npm test` | Vitest run |
| frontend | `npm run test:e2e` | Playwright tests |
| frontend | `npm run lint` | ESLint check |

---

## 6. Project Structure Quick Reference

```
giaphaho/
├── backend/
│   ├── src/
│   │   ├── routes/         # Express routers — one file per resource
│   │   ├── controllers/    # Thin: parse req, call service, send response
│   │   ├── services/       # Business logic (unit-testable)
│   │   ├── middlewares/    # auth.middleware, role.middleware, logger.middleware
│   │   ├── utils/          # jwt.ts, bcrypt.ts, response.ts
│   │   └── app.ts
│   ├── prisma/schema.prisma
│   └── tests/
└── frontend/
    ├── app/
    │   ├── (public)/       # Public-facing pages
    │   └── admin/          # Admin dashboard
    ├── components/
    │   ├── public/         # Header, Footer, FamilyTree, etc.
    │   ├── admin/          # Sidebar, TopBar, forms
    │   └── shared/         # SearchBar, DataTable, ConfirmDialog
    ├── lib/api.ts           # Typed fetch wrapper
    └── proxy.ts            # JWT guard for /admin/* (Next.js 16 replaces middleware.ts)
```

---

## 7. Auth Flow

1. `POST /api/auth/login` → backend sets `token` cookie (HTTP-only)
2. Next.js `proxy.ts` checks cookie for `/admin/*` routes (Next.js 16 — `middleware.ts` renamed to `proxy.ts`)
3. Frontend reads user data from `GET /api/auth/me`
4. `POST /api/auth/logout` → clears cookie

---

## 8. Adding a New Feature

1. **Write tests first** (Principle III — TDD)
2. Add Prisma model if needed → `prisma db push`
3. Create service → controller → route (backend)
4. Create component test → component (frontend)
5. Wire up API call in `lib/api.ts`
6. Update contracts/api.md

---

## 9. Deployment

### Backend → Railway (Docker)
```bash
# Dockerfile in backend/ — multi-stage build (builder + runner)
docker build -t giaphaho-backend ./backend
railway up
# Set env vars in Railway dashboard: DATABASE_URL, JWT_SECRET, CLOUDINARY_*
```

### Frontend → Vercel
```bash
# vercel.json is pre-configured in frontend/ with security headers
vercel --prod
# Set NEXT_PUBLIC_API_URL to Railway domain in Vercel dashboard
```

### Lighthouse CI
```bash
cd frontend
npx @lhci/cli@0.14 autorun   # uses .lighthouserc.json — requires npm run build + npm start first
```

### MongoDB Atlas
- Whitelist Railway server IP in Atlas Network Access
- Use production `DATABASE_URL` in Railway env vars
