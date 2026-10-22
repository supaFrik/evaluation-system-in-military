import {
  UserAccount,
  Platoon,
  Soldier,
  DailyScore,
  CommendationItem,
  EmulationCriterion,
  MilitaryUnit,
  EmulationAppeal,
} from './types';

// ══════════════════════════════════════════════════════════════════════
// HẰNG SỐ HỆ THỐNG & HÀM TIỆN ÍCH CÂY ĐƠN VỊ (ĐÃ XÓA TOÀN BỘ MOCK DATA)
// Toàn bộ dữ liệu nghiệp vụ được nạp 100% từ CSDL MySQL qua REST API
// ══════════════════════════════════════════════════════════════════════

export const DEFAULT_AVATAR = '/default-avatar.png';

export const TODAY_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh',
}).format(new Date());

// Placeholder gốc cho trường hợp đang tải cây đơn vị từ API
export const REGIMENT_UNIT: MilitaryUnit = {
  id: 'e335',
  name: 'Trung đoàn Bộ Binh 335',
  code: 'e335',
  tier: 'REGIMENT',
  leaderTitle: 'Trung đoàn trưởng',
  leaderName: '',
  totalSoldiers: 0,
};

// Toàn bộ mảng khởi tạo để rỗng — chỉ nhận dữ liệu thực từ CSDL
export const DEFAULT_CRITERIA: EmulationCriterion[] = [];
export const BATTALION_UNITS: MilitaryUnit[] = [];
export const COMPANY_UNITS: MilitaryUnit[] = [];
export const PLATOON_UNITS: MilitaryUnit[] = [];
export const SQUAD_UNITS: MilitaryUnit[] = [];
export const ALL_UNITS: MilitaryUnit[] = [];
export const MOCK_PLATOONS: Platoon[] = [];
export const MOCK_ACCOUNTS: UserAccount[] = [];
export const MOCK_SOLDIERS: Soldier[] = [];
export const MOCK_DAILY_SCORES: DailyScore[] = [];
export const MOCK_COMMENDATIONS: CommendationItem[] = [];
export const mockUsers: UserAccount[] = [];
export const MOCK_USERS: UserAccount[] = [];
export const mockAppeals: EmulationAppeal[] = [];
export const MOCK_APPEALS: EmulationAppeal[] = [];

// ── Helper: lấy các đơn vị con trực tiếp từ danh sách đơn vị ─────────
export function getChildUnits(parentId: string, unitList: MilitaryUnit[] = ALL_UNITS): MilitaryUnit[] {
  return unitList.filter((u) => u.parentId === parentId);
}

// ── Helper: lấy toàn bộ đơn vị con (đệ quy) ──────────────────────────
export function getDescendantUnits(parentId: string, unitList: MilitaryUnit[] = ALL_UNITS): MilitaryUnit[] {
  const children = getChildUnits(parentId, unitList);
  return children.reduce<MilitaryUnit[]>(
    (acc, child) => [...acc, child, ...getDescendantUnits(child.id, unitList)],
    []
  );
}

// ── Helper: lấy chuỗi tổ tiên (breadcrumb) ────────────────────────────
export function getAncestorChain(unitId: string, unitList: MilitaryUnit[] = ALL_UNITS): MilitaryUnit[] {
  const chain: MilitaryUnit[] = [];
  let current = unitList.find((u) => u.id === unitId);
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    chain.unshift(current);
    current = current.parentId ? unitList.find((u) => u.id === current!.parentId) : undefined;
  }
  return chain;
}

// Danh mục gợi ý nhanh quy định trừ/cộng điểm khi nhập sổ điểm hàng ngày
export const QUICK_VIOLATION_PRESETS = [
  {
    id: 'nv-1',
    category: 'noi_vu' as const,
    label: 'Chăn màn chưa vuông (-5đ)',
    points: -5,
  },
  {
    id: 'nv-2',
    category: 'noi_vu' as const,
    label: 'Giày dép để lệch hàng (-5đ)',
    points: -5,
  },
  {
    id: 'nv-3',
    category: 'noi_vu' as const,
    label: 'Vệ sinh phòng chưa sạch (-5đ)',
    points: -5,
  },
  {
    id: 'ct-1',
    category: 'chinh_tri' as const,
    label: 'Không tập trung học chính trị (-5đ)',
    points: -5,
  },
  {
    id: 'nm-1',
    category: 'nhiem_vu' as const,
    label: 'Chậm giờ tập trung (-5đ)',
    points: -5,
  },
  {
    id: 'nm-2',
    category: 'nhiem_vu' as const,
    label: 'Xuất sắc tăng gia sản xuất (+5đ)',
    points: 5,
  },
  {
    id: 'tp-1',
    category: 'tac_phong' as const,
    label: 'Xưng hô chưa chuẩn điều lệnh (-5đ)',
    points: -5,
  },
  {
    id: 'tp-2',
    category: 'tac_phong' as const,
    label: 'Đầu tóc, quân phục sai quy cách (-5đ)',
    points: -5,
  },
];
