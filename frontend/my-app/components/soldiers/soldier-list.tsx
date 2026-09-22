'use client';

import React, { useState } from 'react';
import { Soldier, Platoon } from '@/lib/types';
import { Search, ChevronRight, UserPlus, Pencil, X, Trash2, ArrowRightLeft } from 'lucide-react';
import { notify } from '@/lib/notify';

interface SoldierListProps {
  soldiers: Soldier[];
  platoons: Platoon[];
  onViewSoldierProfile: (soldier: Soldier) => void;
  canManage?: boolean;
  onAddSoldier?: (soldier: Omit<Soldier, 'id'>) => void;
  onUpdateSoldier?: (soldier: Soldier) => void;
  onDeleteSoldier?: (soldierId: string) => void;
}

const RANKS = ['Binh nhì', 'Binh nhất', 'Hạ sĩ', 'Trung sĩ', 'Thượng sĩ', 'Thiếu úy'];
const ROLES = ['Chiến sĩ', 'Tiểu đội phó', 'Tiểu đội trưởng', 'Phó Trung đội trưởng'];
const SQUADS = ['Tiểu đội 1', 'Tiểu đội 2', 'Tiểu đội 3'];
const PARTY_STATUSES = ['Đoàn viên', 'Đảng viên dự bị', 'Đảng viên chính thức'];

