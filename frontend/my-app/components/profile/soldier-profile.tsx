'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Soldier, DailyScore, CommendationItem } from '@/lib/types';
import {
  Phone,
  CreditCard,
  Eye,
  EyeOff,
  Check,
  Edit2,
  Printer,
  FileDown,
  FileText,
  Calendar,
  Filter,
  Paperclip,
  Download,
  X,
  CalendarCheck,
  ArrowUpRightIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { notify } from '@/lib/notify';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RANKS = ['Binh nhì', 'Binh nhất', 'Hạ sĩ', 'Trung sĩ', 'Thượng sĩ', 'Thiếu úy', 'Trung úy', 'Thượng úy', 'Đại úy'];
const ROLES = ['Chiến sĩ', 'Tiểu đội phó', 'Tiểu đội trưởng', 'Phó Trung đội trưởng', 'Trung đội trưởng'];
const PARTY_STATUSES = ['Đoàn viên', 'Đảng viên dự bị', 'Đảng viên chính thức'];

interface SoldierProfileProps {
  soldier: Soldier;
  scores: DailyScore[];
  commendations: CommendationItem[];
  onUpdatePhone?: (newPhone: string) => void;
  canManage?: boolean;
  onUpdateSoldier?: (soldier: Soldier) => void;
}

export function SoldierProfile({
  soldier,
  scores,
  commendations,
  onUpdatePhone,
  canManage = false,
  onUpdateSoldier,
}: SoldierProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'commendations' | 'notes'>('overview');
  const [showMasked, setShowMasked] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(soldier.phone);

  const [isFullEditModalOpen, setIsFullEditModalOpen] = useState(false);
  const [fullFormData, setFullFormData] = useState({
    name: soldier.name,
    rank: soldier.rank,
    roleTitle: soldier.roleTitle,
    militaryCode: soldier.militaryCode,
    idCardNumber: soldier.idCardNumber,
    dob: soldier.dob,
    gender: soldier.gender || 'Nam',
    hometown: soldier.hometown,
    phone: soldier.phone,
    joinDate: soldier.joinDate,
    partyStatus: soldier.partyStatus,
    partyJoinDate: soldier.partyJoinDate || '',
    officialDate: soldier.officialDate || '',
    squadName: soldier.squadName,
    platoonName: soldier.platoonName,
  });

  React.useEffect(() => {
    setFullFormData({
      name: soldier.name,
      rank: soldier.rank,
      roleTitle: soldier.roleTitle,
      militaryCode: soldier.militaryCode,
      idCardNumber: soldier.idCardNumber,
      dob: soldier.dob,
      gender: soldier.gender || 'Nam',
      hometown: soldier.hometown,
      phone: soldier.phone,
      joinDate: soldier.joinDate,
      partyStatus: soldier.partyStatus,
      partyJoinDate: soldier.partyJoinDate || '',
      officialDate: soldier.officialDate || '',
      squadName: soldier.squadName,
      platoonName: soldier.platoonName,
    });
  }, [soldier]);

  const soldierScores = scores.filter((s) => s.soldierId === soldier.id);
  const soldierCommendations = commendations.filter(
    (c) => c.targetId === soldier.id || (c.scope === 'PLATOON' && c.targetId === soldier.platoonId)
  );

  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const [viewingDecisionScore, setViewingDecisionScore] = useState<DailyScore | null>(null);

  const filteredScores: DailyScore[] = soldierScores.filter((sc) => {
    if (timeFilter === 'all') return true;
    const now = new Date();
    const scoreDate = new Date(sc.date);
    const diffDays = (now.getTime() - scoreDate.getTime()) / (1000 * 3600 * 24);
    if (timeFilter === 'week') return diffDays <= 7;
    if (timeFilter === 'month') return diffDays <= 30;
    return true;
  });

  const avgTotal = filteredScores.length
    ? (
        filteredScores.reduce((acc, cur) => acc + cur.totalScore, 0) /
        filteredScores.length
      ).toFixed(1)
    : '0';

  const totalViolations = filteredScores.reduce(
    (acc, cur) => acc + cur.violations.filter((v) => v.points < 0).length,
    0
  );
  const totalDecisions = filteredScores.filter((s) => !!s.decisionDocument).length;

  const handleSavePhone = () => {
    if (onUpdatePhone && phoneInput.trim()) {
      onUpdatePhone(phoneInput.trim());
      setIsEditingPhone(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Lý lịch trích ngang - ${soldier.name}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; }
          .header-table { width: 100%; border: none; margin-bottom: 20px; }
          .title { text-align: center; font-size: 16pt; font-weight: bold; margin: 20px 0; text-transform: uppercase; }
          table.data { width: 100%; border-collapse: collapse; margin-top: 15px; }
          table.data td, table.data th { border: 1px solid #333; padding: 6px 10px; font-size: 12pt; }
          .label { font-weight: bold; width: 35%; }
          .sign-table { width: 100%; border: none; margin-top: 40px; text-align: center; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 45%; text-align: center;">
              <strong>QUÂN ĐỘI NHÂN DÂN VIỆT NAM</strong><br>
              <strong>ĐẠI ĐỘI 1 — ${soldier.platoonName.toUpperCase()}</strong>
            </td>
            <td style="width: 55%; text-align: center;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
              <strong><u>Độc lập – Tự do – Hạnh phúc</u></strong>
            </td>
          </tr>
        </table>

        <div class="title">LÝ LỊCH TRÍCH NGANG QUÂN NHÂN</div>

        <table class="data">
          <tr><td class="label">Họ và tên:</td><td><strong>${soldier.name}</strong></td></tr>
          <tr><td class="label">Cấp bậc, Chức vụ:</td><td>${soldier.rank} — ${soldier.roleTitle}</td></tr>
          <tr><td class="label">Đơn vị:</td><td>${soldier.squadName} — ${soldier.platoonName}</td></tr>
          <tr><td class="label">Số thẻ quân nhân:</td><td>${soldier.militaryCode}</td></tr>
          <tr><td class="label">Ngày tháng năm sinh:</td><td>${soldier.dob}</td></tr>
          <tr><td class="label">Giới tính:</td><td>${soldier.gender}</td></tr>
          <tr><td class="label">Quê quán:</td><td>${soldier.hometown}</td></tr>
          <tr><td class="label">Số CCCD:</td><td>${soldier.idCardNumber}</td></tr>
          <tr><td class="label">Số điện thoại:</td><td>${soldier.phone}</td></tr>
          <tr><td class="label">Ngày nhập ngũ:</td><td>${soldier.joinDate}</td></tr>
          <tr><td class="label">Tình trạng chính trị:</td><td>${soldier.partyStatus}</td></tr>
          <tr><td class="label">Ngày vào Đảng:</td><td>${soldier.partyJoinDate || 'Chưa'}</td></tr>
        </table>

        <table class="sign-table">
          <tr>
            <td style="width: 50%;">
              <strong>QUÂN NHÂN KHAI</strong><br>
              <i>(Ký và ghi rõ họ tên)</i><br><br><br><br>
              ${soldier.name}
            </td>
            <td style="width: 50%;">
              <i>Ngày ..... tháng ..... năm 2026</i><br>
              <strong>ĐẠI ĐỘI TRƯỞNG</strong><br>
              <i>(Ký, đóng dấu)</i><br><br><br><br>
              Đại úy Nguyễn Thế Anh
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LyLichTrichNgang_${soldier.militaryCode}_${soldier.name.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify.success('Xuất file thành công', `Đã tạo tệp lý lịch trích ngang Word cho ${soldier.name}`);
  };

  return (
    <div className="w-full max-w-5xl py-2">
      {/* 1. Simple Profile Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6">
        <div className="flex items-start gap-5">
          {/* Avatar with Red Military Star Emblem */}
          <div className="relative h-20 w-20 shrink-0">
            <div className="h-full w-full rounded-full overflow-hidden border-2 border-yellow-500/70 bg-white shadow-sm">
              <Image
                src={soldier.avatarUrl || '/default-avatar.png'}
                alt={soldier.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-yellow-400 text-[#b91c1c] text-xs font-black shadow-xs">
              ★
            </div>
          </div>

          {/* Name & Basic Info */}
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold uppercase tracking-wide text-zinc-900">
              {soldier.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-zinc-600">
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-zinc-400" />
                <span>Số thẻ quân nhân:</span>
                <span className="font-mono text-zinc-800">{soldier.militaryCode}</span>
              </span>

              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-zinc-400" />
                <span>Số điện thoại:</span>
                <span className="font-mono text-zinc-800">
                  {showMasked ? soldier.phone.replace('***', '888') : soldier.phone}
                </span>
                <button
                  type="button"
                  onClick={() => setShowMasked(!showMasked)}
                  className="text-zinc-400 hover:text-zinc-600 ml-0.5"
                  title={showMasked ? 'Ẩn' : 'Hiện số'}
                >
                  {showMasked ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              {soldier.rank} — {soldier.roleTitle} | {soldier.squadName} — {soldier.platoonName}
            </p>
          </div>
        </div>

        {/* Action Buttons: Export Word, Print PDF, Edit Phone, Full Edit */}
        <div className="flex flex-wrap items-center gap-2">
          {canManage && onUpdateSoldier && (
            <button
              type="button"
              onClick={() => setIsFullEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[3px] bg-[#b91c1c] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#991b1b] transition-colors shadow-2xs btn-tactile cursor-pointer"
              title="Chỉnh sửa toàn diện hồ sơ quân nhân"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportWord}
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-xs btn-tactile cursor-pointer"
            title="Xuất file lý lịch trích ngang Microsoft Word (.doc)"
          >
            <FileDown className="h-3.5 w-3.5 text-blue-700" />
            <span>Xuất Word</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-xs btn-tactile cursor-pointer"
            title="In hoặc lưu PDF chuẩn mẫu quân đội"
          >
            <Printer className="h-3.5 w-3.5 text-zinc-700" />
            <span>In lý lịch (PDF)</span>
          </button>

          {isEditingPhone ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="h-8 w-36 rounded border border-zinc-300 px-2 text-xs font-mono focus:border-[#b91c1c] focus:outline-none"
                placeholder="0394..."
              />
              <button
                onClick={handleSavePhone}
                className="h-8 px-2.5 rounded bg-[#b91c1c] text-white text-xs font-medium hover:bg-red-800"
              >
                Lưu
              </button>
              <button
                onClick={() => setIsEditingPhone(false)}
                className="h-8 px-2 rounded border border-zinc-300 text-zinc-600 text-xs hover:bg-zinc-100"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingPhone(true)}
              className="inline-flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Cập nhật SĐT
            </button>
          )}
        </div>
      </div>

      {/* 3. Tabs Navigation with Line Variant */}
      <div className="mb-8">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'overview' | 'scores' | 'commendations' | 'notes')}
          className="w-full"
        >
          <TabsList variant="line" className="overflow-x-auto no-scrollbar max-w-full flex justify-start whitespace-nowrap">
            <TabsTrigger value="overview">Sơ lược về quân nhân</TabsTrigger>
            <TabsTrigger value="scores">Lịch sử điểm thi đua</TabsTrigger>
            <TabsTrigger value="commendations">
              Biểu dương / Nhắc nhở ({soldierCommendations.length})
            </TabsTrigger>
            <TabsTrigger value="notes">Ghi chú cá nhân</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm max-w-5xl">
          {/* Cột 1: Thông tin Quân sự & Đơn vị */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#b91c1c] pb-2 border-b border-red-100">
              I. Thông tin Quân sự & Đơn vị
            </h4>
            <div className="divide-y divide-zinc-100">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Họ và tên:</span>
                <span className="font-semibold text-zinc-900 uppercase">{soldier.name}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Cấp bậc:</span>
                <span className="font-medium text-zinc-800">{soldier.rank}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Chức vụ:</span>
                <span className="font-medium text-zinc-800">{soldier.roleTitle}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Đơn vị:</span>
                <span className="font-medium text-zinc-800">{soldier.squadName} — {soldier.platoonName}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Ngày nhập ngũ:</span>
                <span className="font-medium text-zinc-800">{soldier.joinDate}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Số thẻ quân nhân:</span>
                <span className="font-mono font-medium text-zinc-800">{soldier.militaryCode}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Quê quán:</span>
                <span className="font-medium text-zinc-800">{soldier.hometown}</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Thông tin Cá nhân & Chính trị */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#b91c1c] pb-2 border-b border-red-100">
              II. Thông tin Cá nhân & Chính trị
            </h4>
            <div className="divide-y divide-zinc-100">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Ngày tháng năm sinh:</span>
                <span className="font-medium text-zinc-800">{soldier.dob}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Giới tính:</span>
                <span className="font-medium text-zinc-800">{soldier.gender}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Tình trạng chính trị:</span>
                <span className="font-medium text-zinc-800">{soldier.partyStatus}</span>
              </div>
              {soldier.partyJoinDate && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-zinc-500 font-normal">Ngày vào Đảng:</span>
                  <span className="font-medium text-zinc-800">{soldier.partyJoinDate}</span>
                </div>
              )}
              {soldier.officialDate && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-zinc-500 font-normal">Ngày chính thức:</span>
                  <span className="font-medium text-zinc-800">{soldier.officialDate}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Số CCCD / Định danh:</span>
                <span className="font-mono font-medium text-zinc-800">{soldier.idCardNumber}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 font-normal">Số điện thoại:</span>
                <span className="font-mono font-medium text-zinc-800">{soldier.phone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scores' && (
        <div className="space-y-5 max-w-5xl">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-zinc-900">
                Lịch sử Chấm điểm & Nhật ký Thi đua Rèn luyện
              </h4>
            </div>

            {/* Time Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeFilter === 'all'
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Tất cả ({soldierScores.length})
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('week')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeFilter === 'week'
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                7 ngày qua
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('month')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeFilter === 'month'
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                30 ngày qua
              </button>
            </div>
          </div>

          {/* Quick Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
              <span className="block text-[11px] font-medium text-zinc-500">Điểm trung bình:</span>
              <span className="text-lg font-bold font-mono text-[#b91c1c]">{avgTotal} <span className="text-xs font-normal text-zinc-500">/ 400đ</span></span>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
              <span className="block text-[11px] font-medium text-zinc-500">Số ngày theo dõi:</span>
              <span className="text-lg font-bold font-mono text-zinc-800">{filteredScores.length} <span className="text-xs font-normal text-zinc-500">ngày</span></span>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
              <span className="block text-[11px] font-medium text-zinc-500">Vi phạm / Nhắc nhở:</span>
              <span className="text-lg font-bold font-mono text-amber-700">{totalViolations} <span className="text-xs font-normal text-zinc-500">lần</span></span>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
              <span className="block text-[11px] font-medium text-zinc-500">Văn bản / Quyết định:</span>
              <span className="text-lg font-bold font-mono text-blue-700">{totalDecisions} <span className="text-xs font-normal text-zinc-500">hồ sơ</span></span>
            </div>
          </div>

          {/* Scores Table or Empty State */}
          {filteredScores.length === 0 ? (
            <div className="border border-dashed border-zinc-200 py-10 bg-zinc-50/40 rounded-[3px] text-center space-y-2">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-semibold text-zinc-800">Chưa có dữ liệu điểm thi đua</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Quân nhân chưa có kết quả chấm điểm nào trong khoảng thời gian đã chọn.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimeFilter('all')}
                  className="text-xs h-7 px-3 text-zinc-700 border-zinc-300"
                >
                  Xem toàn bộ lịch sử
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-zinc-200 rounded-lg overflow-x-auto bg-white shadow-2xs">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow className="bg-zinc-50/80">
                    <TableHead className="text-xs font-semibold text-zinc-700">Ngày</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-zinc-700 w-20">Chính trị</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-zinc-700 w-20">Nhiệm vụ</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-zinc-700 w-20">Nội vụ</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-zinc-700 w-20">Tác phong</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-zinc-900 w-24">Tổng điểm</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-700">Vi phạm & Thành tích</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-700">Quyết định đính kèm</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-zinc-500">Người chấm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScores.map((sc) => (
                    <TableRow key={sc.id} className="table-row-hover">
                      <TableCell className="font-mono text-xs text-zinc-800 font-medium">
                        {sc.date}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">{sc.politicalScore}</TableCell>
                      <TableCell className="text-center font-mono text-xs">{sc.taskScore}</TableCell>
                      <TableCell className="text-center font-mono text-xs">{sc.hygieneScore}</TableCell>
                      <TableCell className="text-center font-mono text-xs">{sc.bearingScore}</TableCell>
                      <TableCell className="text-center font-mono text-xs font-bold text-[#b91c1c]">
                        {sc.totalScore}
                      </TableCell>

                      {/* Violations & Achievements column */}
                      <TableCell>
                        {sc.violations && sc.violations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {sc.violations.map((v) => (
                              <span
                                key={v.id}
                                className={`inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-0.5 text-xs font-medium leading-none ${
                                  v.points < 0
                                    ? 'border-red-200 bg-red-50 text-[#991b1b]'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                }`}
                              >
                                {v.points > 0 ? `+${v.points}` : v.points}đ: {v.content.replace(/ \([+-]\d+đ\)/, '')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Không có vi phạm</span>
                        )}
                      </TableCell>

                      {/* Attached Decision Document column */}
                      <TableCell>
                        {sc.decisionDocument ? (
                          <button
                            type="button"
                            onClick={() => setViewingDecisionScore(sc)}
                            className="inline-flex items-center gap-1 rounded-[3px] border border-amber-300 bg-amber-50/70 px-1.5 py-0.5 font-mono text-xs font-medium text-amber-900 hover:bg-amber-100 transition-colors btn-tactile cursor-pointer"
                            title="Nhấn để xem chi tiết văn bản quyết định"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>{sc.decisionDocument.documentNumber}</span>
                            <ArrowUpRightIcon className="w-3 h-3 text-amber-600 ml-0.5 shrink-0" />
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right text-xs text-zinc-500 whitespace-nowrap">
                        {sc.evaluatedBy}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ── MODAL XEM CHI TIẾT QUYẾT ĐỊNH ĐÍNH KÈM ── */}
          {viewingDecisionScore && viewingDecisionScore.decisionDocument && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
              <div className="w-full max-w-md rounded-[3px] border border-zinc-300 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between border-b border-zinc-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#b91c1c]" />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 uppercase">
                        {viewingDecisionScore.decisionDocument.documentType || 'Quyết định kỷ luật / thi đua'}
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Số văn bản: {viewingDecisionScore.decisionDocument.documentNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingDecisionScore(null)}
                    className="text-zinc-400 hover:text-zinc-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-3 py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Quân nhân:</span>
                    <span className="col-span-2 font-semibold text-zinc-900">{soldier.name} ({soldier.rank})</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Ngày áp dụng:</span>
                    <span className="col-span-2 font-mono text-zinc-800">{viewingDecisionScore.date}</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Cơ quan / Người ký:</span>
                    <span className="col-span-2 text-zinc-800">{viewingDecisionScore.decisionDocument.issuedBy || 'Chỉ huy đơn vị'}</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Ngày ban hành:</span>
                    <span className="col-span-2 font-mono text-zinc-800">{viewingDecisionScore.decisionDocument.issuedDate || viewingDecisionScore.date}</span>
                  </div>
                  {viewingDecisionScore.decisionDocument.notes && (
                    <div className="py-1 border-b border-zinc-100">
                      <span className="block text-zinc-500 mb-1">Trích yếu nội dung:</span>
                      <p className="text-zinc-800 bg-zinc-50 p-2 rounded border border-zinc-200 italic leading-relaxed">
                        &ldquo;{viewingDecisionScore.decisionDocument.notes}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Attached File View */}
                  {viewingDecisionScore.decisionDocument.fileName && (
                    <div className="pt-1">
                      <span className="block text-zinc-500 mb-1 font-semibold">Tệp đính kèm văn bản:</span>
                      <div className="flex items-center justify-between p-2.5 rounded bg-blue-50/50 border border-blue-200">
                        <div className="flex items-center gap-2 text-zinc-800">
                          <Paperclip className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium text-xs text-blue-900">{viewingDecisionScore.decisionDocument.fileName}</p>
                            <p className="text-[10px] text-zinc-400 font-mono">{viewingDecisionScore.decisionDocument.fileSize || 'Đã đính kèm'}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => notify.info('Tải tệp', `Đang tải ${viewingDecisionScore.decisionDocument?.fileName}...`)}
                          className="inline-flex items-center gap-1 rounded bg-blue-600 text-white px-2.5 py-1 text-[11px] font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>Tải về</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setViewingDecisionScore(null)}
                    className="rounded bg-zinc-100 hover:bg-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'commendations' && (
        <div className="space-y-4">
          {soldierCommendations.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              Chưa có ghi nhận biểu dương hoặc nhắc nhở nào.
            </div>
          ) : (
            <div className="divide-y divide-zinc-200">
              {soldierCommendations.map((item) => (
                <div key={item.id} className="py-3.5 space-y-1">
                  <div className="flex items-center gap-3">
                    {item.type === 'COMMENDATION' ? (
                      <span className="inline-block rounded-[3px] border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        ★ BIỂU DƯƠNG
                      </span>
                    ) : (
                      <span className="inline-block rounded-[3px] border border-red-300 bg-red-50 px-2 py-0.5 text-xs font-bold text-[#991b1b]">
                        ⚠ NHẮC NHỞ
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 font-mono">{item.date}</span>
                    <span className="text-xs text-zinc-500">Người ghi: {item.createdBy}</span>
                  </div>
                  <p className="text-sm text-zinc-800 leading-relaxed pl-1 pt-1">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="max-w-2xl space-y-3">
          <h4 className="text-sm font-semibold text-zinc-900">
            Nhận xét & Đánh giá của Chỉ huy
          </h4>
          <div className="rounded border border-zinc-200 p-4 bg-zinc-50/50 text-sm text-zinc-700 leading-relaxed">
            Quân nhân an tâm tư tưởng công tác, chấp hành nghiêm kỷ luật quân đội và quy định của đơn vị.
            Tích cực tham gia các phong trào thi đua của trung đội. Cần tiếp tục phát huy tinh thần tự giác trong bảo quản vũ khí trang bị.
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa hồ sơ quân nhân toàn diện (Bottom sheet on mobile) */}
      {isFullEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-t-xl sm:rounded-[3px] border border-zinc-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[92dvh] flex flex-col">
            {/* Mobile pull handle */}
            <div className="mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-zinc-300 sm:hidden" />

            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-zinc-50">
              <span className="text-sm font-bold text-zinc-900">
                Chỉnh sửa Hồ sơ Quân nhân — {soldier.name}
              </span>
              <button
                type="button"
                onClick={() => setIsFullEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!fullFormData.name.trim()) {
                  notify.error('Thiếu thông tin', 'Vui lòng nhập họ và tên quân nhân.');
                  return;
                }
                const updated: Soldier = {
                  ...soldier,
                  name: fullFormData.name.trim(),
                  rank: fullFormData.rank,
                  roleTitle: fullFormData.roleTitle,
                  militaryCode: fullFormData.militaryCode.trim(),
                  idCardNumber: fullFormData.idCardNumber.trim(),
                  dob: fullFormData.dob,
                  gender: fullFormData.gender,
                  hometown: fullFormData.hometown.trim(),
                  phone: fullFormData.phone.trim(),
                  joinDate: fullFormData.joinDate,
                  partyStatus: fullFormData.partyStatus,
                  partyJoinDate: fullFormData.partyJoinDate.trim() || undefined,
                  officialDate: fullFormData.officialDate.trim() || undefined,
                  squadName: fullFormData.squadName,
                  platoonName: fullFormData.platoonName,
                };
                onUpdateSoldier?.(updated);
                setIsFullEditModalOpen(false);
                notify.success('Cập nhật thành công', `Đã lưu hồ sơ quân nhân ${updated.name}`);
              }}
              className="p-5 overflow-y-auto space-y-4 text-xs"
            >
              {/* Nhóm 1: Thông tin cá nhân */}
              <div>
                <h5 className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] mb-2 pb-1 border-b border-zinc-100">
                  1. Thông tin cá nhân
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-zinc-700 font-medium mb-1">Họ và tên</label>
                    <input
                      type="text"
                      value={fullFormData.name}
                      onChange={(e) => setFullFormData({ ...fullFormData, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Giới tính</label>
                    <select
                      value={fullFormData.gender}
                      onChange={(e) => setFullFormData({ ...fullFormData, gender: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 bg-white"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Ngày sinh</label>
                    <input
                      type="text"
                      value={fullFormData.dob}
                      onChange={(e) => setFullFormData({ ...fullFormData, dob: e.target.value })}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Số CCCD / CMND</label>
                    <input
                      type="text"
                      value={fullFormData.idCardNumber}
                      onChange={(e) => setFullFormData({ ...fullFormData, idCardNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={fullFormData.phone}
                      onChange={(e) => setFullFormData({ ...fullFormData, phone: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-zinc-700 font-medium mb-1">Quê quán</label>
                    <input
                      type="text"
                      value={fullFormData.hometown}
                      onChange={(e) => setFullFormData({ ...fullFormData, hometown: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm 2: Thông tin Quân sự */}
              <div>
                <h5 className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] mb-2 pb-1 border-b border-zinc-100">
                  2. Thông tin Quân sự & Đơn vị
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Cấp bậc</label>
                    <select
                      value={fullFormData.rank}
                      onChange={(e) => setFullFormData({ ...fullFormData, rank: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 bg-white"
                    >
                      {RANKS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Chức vụ</label>
                    <select
                      value={fullFormData.roleTitle}
                      onChange={(e) => setFullFormData({ ...fullFormData, roleTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 bg-white"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Số thẻ quân nhân</label>
                    <input
                      type="text"
                      value={fullFormData.militaryCode}
                      onChange={(e) => setFullFormData({ ...fullFormData, militaryCode: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 font-mono font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Phân đội (Tiểu đội)</label>
                    <input
                      type="text"
                      value={fullFormData.squadName}
                      onChange={(e) => setFullFormData({ ...fullFormData, squadName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Trung đội</label>
                    <input
                      type="text"
                      value={fullFormData.platoonName}
                      onChange={(e) => setFullFormData({ ...fullFormData, platoonName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Ngày nhập ngũ</label>
                    <input
                      type="text"
                      value={fullFormData.joinDate}
                      onChange={(e) => setFullFormData({ ...fullFormData, joinDate: e.target.value })}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm 3: Thông tin Chính trị */}
              <div>
                <h5 className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] mb-2 pb-1 border-b border-zinc-100">
                  3. Đoàn / Đảng & Chính trị
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Tình trạng Đoàn/Đảng</label>
                    <select
                      value={fullFormData.partyStatus}
                      onChange={(e) => setFullFormData({ ...fullFormData, partyStatus: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 bg-white"
                    >
                      {PARTY_STATUSES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Ngày vào Đảng</label>
                    <input
                      type="text"
                      value={fullFormData.partyJoinDate}
                      onChange={(e) => setFullFormData({ ...fullFormData, partyJoinDate: e.target.value })}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Ngày chính thức</label>
                    <input
                      type="text"
                      value={fullFormData.officialDate}
                      onChange={(e) => setFullFormData({ ...fullFormData, officialDate: e.target.value })}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsFullEditModalOpen(false)}
                  className="px-3.5 py-1.5 border border-zinc-300 text-zinc-700 rounded-[3px] hover:bg-zinc-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#b91c1c] text-white rounded-[3px] hover:bg-[#991b1b] font-semibold"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
