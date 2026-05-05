# Feature Specification: Website Gia Phả Họ Phùng Bát Tràng

**Feature Branch**: `001-gia-pha-ho-phung-bat-trang`
**Created**: 2026-05-05
**Status**: Draft
**Input**: `task-prompts/ke_hoach.md`

## User Scenarios & Testing

### User Story 1 - Public Homepage & Navigation (Priority: P1)

A visitor opens the website and sees the family homepage with a hero banner, highlighted pinned news, achievements highlights from members, latest news snippets, embedded YouTube videos, and dynamic sections — all in a polished, mobile-responsive layout.

**Why this priority**: This is the first impression of the website. Without the homepage, there is nothing to show. Delivers immediate visual value with no login required.

**Independent Test**: Start the frontend with mock API responses; the homepage renders all sections (Hero, TinNoiBat, ThanhTich, TinTuc, Video, DynamicSection) without errors.

**Acceptance Scenarios**:

1. **Given** a visitor opens `/`, **When** the page loads, **Then** they see HeroSection, TinNoiBat (pinned news), TinTucSection (3 latest articles), VideoSection (3 videos), and DynamicSection
2. **Given** the page is on mobile (< 640px), **When** the page renders, **Then** all sections are responsive and readable
3. **Given** the API returns no pinned news, **When** the homepage loads, **Then** the TinNoiBat section shows an empty state gracefully

---

### User Story 2 - Family Tree & Member Profiles (Priority: P2)

A visitor goes to `/gia-pha` and sees an interactive family tree they can zoom and pan. Clicking a member opens a detail view with their photo, birth/death years, bio, and links to relatives. The `/thanh-vien/:id` page shows full member details with SSR for SEO.

**Why this priority**: This is the core unique feature of the website — the family genealogy. It justifies the site's existence.

**Independent Test**: Navigate to `/gia-pha`; the ReactFlow tree renders with nodes connected by edges. Click a node; member detail drawer/modal opens. Navigate to `/thanh-vien/:id`; full member profile renders with correct data.

**Acceptance Scenarios**:

1. **Given** member data exists, **When** a visitor navigates to `/gia-pha`, **Then** the family tree displays nodes with avatar + name + years, connected by parent-child edges
2. **Given** the tree, **When** the visitor zooms/pans, **Then** the tree responds smoothly
3. **Given** the tree, **When** the visitor clicks a member node, **Then** a drawer/modal shows name, bio, achievements, and links to parent + children
4. **Given** a member ID, **When** the visitor navigates to `/thanh-vien/:id`, **Then** they see full profile with SSR-rendered metadata for SEO

---

### User Story 3 - News & Articles Browsing (Priority: P3)

A visitor can browse the news list at `/tin-tuc` (paginated, SSG) and read full articles at `/tin-tuc/:slug` (ISR, 30 min). Articles render Tiptap HTML content correctly.

**Why this priority**: Content is a major reason visitors return. News drives engagement and family communication.

**Independent Test**: Navigate to `/tin-tuc`; paginated article list renders. Click an article; navigate to `/tin-tuc/:slug` and the full rich-text content renders correctly.

**Acceptance Scenarios**:

1. **Given** news articles exist, **When** a visitor navigates to `/tin-tuc`, **Then** they see a paginated list with thumbnails, titles, and dates
2. **Given** an article slug, **When** the visitor navigates to `/tin-tuc/:slug`, **Then** the full article content (HTML) renders with correct formatting
3. **Given** no articles exist, **When** the visitor visits `/tin-tuc`, **Then** they see a graceful empty state

---

### User Story 4 - Video Gallery (Priority: P4)

A visitor visits `/video` and sees a grid of embedded YouTube videos. Videos are ordered by the `order` field.

**Why this priority**: Videos provide richer family media than text alone.

**Independent Test**: Navigate to `/video`; grid of YouTube iframes renders in order.

**Acceptance Scenarios**:

1. **Given** videos exist, **When** a visitor navigates to `/video`, **Then** they see a responsive grid of YouTube embeds with titles
2. **Given** the admin has set a custom order, **When** the visitor visits the page, **Then** videos appear in that order

---

### User Story 5 - Admin Authentication (Priority: P5)

An admin navigates to `/admin/login`, enters credentials, and gains access to the dashboard. The session persists via HTTP-only cookie. Unauthenticated visits to `/admin/*` redirect to login.

**Why this priority**: Authentication gates all admin features. Must exist before any admin functionality.

