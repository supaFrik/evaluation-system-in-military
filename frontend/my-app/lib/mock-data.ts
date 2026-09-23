import { UserAccount, Platoon, Soldier, DailyScore, CommendationItem, EmulationCriterion, MilitaryUnit } from './types';

// ══════════════════════════════════════════════════════════════════════
// TIÊU CHÍ THI ĐUA MẶC ĐỊNH (4 tiêu chí chuẩn)
// ══════════════════════════════════════════════════════════════════════

export const DEFAULT_CRITERIA: EmulationCriterion[] = [
  {
    id: 'c_political',
    name: 'Chất lượng chính trị, tư tưởng',
    code: 'CT',
    maxScore: 100,
    description: 'Chấp hành nghiêm đường lối của Đảng, pháp luật Nhà nước, kỷ luật Quân đội; gương mẫu trong học tập chính trị.',
    deductionRules: [
      'Không tập trung trong giờ học tập chính trị (-5đ)',
      'Không thuộc 10 lời thề, 12 điều kỷ luật (-10đ)',
      'Có biểu hiện tư tưởng dao động, thiếu an tâm công tác (-20đ)',
    ],
    isActive: true,
    category: 'CHINH_TRI',
  },
  {
    id: 'c_task',
    name: 'Huấn luyện & Thực hiện nhiệm vụ',
    code: 'NV',
    maxScore: 100,
    description: 'Tham gia đầy đủ, nghiêm túc các khoa mục huấn luyện quân sự; hoàn thành tốt nhiệm vụ trực sẵn sàng chiến đấu, tăng gia sản xuất.',
    deductionRules: [
      'Chậm giờ tập trung huấn luyện, báo động (-5đ)',
      'Huấn luyện kiểm tra không đạt yêu cầu (-10đ)',
      'Bỏ vị trí gác, trực ban không báo cáo (-30đ)',
    ],
    isActive: true,
    category: 'QUAN_SU',
  },
  {
    id: 'c_hygiene',
    name: 'Nội vụ, vệ sinh & Thể lực',
    code: 'NVVS',
    maxScore: 100,
    description: 'Duy trì nền nếp nội vụ vệ sinh gọn gàng, xếp chăn màn vuông vức, rèn luyện thể lực 4 bài thể dục sáng.',
    deductionRules: [
      'Chăn màn gấp chưa vuông, đặt sai quy định (-5đ)',
      'Giày dép, quân trang để lộn xộn (-5đ)',
      'Không tham gia thể dục sáng, rèn luyện thể lực (-10đ)',
    ],
    isActive: true,
    category: 'HAU_CAN',
  },
  {
    id: 'c_bearing',
    name: 'Lễ tiết tác phong & Chấp hành kỷ luật',
    code: 'LTP',
    maxScore: 100,
    description: 'Xưng hô chào hỏi đúng điều lệnh quản lý bộ đội; quân dung tươi tỉnh, đầu tóc cắt ngắn gọn gàng đúng quy cách.',
    deductionRules: [
      'Xưng hô, chào hỏi chưa đúng điều lệnh (-5đ)',
      'Đầu tóc dài, mang mặc sai lễ tiết (-5đ)',
      'Vi phạm quy định sử dụng điện thoại thông minh (-20đ)',
    ],
    isActive: true,
    category: 'KY_LUAT',
  },
];

export const DEFAULT_AVATAR = '/default-avatar.png';

// ══════════════════════════════════════════════════════════════════════
// CÂY ĐƠN VỊ PHÂN CẤP TRUNG ĐOÀN BB335 (Sư đoàn BB324)
// ══════════════════════════════════════════════════════════════════════
// Cấp: REGIMENT > BATTALION > COMPANY > PLATOON > SQUAD

export const REGIMENT_UNIT: MilitaryUnit = {
  id: 'e335',
  name: 'Trung đoàn Bộ Binh 335',
  code: 'e335',
  tier: 'REGIMENT',
  leaderTitle: 'Trung đoàn trưởng',
  leaderName: 'Thượng tá NGUYỄN QUANG HUY',
  totalSoldiers: 0, // Tính tổng tự động
};

// ── 4 Khối chính ────────────────────────────────────────────────────

