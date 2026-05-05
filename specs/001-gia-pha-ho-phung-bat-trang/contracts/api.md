# API Contract: Gia Phả Họ Phùng Bát Tràng

**Base URL**: `http://localhost:8080` (dev) | `https://<railway-domain>` (prod)
**Content-Type**: `application/json` (all requests/responses)
**Auth**: HTTP-only cookie `token` (JWT). Set by `/api/auth/login`. Required for all `[AUTH]` endpoints.

## Standard Response Envelope

All responses follow this shape:

```ts
// Success
{ "success": true, "data": <payload>, "message": string }

// Error
{ "success": false, "data": null, "message": string, "errors"?: ZodError[] }
```

HTTP status codes:
- `200` OK (GET, PUT, PATCH)
- `201` Created (POST)
- `204` No Content (DELETE)
- `400` Bad Request (validation failure)
- `401` Unauthorized (missing/invalid JWT)
- `403` Forbidden (insufficient role)
- `404` Not Found
- `500` Internal Server Error

---

## Auth (`/api/auth`)

### `POST /api/auth/login`

**Access**: Public

**Request body**:
```json
{ "username": "string", "password": "string" }
```

**Response `200`**:
```json
{
  "success": true,
  "data": { "id": "string", "username": "string", "role": "SUPER_ADMIN|CHI_ADMIN", "chiId": "string|null" },
  "message": "Login successful"
}
```
Sets `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/`

**Response `401`**: Invalid credentials.

---

### `POST /api/auth/logout`

**Access**: `[AUTH]`

Clears the `token` cookie.

**Response `200`**: `{ "success": true, "data": null, "message": "Logged out" }`

---

### `GET /api/auth/me`

**Access**: `[AUTH]`

**Response `200`**:
```json
{
  "success": true,
  "data": { "id": "string", "username": "string", "role": "string", "chiId": "string|null" },
  "message": ""
}
```

---

## Members (`/api/members`)

### `GET /api/members`

**Access**: Public

Returns the entire family tree as a nested tree structure.

**Response `200`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "fullName": "string",
      "avatar": "string|null",
      "birthYear": "number|null",
      "deathYear": "number|null",
      "gender": "string|null",
      "chiId": "string|null",
      "parentId": "string|null",
      "children": [ /* recursive */ ]
    }
  ],
  "message": ""
}
```

*Implementation note*: Return flat array with `parentId` for frontend to build tree (avoids deep nesting performance issues).

---

### `GET /api/members/:id`

**Access**: Public

**Response `200`**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fullName": "string",
    "avatar": "string|null",
    "birthYear": "number|null",
    "deathYear": "number|null",
    "gender": "string|null",
    "bio": "string|null",
    "achievements": ["string"],
    "chiId": "string|null",
    "parent": { "id": "string", "fullName": "string" } | null,
    "children": [ { "id": "string", "fullName": "string" } ],
    "createdAt": "ISO string",
    "updatedAt": "ISO string"
  },
  "message": ""
}
```

---

### `POST /api/members`

**Access**: `[AUTH]` SUPER_ADMIN or CHI_ADMIN (can only add to own chiId)

**Request body**:
```json
{
  "fullName": "string (required)",
  "avatar": "string|null",
  "birthYear": "number|null",
  "deathYear": "number|null",
  "gender": "string|null",
  "bio": "string|null",
  "achievements": ["string"],
  "parentId": "string|null",
  "chiId": "string|null"
}
```

**Response `201`**: Created member object.

---

### `PUT /api/members/:id`

**Access**: `[AUTH]` SUPER_ADMIN or CHI_ADMIN (own chi only)

**Request body**: Same fields as POST (all optional for partial update via PUT).

**Response `200`**: Updated member object.

---

### `DELETE /api/members/:id`

**Access**: `[AUTH]` SUPER_ADMIN only

**Response `204`**: No content. Children's `parentId` set to null (orphan — not cascade delete).

---

## News (`/api/news`)

### `GET /api/news`

**Access**: Public

**Query params**: `?page=1&limit=10`

**Response `200`**:
```json
{
  "success": true,
  "data": {
    "items": [ { "id": "", "title": "", "slug": "", "thumbnail": "", "isPinned": false, "publishedAt": "" } ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "message": ""
}
```

---

### `GET /api/news/pinned`

**Access**: Public

**Response `200`**: `data` is array of pinned news (same shape as list items).

---

### `GET /api/news/:slug`

**Access**: Public

**Response `200`**: Full news object including `content` (HTML).

---

### `POST /api/news`

**Access**: `[AUTH]` SUPER_ADMIN

**Request body**:
```json
{ "title": "string", "content": "string", "thumbnail": "string|null", "isPinned": false }
```

Slug auto-generated server-side.