**Independent Test**: POST to `POST /api/auth/login` with valid credentials; receive JWT cookie. Navigate to `/admin`; dashboard loads. Clear cookie; navigate to `/admin/gia-pha`; get redirected to `/admin/login`.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** admin submits the login form, **Then** JWT cookie is set and they are redirected to `/admin`
2. **Given** invalid credentials, **When** admin submits the login form, **Then** an error message is shown
3. **Given** an authenticated admin, **When** they click logout, **Then** cookie is cleared and they are redirected to `/admin/login`
4. **Given** an unauthenticated user, **When** they navigate to `/admin/gia-pha`, **Then** they are redirected to `/admin/login`

---

### User Story 6 - Admin Genealogy Management (Priority: P6)

A SUPER_ADMIN or CHI_ADMIN can add, edit, and delete family members from the admin panel. CHI_ADMIN can only manage members in their own branch (chiId). SUPER_ADMIN has full access.

**Why this priority**: Managing the family tree is the primary admin task.

**Independent Test**: Log in as SUPER_ADMIN; add a new member with avatar, bio, achievements, and a parent relationship; confirm member appears in the tree. Log in as CHI_ADMIN; verify they cannot modify members outside their chiId.

**Acceptance Scenarios**:

1. **Given** SUPER_ADMIN is logged in, **When** they fill the member form and submit, **Then** the member is saved and visible in the tree
2. **Given** SUPER_ADMIN is logged in, **When** they upload an avatar, **Then** it uploads to Cloudinary and the URL is stored
3. **Given** CHI_ADMIN is logged in, **When** they try to edit a member from another branch, **Then** they receive a 403 error
4. **Given** SUPER_ADMIN is logged in, **When** they delete a member, **Then** a confirmation dialog appears; on confirm, the member is removed
5. **Given** a deleted member had children, **When** deletion is confirmed, **Then** children's `parentId` is set to null

---

### User Story 7 - Admin News Management (Priority: P7)

An admin (SUPER_ADMIN) can create, edit, and delete news articles using a Tiptap rich text editor. They can pin/unpin articles. Articles get auto-generated slugs.

**Why this priority**: News management allows keeping the site content fresh.

**Independent Test**: Log in as SUPER_ADMIN; create a new article with the rich text editor including a heading, image, and list; save; confirm it appears on the public `/tin-tuc` page. Pin the article; confirm it appears in `GET /api/news/pinned`.

**Acceptance Scenarios**:

1. **Given** SUPER_ADMIN is logged in, **When** they create an article with Tiptap content and submit, **Then** it is saved with an auto-generated slug
2. **Given** an article, **When** admin clicks the pin toggle, **Then** `isPinned` flips and the article appears/disappears from pinned list
3. **Given** an article, **When** admin deletes it with confirmation, **Then** it is removed and the slug becomes available

---

### User Story 8 - Admin Video & Section Management (Priority: P8)

An admin can add/edit/delete YouTube videos and reorder them via drag-and-drop. They can also create/toggle/delete homepage sections.

**Why this priority**: These features complete the homepage content management.

**Independent Test**: Add a video with a YouTube URL; confirm thumbnail is auto-populated. Drag to reorder; confirm `PATCH /api/videos/reorder` is called. Toggle a section; confirm it appears/disappears on the homepage.

**Acceptance Scenarios**:

1. **Given** SUPER_ADMIN is logged in, **When** they add a YouTube URL, **Then** the thumbnail is auto-populated from the YouTube video ID
2. **Given** a list of videos, **When** admin drags to reorder, **Then** the new order is persisted
3. **Given** a section, **When** admin toggles it off, **Then** it disappears from the public homepage

---

### User Story 9 - Search (Priority: P9)

A visitor types a query in the search bar at `/tim-kiem` and sees results across members, news, and videos in real time (debounced CSR fetch).

**Why this priority**: Search enables discovery across the entire content catalogue.

**Independent Test**: Navigate to `/tim-kiem?q=Phùng`; results appear with members, news, and videos matching the query. Verify debounce — typing quickly results in a single API call.

**Acceptance Scenarios**:

1. **Given** a search query, **When** the visitor types in the search bar, **Then** results appear after a 300ms debounce showing matching members, news, and videos
2. **Given** no results, **When** the query returns empty, **Then** an empty state message is shown
3. **Given** a query with < 2 characters, **When** typed, **Then** no API call is made

---

### User Story 10 - Admin Dashboard, Footer & Notifications (Priority: P10)

