'use client';

import React, { useState } from 'react';
import { CommendationItem } from '@/lib/types';
import { Plus, Award, AlertTriangle, Calendar, Pencil, Trash2, X, Search } from 'lucide-react';
import { notify } from '@/lib/notify';

interface CommendationSectionProps {
  commendations: CommendationItem[];
  onOpenAddModal: () => void;
  canAdd: boolean;
  canManage?: boolean;
  onUpdateCommendation?: (item: CommendationItem) => void;
  onDeleteCommendation?: (id: string) => void;
}

export function CommendationSection({
  commendations,
  onOpenAddModal,
  canAdd,
  canManage = false,
  onUpdateCommendation,
  onDeleteCommendation,
}: CommendationSectionProps) {
  const [editingItem, setEditingItem] = useState<CommendationItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'COMMENDATION' | 'REMINDER'>('ALL');

  const filteredItems = commendations.filter((c) => {
    const matchQuery =
      searchQuery.trim() === '' ||
      c.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchQuery;
  });

  const commendationList = filteredItems.filter((c) => c.type === 'COMMENDATION');
  const reminderList = filteredItems.filter((c) => c.type === 'REMINDER');

  const totalCommendations = commendations.filter((c) => c.type === 'COMMENDATION').length;
  const totalReminders = commendations.filter((c) => c.type === 'REMINDER').length;

  const handleDelete = (item: CommendationItem) => {
    if (window.confirm(`Xác nhận xóa ghi nhận đối với "${item.targetName}"?`)) {
      onDeleteCommendation?.(item.id);
      notify.success('Đã xóa ghi nhận', `Đã xóa bản ghi của ${item.targetName}`);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateCommendation?.(editingItem);
    notify.success('Cập nhật thành công', `Đã lưu thay đổi ghi nhận của ${editingItem.targetName}`);
    setEditingItem(null);
  };

  return (
    <div className="w-full max-w-5xl py-2 space-y-6">
      {/* 1. Thanh công cụ điều hành thi đua: Tìm kiếm + Bộ lọc + Thêm mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 p-2.5 rounded-[4px] shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Ô tìm kiếm */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên quân nhân, nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-800 placeholder:text-zinc-400"
            />
          </div>

          {/* Bộ lọc loại ghi nhận */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-[3px] border transition-colors btn-tactile cursor-pointer shrink-0 ${
                typeFilter === 'ALL'
                  ? 'bg-zinc-800 text-white border-zinc-800'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              Tất cả ({commendations.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('COMMENDATION')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-[3px] border transition-colors btn-tactile cursor-pointer shrink-0 ${
                typeFilter === 'COMMENDATION'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <Award className="w-3 h-3" />
              <span>Biểu dương ({totalCommendations})</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('REMINDER')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-[3px] border transition-colors btn-tactile cursor-pointer shrink-0 ${
                typeFilter === 'REMINDER'
                  ? 'bg-[#991b1b] text-white border-[#991b1b]'
                  : 'bg-white text-[#991b1b] border-red-200 hover:bg-red-50'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Nhắc nhở ({totalReminders})</span>
            </button>
          </div>
        </div>

        {canAdd && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-[3px] bg-[#b91c1c] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-800 transition-colors shadow-xs btn-tactile cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Ghi nhận mới</span>
          </button>
        )}
      </div>

      {/* 2. Section 1: Biểu dương cá nhân / tập thể tiêu biểu */}
      {typeFilter !== 'REMINDER' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
            <Award className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Cá nhân / Tập thể tiêu biểu (Biểu dương)
            </h3>
            <span className="rounded-[3px] border border-emerald-200 bg-emerald-50 px-1.5 py-0.2 font-mono text-xs font-semibold text-emerald-800">
              {commendationList.length}
            </span>
          </div>

          <div className="divide-y divide-zinc-200 border-b border-zinc-200">
            {commendationList.length === 0 ? (
              <p className="py-4 text-xs text-zinc-500 italic">
                {searchQuery ? 'Không tìm thấy ghi nhận biểu dương phù hợp với từ khóa.' : 'Chưa có ghi nhận biểu dương nào.'}
              </p>
            ) : (
              commendationList.map((item) => (
                <div key={item.id} className="py-3.5 space-y-1.5 group">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 text-sm">
                        {item.targetName}
                      </span>
                      <span className="inline-block rounded-[3px] border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-800">
                        ★ Biểu dương
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3 text-zinc-400" />
                        {item.date}
                      </span>
                      <span>{item.createdBy}</span>
                      {canManage && (
                        <div className="flex items-center gap-1.5 ml-2 border-l border-zinc-200 pl-2">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors btn-tactile cursor-pointer"
                            title="Chỉnh sửa ghi nhận"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors btn-tactile cursor-pointer"
                            title="Xóa ghi nhận"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
      )}

      {/* 3. Section 2: Vấn đề cần khắc phục, nhắc nhở */}
      {typeFilter !== 'COMMENDATION' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Vấn đề cần khắc phục (Nhắc nhở)
            </h3>
            <span className="rounded-[3px] border border-red-200 bg-red-50 px-1.5 py-0.2 font-mono text-xs font-semibold text-[#991b1b]">
              {reminderList.length}
            </span>
          </div>

          <div className="divide-y divide-zinc-200 border-b border-zinc-200">
            {reminderList.length === 0 ? (
              <p className="py-4 text-xs text-zinc-500 italic">
                {searchQuery ? 'Không tìm thấy ghi nhận nhắc nhở phù hợp với từ khóa.' : 'Chưa có ghi nhận nhắc nhở nào.'}
              </p>
            ) : (
              reminderList.map((item) => (
                <div key={item.id} className="py-3.5 space-y-1.5 group">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 text-sm">
                        {item.targetName}
                      </span>
                      <span className="inline-block rounded-[3px] border border-red-300 bg-red-50 px-1.5 py-0.5 text-xs font-bold text-[#991b1b]">
                        ⚠ Nhắc nhở
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3 text-zinc-400" />
                        {item.date}
                      </span>
                      <span>{item.createdBy}</span>
                      {canManage && (
                        <div className="flex items-center gap-1.5 ml-2 border-l border-zinc-200 pl-2">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors btn-tactile cursor-pointer"
                            title="Chỉnh sửa ghi nhận"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors btn-tactile cursor-pointer"
                            title="Xóa ghi nhận"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
      )}

      {/* 4. Edit Commendation Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[4px] border border-zinc-300 shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50">
              <h3 className="font-semibold text-zinc-900 text-sm flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#b91c1c]" />
                Chỉnh sửa Ghi nhận Thi đua
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded cursor-pointer btn-tactile"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Loại ghi nhận</label>
                <select
                  value={editingItem.type}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      type: e.target.value as 'COMMENDATION' | 'REMINDER',
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 bg-white"
                >
                  <option value="COMMENDATION">★ Biểu dương (Khen thưởng, nhân rộng)</option>
                  <option value="REMINDER">⚠ Nhắc nhở (Khắc phục hạn chế, chấn chỉnh)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Đối tượng (Cá nhân / Tập thể)</label>
                <input
                  type="text"
                  value={editingItem.targetName}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      targetName: e.target.value,
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Ngày ghi nhận</label>
                <input
                  type="date"
                  value={editingItem.date}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Nội dung chi tiết</label>
                <textarea
                  rows={4}
                  value={editingItem.content}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      content: e.target.value,
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-[3px] focus:outline-none focus:border-[#b91c1c] text-zinc-900 resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
