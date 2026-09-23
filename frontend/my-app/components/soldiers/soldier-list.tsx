'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Soldier, Platoon, UnitTier } from '@/lib/types';
import CascadingUnitSelector from '@/components/layout/cascading-unit-selector';
import { Search, ChevronRight, UserPlus, Pencil, X, Trash2, ArrowRightLeft, ArrowUpRightIcon, Eye, MoreHorizontal, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notify } from '@/lib/notify';
import { ALL_UNITS } from '@/lib/mock-data';

interface SoldierListProps {
  soldiers: Soldier[];
  platoons: Platoon[];
  onViewSoldierProfile: (soldier: Soldier) => void;
  canManage?: boolean;
  onAddSoldier?: (soldier: Omit<Soldier, 'id'>) => void;
  onUpdateSoldier?: (soldier: Soldier) => void;
  onDeleteSoldier?: (soldierId: string) => void;
  selectedUnitId?: string;
  selectedTier?: UnitTier;
  onSelectUnit?: (unitId: string, tier: UnitTier) => void;
  allowedRootId?: string;
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
  selectedUnitId: propSelectedUnitId,
  selectedTier: propSelectedTier,
  onSelectUnit: propOnSelectUnit,
  allowedRootId,
}: SoldierListProps) {
  const [localUnitId, setLocalUnitId] = useState<string>('e335');
  const activeUnitId = propSelectedUnitId ?? localUnitId;

  const handleUnitSelect = (unitId: string, tier: UnitTier) => {
    if (propOnSelectUnit) {
      propOnSelectUnit(unitId, tier);
    } else {
      setLocalUnitId(unitId);
    }
  };

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
    platoonId: 'C1-B1',
    squadId: 'C1-B1-A1',
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
    const matchUnit =
      activeUnitId === 'e335' ||
      s.battalionId === activeUnitId ||
      s.companyId === activeUnitId ||
      s.platoonId === activeUnitId ||
      s.squadId === activeUnitId;

    const matchPlatoon = selectedPlatoon === 'ALL' || s.platoonId === selectedPlatoon;
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.militaryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hometown.toLowerCase().includes(searchQuery.toLowerCase());
    return matchUnit && matchPlatoon && matchSearch;
  });

  const handleOpenAddModal = () => {
    setEditingSoldier(null);
    setFormData({
      name: '',
      militaryCode: `QN-04${Date.now().toString().slice(-6)}`,
      idCardNumber: `04020${Date.now().toString().slice(-7)}`,
      rank: 'Binh nhất',
      roleTitle: 'Chiến sĩ',
      platoonId: 'C1-B1',
      squadId: 'C1-B1-A1',
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
      squadId: soldier.squadId || `${soldier.platoonId}-A1`,
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

    // Automatically resolve parent hierarchy units from ALL_UNITS
    const selectedPlatoonUnit =
      ALL_UNITS.find((u) => u.id === formData.platoonId) ||
      ALL_UNITS.find((u) => u.tier === 'PLATOON');
    const platoonId = selectedPlatoonUnit?.id || 'C1-B1';
    const platoonName = selectedPlatoonUnit?.name || 'Trung đội 1';

    const companyUnit = selectedPlatoonUnit?.parentId
      ? ALL_UNITS.find((u) => u.id === selectedPlatoonUnit.parentId)
      : undefined;
    const companyId = companyUnit?.id || 'C1';
    const companyName = companyUnit?.name || 'Đại đội 1';

    const battalionUnit = companyUnit?.parentId
      ? ALL_UNITS.find((u) => u.id === companyUnit.parentId)
      : undefined;
    const battalionId = battalionUnit?.id || 'dBB4';
    const battalionName = battalionUnit?.name || 'Tiểu đoàn Bộ Binh 4';

    const squadUnit = ALL_UNITS.find(
      (u) =>
        u.parentId === platoonId &&
        (u.id === formData.squadId || u.name === formData.squadName)
    );
    const squadId = squadUnit?.id || `${platoonId}-A1`;
    const squadName = squadUnit?.name || formData.squadName || 'Tiểu đội 1';

    const payload = {
      ...formData,
      battalionId,
      battalionName,
      companyId,
      companyName,
      platoonId,
      platoonName,
      squadId,
      squadName,
    };

    if (editingSoldier) {
      if (onUpdateSoldier) {
        onUpdateSoldier({
          ...editingSoldier,
          ...payload,
        });
        notify.success('Cập nhật thành công', `Đã cập nhật thông tin và điều chuyển quân nhân ${formData.name}`);
      }
    } else {
      if (onAddSoldier) {
        onAddSoldier(payload);
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
      {/* ── Cascading Unit Selector ─────────────────────────────────────── */}
      <CascadingUnitSelector
        selectedUnitId={activeUnitId}
        onSelectUnit={handleUnitSelect}
        allowedRootId={allowedRootId}
      />

      {/* 1. Filters & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-200 pb-3">
        {/* Search box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, số thẻ, quê..."
            className="w-full rounded border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-xs text-zinc-800 focus:border-[#b91c1c] focus:outline-none"
          />
        </div>

        {/* Filter and Action */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {/* Platoon filter */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 bg-white text-xs font-medium text-zinc-800 border-zinc-300 hover:bg-zinc-50"
                >
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {selectedPlatoon === 'ALL'
                      ? 'Đơn vị: Tất cả'
                      : platoons.find((p) => p.id === selectedPlatoon)?.name || 'Chọn đơn vị'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-zinc-500 opacity-70" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48 bg-white border border-zinc-200 shadow-md rounded-[3px] p-1 text-xs">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] font-bold text-zinc-500">Lọc theo đơn vị</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setSelectedPlatoon('ALL')}
                  className={selectedPlatoon === 'ALL' ? 'font-bold text-[#b91c1c] bg-red-50/50 cursor-pointer' : 'cursor-pointer'}
                >
                  -- Tất cả đơn vị --
                </DropdownMenuItem>
                {platoons.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => setSelectedPlatoon(p.id)}
                    className={selectedPlatoon === p.id ? 'font-bold text-[#b91c1c] bg-red-50/50 cursor-pointer' : 'cursor-pointer'}
                  >
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {canManage && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded bg-[#b91c1c] px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800 transition-colors shadow-2xs shrink-0 whitespace-nowrap"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Tiếp nhận quân nhân</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile scroll indicator hint */}
      <div className="flex md:hidden items-center justify-between text-[11px] text-zinc-500 px-1 pb-1">
        <span>Quân số đơn vị ({filtered.length})</span>
        <span className="flex items-center gap-1 text-zinc-400 font-medium">
          ← Vuốt ngang xem chi tiết →
        </span>
      </div>

      {/* 2. Flat Clean Administrative Table */}
      <div className="overflow-x-auto border border-zinc-200 bg-white shadow-xs rounded-[3px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-100 text-xs text-zinc-800 font-semibold">
              <th className="py-2.5 px-3 w-10 text-center">STT</th>
              <th className="py-2.5 px-3 w-28">Số thẻ QN</th>
              <th className="py-2.5 px-3 min-w-[160px]">Họ và tên</th>
              <th className="py-2.5 px-3">Cấp bậc / Chức vụ</th>
              <th className="py-2.5 px-3">Đơn vị biên chế</th>
              <th className="py-2.5 px-3">Quê quán</th>
              <th className="py-2.5 px-3 text-center w-24">Đảng / Đoàn</th>
              <th className="py-2.5 px-3 text-center w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-zinc-500 text-xs">
                  <p className="font-semibold text-zinc-800 text-sm mb-1">
                    Chưa có danh sách quân nhân cho đơn vị này
                  </p>
                  <p className="text-zinc-500 max-w-md mx-auto mb-3">
                    Đồng chí có thể tiếp nhận mới hoặc chuyển nhanh sang các phân đội:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUnitSelect('C1', 'COMPANY')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded-[3px] transition-colors shadow-2xs"
                    >
                      <span>Xem Đại đội 1 (dBB4)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitSelect('C18', 'COMPANY')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-[3px] transition-colors"
                    >
                      <span>Xem Đại đội 18 (cTT)</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((soldier, idx) => (
                <tr key={soldier.id} className="table-row-hover">
                  <td className="py-2.5 px-3 text-center text-zinc-500 font-mono text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-800 text-xs font-medium">
                    {soldier.militaryCode}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-zinc-900">
                    <div className="text-xs font-bold">{soldier.name}</div>
                    <div className="text-xs text-zinc-600 font-medium">
                      Sinh: {soldier.dob}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-800 text-xs">
                    <span className="font-semibold text-zinc-900">{soldier.rank}</span>
                    <span className="text-zinc-600 block text-xs font-medium">{soldier.roleTitle}</span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-800 text-xs">
                    <span className="font-semibold text-zinc-900">{soldier.platoonName} • {soldier.squadName}</span>
                    <span className="block text-xs text-zinc-600 font-medium">
                      {soldier.companyName ? `${soldier.companyName} • ` : ''}
                      {soldier.battalionName || 'Trung đoàn 335'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-700 text-xs font-medium">
                    {soldier.hometown}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {soldier.partyStatus === 'Đảng viên chính thức' ? (
                      <span className="inline-block rounded border border-red-200 bg-red-50 text-xs font-bold text-[#991b1b] px-2.5 py-0.5 shadow-2xs">
                        Đảng viên
                      </span>
                    ) : (
                      <span className="inline-block rounded border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-700 px-2.5 py-0.5">
                        Đoàn viên
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            className="h-7 w-7 text-zinc-600 hover:text-zinc-950 border border-zinc-300 bg-white hover:bg-zinc-100 rounded-[3px] mx-auto p-0 flex items-center justify-center btn-tactile cursor-pointer"
                            title="Tác vụ quân nhân"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44 bg-white border border-zinc-200 shadow-md rounded-[3px] p-1 text-xs">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[11px] font-bold text-zinc-500">
                            {soldier.name}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onViewSoldierProfile(soldier)}
                            className="cursor-pointer gap-2 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
                          >
                            <Eye className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Xem hồ sơ</span>
                          </DropdownMenuItem>
                          {canManage && (
                            <DropdownMenuItem
                              onClick={() => handleOpenEditModal(soldier)}
                              className="cursor-pointer gap-2 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
                            >
                              <Pencil className="h-3.5 w-3.5 text-zinc-500" />
                              <span>Sửa thông tin</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                        {canManage && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(soldier)}
                              className="cursor-pointer gap-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                              <span>Xóa quân nhân</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500 pt-1">
        <div>
          Hiển thị 1 - {filtered.length} / {soldiers.length} bản ghi
        </div>
        <div className="flex items-center gap-1 self-center sm:self-auto">
          <button className="px-2 py-1 rounded border border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50 disabled:opacity-50">
            &laquo;
          </button>
          <button className="px-2 py-1 rounded border border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50 disabled:opacity-50">
            &lsaquo;
          </button>
          <button className="px-2.5 py-1 rounded bg-[#b91c1c] text-white font-medium text-xs">
            1
          </button>
          <button className="px-2 py-1 rounded border border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50 disabled:opacity-50">
            &rsaquo;
          </button>
          <button className="px-2 py-1 rounded border border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50 disabled:opacity-50">
            &raquo;
          </button>
        </div>
      </div>

      {/* ── MODAL: TIẾP NHẬN / ĐIỀU CHUYỂN QUÂN NHÂN ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-in fade-in backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-t-xl sm:rounded-[3px] border border-zinc-300 bg-white p-4 sm:p-6 shadow-lg max-h-[92dvh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Mobile pull handle */}
            <div className="mx-auto -mt-1 mb-2 h-1.5 w-12 rounded-full bg-zinc-300 sm:hidden" />
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 uppercase">
                  {editingSoldier ? 'Điều chuyển & Chỉnh sửa Quân nhân' : 'Tiếp nhận Quân nhân Mới'}
                </h3>
                {editingSoldier && (
                  <p className="text-xs font-mono text-zinc-500 mt-0.5">
                    Mã QN: {editingSoldier.militaryCode}
                  </p>
                )}
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
                        onChange={(e) => {
                          const newPlatoonId = e.target.value;
                          const childSquads = ALL_UNITS.filter(
                            (u) => u.parentId === newPlatoonId && u.tier === 'SQUAD'
                          );
                          const firstSquad = childSquads[0];
                          setFormData({
                            ...formData,
                            platoonId: newPlatoonId,
                            squadId: firstSquad ? firstSquad.id : `${newPlatoonId}-A1`,
                            squadName: firstSquad ? firstSquad.name : 'Tiểu đội 1',
                          });
                        }}
                        className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 focus:border-[#b91c1c] focus:outline-none font-semibold text-zinc-800"
                      >
                        {ALL_UNITS.filter((u) => u.tier === 'PLATOON').map((p) => {
                          const parentComp = ALL_UNITS.find((u) => u.id === p.parentId);
                          return (
                            <option key={p.id} value={p.id}>
                              {p.name} ({parentComp ? parentComp.name : p.code})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-700 mb-1">Tiểu đội:</label>
                      <select
                        value={formData.squadId}
                        onChange={(e) => {
                          const sqId = e.target.value;
                          const sq = ALL_UNITS.find((u) => u.id === sqId);
                          setFormData({
                            ...formData,
                            squadId: sqId,
                            squadName: sq ? sq.name : formData.squadName,
                          });
                        }}
                        className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 focus:border-[#b91c1c] focus:outline-none font-semibold text-zinc-800"
                      >
                        {ALL_UNITS.filter(
                          (u) => u.parentId === formData.platoonId && u.tier === 'SQUAD'
                        ).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
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
