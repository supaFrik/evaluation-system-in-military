'use client';

import React, { useState } from 'react';
import { PlatoonAggregate, EmulationCriterion, DailyLockStatus } from '@/lib/types';
import { Calendar, Lock, Unlock, ChevronRight } from 'lucide-react';

interface PlatoonSummaryTableProps {
  aggregates: PlatoonAggregate[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onSelectPlatoon?: (platoonId: string) => void;
  criteria?: EmulationCriterion[];
  lockStatus?: DailyLockStatus;
}

export function PlatoonSummaryTable({
  aggregates,
  selectedDate,
  onChangeDate,
  onSelectPlatoon,
  criteria = [],
  lockStatus,
}: PlatoonSummaryTableProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const activeCriteria = criteria.filter((c) => c.isActive);
  const totalMaxScore = activeCriteria.reduce((sum, c) => sum + c.maxScore, 0) || 400;

  // Find ranks
  const sorted = [...aggregates].sort((a, b) => b.avgTotal - a.avgTotal);

  const td1 = aggregates.find((a) => a.platoonId === 'td1');
  const td2 = aggregates.find((a) => a.platoonId === 'td2');
  const td3 = aggregates.find((a) => a.platoonId === 'td3');

  const getScoreForCrit = (agg: PlatoonAggregate | undefined, crit: EmulationCriterion) => {
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

  return (
    <div className="w-full max-w-5xl py-2 space-y-6">
      {/* 1. Page Title & Action/Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <span>Bảng Tổng hợp Kết quả Thi đua</span>
            {lockStatus && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                  lockStatus.isLocked
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}
                title={lockStatus.lockNote}
              >
                {lockStatus.isLocked ? (
                  <>
                    <Lock className="w-3 h-3" />
                    Đã duyệt chốt sổ 21:00
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3" />
                    Đang mở chấm điểm
                  </>
                )}
              </span>
            )}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Tổng hợp và đánh giá thi đua giữa Trung đội 1, Trung đội 2 và Trung đội 3 theo các tiêu chí chuẩn.
          </p>
        </div>

        {/* View Mode & Date Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded border border-zinc-300 p-0.5 bg-zinc-100 text-xs">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded transition-colors font-semibold ${
                viewMode === 'day'
                  ? 'bg-white text-[#b91c1c] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Theo ngày
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded transition-colors font-semibold ${
                viewMode === 'week'
                  ? 'bg-white text-[#b91c1c] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Tổng hợp tuần
            </button>
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
      </div>

      {/* 2. Main Emulation Summary Table (Clean & Formal) */}
      <div className="overflow-x-auto border border-zinc-200 rounded-lg shadow-xs">
        <table className="w-full text-left text-sm border-collapse bg-white">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-100/80 text-xs text-zinc-800 font-bold uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">STT</th>
              <th className="py-3 px-4 min-w-[200px]">Tiêu chí đánh giá</th>
              <th className="py-3 px-4 text-center">Trung đội 1</th>
              <th className="py-3 px-4 text-center">Trung đội 2</th>
              <th className="py-3 px-4 text-center">Trung đội 3</th>
              <th className="py-3 px-4 min-w-[180px]">Nhận xét đánh giá</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-sm">
            {activeCriteria.length > 0 ? (
              activeCriteria.map((crit, idx) => (
                <tr key={crit.id} className="hover:bg-zinc-50/70">
                  <td className="py-3 px-4 text-center text-xs text-zinc-500 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-zinc-900">
                    {crit.name} ({crit.maxScore}đ)
                    <span className="block text-xs font-normal text-zinc-500 mt-0.5 italic truncate max-w-md">
                      {crit.description}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-800">
                    {getScoreForCrit(td1, crit)}/{crit.maxScore}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-800">
                    {getScoreForCrit(td2, crit)}/{crit.maxScore}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-800">
                    {getScoreForCrit(td3, crit)}/{crit.maxScore}
                  </td>
                  <td className="py-3 px-4 text-xs text-zinc-600">
                    {idx === 0 && 'Nhận thức chính trị đồng đều, tư tưởng an tâm'}
                    {idx === 1 && 'Duy trì nghiêm kỷ luật huấn luyện, gác tuần tra'}
                    {idx === 2 && 'Nội vụ vệ sinh vuông thành sắc cạnh'}
                    {idx >= 3 && 'Chấp hành nghiêm điều lệnh quản lý bộ đội'}
                  </td>
                </tr>
              ))
            ) : (
              // Fallback default 4 rows if no criteria loaded
              <>
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-3 px-4 text-center text-xs text-zinc-500 font-mono">1</td>
                  <td className="py-3 px-4 font-medium text-zinc-800">
                    1. Chất lượng chính trị (100đ)
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                    {td1?.avgPolitical || 0}/100
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                    {td2?.avgPolitical || 0}/100
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                    {td3?.avgPolitical || 0}/100
                  </td>
                  <td className="py-3 px-4 text-xs text-zinc-600">
                    Nhận thức chính trị đồng đều, tư tưởng tốt
                  </td>
                </tr>
              </>
            )}

            {/* Total Row */}
            <tr className="bg-zinc-100 font-bold border-t-2 border-zinc-300">
              <td className="py-3 px-4 text-center text-xs text-zinc-600">∑</td>
              <td className="py-3 px-4 text-zinc-900 uppercase tracking-wide">
                TỔNG ĐIỂM ({totalMaxScore}đ)
              </td>
              <td className="py-3 px-4 text-center font-mono text-base text-[#b91c1c]">
                {td1?.avgTotal || 0}
              </td>
              <td className="py-3 px-4 text-center font-mono text-base text-[#b91c1c]">
                {td2?.avgTotal || 0}
              </td>
              <td className="py-3 px-4 text-center font-mono text-base text-[#b91c1c]">
                {td3?.avgTotal || 0}
              </td>
              <td className="py-3 px-4 text-xs text-zinc-600 italic">
                Cập nhật ngày {selectedDate}
              </td>
            </tr>

            {/* Rank Row */}
            <tr className="bg-white font-bold border-t border-zinc-200">
              <td className="py-3 px-4 text-center text-xs text-zinc-500">🏆</td>
              <td className="py-3 px-4 text-zinc-900 uppercase tracking-wide">
                XẾP HẠNG THI ĐUA
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded border ${
                    sorted.findIndex((s) => s.platoonId === 'td1') === 0
                      ? 'text-[#b91c1c] bg-red-50 border-red-200'
                      : 'text-zinc-700 bg-zinc-100 border-zinc-300'
                  }`}
                >
                  ★ Hạng {sorted.findIndex((s) => s.platoonId === 'td1') + 1}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded border ${
                    sorted.findIndex((s) => s.platoonId === 'td2') === 0
                      ? 'text-[#b91c1c] bg-red-50 border-red-200'
                      : 'text-zinc-700 bg-zinc-100 border-zinc-300'
                  }`}
                >
                  ★ Hạng {sorted.findIndex((s) => s.platoonId === 'td2') + 1}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded border ${
                    sorted.findIndex((s) => s.platoonId === 'td3') === 0
                      ? 'text-[#b91c1c] bg-red-50 border-red-200'
                      : 'text-zinc-700 bg-zinc-100 border-zinc-300'
                  }`}
                >
                  ★ Hạng {sorted.findIndex((s) => s.platoonId === 'td3') + 1}
                </span>
              </td>
              <td className="py-3 px-4 text-xs text-zinc-700">
                Đơn vị dẫn đầu: <strong className="text-[#b91c1c]">{sorted[0]?.platoonName || 'TĐ1'}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Detailed Remarks Per Platoon (Flat simple list) */}
      <div className="pt-2">
        <h3 className="text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wider">
          Tình hình mạnh / yếu của từng Trung đội
        </h3>
        <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
          {aggregates.map((p) => (
            <div key={p.platoonId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900">{p.platoonName}</span>
                  <span className="text-xs text-zinc-500">({p.totalSoldiers} quân nhân)</span>
                  <span className="text-xs font-mono font-bold text-[#b91c1c]">
                    Tổng: {p.avgTotal} điểm — Hạng {p.rank}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {p.generalRemark}
                </p>
              </div>

              {onSelectPlatoon && (
                <button
                  onClick={() => onSelectPlatoon(p.platoonId)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#b91c1c] hover:underline shrink-0"
                >
                  Xem danh sách quân nhân
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
