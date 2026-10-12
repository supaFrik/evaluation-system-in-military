'use client';

import React, { useState, useMemo } from 'react';
import { EmulationAppeal, UserAccount, MilitaryUnit, Soldier } from '@/lib/types';
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Plus,
  Send,
  User,
  Shield,
  Building2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { notify } from '@/lib/notify';

interface AppealManagementProps {
  appeals: EmulationAppeal[];
  currentUser: UserAccount | null;
  units: MilitaryUnit[];
  soldiers: Soldier[];
  onCreateAppeal: (appeal: Omit<EmulationAppeal, 'id' | 'createdAt' | 'status'>) => Promise<any>;
  onResolveAppeal: (appealId: string, status: 'APPROVED' | 'REJECTED', reply: string) => Promise<any>;
}

export function AppealManagement({
  appeals = [],
  currentUser,
  units = [],
  soldiers = [],
  onCreateAppeal,
  onResolveAppeal,
}: AppealManagementProps) {
  const isSoldier = currentUser?.role === 'SOLDIER' || currentUser?.role === 'USER';
  const isScorer = currentUser?.role === 'SCORER';
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'COMMANDER' || String(currentUser?.role || '').includes('ADMIN');

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAppealForReply, setSelectedAppealForReply] = useState<EmulationAppeal | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state cho Chiến sĩ tạo khiếu nại
  const [newAppealReason, setNewAppealReason] = useState('');
  const [newAppealCriterionName, setNewAppealCriterionName] = useState('Chính trị tư tưởng');
  const [newAppealPoints, setNewAppealPoints] = useState<number>(-5);

  // Lọc appeals theo thẩm quyền vai trò (bao gồm kiểm tra phân cấp đơn vị cho SCORER)
  const roleScopedAppeals = useMemo(() => {
    let list = appeals;

    if (isSoldier && currentUser?.soldierId) {
      list = list.filter((a) => a.soldierId === currentUser.soldierId);
    } else if (isScorer) {
      const assignedIds =
        currentUser?.assignedUnitIds && currentUser.assignedUnitIds.length > 0
          ? currentUser.assignedUnitIds
          : currentUser?.assignedUnitId
          ? [currentUser.assignedUnitId]
          : [];

      if (assignedIds.length > 0) {
        const isUnitInAssignedScope = (targetUnitId?: string): boolean => {
          if (!targetUnitId) return false;
          if (assignedIds.includes(targetUnitId)) return true;
          let curr = units.find((u) => u.id === targetUnitId);
          const visited = new Set<string>();
          while (curr && curr.parentId && !visited.has(curr.id)) {
            visited.add(curr.id);
            if (assignedIds.includes(curr.parentId)) return true;
            curr = units.find((u) => u.id === curr!.parentId);
          }
          return false;
        };

        list = list.filter((a) => {
          if (isUnitInAssignedScope(a.unitId)) return true;
          const soldier = soldiers.find((s) => s.id === a.soldierId);
          if (!soldier) return false;
          return (
            isUnitInAssignedScope(soldier.squadId) ||
            isUnitInAssignedScope(soldier.platoonId) ||
            isUnitInAssignedScope(soldier.companyId) ||
            isUnitInAssignedScope(soldier.battalionId)
          );
        });
      }
    }

    return list;
  }, [appeals, isSoldier, isScorer, currentUser, units, soldiers]);

  // Lọc appeals theo bộ lọc trạng thái và từ khóa
  const visibleAppeals = useMemo(() => {
    let list = roleScopedAppeals;

    if (statusFilter !== 'ALL') {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.soldierName.toLowerCase().includes(term) ||
          a.reason.toLowerCase().includes(term) ||
          a.unitName.toLowerCase().includes(term) ||
          (a.criterionName && a.criterionName.toLowerCase().includes(term))
      );
    }

    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [roleScopedAppeals, statusFilter, searchTerm]);

  // Xử lý tạo khiếu nại (Chiến sĩ)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppealReason.trim()) {
      notify.error('Thiếu nội dung', 'Vui lòng nêu rõ lý do hoặc nội dung kiến nghị');
      return;
    }

    const matchedSoldier = soldiers.find((s) => s.id === currentUser?.soldierId);
    const soldierId = matchedSoldier?.id || currentUser?.soldierId || 's-me';
    const soldierName = matchedSoldier?.name || currentUser?.name || 'Tôi';
    const unitId = matchedSoldier?.squadId || matchedSoldier?.platoonId || currentUser?.assignedUnitId || 'C1-B1';

    const unit = units.find((u) => u.id === unitId);

    setIsSubmitting(true);
    try {
      await onCreateAppeal({
        soldierId,
        soldierName,
        unitId,
        unitName: unit?.name || matchedSoldier?.platoonName || 'Phân đội trực thuộc',
        date: new Date().toISOString().split('T')[0],
        criterionName: newAppealCriterionName,
        deductionPoints: Number(newAppealPoints),
        reason: newAppealReason.trim(),
      });
      setIsCreateModalOpen(false);
      setNewAppealReason('');
    } catch (err: any) {
      notify.error('Lỗi gửi khiếu nại', err?.message || 'Không thể tạo đơn');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý giải quyết khiếu nại (Cán bộ / Admin)
  const handleResolve = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedAppealForReply) return;
    if (!replyText.trim()) {
      notify.error('Thiếu ý kiến phản hồi', 'Vui lòng nhập nội dung trả lời quân nhân');
      return;
    }

    setIsSubmitting(true);
    try {
      await onResolveAppeal(selectedAppealForReply.id, status, replyText.trim());
      setSelectedAppealForReply(null);
      setReplyText('');
    } catch (err: any) {
      notify.error('Lỗi cập nhật', err?.message || 'Không thể lưu phản hồi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* ── Header Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {isSoldier ? 'Hòm thư khiếu nại' : 'Xử lý khiếu nại'}
          </h1>
        </div>

        {isSoldier && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-[3px] shadow-2xs transition cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Gửi khiếu nại</span>
          </button>
        )}
      </div>

      {/* ── Filters & Search ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
        <div className="relative flex-1">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm khiếu nại, tên chiến sĩ, phân đội..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#b91c1c]"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-[3px] bg-zinc-100 dark:bg-zinc-800 self-start sm:self-auto">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-[3px] text-xs transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-zinc-900 text-red-700 dark:text-red-400 font-semibold shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {st === 'ALL' && `Tất cả (${roleScopedAppeals.length})`}
              {st === 'PENDING' && `Chờ duyệt (${roleScopedAppeals.filter((a) => a.status === 'PENDING').length})`}
              {st === 'APPROVED' && `Chấp thuận (${roleScopedAppeals.filter((a) => a.status === 'APPROVED').length})`}
              {st === 'REJECTED' && `Bác bỏ (${roleScopedAppeals.filter((a) => a.status === 'REJECTED').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── List of Appeals ───────────────────────────────────────────── */}
      {visibleAppeals.length === 0 ? (
        <div className="rounded-[3px] border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500">
          <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Không có đơn khiếu nại nào</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-[3px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          {visibleAppeals.map((appeal) => (
            <div
              key={appeal.id}
              className="p-4 transition hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{appeal.soldierName}</span>
                  <span className="text-xs text-zinc-400">•</span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{appeal.unitName}</span>
                  <span className="text-xs text-zinc-400">•</span>
                  <span className="text-xs text-zinc-400 font-mono">Ngày {appeal.date}</span>
                </div>

                {/* Badge trạng thái nghiệp vụ */}
                <div>
                  {appeal.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                      <Clock className="h-3 w-3" /> Chờ xử lý
                    </span>
                  )}
                  {appeal.status === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                      <CheckCircle className="h-3 w-3" /> Đã duyệt
                    </span>
                  )}
                  {appeal.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                      <XCircle className="h-3 w-3" /> Bác bỏ
                    </span>
                  )}
                </div>
              </div>

              {/* Nội dung khiếu nại */}
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Tiêu chí:</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{appeal.criterionName || 'Chung'}</span>
                  {appeal.deductionPoints !== undefined && (
                    <span className="font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1 rounded-[3px] text-[11px] font-mono">
                      {appeal.deductionPoints}đ
                    </span>
                  )}
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-[3px] leading-relaxed border border-zinc-100 dark:border-zinc-800">
                  {appeal.reason}
                </p>
              </div>

              {/* Phản hồi từ cán bộ (nếu có) */}
              {appeal.reply && (
                <div className="p-2.5 rounded-[3px] bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-xs">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                    {appeal.resolvedBy || 'Cán bộ phụ trách'} phản hồi:
                  </span>
                  <p className="text-zinc-700 dark:text-zinc-300">{appeal.reply}</p>
                </div>
              )}

              {/* Action */}
              {(isScorer || isAdmin) && appeal.status === 'PENDING' && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppealForReply(appeal);
                      setReplyText('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#b91c1c] hover:bg-red-800 rounded-[3px] transition shadow-2xs cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Xử lý khiếu nại</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Tạo Khiếu Nại (Dành cho Quân nhân) ───────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[3px] max-w-lg w-full p-4 border border-zinc-300 dark:border-zinc-700 shadow-md space-y-3.5">
            <div className="flex items-center justify-between border-b pb-2.5 border-zinc-100 dark:border-zinc-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Gửi khiếu nại / Kiến nghị điểm số thi đua
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Tiêu chí kiến nghị:
                </label>
                <select
                  value={newAppealCriterionName}
                  onChange={(e) => setNewAppealCriterionName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:border-[#b91c1c] focus:outline-none"
                >
                  <option value="Chính trị tư tưởng">Chính trị tư tưởng</option>
                  <option value="Thực hiện nhiệm vụ & Huấn luyện">Thực hiện nhiệm vụ & Huấn luyện</option>
                  <option value="Nội vụ vệ sinh">Nội vụ vệ sinh</option>
                  <option value="Lễ tiết tác phong & Kỷ luật">Lễ tiết tác phong & Kỷ luật</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Mức điểm trừ khiếu nại:
                </label>
                <input
                  type="number"
                  value={newAppealPoints}
                  onChange={(e) => setNewAppealPoints(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:border-[#b91c1c] focus:outline-none font-mono"
                  placeholder="-5"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Lý do kiến nghị chi tiết: *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newAppealReason}
                  onChange={(e) => setNewAppealReason(e.target.value)}
                  placeholder="Trình bày rõ sự việc, thời điểm, nhân chứng hoặc lý do đồng chí nhận thấy điểm số chưa phản ánh đúng thực tế..."
                  className="w-full px-2.5 py-1.5 rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:border-[#b91c1c] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-[3px] border border-zinc-300 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-[3px] bg-[#b91c1c] hover:bg-red-800 text-white font-semibold cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đơn khiếu nại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Giải Quyết / Phản Hồi (Dành cho Cán bộ) ─────────────── */}
      {selectedAppealForReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[3px] max-w-lg w-full p-4 border border-zinc-300 dark:border-zinc-700 shadow-md space-y-3.5">
            <div className="flex items-center justify-between border-b pb-2.5 border-zinc-100 dark:border-zinc-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Xử lý khiếu nại: {selectedAppealForReply.soldierName} ({selectedAppealForReply.unitName})
              </h2>
              <button
                type="button"
                onClick={() => setSelectedAppealForReply(null)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-[3px] border border-zinc-200 dark:border-zinc-700">
              <span className="font-semibold block text-zinc-500 mb-0.5">Nội dung chiến sĩ gửi:</span>
              <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">{selectedAppealForReply.reason}</p>
            </div>

            <div className="text-xs space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Ý kiến kết luận & Phản hồi: *
              </label>
              <textarea
                rows={4}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập nội dung giải thích, kết quả thẩm tra xác minh và quyết định điều chỉnh hoặc giữ nguyên điểm..."
                className="w-full px-2.5 py-1.5 rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:border-[#b91c1c] focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedAppealForReply(null)}
                className="px-3 py-1.5 text-xs rounded-[3px] border border-zinc-300 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleResolve('REJECTED')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-[3px] border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer disabled:opacity-50"
                >
                  Bác bỏ khiếu nại
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleResolve('APPROVED')}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-[3px] bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  Chấp thuận & Điều chỉnh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
