'use client';

import React, { useState } from 'react';
import { PlatoonAggregate } from '@/lib/types';
import { Calendar, Trophy, ChevronRight } from 'lucide-react';

interface PlatoonSummaryTableProps {
  aggregates: PlatoonAggregate[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onSelectPlatoon?: (platoonId: string) => void;
}

export function PlatoonSummaryTable({
  aggregates,
  selectedDate,
  onChangeDate,
  onSelectPlatoon,
}: PlatoonSummaryTableProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Find ranks
  const sorted = [...aggregates].sort((a, b) => b.avgTotal - a.avgTotal);

  return (
    <div className="w-full max-w-5xl py-2 space-y-6">
      {/* 1. Page Title & Action/Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Bảng Tổng hợp Kết quả Thi đua
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Tổng hợp và đánh giá thi đua giữa Trung đội 1, Trung đội 2 và Trung đội 3
          </p>
        </div>

        {/* View Mode & Date Selector */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded border border-zinc-200 p-0.5 bg-zinc-100 text-xs">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded transition-colors font-medium ${
                viewMode === 'day'
                  ? 'bg-white text-[#b91c1c] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Theo ngày
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded transition-colors font-medium ${
                viewMode === 'week'
                  ? 'bg-white text-[#b91c1c] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Tổng hợp tuần
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onChangeDate(e.target.value)}
              className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 focus:outline-none focus:border-[#b91c1c]"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Emulation Summary Table (Clean & Formal) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border border-zinc-200 border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-700 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">STT</th>
              <th className="py-3 px-4">Tiêu chí đánh giá</th>
              <th className="py-3 px-4 text-center">Trung đội 1</th>
              <th className="py-3 px-4 text-center">Trung đội 2</th>
              <th className="py-3 px-4 text-center">Trung đội 3</th>
              <th className="py-3 px-4">Đánh giá chung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-sm">
            {/* Row 1: Political */}
            <tr className="hover:bg-zinc-50/50">
              <td className="py-3 px-4 text-center text-xs text-zinc-500 font-mono">1</td>
              <td className="py-3 px-4 font-medium text-zinc-800">
                1. Chất lượng chính trị (100đ)
                <span className="block text-xs font-normal text-zinc-500 mt-0.5">
                  Nhận thức tư tưởng, học tập, chấp hành kỷ luật
                </span>
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td1')?.avgPolitical || 0}/100
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td2')?.avgPolitical || 0}/100
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td3')?.avgPolitical || 0}/100
              </td>
              <td className="py-3 px-4 text-xs text-zinc-600">
                Trung đội 2 nhận thức chính trị đồng đều, khá giỏi cao
              </td>
            </tr>

            {/* Row 2: Task */}
            <tr className="hover:bg-zinc-50/50">
              <td className="py-3 px-4 text-center text-xs text-zinc-500 font-mono">2</td>
              <td className="py-3 px-4 font-medium text-zinc-800">
                2. Thực hiện nhiệm vụ (100đ)
                <span className="block text-xs font-normal text-zinc-500 mt-0.5">
                  Huấn luyện quân sự, lao động, trực ban tuần tra
                </span>
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td1')?.avgTask || 0}/100
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td2')?.avgTask || 0}/100
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td3')?.avgTask || 0}/100
              </td>
              <td className="py-3 px-4 text-xs text-zinc-600">
                Trung đội 3 hoàn thành xuất sắc ca gác đêm và huấn luyện
              </td>
            </tr>

            {/* Row 3: Hygiene */}
            <tr className="hover:bg-zinc-50/50">
              <td className="py-3 px-4 text-center text-xs text-zinc-500 font-mono">3</td>
              <td className="py-3 px-4 font-medium text-zinc-800">
                3. Nội vụ, vệ sinh (100đ)
                <span className="block text-xs font-normal text-zinc-500 mt-0.5">
                  Gấp chăn màn vuông vắn, sắp đặt ba lô, vệ sinh doanh trại
                </span>
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td1')?.avgHygiene || 0}/100
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td2')?.avgHygiene || 0}/100
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td3')?.avgHygiene || 0}/100
              </td>
              <td className="py-3 px-4 text-xs text-zinc-600">
                Trung đội 1 gấp chăn màn vuông, đẹp, nền nếp nhất
              </td>
            </tr>

            {/* Row 4: Bearing */}
            <tr className="hover:bg-zinc-50/50">
              <td className="py-3 px-4 text-center text-xs text-zinc-500 font-mono">4</td>
              <td className="py-3 px-4 font-medium text-zinc-800">
                4. Lễ tiết tác phong (100đ)
                <span className="block text-xs font-normal text-zinc-500 mt-0.5">
                  Mang mặc quân phục, xưng hô điều lệnh, đầu tóc 3 phân
                </span>
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td1')?.avgBearing || 0}/100
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td2')?.avgBearing || 0}/100
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-zinc-800">
                {aggregates.find((a) => a.platoonId === 'td3')?.avgBearing || 0}/100
              </td>
              <td className="py-3 px-4 text-xs text-zinc-600">
                Toàn đơn vị duy trì tốt, đồng đều, nghiêm túc
              </td>
            </tr>

            {/* Total Row */}
            <tr className="bg-zinc-50/80 font-bold border-t-2 border-zinc-300">
              <td className="py-3 px-4 text-center text-xs text-zinc-500">∑</td>
              <td className="py-3 px-4 text-zinc-900 uppercase tracking-wide">
                TỔNG ĐIỂM (400đ)
              </td>
              <td className="py-3 px-4 text-center font-mono text-base text-[#b91c1c]">
                {aggregates.find((a) => a.platoonId === 'td1')?.avgTotal || 0}
              </td>
              <td className="py-3 px-4 text-center font-mono text-base text-[#b91c1c]">
                {aggregates.find((a) => a.platoonId === 'td2')?.avgTotal || 0}
              </td>
              <td className="py-3 px-4 text-center font-mono text-base text-[#b91c1c]">
                {aggregates.find((a) => a.platoonId === 'td3')?.avgTotal || 0}
              </td>
              <td className="py-3 px-4 text-xs text-zinc-500 italic">
                Cập nhật ngày {selectedDate}
              </td>
            </tr>

            {/* Rank Row */}
            <tr className="bg-white font-semibold">
              <td className="py-3 px-4 text-center text-xs text-zinc-500">🏆</td>
              <td className="py-3 px-4 text-zinc-900 uppercase tracking-wide">
                XẾP HẠNG THI ĐUA
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
                  ★ Hạng {sorted.findIndex((s) => s.platoonId === 'td1') + 1}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded">
                  Hạng {sorted.findIndex((s) => s.platoonId === 'td2') + 1}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded">
                  Hạng {sorted.findIndex((s) => s.platoonId === 'td3') + 1}
                </span>
              </td>
              <td className="py-3 px-4 text-xs text-zinc-600">
                Đơn vị dẫn đầu: <strong className="text-[#b91c1c]">{sorted[0]?.platoonName}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Detailed Remarks Per Platoon (Flat simple list) */}
      <div className="pt-2">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wider">
          Tình hình mạnh / yếu của từng Trung đội
        </h3>
        <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
          {aggregates.map((p) => (
            <div key={p.platoonId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900">{p.platoonName}</span>
                  <span className="text-xs text-zinc-500">({p.totalSoldiers} quân nhân)</span>
                  <span className="text-xs font-mono font-semibold text-[#b91c1c]">
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
                  className="inline-flex items-center gap-1 text-xs text-[#b91c1c] hover:underline shrink-0"
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
