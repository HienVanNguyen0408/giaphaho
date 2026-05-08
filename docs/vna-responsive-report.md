# Báo Cáo Thiết Kế Responsive — Layout VNA-Style
**Website:** Gia Phả Họ Phùng Bát Tràng  
**Tham chiếu:** [vietnamairlines.com/vn/vi](https://www.vietnamairlines.com/vn/vi)  
**Cập nhật:** 07/05/2026

---

## 1. Tổng Quan Cấu Trúc Layout

Trang chủ được cải tiến theo cấu trúc bố cục của Vietnam Airlines, giữ nguyên hệ thống màu sắc và nhận diện thương hiệu của dòng họ Phùng Bát Tràng.

### Mapping VNA → Gia Phả

| VNA Section | Gia Phả Adaptation |
|---|---|
| Header 2 tầng (utility bar + nav) | Header 2 tầng (utility bar + main nav) |
| Hero banner + booking widget | Hero banner + search widget (3 tabs) |
| Dịch vụ nhanh (icon grid) | Khám phá nhanh (5 icon cards) |
| Ưu đãi nổi bật (deal cards) | Tin Nổi Bật (deal card grid) |
| Tin tức | Giá Trị Dòng Họ + Tin Tức Dòng Họ |
| Video/Media | Video Dòng Họ |
| Footer | Footer (không đổi) |

---

## 2. Component Đã Thay Đổi

### `Header.tsx` *(cải tiến)*

**Thay đổi:**
- Thêm **Tầng 1 (Utility Bar)**: thanh mỏng phía trên, hiển thị `Dòng họ Phùng Bát Tràng · Bát Tràng, Hà Nội` bên trái và links `Quản trị | VI` bên phải.
- **Tầng 2 (Main Nav)**: thêm border bottom gold (`2px solid var(--t-gold)`) thay cho 1px border trước đây.
- Nav links active: chuyển từ `background highlight` sang **bottom border indicator** kiểu VNA (gold bar ở dưới link đang active, animation `scaleX`).
- Thêm **Search icon shortcut** (🔍) phía phải desktop nav.

**Responsive:**
- Mobile: chỉ hiển thị Tầng 2 (utility bar ẩn), hamburger menu
- Tablet (md): hiển thị đầy đủ 2 tầng

### `HeroSection.tsx` *(rebuild)*

**Thay đổi:**
- Loại bỏ các CTA button inline (thay bằng search widget)
- Thêm `pb-36` vào hero background để tạo khoảng trống cho widget
- Import và render `HeroSearchWidget` với `-mt-28` (overlap 112px lên hero)
- Thêm subtle grid pattern overlay (SVG, opacity 4%)

**Responsive:**
- Mobile: hero full width, widget stack dưới; `-mt-28` vẫn áp dụng
- Desktop: widget overlap tạo hiệu ứng floating trên hero

### `HeroSearchWidget.tsx` *(mới — Client Component)*

Widget tương tác với 3 tabs:

| Tab | Nội dung |
|---|---|
| **Tìm Thành Viên** | Input tên + dropdown thế hệ (1-20) + nút Tìm Kiếm |
| **Khám Phá Gia Phả** | Mô tả ngắn + button → `/gia-pha` |
| **Tin Tức & Sự Kiện** | Mô tả ngắn + button → `/tin-tuc` |

**Responsive:**
- Mobile: form fields xếp dọc (flex-col)
- Desktop: form fields xếp ngang (sm:flex-row)
- Tab labels: font-size nhỏ hơn ở mobile (`text-xs`)

### `QuickServicesSection.tsx` *(mới — Server Component)*

Hàng 5 icon cards dịch vụ nhanh, tương tự VNA quick services row.

| Icon | Label | Đích đến |
|---|---|---|
| Địa điểm | Gia Phả | `/gia-pha` |
| Kính lúp | Tìm Kiếm | `/tim-kiem` |
| Báo | Tin Tức | `/tin-tuc` |
| Video | Video | `/video` |
| Điện thoại | Liên Hệ | `/tim-kiem` |

**Responsive:**
- Mobile: grid 3 cột + 2 cột (3+2 layout với 5 items)
- Desktop: grid 5 cột đồng đều

### `TinNoiBat.tsx` *(rebuild)*

Thiết kế lại theo phong cách "Ưu đãi nổi bật" của VNA:

**Thay đổi:**
- Section header thêm **red accent bar** bên trái (VNA-style)
- "Xem tất cả" link với bottom-border gold indicator
- Multiple cards trong grid (trước đây: 1 card featured dọc)
- Card style: thumbnail `aspect-16/9`, badge `Tin nổi bật` góc trái trên (màu nav-bg)
- Hover: lift (`-translate-y-1`), border-color → gold, shadow tăng

**Responsive:**
- 1 item → 1 cột `max-w-xl`
- 2 items → 1 cột mobile / 2 cột sm
- 3 items → 1 cột mobile / 2 cột sm / 3 cột lg

### `page.tsx` *(cập nhật)*

Thứ tự sections sau khi cập nhật:
1. `HeroSection` — Hero + Search widget
2. `QuickServicesSection` *(mới)*
3. `TinNoiBat` — Tin nổi bật
4. `ThanhTichSection` — Giá trị dòng họ
5. `TinTucSection` — Tin tức
6. `VideoSection` — Video
7. `DynamicSection` — Chuyên mục động

---

## 3. Responsive Breakpoints

Dự án sử dụng Tailwind CSS v4 với breakpoints chuẩn:

| Breakpoint | Width | Hành vi chính |
|---|---|---|
| `default` (mobile) | < 640px | Stack layout, hamburger nav, utility bar ẩn, form dọc |
| `sm` | ≥ 640px | Form ngang, grid 2 cột cho cards |
| `md` | ≥ 768px | Header 2 tầng, desktop nav hiện, quick services 5 cột |
| `lg` | ≥ 1024px | Grid 3 cột cho cards, max-width containers |
| `xl` | ≥ 1280px | Không thay đổi đáng kể (container đã max-w-6xl) |

---

## 4. Chi Tiết Responsive Từng Section

### Header
```
Mobile  (< md): [Logo] [Hamburger]
                → Menu dropdown khi click
Desktop (≥ md): [Utility bar: "Họ Phùng · Bát Tràng" --- Quản trị | VI]
                [Logo] [Trang chủ][Gia phả][Tin tức][Video][Tìm kiếm] [🔍]
```

### Hero + Search Widget
```
Mobile:  [Hero bg full width]
         [-mt-28: Widget card bên dưới hero, width = 100%-2rem]
         [Form: stack dọc]

Desktop: [Hero bg full width]
         [-mt-28: Widget floating, max-w-5xl centered]
         [Form: row ngang — Input | Select | Button]
```

### Quick Services Row
```
Mobile:  [3 cards] trên + [2 cards] dưới (grid-cols-3 → 5 items = 3+2)
Desktop: [5 cards] một hàng ngang đồng đều
```

### Tin Nổi Bật (Deal Cards)
```
Mobile:  [Stack dọc 1 cột]
Tablet:  [2 cột]
Desktop: [3 cột]
```

### Tin Tức Dòng Họ
```
Mobile:  [1 cột]
Tablet:  [2 cột]
Desktop: [3 cột]
```

### Video Section
```
Mobile:  [1 cột]
Tablet:  [2 cột]
Desktop: [3 cột]
```

---

## 5. Hệ Thống Màu Sắc (Theme-Aware)

Toàn bộ component sử dụng CSS variables — hỗ trợ 4 themes:

| Variable | Bạch Liên | Sơn Mài | Giấy Cổ | Lam Ngọc |
|---|---|---|---|---|
| `--t-nav-bg` | `#6b1515` (đỏ) | `#0c0804` (đen) | `#3d2008` (nâu) | `#050810` (tím) |
| `--t-gold` | `#ca8a04` | `#d4af37` | `#b07820` | `#d4af37` |
| `--t-surface` | `#ffffff` | `#1a0f08` | `#fef9ec` | `#0f1626` |
| `--t-bg` | `#faf7f0` | `#0c0804` | `#f2e8d0` | `#080c18` |

---

## 6. Accessibility

- Tất cả interactive elements có `aria-label`
- Tab roles với `role="tab"` và `aria-selected`
- Decorative elements có `aria-hidden="true"`
- Hero section có `aria-label="Phần giới thiệu dòng họ"`
- Form labels liên kết với inputs qua `htmlFor`/`id`
- Keyboard navigation: hamburger menu, tab switcher
- Color contrast: gold trên dark red đạt WCAG AA

---

## 7. Performance Notes

- `HeroSearchWidget` là Client Component duy nhất trong khu vực hero (tách riêng để giảm JS bundle ảnh hưởng đến `HeroSection` server component)
- `QuickServicesSection` và `TinNoiBat` là Server Components
- Images trong deal cards dùng `next/image` với `fill` + proper `sizes`
- `HeroSection` render trên server, không có JS overhead cho phần static
