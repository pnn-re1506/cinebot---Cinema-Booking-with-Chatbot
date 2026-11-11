# 🔍 Frontend Architecture Review — CineBot

## Tổng Quan Cấu Trúc

```
frontend/
├── index.html                    # Entry point
├── package.json                  # @figma/my-make-file
├── vite.config.ts                # Vite + React + Tailwind v4 + Figma asset resolver
├── postcss.config.mjs            # Trống (Tailwind v4 tự xử lý)
├── pnpm-workspace.yaml           # Multi-arch workspace config
├── guidelines/Guidelines.md      # Template chưa customize
├── default_shadcn_theme.css      # Theme mặc định shadcn (không dùng)
└── src/
    ├── main.tsx                   # React entry (7 dòng)
    ├── styles/
    │   ├── index.css              # Import chain: fonts → tailwind → theme
    │   ├── fonts.css              # Google Fonts: Barlow Condensed, DM Sans, DM Mono
    │   ├── tailwind.css           # Tailwind v4 + tw-animate-css
    │   ├── theme.css              # Design tokens (CSS variables) + base typography
    │   └── globals.css            # ⚠️ Trống (0 bytes)
    └── app/
        ├── App.tsx                # ⚠️ 1,506 dòng — TOÀN BỘ app trong 1 file
        └── components/
            ├── ui/                # 48 shadcn/ui components (đầy đủ)
            │   ├── button.tsx, card.tsx, dialog.tsx, ...
            │   └── utils.ts       # cn() helper (clsx + twMerge)
            └── figma/
                └── ImageWithFallback.tsx  # Figma-generated helper
```

---

## Đánh Giá Chi Tiết

### ✅ Điểm Mạnh — Có thể tái sử dụng

| Thành phần | Đánh giá | Ghi chú |
|---|---|---|
| **Tech stack** | ⭐⭐⭐⭐⭐ | Vite + React 18 + Tailwind CSS v4 + TypeScript — rất hiện đại |
| **shadcn/ui library** | ⭐⭐⭐⭐⭐ | 48 components headless, dễ customize, **reuse 100%** |
| **Design tokens** | ⭐⭐⭐⭐ | CSS variables cho color, typography, radius — dễ thay đổi theme |
| **Typography system** | ⭐⭐⭐⭐ | 3 fonts phù hợp (heading/body/mono), base styles cho h1-h4 |
| **Dark theme** | ⭐⭐⭐⭐ | Default dark + `.dark` variant sẵn sàng |
| **Path alias** | ⭐⭐⭐⭐ | `@/` alias cho import gọn |
| **Dependencies** | ⭐⭐⭐⭐ | Đầy đủ: motion, react-router, react-hook-form, recharts, sonner, cmdk |

### 🔴 Vấn Đề Nghiêm Trọng — Cần refactor nếu muốn dùng

#### 1. **God File: App.tsx = 1,506 dòng, ~95KB**

> [!CAUTION]
> Đây là vấn đề lớn nhất. TOÀN BỘ logic, UI, data, routing đều nằm trong 1 file duy nhất.

File chứa **tất cả** trong 1 file:
- **15+ function components**: `Nav`, `BrowseView`, `ShowtimesView`, `SeatsView`, `ConfirmView`, `ComingSoonView`, `CinemasView`, `MembershipsView`, `SignInModal`, `AdminLoginPage`, `AdminPanel`, `AdminDashboard`, `AdminMovies`, `AdminShows`, `AdminTheatres`, `Field`, `Input`, `Textarea`, `Select`
- **Seed data hardcoded** (~100 dòng): Films, Cinemas, Shows, Coming Soon, Memberships
- **All state management**: `useState` trong App component, truyền props drilling qua 4-5 cấp
- **Admin credentials hardcoded**: `{ username: "admin", password: "lumiere2026" }`

#### 2. **Không có routing thật**

```tsx
// Thay vì React Router, dùng conditional rendering:
{view === "browse" && <BrowseView />}
{view === "coming-soon" && <ComingSoonView />}
{view === "seats" && <SeatsView />}
```

→ Không có URL, không back/forward browser, không SEO.

#### 3. **Không có state management**

- Tất cả state nằm ở root `App()` component
- Props drilling từ App → AdminPanel → AdminMovies/AdminShows/AdminTheatres
- Không sử dụng Context, Zustand, hay bất kỳ state solution nào

