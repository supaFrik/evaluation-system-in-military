'use client';

import React, { useState } from 'react';
import { Soldier, Platoon, CommendationItem, DisciplineDocument } from '@/lib/types';
import { X, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { ALL_UNITS } from '@/lib/mock-data';

interface AddCommendationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<CommendationItem, 'id' | 'date'>) => void;
  soldiers: Soldier[];
  platoons: Platoon[];
  preselectedSoldier?: Soldier | null;
  authorName: string;
}

const DISCIPLINE_TYPES = [
  'Khiển trách',
  'Cảnh cáo',
  'Giáng cấp bậc quân hàm',
  'Tước danh hiệu quân nhân',
  'Buộc thôi phục vụ tại ngũ',
];

export function AddCommendationDialog({
  isOpen,
  onClose,
  onAdd,
  soldiers,
  platoons,
  preselectedSoldier,
  authorName,
}: AddCommendationDialogProps) {
  const [type, setType] = useState<'COMMENDATION' | 'REMINDER'>('COMMENDATION');
  const [scope, setScope] = useState<'INDIVIDUAL' | 'PLATOON'>('INDIVIDUAL');
  const [targetId, setTargetId] = useState<string>(
    preselectedSoldier?.id || soldiers[0]?.id || ''
  );
  const [content, setContent] = useState('');
  const [hasDisciplineDoc, setHasDisciplineDoc] = useState(false);
  const [disciplineDoc, setDisciplineDoc] = useState<Partial<DisciplineDocument>>({
    documentType: 'Khiển trách',
    documentNumber: '',
    issuedBy: authorName,
    issuedDate: new Date().toISOString().slice(0, 10),
    effectiveDate: new Date().toISOString().slice(0, 10),
    reason: '',
    duration: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    let targetName = '';
    let platoonId: string | undefined;

    if (scope === 'INDIVIDUAL') {
      const s = soldiers.find((x) => x.id === targetId);
      targetName = s ? `${s.rank} ${s.name} (${s.platoonName})` : targetId;
      platoonId = s?.platoonId;
    } else {
      const unit = ALL_UNITS.find((x) => x.id === targetId);
      const plat = platoons.find((x) => x.id === targetId);
      targetName = unit ? unit.name : plat ? plat.name : targetId;
      platoonId = unit
        ? unit.tier === 'PLATOON'
          ? unit.id
          : unit.parentId || targetId
        : targetId;
    }

    const disciplineDocument: DisciplineDocument | undefined =
      type === 'REMINDER' && hasDisciplineDoc && disciplineDoc.documentNumber
        ? {
            documentNumber: disciplineDoc.documentNumber || '',
            documentType: disciplineDoc.documentType || 'Khiển trách',
            issuedBy: disciplineDoc.issuedBy || authorName,
            issuedDate: disciplineDoc.issuedDate || '',
            effectiveDate: disciplineDoc.effectiveDate || '',
            reason: disciplineDoc.reason || '',
            duration: disciplineDoc.duration,
          }
        : undefined;

    onAdd({ type, scope, targetId, targetName, platoonId, content: content.trim(), createdBy: authorName, disciplineDocument });
    setContent('');
    setHasDisciplineDoc(false);
    setDisciplineDoc({ documentType: 'Khiển trách', documentNumber: '', issuedBy: authorName, issuedDate: new Date().toISOString().slice(0, 10), effectiveDate: new Date().toISOString().slice(0, 10), reason: '', duration: '' });
    onClose();
  };

  const labelCls = 'block text-xs font-semibold text-zinc-700 mb-1';
  const inputCls = 'w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-[#b91c1c] focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl rounded-t-xl sm:rounded-[3px] border border-zinc-300 bg-white p-4 sm:p-6 shadow-lg max-h-[92dvh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Mobile pull handle */}
        <div className="mx-auto -mt-1 mb-2 h-1.5 w-12 rounded-full bg-zinc-300 sm:hidden" />
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
          <h3 className="text-base font-semibold text-zinc-900">
            Ghi nhận Biểu dương / Nhắc nhở
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* 1. Type */}
          <div>
            <label className={labelCls}>Phân loại ghi nhận:</label>
            <div className="flex gap-5">
              {(['COMMENDATION', 'REMINDER'] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="type" checked={type === t}
                    onChange={() => { setType(t); setHasDisciplineDoc(false); }}
                    className="accent-[#b91c1c]" />
                  <span className={t === 'COMMENDATION' ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                    {t === 'COMMENDATION' ? '★ Biểu dương khen ngợi' : '⚠ Nhắc nhở khuyết điểm'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Scope */}
          <div>
            <label className={labelCls}>Đối tượng:</label>
            <div className="flex gap-5">
              {(['INDIVIDUAL', 'PLATOON'] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700">
                  <input type="radio" name="scope" checked={scope === s}
                    onChange={() => { setScope(s); setTargetId(s === 'INDIVIDUAL' ? soldiers[0]?.id : platoons[0]?.id); }}
                    className="accent-[#b91c1c]" />
                  {s === 'INDIVIDUAL' ? 'Cá nhân quân nhân' : 'Tập thể Trung đội'}
                </label>
              ))}
            </div>
          </div>

          {/* 3. Target */}
          <div>
            <label className={labelCls}>Chọn {scope === 'INDIVIDUAL' ? 'quân nhân' : 'tập thể đơn vị'}:</label>
            <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={inputCls}>
              {scope === 'INDIVIDUAL'
                ? soldiers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.rank} ({s.squadName}, {s.platoonName})
                    </option>
                  ))
                : ALL_UNITS.filter((u) => u.tier === 'PLATOON' || u.tier === 'COMPANY' || u.tier === 'SQUAD').map((u) => {
                    const typeLabel = u.tier === 'COMPANY' ? 'Đại đội' : u.tier === 'PLATOON' ? 'Trung đội' : 'Tiểu đội';
                    return (
                      <option key={u.id} value={u.id}>
                        {u.name} ({typeLabel} • {u.code})
                      </option>
                    );
                  })}
            </select>
          </div>

          {/* 4. Content */}
          <div>
            <label className={labelCls}>Nội dung chi tiết:</label>
            <textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Ghi rõ nội dung biểu dương hoặc khuyết điểm cần chấn chỉnh..."
              className={inputCls + ' resize-none'} required />
          </div>

          {/* 5. Discipline Document (only for REMINDER) */}
          {type === 'REMINDER' && (
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setHasDisciplineDoc(!hasDisciplineDoc)}
                className="flex w-full items-center justify-between px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 transition-colors text-xs font-semibold text-zinc-700"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-zinc-500" />
                  Đính kèm quyết định kỷ luật chính thức
                  {hasDisciplineDoc && disciplineDoc.documentNumber && (
                    <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800 border border-amber-200">
                      {disciplineDoc.documentNumber}
                    </span>
                  )}
                </span>
                {hasDisciplineDoc ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>

              {hasDisciplineDoc && (
                <div className="p-4 space-y-3 border-t border-zinc-200 bg-amber-50/30">
                  <p className="text-[11px] text-amber-800 italic">
                    Hồ sơ kỷ luật này sẽ được lưu vào hồ sơ quân nhân và báo cáo giao ban.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Số quyết định kỷ luật:</label>
                      <input type="text" value={disciplineDoc.documentNumber || ''} placeholder="Vd: QĐ-KL/01/2026"
                        onChange={(e) => setDisciplineDoc((p) => ({ ...p, documentNumber: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Hình thức kỷ luật:</label>
                      <select value={disciplineDoc.documentType}
                        onChange={(e) => setDisciplineDoc((p) => ({ ...p, documentType: e.target.value }))}
                        className={inputCls}>
                        {DISCIPLINE_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Ngày ký quyết định:</label>
                      <input type="date" value={disciplineDoc.issuedDate || ''}
                        onChange={(e) => setDisciplineDoc((p) => ({ ...p, issuedDate: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Ngày có hiệu lực:</label>
                      <input type="date" value={disciplineDoc.effectiveDate || ''}
                        onChange={(e) => setDisciplineDoc((p) => ({ ...p, effectiveDate: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Người ký quyết định:</label>
                      <input type="text" value={disciplineDoc.issuedBy || ''}
                        onChange={(e) => setDisciplineDoc((p) => ({ ...p, issuedBy: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Thời hạn thi hành (nếu có):</label>
                      <input type="text" value={disciplineDoc.duration || ''} placeholder="Vd: 6 tháng kể từ ngày ký"
                        onChange={(e) => setDisciplineDoc((p) => ({ ...p, duration: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Lý do kỷ luật chi tiết:</label>
                      <textarea rows={2} value={disciplineDoc.reason || ''}
                        placeholder="Ghi rõ hành vi vi phạm làm cơ sở xử lý kỷ luật..."
                        onChange={(e) => setDisciplineDoc((p) => ({ ...p, reason: e.target.value }))}
                        className={inputCls + ' resize-none'} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4">
            <button type="button" onClick={onClose}
              className="rounded border border-zinc-300 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100">
              Hủy
            </button>
            <button type="submit"
              className="rounded bg-[#b91c1c] px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-800">
              Ghi nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
