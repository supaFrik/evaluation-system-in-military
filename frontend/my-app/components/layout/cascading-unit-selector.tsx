'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { MilitaryUnit, UnitTier } from '@/lib/types';
import {
  ALL_UNITS,
  getChildUnits,
  getAncestorChain,
  BATTALION_UNITS,
  REGIMENT_UNIT,
} from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  Shield,
  Layers,
  ChevronDown,
  Pencil,
  X,
} from 'lucide-react';
import { notify } from '@/lib/notify';

interface CascadingUnitSelectorProps {
  selectedUnitId: string;
  onSelectUnit: (unitId: string, tier: UnitTier) => void;
  allowedRootId?: string; // restrict to this subtree
  maxTier?: 'COMPANY' | 'PLATOON' | 'SQUAD'; // maximum hierarchical depth to display
  units?: MilitaryUnit[];
  canManage?: boolean;
  onUpdateUnit?: (unit: MilitaryUnit) => void;
}

export function CascadingUnitSelector({
  selectedUnitId,
  onSelectUnit,
  allowedRootId,
  maxTier = 'SQUAD',
  units,
  canManage = false,
  onUpdateUnit,
}: CascadingUnitSelectorProps) {
  const allUnits = units && units.length > 0 ? units : ALL_UNITS;

  const chain = useMemo(() => {
    const list: MilitaryUnit[] = [];
    let curr = allUnits.find((u) => u.id === selectedUnitId);
    while (curr) {
      list.unshift(curr);
      if (!curr.parentId) break;
      curr = allUnits.find((u) => u.id === curr?.parentId);
    }
    return list.length > 0 ? list : [REGIMENT_UNIT];
  }, [selectedUnitId, allUnits]);

  const selectedUnit = useMemo(
    () => allUnits.find((u) => u.id === selectedUnitId) || REGIMENT_UNIT,
    [selectedUnitId, allUnits]
  );

  const regiment = chain.find((u) => u.tier === 'REGIMENT');
  const battalion = chain.find((u) => u.tier === 'BATTALION');
  const company = chain.find((u) => u.tier === 'COMPANY');
  const platoon = chain.find((u) => u.tier === 'PLATOON');
  const squad = chain.find((u) => u.tier === 'SQUAD');

  // Edit unit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: selectedUnit.name,
    code: selectedUnit.code,
    leaderTitle: selectedUnit.leaderTitle,
    leaderName: selectedUnit.leaderName,
    totalSoldiers: selectedUnit.totalSoldiers,
  });

  useEffect(() => {
    setEditFormData({
      name: selectedUnit.name,
      code: selectedUnit.code,
      leaderTitle: selectedUnit.leaderTitle,
      leaderName: selectedUnit.leaderName,
      totalSoldiers: selectedUnit.totalSoldiers,
    });
  }, [selectedUnit]);

  // Helpers to handle allowedRootId scope
  const isDescendantOrSelf = (unitId: string, ancestorId: string) => {
    if (unitId === ancestorId) return true;
    return getAncestorChain(unitId).some((u) => u.id === ancestorId);
  };

  const isOptionVisible = (unitId: string) => {
    if (!allowedRootId) return true;
    return (
      isDescendantOrSelf(unitId, allowedRootId) ||
      isDescendantOrSelf(allowedRootId, unitId)
    );
  };

  const isOptionEnabled = (unitId: string) => {
    if (!allowedRootId) return true;
    return isDescendantOrSelf(unitId, allowedRootId);
  };

  const getChildList = (parentId: string) => allUnits.filter((u) => u.parentId === parentId);

  // Options for Level 1 (Khối / Tiểu đoàn)
  const level1Options = useMemo(() => {
    const reg = allUnits.find((u) => u.tier === 'REGIMENT') || REGIMENT_UNIT;
    const bats = allUnits.filter((u) => u.tier === 'BATTALION');
    return [
      { id: reg.id, name: 'Toàn Trung đoàn', tier: 'REGIMENT' as UnitTier },
      ...bats,
    ].filter((o) => isOptionVisible(o.id));
  }, [allowedRootId, allUnits]);

  // Options for Level 2 (Đại đội)
  const level2Options = useMemo(() => {
    if (!battalion) return [];
    return [
      { id: battalion.id, name: 'Tất cả Đại đội', tier: 'BATTALION' as UnitTier },
      ...getChildList(battalion.id),
    ].filter((o) => isOptionVisible(o.id));
  }, [battalion, allowedRootId, allUnits]);

  // Options for Level 3 (Trung đội)
  const level3Options = useMemo(() => {
    if (!company) return [];
    return [
      { id: company.id, name: 'Tất cả Trung đội', tier: 'COMPANY' as UnitTier },
      ...getChildList(company.id),
    ].filter((o) => isOptionVisible(o.id));
  }, [company, allowedRootId, allUnits]);

  // Options for Level 4 (Tiểu đội)
  const level4Options = useMemo(() => {
    if (!platoon) return [];
    return [
      { id: platoon.id, name: 'Tất cả Tiểu đội', tier: 'PLATOON' as UnitTier },
      ...getChildList(platoon.id),
    ].filter((o) => isOptionVisible(o.id));
  }, [platoon, allowedRootId, allUnits]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-zinc-200 rounded-[3px] bg-white p-2 sm:px-3 sm:py-2 mb-4 shadow-xs max-w-full min-w-0">
      {/* Left: Compact cascading dropdown breadcrumbs on single scrollable line */}
      <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap min-w-0 w-full sm:w-auto flex-1">
        <div className="flex items-center gap-1 text-zinc-500 font-semibold uppercase tracking-wider text-xs mr-1 shrink-0">
          <Layers className="w-3.5 h-3.5 text-[#b91c1c]" />
          <span className="hidden sm:inline">Đơn vị:</span>
        </div>

        {/* Cấp 1: Tiểu đoàn / Khối */}
        <div className="relative inline-flex items-center shrink-0">
          <select
            value={battalion ? battalion.id : REGIMENT_UNIT.id}
            onChange={(e) => {
              const opt = level1Options.find((o) => o.id === e.target.value);
              if (opt) onSelectUnit(opt.id, opt.tier);
            }}
            className="appearance-none bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded-[3px] pl-2.5 pr-6 py-1.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#b91c1c] cursor-pointer"
          >
            {level1Options.map((o) => (
              <option key={o.id} value={o.id} disabled={!isOptionEnabled(o.id)}>
                {o.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-1.5 pointer-events-none" />
        </div>

        {/* Cấp 2: Đại đội (nếu đã chọn Tiểu đoàn) */}
        {battalion && level2Options.length > 0 && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <div className="relative inline-flex items-center shrink-0">
              <select
                value={company ? company.id : battalion.id}
                onChange={(e) => {
                  const opt = level2Options.find((o) => o.id === e.target.value);
                  if (opt) onSelectUnit(opt.id, opt.tier);
                }}
                className="appearance-none bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded-[3px] pl-2.5 pr-6 py-1.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#b91c1c] cursor-pointer"
              >
                {level2Options.map((o) => (
                  <option key={o.id} value={o.id} disabled={!isOptionEnabled(o.id)}>
                    {o.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-1.5 pointer-events-none" />
            </div>
          </>
        )}

        {/* Cấp 3: Trung đội (nếu đã chọn Đại đội và được phép sâu hơn Đại đội) */}
        {maxTier !== 'COMPANY' && company && level3Options.length > 0 && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <div className="relative inline-flex items-center shrink-0">
              <select
                value={platoon ? platoon.id : company.id}
                onChange={(e) => {
                  const opt = level3Options.find((o) => o.id === e.target.value);
                  if (opt) onSelectUnit(opt.id, opt.tier);
                }}
                className="appearance-none bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded-[3px] pl-2.5 pr-6 py-1.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#b91c1c] cursor-pointer"
              >
                {level3Options.map((o) => (
                  <option key={o.id} value={o.id} disabled={!isOptionEnabled(o.id)}>
                    {o.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-1.5 pointer-events-none" />
            </div>
          </>
        )}

        {/* Cấp 4: Tiểu đội (nếu đã chọn Trung đội và cho phép sâu đến Tiểu đội) */}
        {maxTier === 'SQUAD' && platoon && level4Options.length > 0 && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <div className="relative inline-flex items-center shrink-0">
              <select
                value={squad ? squad.id : platoon.id}
                onChange={(e) => {
                  const opt = level4Options.find((o) => o.id === e.target.value);
                  if (opt) onSelectUnit(opt.id, opt.tier);
                }}
                className="appearance-none bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded-[3px] pl-2.5 pr-6 py-1.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#b91c1c] cursor-pointer"
              >
                {level4Options.map((o) => (
                  <option key={o.id} value={o.id} disabled={!isOptionEnabled(o.id)}>
                    {o.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-1.5 pointer-events-none" />
            </div>
          </>
        )}
      </div>

      {/* Right: Commander Badge & Edit Button */}
      <div className="flex items-center gap-1.5 min-w-0 max-w-full justify-between sm:justify-start pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
        <Badge
          variant="outline"
          className="bg-zinc-50 border-zinc-200 flex items-center gap-1.5 px-2 py-1 text-xs min-w-0 max-w-[calc(100%-36px)] sm:max-w-none"
        >
          <Shield className="w-3 h-3 text-zinc-500 shrink-0" />
          <span className="text-zinc-500 font-normal shrink-0 truncate max-w-[100px] sm:max-w-none">{selectedUnit.leaderTitle}:</span>
          <span className="font-semibold text-zinc-900 truncate max-w-[120px] sm:max-w-none">{selectedUnit.leaderName}</span>
        </Badge>
        {canManage && onUpdateUnit && (
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="p-1.5 text-zinc-400 hover:text-[#b91c1c] hover:bg-zinc-100 rounded-[3px] transition-colors shrink-0 btn-tactile cursor-pointer"
            title="Chỉnh sửa thông tin chỉ huy và đơn vị"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Modal Chỉnh sửa thông tin đơn vị & chỉ huy (Bottom sheet on mobile, dialog on desktop) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-xl sm:rounded-[3px] border border-zinc-200 shadow-xl overflow-hidden max-h-[92dvh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Mobile pull handle */}
            <div className="mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-zinc-300 sm:hidden" />

            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#b91c1c]" />
                <span className="text-sm font-bold text-zinc-900">
                  Cập nhật Thông tin Đơn vị & Chỉ huy
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded btn-tactile cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editFormData.name.trim() || !editFormData.leaderName.trim()) {
                  notify.error('Thiếu thông tin', 'Vui lòng nhập tên đơn vị và họ tên chỉ huy.');
                  return;
                }
                const updated: MilitaryUnit = {
                  ...selectedUnit,
                  name: editFormData.name.trim(),
                  code: editFormData.code.trim(),
                  leaderTitle: editFormData.leaderTitle.trim(),
                  leaderName: editFormData.leaderName.trim(),
                  totalSoldiers: Number(editFormData.totalSoldiers) || selectedUnit.totalSoldiers,
                };
                onUpdateUnit?.(updated);
                setIsEditModalOpen(false);
                notify.success('Cập nhật thành công', `Đã lưu thông tin ${updated.name}`);
              }}
              className="p-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Tên đơn vị</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Mã hiệu đơn vị</label>
                  <input
                    type="text"
                    value={editFormData.code}
                    onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Quân số biên chế</label>
                  <input
                    type="number"
                    value={editFormData.totalSoldiers}
                    onChange={(e) => setEditFormData({ ...editFormData, totalSoldiers: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Chức vụ chỉ huy</label>
                  <input
                    type="text"
                    value={editFormData.leaderTitle}
                    onChange={(e) => setEditFormData({ ...editFormData, leaderTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900"
                    placeholder="Đại đội trưởng, Trung đội trưởng..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Họ tên chỉ huy</label>
                  <input
                    type="text"
                    value={editFormData.leaderName}
                    onChange={(e) => setEditFormData({ ...editFormData, leaderName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900"
                    placeholder="Đ/c Đại úy Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-300 text-zinc-700 rounded-[3px] hover:bg-zinc-50 font-medium btn-tactile cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#b91c1c] text-white rounded-[3px] hover:bg-[#991b1b] font-semibold btn-tactile cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CascadingUnitSelector;