#### 4. **Không có API layer**

- Data 100% hardcoded (`SEED_FILMS`, `SEED_CINEMAS`, `SEED_SHOWS`)
- Không có fetch, axios, hay bất kỳ HTTP client nào
- Không có loading/error states

#### 5. **Inline styles lặp lại rất nhiều**

```tsx
// Pattern này xuất hiện hàng chục lần:
style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
style={{ fontFamily: "'DM Mono', monospace" }}
```

#### 6. **48 shadcn/ui components nhưng không sử dụng**

File App.tsx tự build lại `Input`, `Select`, `Textarea`, `Field` thay vì dùng shadcn components có sẵn trong `components/ui/`.

#### 7. **Nguồn gốc: Figma Make (auto-generated)**

- Package name: `@figma/my-make-file`
- `figmaAssetResolver()` plugin trong vite.config.ts
- `ImageWithFallback.tsx` trong `components/figma/`

→ Code được **auto-generate từ Figma Make**, không phải hand-coded. Điều này giải thích vì sao tất cả trong 1 file.

---

## Verdict: Dùng Được Cho Project Cá Nhân Không?

### ✅ CÓ THỂ tái sử dụng ngay:

| Phần | Cách dùng |
|---|---|
| `src/styles/` (theme.css, fonts.css, tailwind.css) | Copy nguyên → đổi color tokens |
| `src/app/components/ui/` (48 shadcn components) | Copy nguyên → đã sẵn sàng |
| `vite.config.ts` (bỏ figmaAssetResolver) | Copy + simplify |
| `package.json` dependencies | Lấy list dependencies cần thiết |

### 🔴 KHÔNG NÊN tái sử dụng:

| Phần | Lý do |
|---|---|
| `App.tsx` | God file, cần tách nhỏ hoàn toàn |
| Routing logic | Cần thay bằng React Router thật |
| State management | Cần refactor sang Context/Zustand |
| Seed data | Cần chuyển sang API/database |
| Admin auth | Hardcoded credentials — bảo mật = 0 |

---

## 💡 Đề Xuất: Cách Tận Dụng Cho Project Cá Nhân

Nếu bạn muốn dùng codebase này làm starting point, tôi đề xuất:

### Bước 1 — Giữ lại foundation (copy trực tiếp)
```
✅ src/styles/         → Design system sẵn sàng
✅ src/components/ui/  → 48 shadcn components
✅ vite.config.ts      → Build setup
✅ package.json        → Dependency list
```

### Bước 2 — Tách App.tsx thành cấu trúc chuẩn
```
src/
├── components/
│   ├── ui/              # (giữ nguyên shadcn)
│   ├── layout/          # Nav, Footer, Sidebar
│   └── features/        # MovieCard, SeatPicker, BookingForm
├── pages/               # BrowsePage, MovieDetailPage, BookingPage, AdminPage
├── hooks/               # useAuth, useBooking, useFilms
├── services/            # api.ts, auth.ts
├── stores/              # Zustand stores hoặc Context
├── types/               # FilmType, CinemaType, BookingType
└── data/                # seed data (tạm thời)
```

### Bước 3 — Thêm routing thật
```tsx
import { BrowserRouter, Routes, Route } from 'react-router';
```

### Bước 4 — Kết nối backend
- Thay seed data bằng API calls
- Thêm auth thật (JWT/session)

---

## Tóm Tắt

| Tiêu chí | Điểm |
|---|---|
| **Tech stack hiện đại** | ⭐⭐⭐⭐⭐ |
| **UI Component library** | ⭐⭐⭐⭐⭐ |
| **Design system / Theming** | ⭐⭐⭐⭐ |
| **Code organization** | ⭐ |
| **Scalability** | ⭐ |
| **Reusability as-is** | ⭐⭐ |
| **Reusability after refactor** | ⭐⭐⭐⭐ |

> [!IMPORTANT]
> **Kết luận**: Foundation tốt (Vite + React + Tailwind v4 + shadcn/ui), nhưng cấu trúc code là Figma auto-gen nên không production-ready. **Giữ lại foundation + design system, xoá App.tsx và build lại từ đầu** là cách tiếp cận tốt nhất cho project cá nhân.
