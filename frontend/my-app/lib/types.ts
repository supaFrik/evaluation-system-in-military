export type UserRole = 'COMMANDER' | 'SCORER' | 'SOLDIER';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  rank: string; // Cấp bậc (Đại úy, Trung sĩ, Binh nhất...)
  role: UserRole;
  roleTitle: string; // Chức vụ: Đại đội trưởng, Tiểu đội trưởng, Chiến sĩ
  soldierId?: string; // Liên kết với hồ sơ quân nhân nếu là SOLDIER
  platoonId?: string;
  phone?: string;
}

export interface Platoon {
  id: string;
  name: string; // Trung đội 1, Trung đội 2, Trung đội 3
  code: string;
  leaderName: string; // Trung đội trưởng
  totalSoldiers: number;
}

export interface Soldier {
  id: string;
  name: string;
  dob: string; // 17/04/2005
  gender: string; // Nam
  rank: string; // Binh nhất, Binh nhì, Hạ sĩ, Trung sĩ
  roleTitle: string; // Chiến sĩ, Tiểu đội trưởng...
  platoonId: string;
  platoonName: string;
  squadName: string; // Tiểu đội 1, 2, 3
  joinDate: string; // Ngày nhập ngũ
  officialDate?: string; // Ngày chính thức
  militaryCode: string; // Số thẻ quân nhân
  idCardNumber: string; // Số CCCD / CMND
  phone: string;
  hometown: string; // Quê quán
  partyStatus: string; // Đảng viên chính thức / Dự bị / Đoàn viên
  partyJoinDate?: string;
  avatarUrl?: string;
}

export interface ViolationRecord {
  id: string;
  category: 'chinh_tri' | 'nhiem_vu' | 'noi_vu' | 'tac_phong';
  content: string;
  points: number; // Điểm trừ (âm) hoặc cộng (dương)
}

export interface EmulationCriterion {
  id: string;
  name: string; // Tên tiêu chí: Chất lượng chính trị, Huấn luyện SSCĐ...
  code: string; // CT, NV, NVVS, LTP, HL, TG...
  maxScore: number; // Điểm chuẩn tối đa (mặc định 100)
  description: string; // Hướng dẫn, yêu cầu đánh giá
  deductionRules: string[]; // Các lỗi trừ điểm thường gặp
  isActive: boolean; // Trạng thái kích hoạt áp dụng
  category?: 'CHINH_TRI' | 'QUAN_SU' | 'HAU_CAN' | 'KY_LUAT' | 'KHAC';
}

export interface DailyScore {
  id: string;
  soldierId: string;
  soldierName: string;
  platoonId: string;
  date: string; // YYYY-MM-DD
  // Điểm các tiêu chí động linh hoạt: { [criterionId]: number }
  criteriaScores?: Record<string, number>;
  // 4 tiêu chí chuẩn ban đầu (thang điểm 100) - bảo toàn tương thích ngược
  politicalScore: number; // 1. Chất lượng chính trị
  taskScore: number; // 2. Thực hiện nhiệm vụ
  hygieneScore: number; // 3. Nội vụ, vệ sinh
  bearingScore: number; // 4. Lễ tiết tác phong
  totalScore: number; // Tổng điểm
  violations: ViolationRecord[];
  notes?: string;
  evaluatedBy: string; // Người chấm
  // Hồ sơ / Quyết định thi đua / kỷ luật đính kèm nếu có
  decisionDocument?: ScoreDecisionDocument;
}

export interface ScoreDecisionDocument {
  documentNumber: string; // Số quyết định / văn bản
  documentType: string; // Loại văn bản (Quyết định kỷ luật, Biên bản kiểm điểm, Khen thưởng...)
  issuedBy?: string; // Cơ quan / Người ký
  issuedDate?: string; // Ngày ký / ban hành
  fileName?: string; // Tên file đính kèm
  fileSize?: string; // Dung lượng file
  notes?: string; // Trích yếu / nội dung
}

export interface DisciplineDocument {
  documentNumber: string; // Số quyết định kỷ luật
  documentType: string; // Loại kỷ luật (Khiển trách / Cảnh cáo / Giáng cấp...)
  issuedBy: string; // Người ký quyết định
  issuedDate: string; // Ngày ký quyết định
  effectiveDate: string; // Ngày có hiệu lực
  reason: string; // Lý do kỷ luật chi tiết
  duration?: string; // Thời hạn thi hành (nếu có)
}

export interface CommendationItem {
  id: string;
  type: 'COMMENDATION' | 'REMINDER'; // BIỂU DƯƠNG hoặc NHẮC NHỞ
  scope: 'INDIVIDUAL' | 'PLATOON'; // Cá nhân hoặc Trung đội
  targetId: string; // soldierId hoặc platoonId
  targetName: string; // Ví dụ: Binh nhất Nguyễn Văn A hoặc Trung đội 2
  platoonId?: string;
  content: string;
  date: string; // YYYY-MM-DD
  createdBy: string;
  // Hồ sơ kỷ luật đính kèm (chỉ có khi type === 'REMINDER' và có quyết định kỷ luật chính thức)
  disciplineDocument?: DisciplineDocument;
}

export interface DailyLockStatus {
  date: string; // YYYY-MM-DD
  isLocked: boolean;
  lockedAt?: string; // Thời gian chốt ISO
  lockedBy?: string; // Cán bộ chốt (Đại úy Nguyễn Văn Thắng)
  lockNote?: string; // Ghi chú chốt sổ điểm danh 21:00
  unlockHistory?: {
    unlockedAt: string;
    unlockedBy: string;
    reason: string;
  }[];
}

export interface PlatoonAggregate {
  platoonId: string;
  platoonName: string;
  totalSoldiers: number;
  avgPolitical: number;
  avgTask: number;
  avgHygiene: number;
  avgBearing: number;
  avgTotal: number;
  avgCriteriaScores?: Record<string, number>;
  rank: number; // 1, 2, 3
  generalRemark: string; // Nhận xét chung
}

