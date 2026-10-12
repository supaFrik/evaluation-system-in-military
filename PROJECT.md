# Project: 3-Role Architecture & Minimalist Role-Tailored System

## Architecture
Hệ thống Quản lý và Theo dõi Thi đua Quân nhân (Next.js 16 + TypeScript + Tailwind CSS, Spring Boot backend / LocalStorage fallback) được tái cấu trúc theo mô hình 3 Role độc lập:
1. **SUPER_ADMIN / ADMIN (Quản trị viên tối cao)**:
   - Độc quyền truy cập Cây đơn vị (`tab=units`), Quy chế chấm điểm (`tab=criteria`), Quản trị quân nhân (`tab=soldiers`), Báo cáo (`tab=reports`).
   - Phân quyền cán bộ chấm điểm trực tiếp trên từng thẻ đơn vị quân sự.
   - Mở/khóa sổ điểm, chốt số và phê duyệt toàn đơn vị.
2. **SCORER (Cán bộ phụ trách phân đội)**:
   - Tối giản chỉ 3 chức năng: Nhập điểm thi đua (`tab=daily_scoring`), Bảng thi đua phân đội (`tab=platoon_summary`), Xử lý khiếu nại (`tab=appeals`).
   - Phạm vi dữ liệu giới hạn nghiêm ngặt trong danh sách phân đội được cấp quyền (`currentUser.assignedUnitIds`).
   - Tuyệt đối không truy cập được Cây đơn vị và Quy chế chấm điểm (bị ẩn khỏi Sidebar và chặn bởi Router Guard).
3. **SOLDIER (Quân nhân / Chiến sĩ)**:
   - Tối giản chỉ 2 chức năng View-Only: Kết quả thi đua của tôi (`tab=my_emulation`), Hòm thư khiếu nại (`tab=appeals`).
   - Chỉ xem dữ liệu điểm số của chính bản thân, không thể chỉnh sửa điểm.
   - Gửi khiếu nại điểm số kèm lý do và nhận phản hồi trực tiếp từ cán bộ phụ trách.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 3-Role Enum & Types Standardization | Chuẩn hóa `UserRole` ('ADMIN', 'SCORER', 'SOLDIER'), hỗ trợ tương thích ngược `COMMANDER` -> `ADMIN`, `USER` -> `SOLDIER`. | M1 | Survey |
