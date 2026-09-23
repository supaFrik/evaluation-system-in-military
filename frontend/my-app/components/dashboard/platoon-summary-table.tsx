'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  PlatoonAggregate,
  UnitAggregate,
  EmulationCriterion,
  DailyLockStatus,
  UnitTier,
  MilitaryUnit,
  Soldier,
  DailyScore,
} from '@/lib/types';
import {
  ALL_UNITS,
  getChildUnits,
  getAncestorChain,
  REGIMENT_UNIT,
} from '@/lib/mock-data';
import CascadingUnitSelector from '@/components/layout/cascading-unit-selector';
import {
  Calendar,
  Lock,
  Unlock,
  ChevronRight,
  Award,
  Trophy,
  Users,
  UserCheck,
  Pencil,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { notify } from '@/lib/notify';

interface PlatoonSummaryTableProps {
  aggregates?: PlatoonAggregate[]; // backward compat
  selectedUnitId?: string;
  selectedTier?: UnitTier;
  onSelectUnit?: (unitId: string, tier: UnitTier) => void;
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onSelectPlatoon?: (platoonId: string) => void;
  criteria?: EmulationCriterion[];
  lockStatus?: DailyLockStatus;
  getUnitAggregates?: (parentUnitId: string, date?: string) => UnitAggregate[];
  allowedRootId?: string;
  soldiers?: Soldier[];
  dailyScores?: DailyScore[];
  onViewSoldierProfile?: (soldier: Soldier) => void;
  onNavigateToIndividual?: (unitId: string, tier: UnitTier) => void;
  units?: MilitaryUnit[];
  canManage?: boolean;
  onUpdateUnit?: (unit: MilitaryUnit) => void;
  onUpdateUnitRemark?: (unitId: string, date: string, remark: string) => void;
}

export function PlatoonSummaryTable({
  aggregates = [],
  selectedUnitId: propSelectedUnitId,
  selectedTier: propSelectedTier,
  onSelectUnit: propOnSelectUnit,
  selectedDate,
  onChangeDate,
  onSelectPlatoon,
  criteria = [],
  lockStatus,
  getUnitAggregates,
  allowedRootId,
  soldiers = [],
  dailyScores = [],
  onViewSoldierProfile,
  onNavigateToIndividual,
  units,
  canManage = false,
  onUpdateUnit,
  onUpdateUnitRemark,
}: PlatoonSummaryTableProps) {
  // Local state if not controlled by parent
  const [localUnitId, setLocalUnitId] = useState<string>('e335');
  const [localTier, setLocalTier] = useState<UnitTier>('REGIMENT');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [editingRemarkUnit, setEditingRemarkUnit] = useState<{ id: string; name: string; remark: string } | null>(null);

  const activeUnitId = propSelectedUnitId ?? localUnitId;
  const activeTier = propSelectedTier ?? localTier;

  const handleSelectUnit = (unitId: string, tier: UnitTier) => {
    if (propOnSelectUnit) {
      propOnSelectUnit(unitId, tier);
    } else {
      setLocalUnitId(unitId);
      setLocalTier(tier);
    }
  };

  const activeCriteria = criteria.filter((c) => c.isActive);
  const totalMaxScore = activeCriteria.reduce((sum, c) => sum + c.maxScore, 0) || 400;

  const allUnits = units && units.length > 0 ? units : ALL_UNITS;

  // Thi đua tập thể chỉ xét đến cấp Đại đội (so sánh các Trung đội trực thuộc)
  const currentUnit = useMemo(() => {
    const raw = allUnits.find((u) => u.id === activeUnitId) || REGIMENT_UNIT;
    if (raw.tier === 'SQUAD' || raw.tier === 'PLATOON') {
      const list: MilitaryUnit[] = [];
      let curr: MilitaryUnit | undefined = raw;
      while (curr) {
        list.unshift(curr);
        if (!curr.parentId) break;
        curr = allUnits.find((u) => u.id === curr?.parentId);
      }
      return list.find((u) => u.tier === 'COMPANY') || REGIMENT_UNIT;
    }
    return raw;
  }, [activeUnitId, allUnits]);

  // Parent unit for comparison:
  // Regiment -> compares Battalions
  // Battalion -> compares Companies
  // Company -> compares Platoons
  const displayParentUnit = currentUnit;

  // Compute aggregates for comparison columns
  const computedUnitAggregates: UnitAggregate[] = useMemo(() => {
    if (getUnitAggregates) {
      return getUnitAggregates(displayParentUnit.id, selectedDate);
    }
    return aggregates.map((a) => ({
      unitId: a.platoonId,
      unitName: a.platoonName,
      unitCode: a.platoonId,
      tier: 'PLATOON' as UnitTier,
      totalSoldiers: a.totalSoldiers,
      avgPolitical: a.avgPolitical,
      avgTask: a.avgTask,
      avgHygiene: a.avgHygiene,
      avgBearing: a.avgBearing,
      avgTotal: a.avgTotal,
      avgCriteriaScores: a.avgCriteriaScores,
      rank: a.rank,
      generalRemark: a.generalRemark,
    }));
  }, [getUnitAggregates, displayParentUnit.id, selectedDate, aggregates]);

  // Sorted list for ranking
  const sortedAggregates = useMemo(() => {
    return [...computedUnitAggregates].sort((a, b) => b.avgTotal - a.avgTotal);
  }, [computedUnitAggregates]);

  const leadingUnit = sortedAggregates[0];

  const getScoreForCrit = (agg: UnitAggregate | undefined, crit: EmulationCriterion) => {
    if (!agg) return 0;
    if (agg.avgCriteriaScores && agg.avgCriteriaScores[crit.id] !== undefined) {
      return agg.avgCriteriaScores[crit.id];
    }
    if (crit.id === 'c_political') return agg.avgPolitical || 0;
    if (crit.id === 'c_task') return agg.avgTask || 0;
    if (crit.id === 'c_hygiene') return agg.avgHygiene || 0;
    if (crit.id === 'c_bearing') return agg.avgBearing || 0;
    return crit.maxScore;
  };

  const getCriteriaSummaryRemark = (crit: EmulationCriterion) => {
    if (computedUnitAggregates.length === 0) return 'Chưa có dữ liệu chấm điểm';
    const totalScore = computedUnitAggregates.reduce((acc, u) => acc + getScoreForCrit(u, crit), 0);
    const avg = totalScore / computedUnitAggregates.length;
    const pct = crit.maxScore > 0 ? (avg / crit.maxScore) * 100 : 0;

    if (pct >= 90) {
      return '100% đơn vị đạt Xuất sắc, duy trì nền nếp chính quy mẫu mực';
    } else if (pct >= 80) {
      return 'Đạt kết quả Giỏi, chấp hành nghiêm túc quy định và an toàn';
    } else if (pct >= 70) {
      return 'Đạt yêu cầu thi đua, một số khâu yếu cần tiếp tục chấn chỉnh';
    } else {
      return 'Chưa đạt chỉ tiêu, cần tăng cường kiểm tra đôn đốc khắc phục';
    }
  };

  return (
    <div className="w-full max-w-6xl py-2 space-y-5">
      {/* 1. Cascading Unit Selector (Giới hạn tối đa cấp Đại đội) */}
      <CascadingUnitSelector
        selectedUnitId={currentUnit.id}
        onSelectUnit={handleSelectUnit}
        allowedRootId={allowedRootId}
        maxTier="COMPANY"
        units={units}
        canManage={canManage}
        onUpdateUnit={onUpdateUnit}
      />

      {/* 2. Thanh điều khiển tinh gọn */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center border border-zinc-200 bg-zinc-50 rounded-[3px] p-0.5">
            <button
              onClick={() => setViewMode('day')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-[2px] transition-colors ${
                viewMode === 'day'
                  ? 'bg-white text-[#b91c1c] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Theo ngày
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-[2px] transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-[#b91c1c] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Tổng hợp tuần
            </button>
          </div>

          {lockStatus && (
            lockStatus.isLocked ? (
              <span className="inline-flex items-center gap-1 rounded-[3px] border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                <Lock className="w-3 h-3 text-zinc-500" />
                Chốt sổ 21:00
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-[3px] border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                <Unlock className="w-3 h-3 text-emerald-600" />
                Đang mở chấm điểm
              </span>
            )
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-white border border-zinc-300 rounded px-2.5 py-1">
          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="text-xs text-zinc-800 focus:outline-none bg-transparent font-medium"
          />
        </div>
      </div>

      {/* Mobile scroll indicator hint */}
      <div className="flex md:hidden items-center justify-between text-xs font-medium text-zinc-500 px-1 pb-1">
        <span>So sánh ({computedUnitAggregates.length} đơn vị)</span>
        <span className="flex items-center gap-1 text-zinc-400 font-medium">
          ← Vuốt ngang xem thêm →
        </span>
      </div>

      {/* 3. BẢNG SO SÁNH THI ĐUA ĐA CẤP */}
      <div className="overflow-x-auto border border-zinc-200 bg-white shadow-xs rounded-[3px]">
        <table className="w-full text-left text-xs border-separate border-spacing-0">
          <thead>
            <tr className="bg-zinc-100 text-xs text-zinc-800 font-semibold">
              {/* Frozen Left: STT + Tiêu chí */}
              <th className="sticky left-0 top-0 z-30 bg-zinc-100 py-2.5 px-2 sm:px-3 w-9 sm:w-10 min-w-[36px] sm:min-w-[40px] max-w-[40px] text-center border-b border-zinc-200">
                STT
              </th>
              <th className="sticky left-9 sm:left-10 top-0 z-30 bg-zinc-100 py-2.5 px-2.5 sm:px-3 min-w-[160px] max-w-[190px] sm:min-w-[210px] sm:max-w-[260px] border-b border-r border-zinc-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                Tiêu chí thi đua ({totalMaxScore}đ)
              </th>

              {/* Scrollable Center: Units */}
              {computedUnitAggregates.map((unit) => (
                <th key={unit.unitId} className="py-2.5 px-3 text-center min-w-[115px] border-b border-zinc-200 bg-zinc-100">
                  <button
                    onClick={() => {
                      if (unit.tier === 'PLATOON') {
                        onNavigateToIndividual?.(unit.unitId, unit.tier);
                      } else {
                        handleSelectUnit(unit.unitId, unit.tier);
                      }
                    }}
                    className="font-bold text-zinc-900 hover:text-[#b91c1c] transition-colors group flex flex-col items-center mx-auto btn-tactile cursor-pointer"
                    title={unit.tier === 'PLATOON' ? `Xem bình xét cá nhân ${unit.unitName}` : `Xem chi tiết thi đua ${unit.unitName}`}
                  >
                    <span className="text-xs">{unit.unitName}</span>
                    <span className="text-xs text-zinc-500 font-normal group-hover:underline mt-0.5">
                      Quân số: {unit.totalSoldiers} đ/c
                    </span>
                  </button>
                </th>
              ))}

              {/* Right: Đánh giá chung (Unpinned on mobile & tablet <lg) */}
              <th className="max-lg:static max-lg:shadow-none lg:sticky lg:right-0 top-0 z-30 bg-zinc-100 py-2.5 px-3 min-w-[170px] border-b border-l border-zinc-200 lg:shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                Đánh giá chung
              </th>
            </tr>
          </thead>
          <tbody>
            {activeCriteria.length > 0 ? (
              activeCriteria.map((crit, idx) => (
                <tr key={crit.id} className="group table-row-hover transition-colors">
                  {/* Frozen Left: STT */}
                  <td className="sticky left-0 z-20 bg-white group-hover:bg-zinc-50 py-2.5 px-2 sm:px-3 text-center text-zinc-400 font-mono border-b border-zinc-200">
                    {idx + 1}
                  </td>

                  {/* Frozen Left: Tiêu chí */}
                  <td className="sticky left-9 sm:left-10 z-20 bg-white group-hover:bg-zinc-50 py-2.5 px-2.5 sm:px-3 font-medium text-zinc-900 border-b border-r border-zinc-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] min-w-[160px] max-w-[190px] sm:min-w-[210px] sm:max-w-[260px]">
                    <div className="font-semibold text-zinc-900 line-clamp-2">{crit.name}</div>
                  </td>

                  {/* Scrollable Center: Điểm số các đơn vị */}
                  {computedUnitAggregates.map((unit) => (
                    <td key={unit.unitId} className="py-2.5 px-3 text-center font-mono font-medium text-zinc-800 border-b border-zinc-200">
                      {getScoreForCrit(unit, crit)}/{crit.maxScore}
                    </td>
                  ))}

                  {/* Right: Đánh giá chung (Unpinned on mobile & tablet <lg) */}
                  <td className="max-lg:static max-lg:shadow-none lg:sticky lg:right-0 z-20 bg-white group-hover:bg-zinc-50 py-2.5 px-3 text-zinc-700 text-xs leading-relaxed border-b border-l border-zinc-200 lg:shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                    {getCriteriaSummaryRemark(crit)}
                  </td>
                </tr>
              ))
            ) : null}

            {/* Total Row */}
            <tr className="bg-zinc-50 font-semibold">
              <td className="sticky left-0 z-20 bg-zinc-50 py-2.5 px-2 sm:px-3 text-center text-zinc-500 font-mono border-b border-t-2 border-zinc-200">
                ∑
              </td>
              <td className="sticky left-9 sm:left-10 z-20 bg-zinc-50 py-2.5 px-2.5 sm:px-3 text-zinc-900 font-bold uppercase tracking-wide border-b border-t-2 border-r border-zinc-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                TỔNG ĐIỂM THI ĐUA
              </td>
              {computedUnitAggregates.map((unit) => (
                <td key={unit.unitId} className="py-2.5 px-3 text-center font-mono font-bold text-sm text-[#b91c1c] border-b border-t-2 border-zinc-200">
                  {unit.avgTotal || 0}
                </td>
              ))}
              <td className="max-lg:static max-lg:shadow-none lg:sticky lg:right-0 z-20 bg-zinc-50 py-2.5 px-3 text-xs text-zinc-500 italic border-b border-t-2 border-l border-zinc-200 lg:shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                Cập nhật ngày {selectedDate}
              </td>
            </tr>

            {/* Rank Row */}
            <tr className="bg-white">
              <td className="sticky left-0 z-20 bg-white py-2.5 px-2 sm:px-3 text-center text-xs text-zinc-400 border-b border-zinc-200">
                ★
              </td>
              <td className="sticky left-9 sm:left-10 z-20 bg-white py-2.5 px-2.5 sm:px-3 font-semibold text-zinc-900 uppercase tracking-wide border-b border-r border-zinc-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                XẾP HẠNG THI ĐUA
              </td>
              {computedUnitAggregates.map((unit) => {
                const rankIdx = sortedAggregates.findIndex((s) => s.unitId === unit.unitId);
                const isLeading = rankIdx === 0 && unit.avgTotal > 0;
                return (
                  <td key={unit.unitId} className="py-2.5 px-3 text-center border-b border-zinc-200">
                    {isLeading ? (
                      <span className="inline-flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-xs font-semibold text-[#991b1b] bg-red-50 border border-red-200">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        Hạng 1
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600 font-medium">
                        Hạng {rankIdx + 1}
                      </span>
                    )}
                  </td>
                );
              })}
              <td className="max-lg:static max-lg:shadow-none lg:sticky lg:right-0 z-20 bg-white py-2.5 px-3 text-xs text-zinc-700 border-b border-l border-zinc-200 lg:shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                {leadingUnit && leadingUnit.avgTotal > 0 ? (
                  <span>
                    Dẫn đầu: <strong className="text-[#991b1b]">{leadingUnit.unitName}</strong>
                  </span>
                ) : (
                  <span className="text-zinc-400 italic">Đang cập nhật</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. THẺ TÌNH HÌNH THI ĐUA CÁC ĐƠN VỊ TRỰC THUỘC */}
      <div className="pt-1">
        <div className="text-xs font-semibold text-zinc-600 mb-2">
          Nhận xét đánh giá đơn vị trực thuộc
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {computedUnitAggregates.map((unit) => {
            const rankIdx = sortedAggregates.findIndex((s) => s.unitId === unit.unitId);
            const isLeading = rankIdx === 0 && unit.avgTotal > 0;

            return (
              <div
                key={unit.unitId}
                className="p-3.5 border border-zinc-200 rounded-[3px] bg-white hover:border-zinc-300 transition-colors flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900">{unit.unitName}</span>
                      {isLeading && (
                        <Badge className="bg-red-50 text-[#991b1b] border-red-200 text-xs font-semibold py-0.5">
                          Dẫn đầu thi đua ngày
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                      <span>Quân số: <strong>{unit.totalSoldiers}</strong> đồng chí</span>
                      <span>•</span>
                      <span>Mã: {unit.unitCode}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-[#b91c1c]">
                      {unit.avgTotal} điểm
                    </div>
                    <div className="text-xs text-zinc-500 font-medium">
                      Hạng {rankIdx + 1}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {unit.generalRemark && unit.generalRemark.trim() ? (
                    <div className="flex items-start justify-between gap-2 text-xs text-zinc-700 bg-zinc-50 p-2 rounded-[2px] border border-zinc-100 leading-relaxed">
                      <span>{unit.generalRemark}</span>
                      {canManage && onUpdateUnitRemark && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRemarkUnit({ id: unit.unitId, name: unit.unitName, remark: unit.generalRemark });
                          }}
                          className="shrink-0 text-zinc-400 hover:text-[#b91c1c] p-0.5 rounded transition-colors btn-tactile cursor-pointer"
                          title="Sửa nhận xét thi đua"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    canManage && onUpdateUnitRemark && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRemarkUnit({ id: unit.unitId, name: unit.unitName, remark: '' });
                        }}
                        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-[#b91c1c] italic btn-tactile cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>+ Thêm nhận xét đánh giá đơn vị...</span>
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center justify-end pt-1 text-xs">
                  {unit.tier === 'PLATOON' ? (
                    <button
                      onClick={() => onNavigateToIndividual?.(unit.unitId, unit.tier)}
                      className="inline-flex items-center gap-1 font-semibold text-[#b91c1c] hover:underline btn-tactile cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Xem bình xét cá nhân</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectUnit(unit.unitId, unit.tier)}
                      className="inline-flex items-center gap-1 font-semibold text-[#b91c1c] hover:underline btn-tactile cursor-pointer"
                    >
                      <span>Xem chi tiết cấp con</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Chỉnh sửa nhận xét thi đua đơn vị */}
      {editingRemarkUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-[3px] border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50">
              <span className="text-sm font-bold text-zinc-900">
                Nhận xét thi đua — {editingRemarkUnit.name}
              </span>
              <button
                type="button"
                onClick={() => setEditingRemarkUnit(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded btn-tactile cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateUnitRemark?.(editingRemarkUnit.id, selectedDate, editingRemarkUnit.remark.trim());
                notify.success('Đã lưu nhận xét', `Đã cập nhật nhận xét thi đua cho ${editingRemarkUnit.name}`);
                setEditingRemarkUnit(null);
              }}
              className="p-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-zinc-600 font-medium mb-1">
                  Đánh giá thi đua ngày {selectedDate}:
                </label>
                <textarea
                  rows={3}
                  value={editingRemarkUnit.remark}
                  onChange={(e) => setEditingRemarkUnit({ ...editingRemarkUnit, remark: e.target.value })}
                  placeholder="Nhập nội dung nhận xét, chấn chỉnh nề nếp, biểu dương kết quả..."
                  className="w-full p-2.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 leading-relaxed"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingRemarkUnit(null)}
                  className="px-3 py-1.5 border border-zinc-300 text-zinc-700 rounded-[3px] hover:bg-zinc-50 font-medium btn-tactile cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#b91c1c] text-white rounded-[3px] hover:bg-[#991b1b] font-semibold btn-tactile cursor-pointer"
                >
                  Lưu nhận xét
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlatoonSummaryTable;
