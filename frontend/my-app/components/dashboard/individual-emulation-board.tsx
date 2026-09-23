'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Soldier,
  DailyScore,
  EmulationCriterion,
  DailyLockStatus,
  UnitTier,
  MilitaryUnit,
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
  Trophy,
  Users,
  Eye,
  UserCheck,
  ArrowRight,
  Search,
  Award,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Pencil,
  X,
  MoreHorizontal,
} from 'lucide-react';
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

interface IndividualEmulationBoardProps {
  soldiers?: Soldier[];
  dailyScores?: DailyScore[];
  criteria?: EmulationCriterion[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  selectedUnitId?: string;
  selectedTier?: UnitTier;
  onSelectUnit?: (unitId: string, tier: UnitTier) => void;
  allowedRootId?: string;
  lockStatus?: DailyLockStatus;
  onViewSoldierProfile?: (soldier: Soldier) => void;
  onNavigateToCollective?: () => void;
  units?: MilitaryUnit[];
  canManage?: boolean;
  onUpdateUnit?: (unit: MilitaryUnit) => void;
  onSaveScore?: (score: DailyScore) => void;
}

export function IndividualEmulationBoard({
  soldiers = [],
  dailyScores = [],
  criteria = [],
  selectedDate,
  onChangeDate,
  selectedUnitId: propSelectedUnitId,
  selectedTier: propSelectedTier,
  onSelectUnit: propOnSelectUnit,
  allowedRootId,
  lockStatus,
  onViewSoldierProfile,
  onNavigateToCollective,
  units,
  canManage = false,
  onUpdateUnit,
  onSaveScore,
}: IndividualEmulationBoardProps) {
  const [localUnitId, setLocalUnitId] = useState<string>('c1_b1');
  const [localTier, setLocalTier] = useState<UnitTier>('PLATOON');
  const [squadFilter, setSquadFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingScoreItem, setEditingScoreItem] = useState<{
    soldier: Soldier;
    score: DailyScore;
  } | null>(null);

  const activeUnitId = propSelectedUnitId ?? localUnitId;
  const activeTier = propSelectedTier ?? localTier;

  const handleSelectUnit = (unitId: string, tier: UnitTier) => {
    setSquadFilter('ALL');
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

  const currentUnit = useMemo(
    () => allUnits.find((u) => u.id === activeUnitId) || REGIMENT_UNIT,
    [activeUnitId, allUnits]
  );

  const isSquadLevel = currentUnit.tier === 'SQUAD';
  const isPlatoonLevel = currentUnit.tier === 'PLATOON';

  // Lấy danh sách tiểu đội con nếu đang ở cấp Trung đội hoặc Đại đội
  const platoonSquads = useMemo(() => {
    if (isPlatoonLevel) {
      return allUnits.filter((u) => u.parentId === currentUnit.id);
    }
    if (currentUnit.tier === 'COMPANY') {
      const companyPlatoons = allUnits.filter((u) => u.parentId === currentUnit.id);
      return companyPlatoons.flatMap((p) => allUnits.filter((u) => u.parentId === p.id));
    }
    if (isSquadLevel && currentUnit.parentId) {
      return allUnits.filter((u) => u.parentId === currentUnit.parentId);
    }
    return [];
  }, [isPlatoonLevel, isSquadLevel, currentUnit, allUnits]);

  // Lọc danh sách chiến sĩ theo đơn vị hiện tại
  const unitSoldiers = useMemo(() => {
    let base: Soldier[] = [];
    if (isSquadLevel) {
      base = soldiers.filter((s) => s.squadId === currentUnit.id);
    } else if (isPlatoonLevel) {
      const platoonList = soldiers.filter((s) => s.platoonId === currentUnit.id);
      if (squadFilter === 'ALL') {
        base = platoonList;
      } else {
        base = platoonList.filter((s) => s.squadId === squadFilter);
      }
    } else {
      base = soldiers.filter(
        (s) =>
          s.battalionId === activeUnitId ||
          s.companyId === activeUnitId ||
          s.platoonId === activeUnitId ||
          s.squadId === activeUnitId ||
          activeUnitId === 'e335'
      );
      if (squadFilter !== 'ALL') {
        base = base.filter((s) => s.squadId === squadFilter);
      }
    }

    if (!searchTerm.trim()) return base;
    const term = searchTerm.toLowerCase();
    return base.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.militaryCode.toLowerCase().includes(term) ||
        s.hometown.toLowerCase().includes(term)
    );
  }, [soldiers, currentUnit, isSquadLevel, isPlatoonLevel, squadFilter, activeUnitId, searchTerm]);

  // Tính điểm thi đua và xếp hạng cho từng chiến sĩ
  const scoredSoldiers = useMemo(() => {
    const list = unitSoldiers.map((soldier) => {
      const scoreObj = dailyScores.find(
        (s) => s.soldierId === soldier.id && s.date === selectedDate
      );

      const criteriaScores: Record<string, number> = {};
      activeCriteria.forEach((crit) => {
        if (scoreObj?.criteriaScores && scoreObj.criteriaScores[crit.id] !== undefined) {
          criteriaScores[crit.id] = scoreObj.criteriaScores[crit.id];
        } else if (crit.id === 'c_political') {
          criteriaScores[crit.id] = scoreObj?.politicalScore ?? 100;
        } else if (crit.id === 'c_task') {
          criteriaScores[crit.id] = scoreObj?.taskScore ?? 100;
        } else if (crit.id === 'c_hygiene') {
          criteriaScores[crit.id] = scoreObj?.hygieneScore ?? 100;
        } else if (crit.id === 'c_bearing') {
          criteriaScores[crit.id] = scoreObj?.bearingScore ?? 100;
        } else {
          criteriaScores[crit.id] = crit.maxScore;
        }
      });

      const totalScore =
        scoreObj?.totalScore !== undefined
          ? scoreObj.totalScore
          : activeCriteria.reduce((sum, c) => sum + (criteriaScores[c.id] ?? c.maxScore), 0);

      return {
        soldier,
        criteriaScores,
        totalScore,
        violations: scoreObj?.violations || [],
        individualRank: 0,
      };
    });

    list.sort((a, b) => b.totalScore - a.totalScore);
    return list.map((item, idx) => ({
      ...item,
      individualRank: idx + 1,
    }));
  }, [unitSoldiers, dailyScores, selectedDate, activeCriteria]);

  // Thống kê nhanh cấp phân đội
  const stats = useMemo(() => {
    const totalCount = scoredSoldiers.length;
    if (totalCount === 0) {
      return { totalCount: 0, avgScore: 0, topSoldier: null, excellentRate: 0 };
    }

    const sumTotal = scoredSoldiers.reduce((acc, s) => acc + s.totalScore, 0);
    const avgScore = Math.round(sumTotal / totalCount);
    const topSoldier = scoredSoldiers[0] || null;
    const excellentCount = scoredSoldiers.filter((s) => s.totalScore >= 380).length;
    const excellentRate = Math.round((excellentCount / totalCount) * 100);

    return { totalCount, avgScore, topSoldier, excellentRate };
  }, [scoredSoldiers]);

  // Helper hiển thị mã hiệu quân sự của Tiểu đội (A1, A2, A3)
  const formatSquadBadge = (squadName: string) => {
    if (!squadName) return 'Biên chế đơn vị';
    if (squadName.includes('1')) return 'A1 (Tiểu đội 1)';
    if (squadName.includes('2')) return 'A2 (Tiểu đội 2)';
    if (squadName.includes('3')) return 'A3 (Tiểu đội 3)';
    return squadName;
  };

  return (
    <div className="w-full max-w-6xl py-2 space-y-5">
      {/* 1. Cascading Unit Selector (Chọn đến cấp Trung đội, lọc Tiểu đội bằng thanh nút bên dưới) */}
      <CascadingUnitSelector
        selectedUnitId={activeUnitId}
        onSelectUnit={handleSelectUnit}
        allowedRootId={allowedRootId}
        maxTier="PLATOON"
        units={units}
        canManage={canManage}
        onUpdateUnit={onUpdateUnit}
      />

      {/* 2. Thanh điều khiển tinh gọn */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2">
          {lockStatus && (
            lockStatus.isLocked ? (
              <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-800">
                <Lock className="w-3.5 h-3.5 text-zinc-600" />
                Chốt sổ 21:00
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900">
                <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                Đang mở chấm điểm
              </span>
            )
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-700 bg-white border border-zinc-300 rounded-[3px] px-2.5 py-1 shadow-2xs">
          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="text-xs text-zinc-900 focus:outline-none bg-transparent font-medium cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Thẻ Chỉ số Thi đua Nhanh (KPI Stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-zinc-200 rounded-[3px] shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
            <span>Quân số bình xét</span>
            <Users className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-lg font-bold text-zinc-900">
            {stats.totalCount}{' '}
            <span className="text-xs font-normal text-zinc-500">đồng chí</span>
          </div>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-[3px] shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
            <span>Điểm trung bình</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#b91c1c]" />
          </div>
          <div className="text-lg font-bold text-[#b91c1c] font-mono">
            {stats.avgScore}{' '}
            <span className="text-xs font-normal text-zinc-500">/ {totalMaxScore}đ</span>
          </div>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-[3px] shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
            <span>Chiến sĩ dẫn đầu</span>
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-zinc-900 truncate" title={stats.topSoldier?.soldier.name}>
            {stats.topSoldier ? stats.topSoldier.soldier.name : '—'}
          </div>
          <div className="text-xs text-zinc-600 mt-0.5 truncate font-medium">
            {stats.topSoldier ? `${formatSquadBadge(stats.topSoldier.soldier.squadName)} • ${stats.topSoldier.totalScore}đ` : 'Chưa có dữ liệu'}
          </div>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-[3px] shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
            <span>Tỷ lệ đạt Giỏi/Xuất sắc</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-emerald-700 font-mono">
            {stats.excellentRate}%
          </div>
        </div>
      </div>

      {/* 4. Bộ lọc Tiểu đội & Tìm kiếm quân nhân */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-zinc-50 p-2.5 rounded-[3px] border border-zinc-200">
        {/* Bộ lọc nhanh theo từng tiểu đội - cuộn ngang mượt mà trên mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap min-w-0 flex-1">
          <span className="text-xs text-zinc-700 font-semibold mr-1 shrink-0">Tiểu đội:</span>
          <button
            onClick={() => setSquadFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[3px] border transition-colors shrink-0 btn-tactile cursor-pointer ${
              squadFilter === 'ALL'
                ? 'bg-[#b91c1c] text-white border-[#b91c1c] shadow-xs'
                : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
            }`}
          >
            Tất cả ({soldiers.filter((s) => s.platoonId === currentUnit.id || s.companyId === currentUnit.id || currentUnit.tier === 'REGIMENT').length})
          </button>
          {platoonSquads.map((sq) => {
            const count = soldiers.filter((s) => s.squadId === sq.id).length;
            return (
              <button
                key={sq.id}
                onClick={() => setSquadFilter(sq.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[3px] border transition-colors shrink-0 btn-tactile cursor-pointer ${
                  squadFilter === sq.id
                    ? 'bg-[#b91c1c] text-white border-[#b91c1c] shadow-xs'
                    : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                {formatSquadBadge(sq.name)} ({count})
              </button>
            );
          })}
        </div>

        {/* Ô tìm kiếm quân nhân */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, số hiệu SQ/CS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-800"
          />
        </div>
      </div>

      {/* Mobile scroll indicator hint */}
      <div className="flex md:hidden items-center justify-between text-xs font-medium text-zinc-500 px-1 pb-1">
        <span>Bảng thi đua cá nhân</span>
        <span className="flex items-center gap-1 text-zinc-400 font-medium">
          ← Vuốt ngang xem đủ tiêu chí & điểm →
        </span>
      </div>

      {/* 5. Bảng Chi Tiết Điểm Thi Đua Từng Chiến Sĩ (Triple-Zone Frozen Columns on Desktop) */}
      <div className="overflow-x-auto border border-zinc-200 bg-white shadow-xs rounded-[3px]">
        <table className="w-full text-left text-xs border-separate border-spacing-0">
          <thead>
            <tr className="bg-zinc-100 text-xs text-zinc-800 font-semibold">
              {/* Frozen Left: STT + Quân nhân */}
              <th className="sticky left-0 top-0 z-30 bg-zinc-100 py-2.5 px-2 w-9 sm:w-10 min-w-[36px] sm:min-w-[40px] max-w-[40px] text-center border-b border-zinc-200">
                STT
              </th>
              <th className="sticky left-9 sm:left-10 top-0 z-30 bg-zinc-100 py-2.5 px-2.5 sm:px-3 min-w-[150px] max-w-[180px] sm:min-w-[180px] sm:max-w-[210px] border-b border-r border-zinc-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                Quân nhân
              </th>

              {/* Scrollable Center: Cấp bậc, Phân đội, Tiêu chí */}
              <th className="py-2.5 px-3 min-w-[120px] border-b border-zinc-200 bg-zinc-100">
                Cấp bậc / Chức vụ
              </th>
              <th className="py-2.5 px-3 min-w-[120px] border-b border-zinc-200 bg-zinc-100">
                Phân đội
              </th>
              {activeCriteria.map((crit) => (
                <th
                  key={crit.id}
                  className="py-2.5 px-2 text-center min-w-[95px] border-b border-zinc-200 bg-zinc-100"
                >
                  <div className="text-xs font-semibold text-zinc-800">{crit.name.split(',')[0]}</div>
                  <span className="font-bold text-xs text-[#b91c1c]">
                    ({crit.maxScore}đ)
                  </span>
                </th>
              ))}

              {/* Right: Tổng điểm + Xếp hạng + Tác vụ (Unpinned on mobile <md) */}
              <th className="max-md:static max-md:shadow-none md:sticky md:right-[144px] top-0 z-30 bg-zinc-100 py-2.5 px-2 text-center w-24 min-w-[96px] max-w-[96px] font-bold text-[#b91c1c] border-b border-l border-zinc-200 md:shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                Tổng điểm
              </th>
              <th className="max-md:static max-md:shadow-none md:sticky md:right-[64px] top-0 z-30 bg-zinc-100 py-2.5 px-2 text-center w-20 min-w-[80px] max-w-[80px] border-b border-zinc-200">
                Xếp hạng
              </th>
              <th className="max-md:static max-md:shadow-none md:sticky md:right-0 top-0 z-30 bg-zinc-100 py-2.5 px-2 text-center w-20 min-w-[76px] max-w-[76px] border-b border-zinc-200">
                Tác vụ
              </th>
            </tr>
          </thead>
          <tbody>
            {scoredSoldiers.length > 0 ? (
              scoredSoldiers.map(({ soldier, criteriaScores, totalScore, individualRank, violations }, idx) => {
                const isTop1 = individualRank === 1 && totalScore > 0;
                return (
                  <tr key={soldier.id} className="group table-row-hover">
                    {/* Frozen Left: STT */}
                    <td className="sticky left-0 z-20 bg-white group-hover:bg-red-50/20 py-2.5 px-2 w-9 sm:w-10 min-w-[36px] sm:min-w-[40px] max-w-[40px] text-center text-zinc-500 font-mono text-xs border-b border-zinc-200">
                      {idx + 1}
                    </td>

                    {/* Frozen Left: Quân nhân */}
                    <td className="sticky left-9 sm:left-10 z-20 bg-white group-hover:bg-red-50/20 py-2.5 px-2.5 sm:px-3 min-w-[150px] max-w-[180px] sm:min-w-[180px] sm:max-w-[210px] border-b border-r border-zinc-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center gap-2">
                        <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-[2px] overflow-hidden border border-zinc-200 bg-zinc-50">
                          <Image
                            src={soldier.avatarUrl || '/default-avatar.png'}
                            alt={soldier.name}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-zinc-900 uppercase truncate">
                            {soldier.name}
                          </div>
                          <div className="text-xs font-mono text-zinc-600">
                            {soldier.militaryCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Scrollable Center: Cấp bậc, Phân đội, Tiêu chí */}
                    <td className="py-2.5 px-3 text-zinc-700 border-b border-zinc-200 text-xs">
                      <span className="font-semibold text-zinc-900">{soldier.rank}</span>
                      <span className="block text-xs text-zinc-600 font-medium">{soldier.roleTitle}</span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700 border-b border-zinc-200">
                      <span className="inline-block rounded-[2px] border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-semibold text-zinc-800">
                        {formatSquadBadge(soldier.squadName)}
                      </span>
                    </td>
                    {activeCriteria.map((crit) => (
                      <td
                        key={crit.id}
                        className="py-2.5 px-2 text-center font-mono font-medium text-xs text-zinc-800 border-b border-zinc-200"
                      >
                        {criteriaScores[crit.id] ?? crit.maxScore}/{crit.maxScore}
                      </td>
                    ))}

                    {/* Right: Tổng điểm (Unpinned on mobile <md) */}
                    <td className="max-md:static max-md:shadow-none md:sticky md:right-[144px] z-20 bg-white group-hover:bg-red-50/20 py-2.5 px-2 text-center font-mono font-bold text-sm text-[#b91c1c] w-24 min-w-[96px] max-w-[96px] border-b border-l border-zinc-200 md:shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                      {totalScore}
                    </td>

                    {/* Right: Xếp hạng (Unpinned on mobile <md) */}
                    <td className="max-md:static max-md:shadow-none md:sticky md:right-[64px] z-20 bg-white group-hover:bg-red-50/20 py-2.5 px-2 text-center w-20 min-w-[80px] max-w-[80px] border-b border-zinc-200">
                      {isTop1 ? (
                        <span className="inline-flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-xs font-bold text-[#991b1b] bg-red-50 border border-red-200">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          Hạng 1
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-700 font-semibold">
                          Hạng {individualRank}
                        </span>
                      )}
                    </td>

                    {/* Right: Tác vụ (Unpinned on mobile <md) */}
                    <td className="max-md:static max-md:shadow-none md:sticky md:right-0 z-20 bg-white group-hover:bg-red-50/20 py-2 px-2 text-center w-20 min-w-[76px] max-w-[76px] border-b border-zinc-200">
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
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-zinc-200 shadow-md rounded-[3px] p-1 text-xs">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[11px] font-bold text-zinc-500">
                              {soldier.name}
                            </DropdownMenuLabel>
                            {canManage && onSaveScore && (
                              <DropdownMenuItem
                                onClick={() => {
                                  const existingScore = dailyScores.find(
                                    (s) => s.soldierId === soldier.id && s.date === selectedDate
                                  ) || {
                                    id: `sc-${soldier.id}-${selectedDate}`,
                                    soldierId: soldier.id,
                                    soldierName: soldier.name,
                                    platoonId: soldier.platoonId,
                                    date: selectedDate,
                                    criteriaScores: {},
                                    politicalScore: 100,
                                    taskScore: 100,
                                    hygieneScore: 100,
                                    bearingScore: 100,
                                    totalScore: 400,
                                    violations: [],
                                    evaluatedBy: 'Chỉ huy đơn vị',
                                  };
                                  setEditingScoreItem({ soldier, score: { ...existingScore } });
                                }}
                                className="cursor-pointer gap-2 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
                              >
                                <Pencil className="h-3.5 w-3.5 text-zinc-500" />
                                <span>Điều chỉnh điểm</span>
                              </DropdownMenuItem>
                            )}
                            {onViewSoldierProfile && (
                              <DropdownMenuItem
                                onClick={() => onViewSoldierProfile(soldier)}
                                className="cursor-pointer gap-2 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
                              >
                                <Eye className="h-3.5 w-3.5 text-zinc-500" />
                                <span>Xem lý lịch trích ngang</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={activeCriteria.length + 7}
                  className="py-12 text-center text-zinc-500 text-xs"
                >
                  <p className="font-semibold text-zinc-800 text-sm mb-1">
                    Chưa có danh sách quân nhân cho đơn vị này
                  </p>
                  <p className="text-zinc-500 max-w-md mx-auto mb-4 text-xs">
                    Đồng chí có thể chuyển nhanh sang các phân đội dưới đây:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleSelectUnit('c1_b1', 'PLATOON')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded-[3px] transition-colors shadow-2xs"
                    >
                      <span>Trung đội 1 (Đại đội 1)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSelectUnit('c18_b1', 'PLATOON')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-[3px] transition-colors"
                    >
                      <span>Trung đội 1 (Đại đội 18 Thông tin)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Điều chỉnh điểm thi đua quân nhân */}
      {editingScoreItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-xl sm:rounded-[3px] border border-zinc-200 shadow-xl overflow-hidden max-h-[92dvh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Mobile pull handle */}
            <div className="mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-zinc-300 sm:hidden" />

            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50">
              <span className="text-sm font-bold text-zinc-900 truncate pr-2">
                Điều chỉnh điểm — {editingScoreItem.soldier.name} ({editingScoreItem.soldier.militaryCode})
              </span>
              <button
                type="button"
                onClick={() => setEditingScoreItem(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cur = editingScoreItem.score;
                const critScores = cur.criteriaScores || {};
                const critTotal = activeCriteria.reduce(
                  (sum, c) => sum + (critScores[c.id] !== undefined ? critScores[c.id] : c.maxScore),
                  0
                );
                const newTotal = critTotal;

                const updated: DailyScore = {
                  ...cur,
                  criteriaScores: critScores,
                  politicalScore: critScores['c_political'] ?? cur.politicalScore,
                  taskScore: critScores['c_task'] ?? cur.taskScore,
                  hygieneScore: critScores['c_hygiene'] ?? cur.hygieneScore,
                  bearingScore: critScores['c_bearing'] ?? cur.bearingScore,
                  totalScore: newTotal,
                };
                onSaveScore?.(updated);
                notify.success('Cập nhật thành công', `Đã cập nhật điểm thi đua của ${editingScoreItem.soldier.name}`);
                setEditingScoreItem(null);
              }}
              className="p-4 space-y-3 text-xs"
            >
              <div className="text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-[3px] border border-zinc-200">
                Ngày đánh giá: <strong className="font-mono text-zinc-800">{selectedDate}</strong> | Đơn vị: {editingScoreItem.soldier.rank} - {editingScoreItem.soldier.squadName}
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-700 font-semibold">Điểm các tiêu chí thi đua:</label>
                {activeCriteria.map((crit) => {
                  const currentVal = editingScoreItem.score.criteriaScores?.[crit.id] !== undefined
                    ? editingScoreItem.score.criteriaScores[crit.id]
                    : (crit.id === 'c_political' ? editingScoreItem.score.politicalScore
                      : crit.id === 'c_task' ? editingScoreItem.score.taskScore
                      : crit.id === 'c_hygiene' ? editingScoreItem.score.hygieneScore
                      : crit.id === 'c_bearing' ? editingScoreItem.score.bearingScore
                      : crit.maxScore);

                  return (
                    <div key={crit.id} className="flex items-center justify-between gap-3 bg-zinc-50/70 p-2 rounded-[2px] border border-zinc-200">
                      <span className="font-medium text-zinc-800">{crit.name.split(',')[0]} (Tối đa {crit.maxScore}đ)</span>
                      <input
                        type="number"
                        min={0}
                        max={crit.maxScore}
                        value={currentVal}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(crit.maxScore, parseInt(e.target.value) || 0));
                          setEditingScoreItem({
                            ...editingScoreItem,
                            score: {
                              ...editingScoreItem.score,
                              criteriaScores: {
                                ...(editingScoreItem.score.criteriaScores || {}),
                                [crit.id]: val,
                              },
                            },
                          });
                        }}
                        className="w-16 px-2 py-1 text-center font-mono font-bold text-zinc-900 bg-white border border-zinc-300 rounded-[2px] focus:outline-none focus:border-[#b91c1c]"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingScoreItem(null)}
                  className="px-3 py-1.5 border border-zinc-300 text-zinc-700 rounded-[3px] hover:bg-zinc-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#b91c1c] text-white rounded-[3px] hover:bg-[#991b1b] font-semibold"
                >
                  Lưu điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndividualEmulationBoard;