| 2 | `assignedUnitIds: string[]` in UserAccount | Thêm mảng `assignedUnitIds` vào `UserAccount`, mock accounts (Admin, Scorer C1, Scorer B1, Soldier A). | M1 | Survey |
| 3 | Scorer Assignment API & Store Methods | Cung cấp `assignUnitsToUser`, `assignScorersToUnit` trong store và API services. | M1 | Survey |
| 4 | `EmulationAppeal` Data Model & Storage | Định nghĩa model khiếu nại, lưu trữ state `appeals` trong store/local storage & API methods. | M1 | Survey |
| 5 | Remove Quick-Scoring Buttons from Unit Tree | Gỡ bỏ nút "Nhập điểm" và "Xem thi đua" trên cả Tree View và Table View trong `unit-management.tsx`. | M2 | Survey |
| 6 | Read-Only Soldier Count Badge | Chuyển badge "X đồng chí" từ nút click điều hướng thành `<div>` thông tin tĩnh thuần túy. | M2 | Survey |
| 7 | "Phân quyền chấm điểm" Button & Scorer Tags | Thêm icon `Key` trên thẻ đơn vị và tag hiển thị danh sách cán bộ chấm điểm phụ trách. | M2 | Survey |
| 8 | Assign Scorer Modal | Modal cho phép Admin tìm kiếm, chọn nhiều cán bộ từ danh sách tài khoản và lưu phân quyền cho đơn vị. | M2 | Survey |
| 9 | Role-Tailored Sidebar Navigation | Hiển thị menu thích ứng: Admin (đầy đủ), Scorer (3 mục), Soldier (2 mục). Ẩn hoàn toàn tab `units` và `criteria` với non-Admin. | M3 | Survey |
| 10 | Strict Router Guard in `app/page.tsx` | Kiểm tra URL tab với `ROLE_ALLOWED_TABS`. Chặn và chuyển hướng ngay lập tức nếu non-Admin truy cập `units` hoặc `criteria`. | M3 | Survey |
| 11 | Scorer Unit Scope Restriction in Daily Scoring | Tự động chọn đơn vị trong `assignedUnitIds`, lọc danh sách quân nhân chỉ thuộc đơn vị được phân công, không cho chấm vượt quyền. | M3 | Survey |
| 12 | Soldier Personal Emulation View-Only Sheet | Giao diện hiển thị sổ điểm thi đua cá nhân, điểm hôm nay, lịch sử cộng/trừ điểm và biểu dương/nhắc nhở. | M4 | Survey |
| 13 | Soldier Appeal Submission Form | Form khiếu nại cho quân nhân: chọn ngày, tiêu chí, nhập lý do giải trình. | M4 | Survey |
| 14 | Scorer & Admin Appeals Resolution Console | Giao diện xem danh sách khiếu nại theo đơn vị phụ trách, modal phê duyệt/từ chối kèm ý kiến phản hồi (`reply`). | M4 | Survey |
| 15 | Playwright E2E 3-Role Test Suite | Bộ test E2E kiểm tra toàn diện 3 vai trò: quyền hiển thị sidebar, router guards, phân quyền trên cây đơn vị, luồng khiếu nại. | M5 | Survey |
| 16 | Production Build Verification | Xác minh `npm run build` hoàn thành 100% với 0 lỗi TypeScript và Lint. | M5 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: RBAC Data Models & Appeals Store | Cập nhật `types.ts`, `store.ts`, `mock-data.ts`, `auth.service.ts`, `user.service.ts`, mock accounts cho 3 role, `EmulationAppeal` CRUD | None | DONE |
| 2 | M2: Unit Tree Minimalist UI & Assign Scorer Modal | Gỡ bỏ nút "Nhập điểm"/"Xem thi đua", làm tĩnh badge quân số, thêm nút icon `Key` & tag cán bộ chấm điểm, xây dựng Modal phân quyền | M1 | PLANNED |
| 3 | M3: Role-Tailored Sidebar & Router Guard | Cập nhật `sidebar.tsx`, `header.tsx`, Router Guard trong `app/page.tsx`, scoping đơn vị trong `daily-scoring-sheet.tsx` | M1, M2 | PLANNED |
| 4 | M4: Soldier View-Only Scoring & Appeals Flow | Xây dựng `SoldierEmulationView`, form gửi khiếu nại cho Soldier, và console xử lý khiếu nại cho Scorer/Admin | M1, M3 | PLANNED |
| 5 | M5: E2E Verification & Production Build | Viết kịch bản Playwright E2E 3 role (`e2e/role-based-ux.spec.ts`), cập nhật các test cũ bị ảnh hưởng, xác minh `npm run build` | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### UserAccount & Roles
```typescript
export type UserRole = 'ADMIN' | 'SCORER' | 'SOLDIER';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  rank?: string;
  role: UserRole;
  roleTitle?: string;
  soldierId?: string;
  platoonId?: string;
  phone?: string;
  email?: string;
  status?: string;
  avatarUrl?: string;
  unitScopeTier?: UnitTier;
  assignedUnitIds: string[]; // Các đơn vị được gán quyền chấm điểm
  assignedUnitId?: string;   // Fallback tương thích ngược
}
```

### EmulationAppeal
```typescript
export type AppealStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EmulationAppeal {
  id: string;
  soldierId: string;
  soldierName: string;
  unitId: string;
  unitName: string;
  date: string;              // YYYY-MM-DD
  criterionId?: string;
  criterionName?: string;
  deductionPoints?: number;
  reason: string;
  status: AppealStatus;      // PENDING, APPROVED, REJECTED
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  reply?: string;
}
```

### Scorer Assignment API / Store Contract
- `assignUnitsToUser(userId: string, unitIds: string[]): Promise<UserAccount>`
- `assignScorersToUnit(unitId: string, scorerUserIds: string[]): Promise<void>`
- `createAppeal(appeal: Omit<EmulationAppeal, 'id' | 'status' | 'createdAt'>): Promise<EmulationAppeal>`
- `resolveAppeal(appealId: string, status: 'APPROVED' | 'REJECTED', reply: string): Promise<EmulationAppeal>`

## Code Layout
- `frontend/my-app/lib/types.ts`: RBAC types, `UserAccount`, `EmulationAppeal`.
- `frontend/my-app/lib/store.ts`: Zustand/React state store, appeals CRUD, assigned units sync.
- `frontend/my-app/lib/mock-data.ts`: Mock accounts for ADMIN, SCORER, SOLDIER, default appeals.
- `frontend/my-app/components/unit/unit-management.tsx`: Cây đơn vị tối giản, nút Key phân quyền, modal Assign Scorer.
- `frontend/my-app/components/layout/sidebar.tsx`: Menu thích ứng 3 role.
- `frontend/my-app/components/layout/header.tsx`: Header role display & filtered shortcuts.
- `frontend/my-app/app/page.tsx`: Router guard whitelist & tab routing.
- `frontend/my-app/components/scoring/daily-scoring-sheet.tsx`: Scorer assigned units auto-select & filtering.
- `frontend/my-app/components/soldier/soldier-emulation-view.tsx`: Giao diện sổ điểm cá nhân View-Only.
- `frontend/my-app/components/appeals/`: Module quản lý và gửi khiếu nại điểm thi đua.
- `frontend/my-app/e2e/role-based-ux.spec.ts`: Playwright test suite cho 3 role.