export const BATTALION_UNITS: MilitaryUnit[] = [
  {
    id: 'dBB4',
    name: 'Tiểu đoàn Bộ Binh 4',
    code: 'dBB4',
    tier: 'BATTALION',
    parentId: 'e335',
    leaderTitle: 'Tiểu đoàn trưởng',
    leaderName: 'Thiếu tá TRẦN ĐẠI NGHĨA',
    totalSoldiers: 0,
  },
  {
    id: 'dBB5',
    name: 'Tiểu đoàn Bộ Binh 5',
    code: 'dBB5',
    tier: 'BATTALION',
    parentId: 'e335',
    leaderTitle: 'Tiểu đoàn trưởng',
    leaderName: 'Thiếu tá LÊ MINH QUÂN',
    totalSoldiers: 0,
  },
  {
    id: 'dBB6',
    name: 'Tiểu đoàn Bộ Binh 6',
    code: 'dBB6',
    tier: 'BATTALION',
    parentId: 'e335',
    leaderTitle: 'Tiểu đoàn trưởng',
    leaderName: 'Thiếu tá PHẠM HỒNG SƠN',
    totalSoldiers: 0,
  },
  {
    id: 'cTT',
    name: 'Khối Đại đội Trực thuộc',
    code: 'cTT',
    tier: 'BATTALION',
    parentId: 'e335',
    leaderTitle: 'Phó Trung đoàn trưởng phụ trách',
    leaderName: 'Trung tá VŨ ĐÌNH TRỌNG',
    totalSoldiers: 0,
  },
];

// ── Đại đội thuộc Tiểu đoàn BB4 ────────────────────────────────────