The admin dashboard shows statistics (total members, news, videos, unread notifications, recent activity). Admins can edit the footer content. All admins can view notifications; SUPER_ADMIN can view full activity logs.

**Why this priority**: These provide operational visibility and site configuration.

**Independent Test**: Log in as SUPER_ADMIN; the dashboard shows correct counts. Edit the footer; confirm `GET /api/footer` returns updated values. Create a member (triggers notification); confirm notification appears in the list.

**Acceptance Scenarios**:

1. **Given** SUPER_ADMIN is logged in, **When** they open the dashboard, **Then** they see accurate counts for members, news, videos, and unread notifications
2. **Given** SUPER_ADMIN edits the footer, **When** they save, **Then** the public footer updates on next page load
3. **Given** a new member was added, **When** any admin opens notifications, **Then** a new unread notification appears
4. **Given** SUPER_ADMIN opens the activity log, **When** the page loads, **Then** they see a paginated list of all admin actions with user and timestamp

---

### Edge Cases

- What happens when `parentId` forms a cycle in the member tree?
- What if a CHI_ADMIN tries to set a member's `chiId` to a different branch?
- What happens when the Cloudinary upload fails mid-form submission?
- What if MongoDB Atlas connection drops during a write operation?
- What if the JWT secret is rotated — existing sessions invalidated?
- What if a news slug collision occurs (title produces duplicate slug)?
- What if the family tree has > 500 nodes — performance implications?

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST authenticate admin users via username/password and issue JWT stored in HTTP-only cookie
- **FR-002**: System MUST enforce role-based access: SUPER_ADMIN has all permissions; CHI_ADMIN can only manage members in their branch
- **FR-003**: System MUST support a recursive family tree data structure with parent-child member relationships
- **FR-004**: System MUST render the public homepage with ISR (1h TTL)
- **FR-005**: System MUST render news articles with ISR (30m TTL) and list with SSG
- **FR-006**: System MUST render member detail pages with SSR for SEO
- **FR-007**: System MUST auto-generate unique slugs for news articles from their titles
- **FR-008**: System MUST upload images to Cloudinary via a signed server-side proxy endpoint
- **FR-009**: System MUST auto-capture admin mutations in an ActivityLog via Express middleware
- **FR-010**: System MUST provide full-text search across members, news, and videos
- **FR-011**: System MUST support rich text editing (Tiptap) for news articles with inline image upload
- **FR-012**: System MUST redirect unauthenticated requests to `/admin/*` to `/admin/login`
- **FR-013**: System MUST support reordering videos via a drag-and-drop interface
- **FR-014**: System MUST meet Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
- **FR-015**: System MUST be fully responsive on mobile (sm/md/lg breakpoints)
- **FR-016**: System MUST meet WCAG 2.1 AA accessibility standards

### Key Entities

- **User**: Admin account with role (SUPER_ADMIN / CHI_ADMIN) and optional branch scope
- **Member**: Family tree node with personal details, optional avatar, achievements, and parent relationship
- **News**: Blog article with rich text content, auto-slug, thumbnail, and pin status
- **Video**: YouTube embed with title, URL, and reorderable position
- **Section**: Dynamic homepage section with name, optional linked article, active toggle, and order
- **FooterConfig**: Single-document footer content (contact, description, copyright)
- **Notification**: System event notification with read status
- **ActivityLog**: Audit trail entry linking user, action, and target resource

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Lighthouse score ≥ 80 on all public pages
- **SC-002**: Homepage LCP < 2.5s on 4G mobile simulation
- **SC-003**: Admin can add a new family member (with avatar) in under 2 minutes
- **SC-004**: Family tree renders correctly for at least 200 members
- **SC-005**: All WCAG 2.1 AA requirements met (verified via axe-core in Playwright)
- **SC-006**: Zero 500 errors in normal operation (monitored via Railway logs)
- **SC-007**: All Vitest unit tests pass in CI; all Playwright E2E smoke tests pass

---

## Assumptions

- MongoDB Atlas free tier is sufficient for development and initial production (< 512 MB storage)
- Cloudinary free tier is sufficient for initial photo uploads (< 25 GB storage)
- The website serves the Phùng Bát Tràng family community — not a public social network
- Family member count is in the hundreds, not thousands (tree performance not an issue initially)
- Admin users are trusted individuals managed manually (no self-registration flow needed)
- Vietnamese language is the primary language; no i18n/locale system required for v1
- Railway free tier is acceptable for initial backend deployment
- Drag-and-drop for video reordering uses `@dnd-kit/core` (or equivalent)