export function SoldierList({
  soldiers,
  platoons,
  onViewSoldierProfile,
  canManage = true,
  onAddSoldier,
  onUpdateSoldier,
  onDeleteSoldier,
}: SoldierListProps) {
  const [selectedPlatoon, setSelectedPlatoon] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states for Create / Edit / Transfer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSoldier, setEditingSoldier] = useState<Soldier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    militaryCode: '',
    idCardNumber: '',
    rank: 'Binh nhất',
    roleTitle: 'Chiến sĩ',
    platoonId: platoons[0]?.id || 'td1',
    squadName: 'Tiểu đội 1',
    dob: '2005-01-01',
    gender: 'Nam',
    joinDate: '2023-02-15',
    hometown: '',
    phone: '',
    partyStatus: 'Đoàn viên',
    partyJoinDate: '',
    officialDate: '',
  });

  const filtered = soldiers.filter((s) => {
    const matchPlatoon = selectedPlatoon === 'ALL' || s.platoonId === selectedPlatoon;
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.militaryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hometown.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPlatoon && matchSearch;
  });

  const handleOpenAddModal = () => {
    setEditingSoldier(null);
    setFormData({
      name: '',
      militaryCode: `QN-04${Date.now().toString().slice(-6)}`,
      idCardNumber: `04020${Date.now().toString().slice(-7)}`,
      rank: 'Binh nhất',
      roleTitle: 'Chiến sĩ',
      platoonId: platoons[0]?.id || 'td1',
      squadName: 'Tiểu đội 1',
      dob: '2005-05-15',
      gender: 'Nam',
      joinDate: '2024-02-20',
      hometown: '',
      phone: '0987654***',
      partyStatus: 'Đoàn viên',
      partyJoinDate: '',
      officialDate: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (soldier: Soldier) => {
    setEditingSoldier(soldier);
    setFormData({
      name: soldier.name,
      militaryCode: soldier.militaryCode,
      idCardNumber: soldier.idCardNumber,
      rank: soldier.rank,
      roleTitle: soldier.roleTitle,
      platoonId: soldier.platoonId,
      squadName: soldier.squadName,
      dob: soldier.dob,
      gender: soldier.gender,
      joinDate: soldier.joinDate,
      hometown: soldier.hometown,
      phone: soldier.phone,
      partyStatus: soldier.partyStatus,
      partyJoinDate: soldier.partyJoinDate || '',
      officialDate: soldier.officialDate || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const matchedPlatoon = platoons.find((p) => p.id === formData.platoonId);
    const platoonName = matchedPlatoon ? matchedPlatoon.name : 'Trung đội 1';

    if (editingSoldier) {
      if (onUpdateSoldier) {
        onUpdateSoldier({
          ...editingSoldier,
          ...formData,
          platoonName,
        });
        notify.success('Cập nhật thành công', `Đã cập nhật thông tin và điều chuyển quân nhân ${formData.name}`);
      }
    } else {
      if (onAddSoldier) {
        onAddSoldier({
          ...formData,
          platoonName,
        });
        notify.success('Tiếp nhận thành công', `Đã thêm mới quân nhân ${formData.name} vào ${platoonName}`);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (soldier: Soldier) => {
    if (confirm(`Đồng chí có chắc chắn muốn xóa quân nhân ${soldier.name} khỏi danh sách?`)) {
      onDeleteSoldier?.(soldier.id);
      notify.info('Đã xóa quân nhân', soldier.name);
    }
  };

  return (
    <div className="w-full max-w-5xl py-2 space-y-6">
      {/* 1. Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Danh sách Quân nhân
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Tổng số: {soldiers.length} đồng chí biên chế tại các trung đội
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {canManage && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded bg-[#b91c1c] px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800 transition-colors shadow-2xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Tiếp nhận quân nhân</span>
            </button>
          )}

          {/* Platoon filter */}
          <select
            value={selectedPlatoon}
            onChange={(e) => setSelectedPlatoon(e.target.value)}
            className="rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 focus:border-[#b91c1c] focus:outline-none font-medium"
          >
            <option value="ALL">Tất cả các Trung đội</option>
            {platoons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, số thẻ, quê..."
              className="w-44 rounded border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-xs text-zinc-800 focus:border-[#b91c1c] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Flat Clean Administrative Table */}
      <div className="overflow-x-auto border border-zinc-200 rounded-lg bg-white shadow-2xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-700 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">STT</th>
              <th className="py-2.5 px-3">Họ và tên</th>
              <th className="py-2.5 px-3">Cấp bậc / Chức vụ</th>
              <th className="py-2.5 px-3">Đơn vị biên chế</th>
              <th className="py-2.5 px-3">Số thẻ QN</th>
              <th className="py-2.5 px-3">Quê quán</th>
              <th className="py-2.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-zinc-500">
                  Không tìm thấy quân nhân phù hợp.
                </td>
              </tr>
            ) : (
              filtered.map((soldier, idx) => (
                <tr key={soldier.id} className="hover:bg-zinc-50/50">
                  <td className="py-3 px-3 text-center text-xs text-zinc-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-zinc-900 text-xs uppercase">
                      {soldier.name}
                    </span>
                    <span className="block text-[11px] text-zinc-500 font-normal">
                      Sinh: {soldier.dob}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-zinc-700">
                    <span className="font-medium">{soldier.rank}</span>
                    <span className="text-zinc-500 block text-[11px]">{soldier.roleTitle}</span>
                  </td>
                  <td className="py-3 px-3 text-xs text-zinc-700 font-medium">
                    {soldier.squadName} — {soldier.platoonName}
                  </td>
                  <td className="py-3 px-3 text-xs font-mono text-zinc-600">
                    {soldier.militaryCode}
                  </td>
                  <td className="py-3 px-3 text-xs text-zinc-600">
                    {soldier.hometown}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(soldier)}
                          title="Điều chuyển hoặc chỉnh sửa thông tin"
                          className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700 transition-colors"
                        >
                          <Pencil className="h-3 w-3 text-zinc-500" />
                          <span>Sửa</span>
                        </button>
                      )}

                      <button
                        onClick={() => onViewSoldierProfile(soldier)}
                        className="inline-flex items-center gap-1 text-xs text-[#b91c1c] hover:underline font-medium"
                      >
                        <span>Hồ sơ</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>

                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleDelete(soldier)}
                          title="Xóa quân nhân"
                          className="text-zinc-300 hover:text-red-600 p-1 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── MODAL: TIẾP NHẬN / ĐIỀU CHUYỂN QUÂN NHÂN ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 uppercase">
                  {editingSoldier ? 'Điều chuyển & Chỉnh sửa Quân nhân' : 'Tiếp nhận Quân nhân Mới'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {editingSoldier ? `Mã QN: ${editingSoldier.militaryCode}` : 'Cập nhật biên chế vào các trung đội'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-zinc-700 font-medium mb-1">Họ và tên quân nhân *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: NGUYỄN VĂN AN"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded border border-zinc-300 px-3 py-1.5 uppercase font-medium focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Cấp bậc</label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full rounded border border-zinc-300 px-2.5 py-1.5 focus:border-[#b91c1c] focus:outline-none"
                  >
                    {RANKS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Chức vụ</label>
                  <select
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    className="w-full rounded border border-zinc-300 px-2.5 py-1.5 focus:border-[#b91c1c] focus:outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* BIÊN CHẾ / ĐIỀU CHUYỂN */}
                <div className="col-span-2 p-3 rounded-lg border border-amber-200 bg-amber-50/40 space-y-2">
                  <span className="block font-semibold text-amber-900 flex items-center gap-1.5">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-amber-700" />
                    Biên chế đơn vị / Điều chuyển:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-700 mb-1">Trung đội:</label>
                      <select
                        value={formData.platoonId}
                        onChange={(e) => setFormData({ ...formData, platoonId: e.target.value })}
                        className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 focus:border-[#b91c1c] focus:outline-none font-semibold text-zinc-800"
                      >
                        {platoons.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-700 mb-1">Tiểu đội:</label>
                      <select
                        value={formData.squadName}
                        onChange={(e) => setFormData({ ...formData, squadName: e.target.value })}
                        className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 focus:border-[#b91c1c] focus:outline-none font-semibold text-zinc-800"
                      >
                        {SQUADS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Số thẻ quân nhân</label>
                  <input
                    type="text"
                    value={formData.militaryCode}
                    onChange={(e) => setFormData({ ...formData, militaryCode: e.target.value })}
                    className="w-full rounded border border-zinc-300 px-3 py-1.5 font-mono focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Quê quán</label>
                  <input
                    type="text"
                    placeholder="VD: Ý Yên, Nam Định"
                    value={formData.hometown}
                    onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                    className="w-full rounded border border-zinc-300 px-3 py-1.5 focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full rounded border border-zinc-300 px-3 py-1.5 focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Ngày nhập ngũ</label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full rounded border border-zinc-300 px-3 py-1.5 focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded border border-zinc-300 px-3 py-1.5 font-mono focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Tình trạng chính trị</label>
                  <select
                    value={formData.partyStatus}
                    onChange={(e) => setFormData({ ...formData, partyStatus: e.target.value })}
                    className="w-full rounded border border-zinc-300 px-2.5 py-1.5 focus:border-[#b91c1c] focus:outline-none"
                  >
                    {PARTY_STATUSES.map((st) => (
                      <option key={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded border border-zinc-300 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#b91c1c] px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-800 transition-colors"
                >
                  {editingSoldier ? 'Lưu thay đổi' : 'Tiếp nhận quân nhân'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
