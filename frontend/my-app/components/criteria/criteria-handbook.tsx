'use client';

import React, { useState } from 'react';
import { EmulationCriterion } from '@/lib/types';
import { Plus, Pencil, Trash2, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, X, ShieldAlert } from 'lucide-react';
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
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <span>Danh mục Tiêu chí Thi đua & Cẩm nang Quy chế</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Quy định các tiêu chuẩn chấm điểm thi đua hằng ngày của đơn vị. Chỉ huy có thẩm quyền cấu hình thang điểm và tiêu chí.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded transition shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm tiêu chí mới</span>
          </button>
        )}
      </div>

      {/* ── Summary Stats Strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 border border-zinc-200 rounded p-3 text-xs">
        <div>
          <span className="text-zinc-500 block">Tổng tiêu chí:</span>
          <span className="font-bold text-zinc-900 text-sm">{criteria.length} tiêu chí</span>
        </div>
        <div>
          <span className="text-zinc-500 block">Đang kích hoạt:</span>
          <span className="font-bold text-emerald-700 text-sm">{activeCriteria.length} tiêu chí</span>
        </div>
        <div>
          <span className="text-zinc-500 block">Tổng thang điểm ngày:</span>
          <span className="font-bold text-[#b91c1c] text-sm">{totalMaxScore} điểm</span>
        </div>
        <div>
          <span className="text-zinc-500 block">Quyền cấu hình:</span>
          <span className="font-bold text-zinc-800 text-sm">
            {canManage ? 'Chỉ huy (Được sửa)' : 'Chiến sĩ / Cán bộ (Chỉ xem)'}
          </span>
        </div>
      </div>

      {/* ── Criteria List ─────────────────────────────────────────────── */}
      <div className="space-y-6">
        {criteria.map((crit, idx) => (
          <div
            key={crit.id}
            className={`border rounded p-4 transition ${
              crit.isActive
                ? 'border-zinc-200 bg-white'
                : 'border-dashed border-zinc-300 bg-zinc-50 opacity-75'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {crit.code}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900">
                    {idx + 1}. {crit.name}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-[#b91c1c] border border-red-200">
                    Thang điểm: {crit.maxScore}
                  </span>
                  {crit.isActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Đang áp dụng
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3" />
                      Tạm ngưng
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 italic mt-1">{crit.description}</p>
              </div>

              {canManage && (
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                  <button
                    onClick={() => onToggleCriterion && onToggleCriterion(crit.id)}
                    title={crit.isActive ? 'Tạm ngưng tiêu chí này' : 'Kích hoạt tiêu chí này'}
                    className={`p-1.5 rounded border text-xs font-medium flex items-center gap-1 transition ${
                      crit.isActive
                        ? 'border-zinc-300 text-zinc-600 hover:bg-zinc-100'
                        : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {crit.isActive ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px]">Bật</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-zinc-400" />
                        <span className="text-[11px]">Tắt</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(crit)}
                    title="Chỉnh sửa tiêu chí"
                    className="p-1.5 rounded border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(crit)}
                    title="Xóa tiêu chí"
                    className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Deduction rules list */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wide block mb-1">
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

      {/* ── Modal Add / Edit Criterion ─────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-xl border border-zinc-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#b91c1c]" />
                <h3 className="font-bold text-zinc-900 text-sm">
                  {editingCriterion ? 'Chỉnh sửa Tiêu chí Thi đua' : 'Thêm Tiêu chí Thi đua Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded"
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
                  <label className="font-semibold text-zinc-700 block">
                    Thang điểm tối đa (chuẩn) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    required
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                  />
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
                    className="w-full px-3 py-1.5 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-red-600 focus:outline-none bg-white"
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
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded hover:bg-zinc-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded font-medium shadow-sm"
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
