'use client';

import React, { useState } from 'react';
import { EmulationCriterion } from '@/lib/types';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  X,
  ShieldAlert,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { notify } from '@/lib/notify';

interface CriteriaHandbookProps {
  criteria: EmulationCriterion[];
  canManage?: boolean;
  onAddCriterion?: (criterion: Omit<EmulationCriterion, 'id'>) => void;
  onUpdateCriterion?: (criterion: EmulationCriterion) => void;
  onDeleteCriterion?: (criterionId: string) => void;
  onToggleCriterion?: (criterionId: string) => void;
}

export function CriteriaHandbook({
  criteria,
  canManage = false,
  onAddCriterion,
  onUpdateCriterion,
  onDeleteCriterion,
  onToggleCriterion,
}: CriteriaHandbookProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<EmulationCriterion | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    maxScore: number;
    description: string;
    category: 'CHINH_TRI' | 'QUAN_SU' | 'HAU_CAN' | 'KY_LUAT' | 'KHAC';
    deductionRulesText: string;
    isActive: boolean;
  }>({
    name: '',
    code: '',
    maxScore: 100,
    description: '',
    category: 'QUAN_SU',
    deductionRulesText: '',
    isActive: true,
  });

  const activeCriteria = criteria.filter((c) => c.isActive);
  const totalMaxScore = activeCriteria.reduce((sum, c) => sum + c.maxScore, 0);

  const openCreateModal = () => {
    setEditingCriterion(null);
    setFormData({
      name: '',
      code: '',
      maxScore: 100,
      description: '',
      category: 'QUAN_SU',
      deductionRulesText: '- Vi phạm nội dung 1 (-5đ)\n- Vi phạm nội dung 2 (-10đ)',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (crit: EmulationCriterion) => {
    setEditingCriterion(crit);
    setFormData({
      name: crit.name,
      code: crit.code,
      maxScore: crit.maxScore,
      description: crit.description,
      category: crit.category || 'QUAN_SU',
      deductionRulesText: crit.deductionRules.join('\n'),
      isActive: crit.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      notify.error('Thiếu thông tin', 'Vui lòng nhập tên tiêu chí và mã ký hiệu.');
      return;
    }

    const rules = formData.deductionRulesText
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (editingCriterion) {
      if (onUpdateCriterion) {
        onUpdateCriterion({
          ...editingCriterion,
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          maxScore: Number(formData.maxScore) || 100,
          description: formData.description.trim(),
          category: formData.category,
          deductionRules: rules,
          isActive: formData.isActive,
        });
        notify.success('Cập nhật thành công', `Đã chỉnh sửa tiêu chí "${formData.name}".`);
      }
    } else {
      if (onAddCriterion) {
        onAddCriterion({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          maxScore: Number(formData.maxScore) || 100,
          description: formData.description.trim(),
          category: formData.category,
          deductionRules: rules,
          isActive: formData.isActive,
        });
        notify.success('Thêm tiêu chí thành công', `Đã bổ sung tiêu chí "${formData.name}".`);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (crit: EmulationCriterion) => {
    if (criteria.length <= 1) {
      notify.error('Không thể xóa', 'Hệ thống cần duy trì ít nhất 1 tiêu chí thi đua.');
      return;
    }
    if (confirm(`Đồng chí có chắc chắn muốn xóa tiêu chí thi đua: "${crit.name}"?`)) {
      if (onDeleteCriterion) {
        onDeleteCriterion(crit.id);
        notify.info('Đã xóa tiêu chí', `Đã loại bỏ tiêu chí "${crit.name}" khỏi danh mục.`);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl py-2 space-y-6">
      {/* ── Actions & Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Quy chế & Tiêu chí thi đua
        </h1>

        {canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-2xs transition btn-tactile cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm tiêu chí</span>
          </button>
        )}
      </div>

      {/* ── Summary Stats Plain Metrics ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2 border-y border-zinc-100 dark:border-zinc-800">
        <div>
          <span className="text-zinc-500 text-xs font-medium block mb-0.5">Tổng tiêu chí</span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {criteria.length} <span className="text-xs font-normal text-zinc-400">tiêu chí</span>
          </div>
        </div>
        <div>
          <span className="text-zinc-500 text-xs font-medium block mb-0.5">Đang áp dụng</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeCriteria.length} <span className="text-xs font-normal text-zinc-400">tiêu chí</span>
          </div>
        </div>
        <div>
          <span className="text-zinc-500 text-xs font-medium block mb-0.5">Tổng thang điểm</span>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">
            {totalMaxScore} <span className="text-xs font-normal text-zinc-400">điểm</span>
          </div>
        </div>
      </div>

      {/* ── Criteria List ─────────────────────────────────────────────── */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {criteria.map((crit, idx) => (
          <div
            key={crit.id}
            className={`p-4 transition ${
              crit.isActive ? 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30' : 'bg-zinc-50/70 dark:bg-zinc-900/70 opacity-70'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-zinc-500 font-semibold">
                    [{crit.code}]
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {idx + 1}. {crit.name}
                  </h3>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">
                    {crit.maxScore}đ
                  </span>
                  {crit.isActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Áp dụng
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                      <AlertCircle className="w-3 h-3" />
                      Tạm ngưng
                    </span>
                  )}
                </div>
                {crit.description && (
                  <p className="text-xs text-zinc-500">{crit.description}</p>
                )}
              </div>

              {canManage && (
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          aria-label="Thao tác"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => onToggleCriterion && onToggleCriterion(crit.id)}
                        className="cursor-pointer text-xs"
                      >
                        {crit.isActive ? (
                          <>
                            <ToggleLeft className="h-3.5 w-3.5 mr-2 text-zinc-500" />
                            <span>Tạm ngưng tiêu chí</span>
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                            <span>Kích hoạt tiêu chí</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditModal(crit)} className="cursor-pointer text-xs">
                        <Pencil className="h-3.5 w-3.5 mr-2 text-zinc-500" />
                        <span>Chỉnh sửa tiêu chí</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(crit)}
                        className="cursor-pointer text-xs text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        <span>Xóa tiêu chí</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Deduction rules list */}
            <div className="mt-3">
              <span className="text-xs font-semibold text-zinc-700 tracking-wide block mb-1">
                Các nội dung kiểm tra & quy định trừ/cộng điểm:
              </span>
              {crit.deductionRules && crit.deductionRules.length > 0 ? (
                <ul className="space-y-1 text-xs text-zinc-600 pl-4 list-disc">
                  {crit.deductionRules.map((rule, rIdx) => (
                    <li key={rIdx}>{rule}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-400 italic">Chưa có quy định trừ điểm chi tiết.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal Add / Edit Criterion (Bottom sheet on mobile) ───────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-in fade-in backdrop-blur-xs">
          <div className="bg-white rounded-t-[4px] sm:rounded-[3px] shadow-md border border-zinc-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[92dvh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Mobile pull handle */}
            <div className="mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-zinc-300 sm:hidden" />
            <div className="flex items-center justify-between border-b border-zinc-200 p-4 bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#b91c1c]" />
                <h3 className="font-bold text-zinc-900 text-sm">
                  {editingCriterion ? 'Chỉnh sửa Tiêu chí Thi đua' : 'Thêm Tiêu chí Thi đua Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded cursor-pointer btn-tactile"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-zinc-700 block">
                    Tên tiêu chí thi đua <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Huấn luyện Thể lực & Bơi"
                    className="w-full px-3 py-1.5 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 block">
                    Mã ký hiệu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="VD: HLTL"
                    className="w-full px-3 py-1.5 border border-zinc-300 rounded text-xs uppercase focus:ring-1 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-zinc-700 block">
                      Thang điểm tối đa <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    required
                    placeholder="Nhập thang điểm (VD: 20, 25, 50, 100...)"
                    value={formData.maxScore === 0 ? '' : formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-zinc-300 rounded text-xs font-mono font-bold text-zinc-900 focus:ring-1 focus:ring-red-600 focus:outline-none"
                  />
                  <div className="flex items-center gap-1 pt-1 flex-wrap">
                    <span className="text-[10.5px] text-zinc-400">Gợi ý nhanh:</span>
                    {[20, 25, 50, 100, 200].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setFormData({ ...formData, maxScore: score })}
                        className={`px-1.5 py-0.5 rounded-[2px] border font-mono text-[10.5px] btn-tactile cursor-pointer transition-colors ${
                          formData.maxScore === score
                            ? 'bg-[#b91c1c] text-white border-[#b91c1c] font-bold'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        {score}đ
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 block">Phân nhóm lĩnh vực</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as 'CHINH_TRI' | 'QUAN_SU' | 'HAU_CAN' | 'KY_LUAT' | 'KHAC',
                      })
                    }
                    className="w-full px-3 py-1.5 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-red-600 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="CHINH_TRI">Chính trị, tư tưởng</option>
                    <option value="QUAN_SU">Quân sự, huấn luyện</option>
                    <option value="HAU_CAN">Hậu cần, kỹ thuật, nội vụ</option>
                    <option value="KY_LUAT">Kỷ luật, điều lệnh, tác phong</option>
                    <option value="KHAC">Khác</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 block">Mô tả & Hướng dẫn đánh giá</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả mục tiêu, yêu cầu cần đạt được..."
                  className="w-full px-3 py-1.5 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 block">
                  Quy định các lỗi trừ điểm thường gặp (Mỗi lỗi 1 dòng)
                </label>
                <textarea
                  rows={4}
                  value={formData.deductionRulesText}
                  onChange={(e) => setFormData({ ...formData, deductionRulesText: e.target.value })}
                  placeholder="- Điểm danh muộn (-5đ)&#10;- Không đạt chỉ tiêu bơi (-10đ)"
                  className="w-full px-3 py-1.5 border border-zinc-300 rounded text-xs font-mono focus:ring-1 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="isActiveCheck" className="text-xs text-zinc-700 font-medium">
                  Kích hoạt áp dụng tiêu chí này ngay từ hôm nay
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded hover:bg-zinc-50 btn-tactile cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded font-medium shadow-sm btn-tactile cursor-pointer"
                >
                  {editingCriterion ? 'Lưu thay đổi' : 'Tạo tiêu chí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
