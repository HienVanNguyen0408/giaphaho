@AGENTS.md

# Frontend Color Rules — BẮET BUỘC

## Nguyên tắc cứng: KHÔNG được hardcode màu

Khi viết bất kỳ code FE nào (TSX, CSS, style props), **PHẢI dùng CSS custom properties từ theme** thay vì giá trị màu cứng.

### Theme variables có sẵn (`app/globals.css`)

```
--t-bg              Nền trang chính
--t-surface         Nền component (card, input...)
--t-surface-2       Nền thứ cấp (hover, section...)
--t-border          Viền, đường kẻ
--t-text            Văn bản chính
--t-text-2          Văn bản phụ
--t-text-3          Văn bản mờ (placeholder, label)
--t-accent          Màu chủ đạo đỏ thẫm (#8B0000)
--t-accent-soft     Accent sáng hơn (#a01515)
--t-accent-2        Accent tối hơn (#6b0000)
--t-gold            Vàng (= accent)
--t-nav-bg          Nền header/sidebar
--t-nav-border      Viền nav
--t-nav-text        Chữ nav
--t-nav-active-bg   Nền nav active (= accent)
--t-nav-active-text Chữ trên nền accent (#ffffff)
--t-footer-bg       Nền footer
--t-footer-text     Chữ footer
--t-footer-accent   Accent footer
--t-success         Màu thành công (#059669)
--t-warning         Màu cảnh báo/amber (#d97706)
--t-error           Màu lỗi (#dc2626)
--t-info            Màu thông tin (#2563eb)
--color-red-50..950 Thang màu đỏ từ theme
```

### Quy tắc chuyển đổi

| ❌ Hardcode | ✅ Theme variable |
|---|---|
| `#8B0000`, `#8b1a1a`, `#6b0000` | `var(--t-accent)`, `var(--t-accent-2)` |
| `#ffffff` trên nền accent | `var(--t-nav-active-text)` |
| `#059669` | `var(--t-success)` |
| `#dc2626`, `#b91c1c` | `var(--t-error)` |
| `#d97706`, `#f59e0b`, `#ca8a04` | `var(--t-warning)` |
| `#2563eb`, `#38bdf8` | `var(--t-info)` |
| `rgba(139,0,0,0.25)` | `color-mix(in oklch, var(--t-accent) 25%, transparent)` |
| `rgba(255,255,255,0.8)` trên nền accent | `color-mix(in oklch, var(--t-nav-active-text) 80%, transparent)` |
| `rgba(245,158,11,0.1)` | `color-mix(in oklch, var(--t-warning) 10%, transparent)` |
| `bg-red-700` (brand) | `bg-[var(--t-accent)]` hoặc `style={{ background: 'var(--t-accent)' }}` |
| `text-green-600` | `style={{ color: 'var(--t-success)' }}` |
| `text-blue-700` | `style={{ color: 'var(--t-info)' }}` |

### Ngoại lệ cho phép

- Dữ liệu theme definition (ví dụ array swatches trong `ThemeProvider.tsx`)
- SVG decorative với opacity rất thấp khi không có var phù hợp
- `transparent`, `currentColor`, `inherit` là OK
- Màu `black/white` thuần (0,0,0 / 255,255,255) nếu không có context theme