**Response `201`**: Created news object.

---

### `PUT /api/news/:id`

**Access**: `[AUTH]` SUPER_ADMIN

**Request body**: Any subset of `{ title, content, thumbnail, isPinned }`.

**Response `200`**: Updated news object.

---

### `DELETE /api/news/:id`

**Access**: `[AUTH]` SUPER_ADMIN

**Response `204`**

---

### `PATCH /api/news/:id/pin`

**Access**: `[AUTH]` SUPER_ADMIN

Toggles `isPinned`. No request body required.

**Response `200`**: `{ "data": { "isPinned": true|false } }`

---

## Videos (`/api/videos`)

### `GET /api/videos`

**Access**: Public

**Response `200`**: `data` is array ordered by `order ASC`.

```json
[{ "id": "", "title": "", "youtubeUrl": "", "thumbnailUrl": "", "order": 0 }]
```

---

### `POST /api/videos`

**Access**: `[AUTH]` SUPER_ADMIN

```json
{ "title": "string", "youtubeUrl": "string", "thumbnailUrl": "string|null" }
```

**Response `201`**

---

### `PUT /api/videos/:id`

**Access**: `[AUTH]` SUPER_ADMIN

**Response `200`**

---

### `DELETE /api/videos/:id`

**Access**: `[AUTH]` SUPER_ADMIN

**Response `204`**

---

### `PATCH /api/videos/reorder`

**Access**: `[AUTH]` SUPER_ADMIN

**Request body**:
```json
{ "orderedIds": ["id1", "id2", "id3"] }
```

Sets `order` field of each video to its index in the array.

**Response `200`**: `{ "data": null, "message": "Reordered" }`

---

## Sections (`/api/sections`)

### `GET /api/sections`

**Access**: Public — returns only `isActive: true` sections, ordered by `order ASC`.

Admin: `?all=true` returns all sections (requires `[AUTH]`).

---

### `POST /api/sections`

**Access**: `[AUTH]` SUPER_ADMIN

```json
{ "name": "string", "newsId": "string|null", "isActive": true, "order": 0 }
```

**Response `201`**

---

### `PUT /api/sections/:id`

**Access**: `[AUTH]` SUPER_ADMIN

**Response `200`**

---

### `PATCH /api/sections/:id/toggle`

**Access**: `[AUTH]` SUPER_ADMIN

Toggles `isActive`. No body.

**Response `200`**: `{ "data": { "isActive": true|false } }`

---

### `DELETE /api/sections/:id`

**Access**: `[AUTH]` SUPER_ADMIN

**Response `204`**

---

## Footer (`/api/footer`)

### `GET /api/footer`

**Access**: Public

**Response `200`**:
```json
{ "data": { "contact": "", "description": "", "copyright": "" } }
```

---

### `PUT /api/footer`

**Access**: `[AUTH]` SUPER_ADMIN

```json
{ "contact": "string", "description": "string", "copyright": "string" }
```

Creates if not exists (upsert). **Response `200`**

---

## Notifications (`/api/notifications`)

### `GET /api/notifications`

**Access**: `[AUTH]`

**Response `200`**: Array of notifications, newest first.

---

### `PATCH /api/notifications/:id/read`

**Access**: `[AUTH]`

Sets `isRead: true`. **Response `200`**

---

## Activity Logs (`/api/activity-logs`)

### `GET /api/activity-logs`

**Access**: `[AUTH]` SUPER_ADMIN only

**Query params**: `?page=1&limit=20`

**Response `200`**: Paginated list with `user` details included.

---

## Search (`/api/search`)

### `GET /api/search`

**Access**: Public

**Query params**: `?q=<search term>` (required, min 2 chars)

**Response `200`**:
```json
{
  "data": {
    "members": [ { "id": "", "fullName": "", "avatar": "" } ],
    "news": [ { "id": "", "title": "", "slug": "", "thumbnail": "" } ],
    "videos": [ { "id": "", "title": "", "youtubeUrl": "" } ]
  }
}
```

---

## Upload (`/api/upload`)

### `POST /api/upload`

**Access**: `[AUTH]`

**Request**: `multipart/form-data` with `file` field (image/jpeg, image/png, image/webp; max 5 MB)

**Response `201`**:
```json
{ "data": { "url": "https://res.cloudinary.com/...", "publicId": "string" } }
```

---

## Dashboard Stats (`/api/dashboard`)

### `GET /api/dashboard`

**Access**: `[AUTH]`

**Response `200`**:
```json
{
  "data": {
    "totalMembers": 0,
    "totalNews": 0,
    "totalVideos": 0,
    "unreadNotifications": 0,
    "recentLogs": [ /* last 5 ActivityLog entries */ ]
  }
}
```
