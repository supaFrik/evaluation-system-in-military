'use client';

import React, { useState } from 'react';
import { CommendationItem } from '@/lib/types';
import { Plus, Award, AlertTriangle, Calendar } from 'lucide-react';

interface CommendationSectionProps {
  commendations: CommendationItem[];
  onOpenAddModal: () => void;
  canAdd: boolean;
}

export function CommendationSection({
  commendations,
  onOpenAddModal,
  canAdd,
}: CommendationSectionProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'COMMENDATION' | 'REMINDER'>('ALL');

  const filtered = commendations.filter((c) => {
    if (filterType === 'COMMENDATION') return c.type === 'COMMENDATION';
    if (filterType === 'REMINDER') return c.type === 'REMINDER';
    return true;
  });

  const commendationList = commendations.filter((c) => c.type === 'COMMENDATION');
  const reminderList = commendations.filter((c) => c.type === 'REMINDER');

  return (
    <div className="w-full max-w-5xl py-2 space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Biểu dương & Nhắc nhở
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Ghi nhận các gương người tốt, việc tốt và những khuyết điểm cần chấn chỉnh hằng ngày
          </p>
        </div>

        {canAdd && (
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded bg-[#b91c1c] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-800 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Ghi nhận mới
          </button>
        )}
      </div>

      {/* 2. Section 1: Biểu dương cá nhân / tập thể tiêu biểu */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-emerald-600 pb-2">
          <Award className="h-4 w-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">
            Cá nhân / Tập thể tiêu biểu (Biểu dương)
          </h3>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {commendationList.length}
          </span>
        </div>

        <div className="divide-y divide-zinc-200 border-b border-zinc-200">
          {commendationList.length === 0 ? (
            <p className="py-4 text-xs text-zinc-500 italic">Chưa có ghi nhận biểu dương nào.</p>
          ) : (
            commendationList.map((item) => (
              <div key={item.id} className="py-3.5 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-zinc-900 text-sm">
                    {item.targetName}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3 text-zinc-400" />
                      {item.date}
                    </span>
                    <span>{item.createdBy}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed pl-0.5">
                  {item.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Section 2: Vấn đề cần khắc phục, nhắc nhở */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 border-b border-amber-600 pb-2">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
            Vấn đề cần khắc phục (Nhắc nhở)
          </h3>
          <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {reminderList.length}
          </span>
        </div>

        <div className="divide-y divide-zinc-200 border-b border-zinc-200">
          {reminderList.length === 0 ? (
            <p className="py-4 text-xs text-zinc-500 italic">Chưa có ghi nhận nhắc nhở nào.</p>
          ) : (
            reminderList.map((item) => (
              <div key={item.id} className="py-3.5 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-zinc-900 text-sm">
                    {item.targetName}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3 text-zinc-400" />
                      {item.date}
                    </span>
                    <span>{item.createdBy}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed pl-0.5">
                  {item.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