export const COMPANY_UNITS: MilitaryUnit[] = [
  // === Tiểu đoàn BB4 ===
  { id: 'C1', name: 'Đại đội 1', code: 'C1', tier: 'COMPANY', parentId: 'dBB4', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy NGUYỄN THẾ ANH', totalSoldiers: 0 },
  { id: 'C2', name: 'Đại đội 2', code: 'C2', tier: 'COMPANY', parentId: 'dBB4', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy HOÀNG VĂN LONG', totalSoldiers: 0 },
  { id: 'C3', name: 'Đại đội 3', code: 'C3', tier: 'COMPANY', parentId: 'dBB4', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy PHẠM TUẤN KIỆT', totalSoldiers: 0 },
  { id: 'C4', name: 'Đại đội Hỏa lực 4', code: 'C4', tier: 'COMPANY', parentId: 'dBB4', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy VŨ MẠNH CƯỜNG', totalSoldiers: 0 },
  // === Tiểu đoàn BB5 ===
  { id: 'C5', name: 'Đại đội 5', code: 'C5', tier: 'COMPANY', parentId: 'dBB5', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy ĐẶNG QUỐC TUẤN', totalSoldiers: 0 },
  { id: 'C6', name: 'Đại đội 6', code: 'C6', tier: 'COMPANY', parentId: 'dBB5', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy BÙI VĂN HẢI', totalSoldiers: 0 },
  { id: 'C7', name: 'Đại đội 7', code: 'C7', tier: 'COMPANY', parentId: 'dBB5', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy NGUYỄN HỮU ĐẠT', totalSoldiers: 0 },
  { id: 'C8', name: 'Đại đội Hỏa lực 8', code: 'C8', tier: 'COMPANY', parentId: 'dBB5', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy LÊ VĂN TÙNG', totalSoldiers: 0 },
  // === Tiểu đoàn BB6 ===
  { id: 'C9', name: 'Đại đội 9', code: 'C9', tier: 'COMPANY', parentId: 'dBB6', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy TRẦN MINH ĐỨC', totalSoldiers: 0 },
  { id: 'C10', name: 'Đại đội 10', code: 'C10', tier: 'COMPANY', parentId: 'dBB6', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy NGUYỄN VĂN THẢO', totalSoldiers: 0 },
  { id: 'C11', name: 'Đại đội 11', code: 'C11', tier: 'COMPANY', parentId: 'dBB6', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy ĐOÀN QUỐC KHÁNH', totalSoldiers: 0 },
  { id: 'C12', name: 'Đại đội Hỏa lực 12', code: 'C12', tier: 'COMPANY', parentId: 'dBB6', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy PHAN ANH DŨNG', totalSoldiers: 0 },
  // === Khối Trực thuộc ===
  { id: 'C14', name: 'Đại đội Cối 100mm (C14)', code: 'C14', tier: 'COMPANY', parentId: 'cTT', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy NGUYỄN QUỐC BÌNH', totalSoldiers: 0 },
  { id: 'C16', name: 'Đại đội PK 12.7mm (C16)', code: 'C16', tier: 'COMPANY', parentId: 'cTT', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy TRẦN VĂN PHÚC', totalSoldiers: 0 },
  { id: 'C17', name: 'Đại đội Công binh (C17)', code: 'C17', tier: 'COMPANY', parentId: 'cTT', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy LÊ HOÀNG NAM', totalSoldiers: 0 },
  { id: 'C18', name: 'Đại đội Thông tin (C18)', code: 'C18', tier: 'COMPANY', parentId: 'cTT', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy VŨ ĐỨC MẠNH', totalSoldiers: 0 },
  { id: 'C20', name: 'Đại đội Trinh sát (C20)', code: 'C20', tier: 'COMPANY', parentId: 'cTT', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy HOÀNG MINH TÂN', totalSoldiers: 0 },
  { id: 'C24', name: 'Đại đội Quân y (C24)', code: 'C24', tier: 'COMPANY', parentId: 'cTT', leaderTitle: 'Đại đội trưởng', leaderName: 'Đại úy BS. NGUYỄN THỊ HƯƠNG', totalSoldiers: 0 },
];

// ── Trung đội & Tiểu đội chi tiết: Đại đội 1 (dBB4) ────────────────

export const PLATOON_UNITS: MilitaryUnit[] = [
  // === C1 / dBB4 — chi tiết ===
  { id: 'C1-B1', name: 'Trung đội 1', code: 'B1', tier: 'PLATOON', parentId: 'C1', leaderTitle: 'Trung đội trưởng', leaderName: 'Thượng úy LÊ HOÀNG HẢI', totalSoldiers: 0 },
  { id: 'C1-B2', name: 'Trung đội 2', code: 'B2', tier: 'PLATOON', parentId: 'C1', leaderTitle: 'Trung đội trưởng', leaderName: 'Trung úy VŨ ĐÌNH TRỌNG', totalSoldiers: 0 },
  { id: 'C1-B3', name: 'Trung đội 3', code: 'B3', tier: 'PLATOON', parentId: 'C1', leaderTitle: 'Trung đội trưởng', leaderName: 'Thiếu úy PHẠM MINH TUẤN', totalSoldiers: 0 },
  // === C18 / cTT — chi tiết ===
  { id: 'C18-B1', name: 'Trung đội 1', code: 'B1', tier: 'PLATOON', parentId: 'C18', leaderTitle: 'Trung đội trưởng', leaderName: 'Thượng úy TRẦN QUANG MINH', totalSoldiers: 0 },
  { id: 'C18-B2', name: 'Trung đội 2', code: 'B2', tier: 'PLATOON', parentId: 'C18', leaderTitle: 'Trung đội trưởng', leaderName: 'Trung úy NGUYỄN ĐỨC TOÀN', totalSoldiers: 0 },
  { id: 'C18-B3', name: 'Trung đội 3', code: 'B3', tier: 'PLATOON', parentId: 'C18', leaderTitle: 'Trung đội trưởng', leaderName: 'Thiếu úy LÊ VĂN THÀNH', totalSoldiers: 0 },
];

export const SQUAD_UNITS: MilitaryUnit[] = [
  // === C1-B1 ===
  { id: 'C1-B1-A1', name: 'Tiểu đội 1', code: 'A1', tier: 'SQUAD', parentId: 'C1-B1', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Trung sĩ TRẦN VĂN BÌNH', totalSoldiers: 0 },
  { id: 'C1-B1-A2', name: 'Tiểu đội 2', code: 'A2', tier: 'SQUAD', parentId: 'C1-B1', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Trung sĩ NGUYỄN VĂN HÒA', totalSoldiers: 0 },
  { id: 'C1-B1-A3', name: 'Tiểu đội 3', code: 'A3', tier: 'SQUAD', parentId: 'C1-B1', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Hạ sĩ PHẠM QUỐC HƯNG', totalSoldiers: 0 },
  // === C1-B2 ===
  { id: 'C1-B2-A1', name: 'Tiểu đội 1', code: 'A1', tier: 'SQUAD', parentId: 'C1-B2', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Trung sĩ LÊ THANH TÙNG', totalSoldiers: 0 },
  { id: 'C1-B2-A2', name: 'Tiểu đội 2', code: 'A2', tier: 'SQUAD', parentId: 'C1-B2', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Hạ sĩ ĐẶNG VĂN HIẾU', totalSoldiers: 0 },
  { id: 'C1-B2-A3', name: 'Tiểu đội 3', code: 'A3', tier: 'SQUAD', parentId: 'C1-B2', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Hạ sĩ TRẦN XUÂN NAM', totalSoldiers: 0 },
  // === C1-B3 ===
  { id: 'C1-B3-A1', name: 'Tiểu đội 1', code: 'A1', tier: 'SQUAD', parentId: 'C1-B3', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Trung sĩ NGÔ VĂN THẮNG', totalSoldiers: 0 },
  { id: 'C1-B3-A2', name: 'Tiểu đội 2', code: 'A2', tier: 'SQUAD', parentId: 'C1-B3', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Hạ sĩ VŨ HOÀNG ANH', totalSoldiers: 0 },
  { id: 'C1-B3-A3', name: 'Tiểu đội 3', code: 'A3', tier: 'SQUAD', parentId: 'C1-B3', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Hạ sĩ NGUYỄN VĂN LONG', totalSoldiers: 0 },
  // === C18-B1 ===
  { id: 'C18-B1-A1', name: 'Tiểu đội 1', code: 'A1', tier: 'SQUAD', parentId: 'C18-B1', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Trung sĩ PHẠM HỒNG QUÂN', totalSoldiers: 0 },
  { id: 'C18-B1-A2', name: 'Tiểu đội 2', code: 'A2', tier: 'SQUAD', parentId: 'C18-B1', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Hạ sĩ NGUYỄN BÁ ĐỨC', totalSoldiers: 0 },
  { id: 'C18-B1-A3', name: 'Tiểu đội 3', code: 'A3', tier: 'SQUAD', parentId: 'C18-B1', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Hạ sĩ LÊ ĐỨC MINH', totalSoldiers: 0 },
  // === C18-B2 ===
  { id: 'C18-B2-A1', name: 'Tiểu đội 1', code: 'A1', tier: 'SQUAD', parentId: 'C18-B2', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Trung sĩ HOÀNG VĂN ĐẠT', totalSoldiers: 0 },
  { id: 'C18-B2-A2', name: 'Tiểu đội 2', code: 'A2', tier: 'SQUAD', parentId: 'C18-B2', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Hạ sĩ TRẦN THẾ LONG', totalSoldiers: 0 },
  { id: 'C18-B2-A3', name: 'Tiểu đội 3', code: 'A3', tier: 'SQUAD', parentId: 'C18-B2', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Hạ sĩ VŨ MINH ĐỨC', totalSoldiers: 0 },
  // === C18-B3 ===
  { id: 'C18-B3-A1', name: 'Tiểu đội 1', code: 'A1', tier: 'SQUAD', parentId: 'C18-B3', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Trung sĩ ĐẶNG NGỌC HÀ', totalSoldiers: 0 },
  { id: 'C18-B3-A2', name: 'Tiểu đội 2', code: 'A2', tier: 'SQUAD', parentId: 'C18-B3', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Hạ sĩ BÙI VĂN ĐÔNG', totalSoldiers: 0 },
  { id: 'C18-B3-A3', name: 'Tiểu đội 3', code: 'A3', tier: 'SQUAD', parentId: 'C18-B3', leaderTitle: 'Tiểu đội trưởng', leaderName: 'Hạ sĩ PHAN TRỌNG NGHĨA', totalSoldiers: 0 },
];

// ── Tổng hợp toàn bộ đơn vị ─────────────────────────────────────────
export const ALL_UNITS: MilitaryUnit[] = [
  REGIMENT_UNIT,
  ...BATTALION_UNITS,
  ...COMPANY_UNITS,
  ...PLATOON_UNITS,
  ...SQUAD_UNITS,
];

// ── Helper: lấy các đơn vị con trực tiếp ────────────────────────────
export function getChildUnits(parentId: string): MilitaryUnit[] {
  return ALL_UNITS.filter((u) => u.parentId === parentId);
}

// ── Helper: lấy toàn bộ đơn vị con (đệ quy) ────────────────────────
export function getDescendantUnits(parentId: string): MilitaryUnit[] {
  const children = getChildUnits(parentId);
  return children.reduce<MilitaryUnit[]>(
    (acc, child) => [...acc, child, ...getDescendantUnits(child.id)],
    []
  );
}

// ── Helper: lấy chuỗi tổ tiên (breadcrumb) ──────────────────────────
export function getAncestorChain(unitId: string): MilitaryUnit[] {
  const chain: MilitaryUnit[] = [];
  let current = ALL_UNITS.find((u) => u.id === unitId);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? ALL_UNITS.find((u) => u.id === current!.parentId) : undefined;
  }
  return chain;
}

// ══════════════════════════════════════════════════════════════════════
// BACKWARD COMPAT: MOCK_PLATOONS (map từ PLATOON_UNITS của C1)
// ══════════════════════════════════════════════════════════════════════

export const MOCK_PLATOONS: Platoon[] = PLATOON_UNITS
  .filter((u) => u.parentId === 'C1')
  .map((u, idx) => ({
    id: u.id,
    name: u.name,
    code: u.code,
    leaderName: u.leaderName,
    totalSoldiers: u.totalSoldiers,
  }));

// ══════════════════════════════════════════════════════════════════════
// TÀI KHOẢN MẪU (mở rộng phân cấp)
// ══════════════════════════════════════════════════════════════════════

export const MOCK_ACCOUNTS: UserAccount[] = [
  {
    id: 'u-trungdoan',
    username: 'trungdoan',
    name: 'Thượng tá NGUYỄN QUANG HUY',
    rank: 'Thượng tá',
    role: 'COMMANDER',
    roleTitle: 'Trung đoàn trưởng',
    phone: '0981000001',
    avatarUrl: DEFAULT_AVATAR,
    unitScopeTier: 'REGIMENT',
    assignedUnitId: 'e335',
  },
  {
    id: 'u-tieudoan',
    username: 'tieudoan',
    name: 'Thiếu tá TRẦN ĐẠI NGHĨA',
    rank: 'Thiếu tá',
    role: 'COMMANDER',
    roleTitle: 'Tiểu đoàn trưởng',
    phone: '0981000002',
    avatarUrl: DEFAULT_AVATAR,
    unitScopeTier: 'BATTALION',
    assignedUnitId: 'dBB4',
  },
  {
    id: 'u-chihuy',
    username: 'chihuy',
    name: 'Đại úy NGUYỄN THẾ ANH',
    rank: 'Đại úy',
    role: 'COMMANDER',
    roleTitle: 'Đại đội trưởng',
    phone: '0988123456',
    avatarUrl: DEFAULT_AVATAR,
    unitScopeTier: 'COMPANY',
    assignedUnitId: 'C1',
  },
  {
    id: 'u-chamdiem',
    username: 'chamdiem',
    name: 'Trung sĩ TRẦN VĂN BÌNH',
    rank: 'Trung sĩ',
    role: 'SCORER',
    roleTitle: 'Trực ban Nội vụ / Tiểu đội trưởng',
    platoonId: 'C1-B1',
    phone: '0977654321',
    avatarUrl: DEFAULT_AVATAR,
    unitScopeTier: 'PLATOON',
    assignedUnitId: 'C1-B1',
  },
  {
    id: 'u-quannhan',
    username: 'quannhan',
    name: 'Binh nhất TRỊNH QUỐC VIỆT',
    rank: 'Binh nhất',
    role: 'SOLDIER',
    roleTitle: 'Chiến sĩ',
    soldierId: 's1',
    platoonId: 'C1-B1',
    phone: '0394497***',
    avatarUrl: DEFAULT_AVATAR,
    unitScopeTier: 'SQUAD',
    assignedUnitId: 'C1-B1-A1',
  },
];

// ══════════════════════════════════════════════════════════════════════
// DANH SÁCH QUÂN NHÂN MẪU
// ══════════════════════════════════════════════════════════════════════
// Chi tiết: Đại đội 1 (dBB4) — 3 Trung đội × 3 Tiểu đội
//           Đại đội 18 Thông tin (cTT) — 3 Trung đội × 3 Tiểu đội

export const MOCK_SOLDIERS: Soldier[] = [
  // ──────────────────────────────────────────────────────────────────
  // ĐẠI ĐỘI 1 / TIỂU ĐOÀN BB4
  // ──────────────────────────────────────────────────────────────────

  // ── C1-B1 (Trung đội 1) ── Tiểu đội 1 ──
  { id: 's1', name: 'TRỊNH QUỐC VIỆT', dob: '17/04/2005', gender: 'Nam', rank: 'Binh nhất', roleTitle: 'Chiến sĩ', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B1', platoonName: 'Trung đội 1', squadId: 'C1-B1-A1', squadName: 'Tiểu đội 1', joinDate: '15/02/2023', officialDate: '18/06/2024', militaryCode: 'QN-040205009', idCardNumber: '040205009***', phone: '0394497***', hometown: 'Ý Yên, Nam Định', partyStatus: 'Đảng viên chính thức', partyJoinDate: '18/06/2023' },
  { id: 's2', name: 'NGUYỄN VĂN ĐỨC', dob: '15/02/2004', gender: 'Nam', rank: 'Binh nhất', roleTitle: 'Chiến sĩ', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B1', platoonName: 'Trung đội 1', squadId: 'C1-B1-A1', squadName: 'Tiểu đội 1', joinDate: '15/02/2023', militaryCode: 'QN-038204011', idCardNumber: '038204011***', phone: '0912345***', hometown: 'Đông Hưng, Thái Bình', partyStatus: 'Đoàn viên' },
  { id: 's4', name: 'TRẦN VĂN BÌNH', dob: '05/11/2003', gender: 'Nam', rank: 'Trung sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B1', platoonName: 'Trung đội 1', squadId: 'C1-B1-A1', squadName: 'Tiểu đội 1', joinDate: '15/02/2022', officialDate: '02/09/2023', militaryCode: 'QN-001203005', idCardNumber: '001203005***', phone: '0977654***', hometown: 'Gia Lâm, Hà Nội', partyStatus: 'Đảng viên chính thức', partyJoinDate: '02/09/2022' },

  // ── C1-B1 ── Tiểu đội 2 ──
  { id: 's3', name: 'LÊ VĂN THẮNG', dob: '22/09/2005', gender: 'Nam', rank: 'Binh nhì', roleTitle: 'Chiến sĩ', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B1', platoonName: 'Trung đội 1', squadId: 'C1-B1-A2', squadName: 'Tiểu đội 2', joinDate: '20/02/2024', militaryCode: 'QN-035205022', idCardNumber: '035205022***', phone: '0987654***', hometown: 'Kim Bảng, Hà Nam', partyStatus: 'Đoàn viên' },
  { id: 's11', name: 'NGUYỄN VĂN HÒA', dob: '12/01/2004', gender: 'Nam', rank: 'Trung sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B1', platoonName: 'Trung đội 1', squadId: 'C1-B1-A2', squadName: 'Tiểu đội 2', joinDate: '15/02/2022', militaryCode: 'QN-036204015', idCardNumber: '036204015***', phone: '0923456***', hometown: 'Thanh Liêm, Hà Nam', partyStatus: 'Đoàn viên ưu tú' },

  // ── C1-B1 ── Tiểu đội 3 ──
  { id: 's12', name: 'ĐỖ VĂN HIỆP', dob: '08/07/2005', gender: 'Nam', rank: 'Binh nhì', roleTitle: 'Chiến sĩ', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B1', platoonName: 'Trung đội 1', squadId: 'C1-B1-A3', squadName: 'Tiểu đội 3', joinDate: '20/02/2024', militaryCode: 'QN-034205033', idCardNumber: '034205033***', phone: '0945678***', hometown: 'Quốc Oai, Hà Nội', partyStatus: 'Đoàn viên' },

  // ── C1-B2 (Trung đội 2) ── Tiểu đội 1 ──
  { id: 's5', name: 'HOÀNG MINH KHÔI', dob: '10/08/2004', gender: 'Nam', rank: 'Binh nhất', roleTitle: 'Chiến sĩ', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B2', platoonName: 'Trung đội 2', squadId: 'C1-B2-A1', squadName: 'Tiểu đội 1', joinDate: '15/02/2023', militaryCode: 'QN-026204018', idCardNumber: '026204018***', phone: '0934567***', hometown: 'Thủy Nguyên, Hải Phòng', partyStatus: 'Đoàn viên ưu tú' },
  { id: 's7', name: 'PHẠM QUỐC HƯNG', dob: '14/06/2003', gender: 'Nam', rank: 'Hạ sĩ', roleTitle: 'Tiểu đội phó', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B2', platoonName: 'Trung đội 2', squadId: 'C1-B2-A1', squadName: 'Tiểu đội 1', joinDate: '15/02/2023', militaryCode: 'QN-033203044', idCardNumber: '033203044***', phone: '0981122***', hometown: 'Khoái Châu, Hưng Yên', partyStatus: 'Đoàn viên ưu tú' },

  // ── C1-B2 ── Tiểu đội 2 ──
  { id: 's6', name: 'ĐỖ TUẤN ANH', dob: '30/12/2005', gender: 'Nam', rank: 'Binh nhì', roleTitle: 'Chiến sĩ', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B2', platoonName: 'Trung đội 2', squadId: 'C1-B2-A2', squadName: 'Tiểu đội 2', joinDate: '20/02/2024', militaryCode: 'QN-031205099', idCardNumber: '031205099***', phone: '0961234***', hometown: 'Cẩm Giàng, Hải Dương', partyStatus: 'Đoàn viên' },

  // ── C1-B2 ── Tiểu đội 3 ──
  { id: 's13', name: 'TRẦN XUÂN NAM', dob: '03/03/2004', gender: 'Nam', rank: 'Hạ sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B2', platoonName: 'Trung đội 2', squadId: 'C1-B2-A3', squadName: 'Tiểu đội 3', joinDate: '15/02/2023', militaryCode: 'QN-027204007', idCardNumber: '027204007***', phone: '0956789***', hometown: 'An Dương, Hải Phòng', partyStatus: 'Đoàn viên' },

  // ── C1-B3 (Trung đội 3) ── Tiểu đội 1 ──
  { id: 's8', name: 'NGUYỄN VĂN A', dob: '08/03/2004', gender: 'Nam', rank: 'Binh nhất', roleTitle: 'Chiến sĩ', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B3', platoonName: 'Trung đội 3', squadId: 'C1-B3-A1', squadName: 'Tiểu đội 1', joinDate: '15/02/2023', militaryCode: 'QN-020204001', idCardNumber: '020204001***', phone: '0972233***', hometown: 'Việt Trì, Phú Thọ', partyStatus: 'Đoàn viên ưu tú' },
  { id: 's10', name: 'BÙI QUANG HUY', dob: '25/01/2003', gender: 'Nam', rank: 'Hạ sĩ', roleTitle: 'Tiểu đội phó', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B3', platoonName: 'Trung đội 3', squadId: 'C1-B3-A1', squadName: 'Tiểu đội 1', joinDate: '15/02/2023', militaryCode: 'QN-024203055', idCardNumber: '024203055***', phone: '0915566***', hometown: 'Yên Phong, Bắc Ninh', partyStatus: 'Đoàn viên' },

  // ── C1-B3 ── Tiểu đội 2 ──
  { id: 's9', name: 'VŨ ĐỨC MẠNH', dob: '19/07/2005', gender: 'Nam', rank: 'Binh nhì', roleTitle: 'Chiến sĩ', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B3', platoonName: 'Trung đội 3', squadId: 'C1-B3-A2', squadName: 'Tiểu đội 2', joinDate: '20/02/2024', militaryCode: 'QN-019205077', idCardNumber: '019205077***', phone: '0943344***', hometown: 'Sông Lô, Vĩnh Phúc', partyStatus: 'Đoàn viên' },

  // ── C1-B3 ── Tiểu đội 3 ──
  { id: 's14', name: 'NGÔ VĂN THẮNG', dob: '11/11/2004', gender: 'Nam', rank: 'Trung sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'dBB4', battalionName: 'Tiểu đoàn BB4', companyId: 'C1', companyName: 'Đại đội 1', platoonId: 'C1-B3', platoonName: 'Trung đội 3', squadId: 'C1-B3-A3', squadName: 'Tiểu đội 3', joinDate: '15/02/2022', militaryCode: 'QN-030204066', idCardNumber: '030204066***', phone: '0967890***', hometown: 'Đan Phượng, Hà Nội', partyStatus: 'Đoàn viên ưu tú' },

  // ──────────────────────────────────────────────────────────────────
  // ĐẠI ĐỘI 18 THÔNG TIN / KHỐI TRỰC THUỘC
  // ──────────────────────────────────────────────────────────────────

  // ── C18-B1 (Trung đội 1) ── Tiểu đội 1 ──
  { id: 's20', name: 'PHẠM HỒNG QUÂN', dob: '20/05/2003', gender: 'Nam', rank: 'Trung sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B1', platoonName: 'Trung đội 1', squadId: 'C18-B1-A1', squadName: 'Tiểu đội 1', joinDate: '15/02/2022', militaryCode: 'QN-001203101', idCardNumber: '001203101***', phone: '0981001***', hometown: 'Hoàn Kiếm, Hà Nội', partyStatus: 'Đảng viên chính thức', partyJoinDate: '15/09/2023' },
  { id: 's21', name: 'LÊ VĂN QUANG', dob: '14/08/2005', gender: 'Nam', rank: 'Binh nhì', roleTitle: 'Chiến sĩ', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B1', platoonName: 'Trung đội 1', squadId: 'C18-B1-A1', squadName: 'Tiểu đội 1', joinDate: '20/02/2024', militaryCode: 'QN-038205102', idCardNumber: '038205102***', phone: '0982002***', hometown: 'Hà Đông, Hà Nội', partyStatus: 'Đoàn viên' },
  { id: 's22', name: 'TRẦN QUỐC THỊNH', dob: '01/12/2004', gender: 'Nam', rank: 'Binh nhất', roleTitle: 'Chiến sĩ', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B1', platoonName: 'Trung đội 1', squadId: 'C18-B1-A1', squadName: 'Tiểu đội 1', joinDate: '15/02/2023', militaryCode: 'QN-025204103', idCardNumber: '025204103***', phone: '0983003***', hometown: 'Từ Liêm, Hà Nội', partyStatus: 'Đoàn viên ưu tú' },

  // ── C18-B1 ── Tiểu đội 2 ──
  { id: 's23', name: 'NGUYỄN BÁ ĐỨC', dob: '28/06/2003', gender: 'Nam', rank: 'Hạ sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B1', platoonName: 'Trung đội 1', squadId: 'C18-B1-A2', squadName: 'Tiểu đội 2', joinDate: '15/02/2023', militaryCode: 'QN-001203104', idCardNumber: '001203104***', phone: '0984004***', hometown: 'Long Biên, Hà Nội', partyStatus: 'Đoàn viên' },
  { id: 's24', name: 'VŨ HỒNG NAM', dob: '05/03/2005', gender: 'Nam', rank: 'Binh nhì', roleTitle: 'Chiến sĩ', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B1', platoonName: 'Trung đội 1', squadId: 'C18-B1-A2', squadName: 'Tiểu đội 2', joinDate: '20/02/2024', militaryCode: 'QN-019205105', idCardNumber: '019205105***', phone: '0985005***', hometown: 'Tam Đảo, Vĩnh Phúc', partyStatus: 'Đoàn viên' },

  // ── C18-B1 ── Tiểu đội 3 ──
  { id: 's25', name: 'LÊ ĐỨC MINH', dob: '22/09/2004', gender: 'Nam', rank: 'Hạ sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B1', platoonName: 'Trung đội 1', squadId: 'C18-B1-A3', squadName: 'Tiểu đội 3', joinDate: '15/02/2023', militaryCode: 'QN-034204106', idCardNumber: '034204106***', phone: '0986006***', hometown: 'Ninh Bình', partyStatus: 'Đoàn viên ưu tú' },

  // ── C18-B2 (Trung đội 2) ── Tiểu đội 1 ──
  { id: 's26', name: 'HOÀNG VĂN ĐẠT', dob: '17/02/2003', gender: 'Nam', rank: 'Trung sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B2', platoonName: 'Trung đội 2', squadId: 'C18-B2-A1', squadName: 'Tiểu đội 1', joinDate: '15/02/2022', militaryCode: 'QN-036203107', idCardNumber: '036203107***', phone: '0987007***', hometown: 'Bắc Giang', partyStatus: 'Đảng viên chính thức', partyJoinDate: '01/10/2023' },
  { id: 's27', name: 'ĐẶNG TRỌNG HIẾU', dob: '30/10/2005', gender: 'Nam', rank: 'Binh nhì', roleTitle: 'Chiến sĩ', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B2', platoonName: 'Trung đội 2', squadId: 'C18-B2-A1', squadName: 'Tiểu đội 1', joinDate: '20/02/2024', militaryCode: 'QN-024205108', idCardNumber: '024205108***', phone: '0988008***', hometown: 'Bắc Ninh', partyStatus: 'Đoàn viên' },

  // ── C18-B2 ── Tiểu đội 2 ──
  { id: 's28', name: 'TRẦN THẾ LONG', dob: '09/04/2004', gender: 'Nam', rank: 'Hạ sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B2', platoonName: 'Trung đội 2', squadId: 'C18-B2-A2', squadName: 'Tiểu đội 2', joinDate: '15/02/2023', militaryCode: 'QN-038204109', idCardNumber: '038204109***', phone: '0989009***', hometown: 'Thái Nguyên', partyStatus: 'Đoàn viên' },

  // ── C18-B2 ── Tiểu đội 3 ──
  { id: 's29', name: 'VŨ MINH ĐỨC', dob: '15/11/2004', gender: 'Nam', rank: 'Hạ sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B2', platoonName: 'Trung đội 2', squadId: 'C18-B2-A3', squadName: 'Tiểu đội 3', joinDate: '15/02/2023', militaryCode: 'QN-020204110', idCardNumber: '020204110***', phone: '0990010***', hometown: 'Phú Thọ', partyStatus: 'Đoàn viên ưu tú' },

  // ── C18-B3 (Trung đội 3) ── Tiểu đội 1 ──
  { id: 's30', name: 'ĐẶNG NGỌC HÀ', dob: '02/08/2003', gender: 'Nam', rank: 'Trung sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B3', platoonName: 'Trung đội 3', squadId: 'C18-B3-A1', squadName: 'Tiểu đội 1', joinDate: '15/02/2022', militaryCode: 'QN-035203111', idCardNumber: '035203111***', phone: '0991011***', hometown: 'Hà Nam', partyStatus: 'Đoàn viên' },
  { id: 's31', name: 'NGUYỄN TIẾN DŨNG', dob: '18/01/2005', gender: 'Nam', rank: 'Binh nhì', roleTitle: 'Chiến sĩ', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B3', platoonName: 'Trung đội 3', squadId: 'C18-B3-A1', squadName: 'Tiểu đội 1', joinDate: '20/02/2024', militaryCode: 'QN-033205112', idCardNumber: '033205112***', phone: '0992012***', hometown: 'Hưng Yên', partyStatus: 'Đoàn viên' },

  // ── C18-B3 ── Tiểu đội 2 ──
  { id: 's32', name: 'BÙI VĂN ĐÔNG', dob: '26/06/2004', gender: 'Nam', rank: 'Hạ sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B3', platoonName: 'Trung đội 3', squadId: 'C18-B3-A2', squadName: 'Tiểu đội 2', joinDate: '15/02/2023', militaryCode: 'QN-031204113', idCardNumber: '031204113***', phone: '0993013***', hometown: 'Hải Dương', partyStatus: 'Đoàn viên' },

  // ── C18-B3 ── Tiểu đội 3 ──
  { id: 's33', name: 'PHAN TRỌNG NGHĨA', dob: '10/10/2004', gender: 'Nam', rank: 'Hạ sĩ', roleTitle: 'Tiểu đội trưởng', battalionId: 'cTT', battalionName: 'Khối Trực thuộc', companyId: 'C18', companyName: 'Đại đội Thông tin', platoonId: 'C18-B3', platoonName: 'Trung đội 3', squadId: 'C18-B3-A3', squadName: 'Tiểu đội 3', joinDate: '15/02/2023', militaryCode: 'QN-026204114', idCardNumber: '026204114***', phone: '0994014***', hometown: 'Hải Phòng', partyStatus: 'Đoàn viên' },
].map((s) => ({ ...s, avatarUrl: DEFAULT_AVATAR }));

// ══════════════════════════════════════════════════════════════════════
// DỮ LIỆU TRỐNG & TIỆN ÍCH
// ══════════════════════════════════════════════════════════════════════

export const TODAY_DATE = new Date().toISOString().slice(0, 10);

// Bắt đầu từ trạng thái trống — dữ liệu được nhập vào qua giao diện và lưu vào LocalStorage.
export const MOCK_DAILY_SCORES: DailyScore[] = [];

export const MOCK_COMMENDATIONS: CommendationItem[] = [];

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
