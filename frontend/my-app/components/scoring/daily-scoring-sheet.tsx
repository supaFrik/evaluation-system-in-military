'use client';

import React, { useState } from 'react';
import {
  Soldier,
  DailyScore,
  Platoon,
  ScoreDecisionDocument,
  ViolationRecord,
  EmulationCriterion,
  DailyLockStatus,
} from '@/lib/types';
import { QUICK_VIOLATION_PRESETS } from '@/lib/mock-data';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Save,
  Pencil,
  Check,
  X,
  Plus,
  Minus,
  FileText,
  Upload,
  Trash2,
  Paperclip,
  Lock,
  Unlock,
  SlidersHorizontal,
  ShieldCheck,
  AlertTriangle,
  History,
} from 'lucide-react';
import { notify } from '@/lib/notify';

interface DailyScoringSheetProps {
  platoons: Platoon[];
  soldiers: Soldier[];
  dailyScores: DailyScore[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onSaveScore: (score: DailyScore) => void;
  onOpenCommendationModal: (soldier: Soldier) => void;
  evaluatorName: string;
  criteria: EmulationCriterion[];
  lockStatus: DailyLockStatus;
  canLock?: boolean;
  onLockDate?: (date: string, note: string) => void;
  onUnlockDate?: (date: string, reason: string) => void;
  onNavigateToCriteria?: () => void;
}

interface InlineEditState {
  soldierId: string;
  criterionId: string;
  value: string;
}

export function DailyScoringSheet({
  platoons,
  soldiers,
  dailyScores,
  selectedDate,
  onChangeDate,
  onSaveScore,
  onOpenCommendationModal,
  evaluatorName,
  criteria,
  lockStatus,
  canLock = false,
  onLockDate,
  onUnlockDate,
  onNavigateToCriteria,
}: DailyScoringSheetProps) {
  const [selectedPlatoonId, setSelectedPlatoonId] = useState<string>(platoons[0]?.id || 'td1');
  const [localScores, setLocalScores] = useState<Record<string, DailyScore>>({});
  const [inlineEditState, setInlineEditState] = useState<InlineEditState | null>(null);

  // Modals for Lock / Unlock
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockNoteInput, setLockNoteInput] = useState('');
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockReasonInput, setUnlockReasonInput] = useState('');
  const [showUnlockHistoryModal, setShowUnlockHistoryModal] = useState(false);

  // Dialog state for full soldier score edit & decision file attachment
  const [editingSoldier, setEditingSoldier] = useState<Soldier | null>(null);
  const [dialogScore, setDialogScore] = useState<DailyScore | null>(null);
  const [hasDecisionDoc, setHasDecisionDoc] = useState<boolean>(false);
  const [customViolationText, setCustomViolationText] = useState<string>('');
  const [customViolationPoints, setCustomViolationPoints] = useState<number>(-5);
  const [violationTargetCrit, setViolationTargetCrit] = useState<string>('');

  const activeCriteria = criteria.filter((c) => c.isActive);
  const platoonSoldiers = soldiers.filter((s) => s.platoonId === selectedPlatoonId);
  const isLocked = lockStatus.isLocked;

  // Compute or get soldier score with dynamic criteria
  const getSoldierScore = (soldier: Soldier): DailyScore => {
    if (localScores[soldier.id]) return localScores[soldier.id];
    const existing = dailyScores.find(
      (s) => s.soldierId === soldier.id && s.date === selectedDate
    );

    if (existing) {
      const critScores = { ...(existing.criteriaScores || {}) };
      activeCriteria.forEach((crit) => {
        if (critScores[crit.id] === undefined) {
          if (crit.id === 'c_political') critScores[crit.id] = existing.politicalScore ?? crit.maxScore;
          else if (crit.id === 'c_task') critScores[crit.id] = existing.taskScore ?? crit.maxScore;
          else if (crit.id === 'c_hygiene') critScores[crit.id] = existing.hygieneScore ?? crit.maxScore;
          else if (crit.id === 'c_bearing') critScores[crit.id] = existing.bearingScore ?? crit.maxScore;
          else critScores[crit.id] = crit.maxScore;
        }
      });
      return {
        ...existing,
        criteriaScores: critScores,
      };
    }

    const defaultCritScores: Record<string, number> = {};
    activeCriteria.forEach((crit) => {
      defaultCritScores[crit.id] = crit.maxScore;
    });

    const sumMax = activeCriteria.reduce((sum, c) => sum + c.maxScore, 0);

    return {
      id: `sc-${soldier.id}-${selectedDate}`,
      soldierId: soldier.id,
      soldierName: soldier.name,
      platoonId: soldier.platoonId,
      date: selectedDate,
      criteriaScores: defaultCritScores,
      politicalScore: defaultCritScores['c_political'] ?? 100,
      taskScore: defaultCritScores['c_task'] ?? 100,
      hygieneScore: defaultCritScores['c_hygiene'] ?? 100,
      bearingScore: defaultCritScores['c_bearing'] ?? 100,
      totalScore: sumMax,
      violations: [],
      evaluatedBy: evaluatorName,
    };
  };

  // Inline cell edit commit
  const commitInlineEdit = (soldier: Soldier, crit: EmulationCriterion) => {
    if (!inlineEditState || inlineEditState.soldierId !== soldier.id) return;
    if (isLocked) {
      notify.error('Sổ đã khóa', 'Sổ thi đua đã chốt sau 21:00. Không thể chỉnh sửa trực tiếp.');
      setInlineEditState(null);
      return;
    }

    const current = getSoldierScore(soldier);
    const clamped = Math.max(0, Math.min(crit.maxScore, parseInt(inlineEditState.value) || 0));

    const updatedCritScores = {
      ...(current.criteriaScores || {}),
      [crit.id]: clamped,
    };

    // Calculate new total
    const criteriaTotal = activeCriteria.reduce(
      (sum, c) => sum + (updatedCritScores[c.id] ?? c.maxScore),
      0
    );
    const violationDeductions = (current.violations || []).reduce((acc, v) => acc + v.points, 0);
    const newTotal = Math.max(0, criteriaTotal + violationDeductions);

    const updated: DailyScore = {
      ...current,
      criteriaScores: updatedCritScores,
      politicalScore: updatedCritScores['c_political'] ?? current.politicalScore,
      taskScore: updatedCritScores['c_task'] ?? current.taskScore,
      hygieneScore: updatedCritScores['c_hygiene'] ?? current.hygieneScore,
      bearingScore: updatedCritScores['c_bearing'] ?? current.bearingScore,
      totalScore: newTotal,
    };

    setLocalScores((prev) => ({ ...prev, [soldier.id]: updated }));
    setInlineEditState(null);
  };

  const cancelInlineEdit = () => setInlineEditState(null);

  const startInlineEdit = (soldierId: string, criterionId: string, currentVal: number) => {
    if (isLocked) {
      notify.warning(
        'Sổ thi đua đã chốt',
        'Sổ đã được phê duyệt và khóa sau 21:00. Vui lòng liên hệ Chỉ huy để mở khóa nếu cần sửa.'
      );
      return;
    }
    setInlineEditState({ soldierId, criterionId, value: String(currentVal) });
  };

  // Open full edit modal for a soldier
  const handleOpenEditModal = (soldier: Soldier) => {
    if (isLocked && !canLock) {
      notify.warning(
        'Sổ thi đua đã chốt',
        'Sổ đã được chốt và khóa sau điểm danh tối 21:00. Chỉ có Chỉ huy mới có thẩm quyền mở khóa.'
      );
      return;
    }
    const sc = { ...getSoldierScore(soldier) };
    setEditingSoldier(soldier);
    setDialogScore(sc);
    setHasDecisionDoc(!!sc.decisionDocument);
    setCustomViolationText('');
    setViolationTargetCrit(activeCriteria[0]?.id || '');
  };

  const handleSaveModal = () => {
    if (!dialogScore || !editingSoldier) return;
    const critScores = dialogScore.criteriaScores || {};
    const critTotal = activeCriteria.reduce(
      (sum, c) => sum + (critScores[c.id] ?? c.maxScore),
      0
    );
    const violationSum = (dialogScore.violations || []).reduce((sum, v) => sum + v.points, 0);
    const totalScore = Math.max(0, critTotal + violationSum);

    const updated: DailyScore = {
      ...dialogScore,
      totalScore,
      decisionDocument: hasDecisionDoc ? dialogScore.decisionDocument : undefined,
    };
    setLocalScores((prev) => ({ ...prev, [editingSoldier.id]: updated }));
    onSaveScore(updated);
    notify.success('Cập nhật thành công', `Đã lưu điểm và hồ sơ thi đua của ${editingSoldier.name}`);
    setEditingSoldier(null);
    setDialogScore(null);
  };

  // Add violation inside modal
  const handleAddViolation = (content: string, points: number, critId?: string) => {
    if (!dialogScore || !content.trim()) return;
    const newViolation: ViolationRecord = {
      id: `v-${Date.now()}`,
      category: 'tac_phong',
      content: content.trim(),
      points,
    };

    const targetCritId = critId || activeCriteria[0]?.id;
    const targetCrit = activeCriteria.find((c) => c.id === targetCritId) || activeCriteria[0];
    const currentCritScores = { ...(dialogScore.criteriaScores || {}) };
    const oldScore = currentCritScores[targetCrit.id] ?? targetCrit.maxScore;
    const newScore = Math.max(0, Math.min(targetCrit.maxScore, oldScore + points));
    currentCritScores[targetCrit.id] = newScore;

    const nextViolations = [...dialogScore.violations, newViolation];
    const critTotal = activeCriteria.reduce(
      (sum, c) => sum + (currentCritScores[c.id] ?? c.maxScore),
      0
    );
    const totalScore = Math.max(0, critTotal);

    setDialogScore({
      ...dialogScore,
      criteriaScores: currentCritScores,
      politicalScore: currentCritScores['c_political'] ?? dialogScore.politicalScore,
      taskScore: currentCritScores['c_task'] ?? dialogScore.taskScore,
      hygieneScore: currentCritScores['c_hygiene'] ?? dialogScore.hygieneScore,
      bearingScore: currentCritScores['c_bearing'] ?? dialogScore.bearingScore,
      violations: nextViolations,
      totalScore,
    });
  };

  const handleRemoveViolation = (violationId: string) => {
    if (!dialogScore) return;
    const v = dialogScore.violations.find((x) => x.id === violationId);
    if (!v) return;

    const nextViolations = dialogScore.violations.filter((x) => x.id !== violationId);
    setDialogScore({
      ...dialogScore,
      violations: nextViolations,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !dialogScore) return;
    const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
    setDialogScore({
      ...dialogScore,
      decisionDocument: {
        documentNumber: dialogScore.decisionDocument?.documentNumber || `QĐ-${Date.now().toString().slice(-4)}`,
        documentType: dialogScore.decisionDocument?.documentType || 'Quyết định xử lý thi đua',
        issuedBy: dialogScore.decisionDocument?.issuedBy || evaluatorName,
        issuedDate: dialogScore.decisionDocument?.issuedDate || selectedDate,
        fileName: file.name,
        fileSize: sizeStr,
        notes: dialogScore.decisionDocument?.notes || '',
      },
    });
    notify.info('Đã đính kèm tệp', file.name);
  };

  const handleSaveAll = () => {
    if (isLocked) {
      notify.error('Sổ đã khóa', 'Sổ thi đua đã chốt sau 21:00. Không thể lưu thay đổi.');
      return;
    }
    platoonSoldiers.forEach((soldier) => {
      onSaveScore(getSoldierScore(soldier));
    });
    notify.success('Đã lưu toàn bộ bảng điểm thành công!');
  };

  // Lock & Unlock handlers
  const handleConfirmLock = () => {
    if (onLockDate) {
      onLockDate(selectedDate, lockNoteInput.trim() || 'Chỉ huy đơn vị đã phê duyệt chốt sổ thi đua.');
      notify.success('Đã chốt sổ thi đua', `Đã khóa sổ ngày ${selectedDate} sau điểm danh tối.`);
    }
    setIsLockModalOpen(false);
    setLockNoteInput('');
  };

  const handleConfirmUnlock = () => {
    if (!unlockReasonInput.trim()) {
      notify.error('Thiếu lý do', 'Vui lòng nhập lý do mở khóa sổ để lưu vào biên bản kiểm toán.');
      return;
    }
    if (onUnlockDate) {
      onUnlockDate(selectedDate, unlockReasonInput.trim());
      notify.info('Đã mở khóa sổ', `Sổ ngày ${selectedDate} đã được mở cho phép bổ sung điểm.`);
    }
    setIsUnlockModalOpen(false);
    setUnlockReasonInput('');
  };

  // Criteria totals for footer
  const count = platoonSoldiers.length || 1;
  const criteriaTotals: Record<string, number> = {};
  activeCriteria.forEach((crit) => {
    const sum = platoonSoldiers.reduce((acc, s) => {
      const sc = getSoldierScore(s);
      return acc + (sc.criteriaScores?.[crit.id] ?? crit.maxScore);
    }, 0);
    criteriaTotals[crit.id] = Math.round((sum / count) * 10) / 10;
  });

  const totalAverage = Math.round(
    platoonSoldiers.reduce((acc, s) => acc + getSoldierScore(s).totalScore, 0) / count
  );

  return (
    <div className="w-full max-w-6xl py-2 space-y-6">
      {/* ── Daily Lock & Approval Status Banner ──────────────────────── */}
      <div
        className={`border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm transition-all ${
          isLocked
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="flex items-start md:items-center gap-3">
          <div
            className={`p-2.5 rounded-full shrink-0 ${
              isLocked
                ? 'bg-amber-200 text-amber-900 border border-amber-300'
                : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
            }`}
          >
            {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isLocked
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}
              >
                {isLocked ? 'ĐÃ CHỐT SỔ THI ĐUA (KHÓA)' : 'SỔ THI ĐUA ĐANG MỞ CHẤM ĐIỂM'}
              </span>
              <span className="text-xs font-semibold text-zinc-800">
                Ngày: {selectedDate}
              </span>
              {isLocked && lockStatus.lockedBy && (
                <span className="text-xs text-zinc-600 bg-white/60 px-1.5 py-0.5 rounded">
                  Phê duyệt bởi: <strong>{lockStatus.lockedBy}</strong>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 mt-1">
              {isLocked
                ? lockStatus.lockNote ||
                  'Sổ thi đua ngày đã được kiểm duyệt và chốt sau điểm danh tối 21:00. Không thể tùy tiện sửa điểm khi chưa có lệnh mở khóa của Chỉ huy.'
                : 'Cán bộ chấm điểm hoàn tất nhập điểm và hồ sơ trước 21:00 hằng ngày (sau giờ điểm danh tối hệ thống sẽ tự động chốt).'}
            </p>
          </div>
        </div>

        {/* Lock / Unlock actions */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {lockStatus.unlockHistory && lockStatus.unlockHistory.length > 0 && (
            <button
              onClick={() => setShowUnlockHistoryModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-300 px-2 py-1.5 rounded shadow-xs"
              title="Xem nhật ký mở khóa sửa điểm"
            >
              <History className="w-3.5 h-3.5" />
              <span>Nhật ký mở khóa ({lockStatus.unlockHistory.length})</span>
            </button>
          )}

          {canLock && (
            <>
              {isLocked ? (
                <button
                  onClick={() => setIsUnlockModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded shadow-xs transition"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Mở khóa sổ để sửa</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsLockModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded shadow-xs transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Chốt sổ & Phê duyệt (21:00)</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Header & Controls ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <span>Bảng Điểm Thi Đua Quân Nhân</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Đánh giá theo {activeCriteria.length} tiêu chí thi đua đang áp dụng. Bấm số điểm để sửa nhanh hoặc bấm <span className="font-semibold text-zinc-700">Chỉnh sửa</span> để thêm hồ sơ vi phạm/quyết định.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick link to criteria settings */}
          {onNavigateToCriteria && (
            <button
              onClick={onNavigateToCriteria}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded shadow-xs"
              title="Quản lý và thiết lập danh mục tiêu chí thi đua"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Cấu hình tiêu chí</span>
            </button>
          )}

          <select
            value={selectedPlatoonId}
            onChange={(e) => {
              setSelectedPlatoonId(e.target.value);
              setInlineEditState(null);
            }}
            className="rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 focus:border-[#b91c1c] focus:outline-none"
          >
            {platoons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-white border border-zinc-300 rounded px-2 py-1">
            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                onChangeDate(e.target.value);
                setLocalScores({});
                setInlineEditState(null);
              }}
              className="text-xs text-zinc-800 focus:outline-none bg-transparent"
            />
          </div>

          <button
            onClick={handleSaveAll}
            disabled={isLocked}
            className={`inline-flex items-center gap-1.5 rounded px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-xs ${
              isLocked
                ? 'bg-zinc-400 cursor-not-allowed opacity-70'
                : 'bg-[#b91c1c] hover:bg-red-800'
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            Lưu bảng điểm
          </button>
        </div>
      </div>

      {/* ── Dynamic Criteria Table ────────────────────────────────────── */}
      <div className="overflow-x-auto border border-zinc-200 rounded-lg shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-100/80 hover:bg-zinc-100/80 border-b border-zinc-200">
              <TableHead className="w-10 text-center text-xs font-bold text-zinc-700 uppercase tracking-wide">
                STT
              </TableHead>
              <TableHead className="text-xs font-bold text-zinc-800 uppercase tracking-wide min-w-[160px]">
                Quân nhân
              </TableHead>

              {/* Dynamic criteria columns */}
              {activeCriteria.map((crit, idx) => (
                <TableHead
                  key={crit.id}
                  className="text-center text-xs font-bold text-zinc-800 uppercase tracking-wide whitespace-normal leading-tight min-w-[110px]"
                >
                  <div>
                    {idx + 1}. {crit.name}
                  </div>
                  <span className="font-normal text-zinc-500 normal-case text-[11px]">
                    ({crit.maxScore}đ)
                  </span>
                </TableHead>
              ))}

              <TableHead className="text-center text-xs font-bold text-[#b91c1c] uppercase tracking-wide w-24">
                Tổng điểm
              </TableHead>
              <TableHead className="text-xs font-bold text-zinc-800 uppercase tracking-wide min-w-[190px]">
                Vi phạm / Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {platoonSoldiers.map((soldier, idx) => {
              const sc = getSoldierScore(soldier);

              return (
                <TableRow key={soldier.id} className="hover:bg-zinc-50/70 border-b border-zinc-200">
                  <TableCell className="text-center text-xs text-zinc-500 font-mono">
                    {idx + 1}
                  </TableCell>

                  <TableCell>
                    <div className="font-bold text-xs uppercase text-zinc-900">
                      {soldier.name}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {soldier.rank} — {soldier.squadName}
                    </div>
                  </TableCell>

                  {/* Dynamic criteria cells */}
                  {activeCriteria.map((crit) => {
                    const scoreVal = sc.criteriaScores?.[crit.id] ?? crit.maxScore;
                    const isEditing =
                      inlineEditState?.soldierId === soldier.id &&
                      inlineEditState?.criterionId === crit.id;

                    if (isEditing) {
                      return (
                        <TableCell key={crit.id} className="text-center p-1.5">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              autoFocus
                              type="number"
                              min={0}
                              max={crit.maxScore}
                              value={inlineEditState.value}
                              onChange={(e) =>
                                setInlineEditState((prev) =>
                                  prev ? { ...prev, value: e.target.value } : null
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitInlineEdit(soldier, crit);
                                if (e.key === 'Escape') cancelInlineEdit();
                              }}
                              className="w-14 rounded border border-[#b91c1c] py-0.5 text-center font-mono text-xs font-bold focus:outline-none"
                            />
                            <button
                              onClick={() => commitInlineEdit(soldier, crit)}
                              className="text-emerald-600 hover:text-emerald-700"
                              title="Xác nhận"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={cancelInlineEdit}
                              className="text-zinc-400 hover:text-zinc-600"
                              title="Hủy"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={crit.id} className="text-center p-2 group">
                        <button
                          onClick={() => startInlineEdit(soldier.id, crit.id, scoreVal)}
                          disabled={isLocked}
                          title={
                            isLocked
                              ? 'Sổ đã khóa sau 21:00'
                              : `Bấm để sửa điểm ${crit.name} (Tối đa ${crit.maxScore})`
                          }
                          className={`inline-flex items-center gap-1 font-mono font-semibold transition-colors ${
                            isLocked
                              ? 'text-zinc-700 cursor-not-allowed'
                              : 'text-zinc-900 hover:text-[#b91c1c]'
                          }`}
                        >
                          <span>{scoreVal}</span>
                          {!isLocked && (
                            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                          )}
                        </button>
                      </TableCell>
                    );
                  })}

                  <TableCell className="text-center font-mono font-bold text-sm text-[#b91c1c]">
                    {sc.totalScore}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(soldier)}
                        disabled={isLocked && !canLock}
                        className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs font-semibold transition-colors ${
                          isLocked && !canLock
                            ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            : 'border-[#b91c1c] bg-red-50/60 text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white'
                        }`}
                        title={
                          isLocked && !canLock
                            ? 'Sổ đã chốt 21:00'
                            : 'Chỉnh sửa chi tiết điểm và hồ sơ đính kèm'
                        }
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Chỉnh sửa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenCommendationModal(soldier)}
                        className="inline-flex items-center gap-1 rounded border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-600 hover:border-zinc-400 transition-colors bg-white"
                      >
                        Biểu dương / nhắc nhở
                      </button>
                    </div>

                    {sc.decisionDocument && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 max-w-fit">
                        <FileText className="h-3 w-3 text-amber-700" />
                        <span className="font-semibold">{sc.decisionDocument.documentNumber}</span>
                        {sc.decisionDocument.fileName && (
                          <span className="text-zinc-500 font-mono italic">
                            ({sc.decisionDocument.fileName})
                          </span>
                        )}
                      </div>
                    )}

                    {sc.violations.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {sc.violations.map((v) => (
                          <span
                            key={v.id}
                            className={`inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] ${
                              v.points < 0
                                ? 'border-red-200 bg-red-50 text-red-800'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {v.points < 0 ? (
                              <Minus className="h-2.5 w-2.5" />
                            ) : (
                              <Plus className="h-2.5 w-2.5" />
                            )}
                            {v.content.replace(/ \([+-]\d+đ\)/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          <TableFooter>
            <TableRow className="bg-zinc-100 font-bold border-t-2 border-zinc-300">
              <TableCell colSpan={2} className="text-xs uppercase tracking-wide text-zinc-800">
                Trung bình cả trung đội
              </TableCell>

              {activeCriteria.map((crit) => (
                <TableCell key={crit.id} className="text-center font-mono text-xs text-zinc-900">
                  {criteriaTotals[crit.id] || 0}
                </TableCell>
              ))}

              <TableCell className="text-center font-mono font-bold text-sm text-[#b91c1c]">
                {totalAverage}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Guide Note */}
      <div className="border-t border-zinc-200 pt-3 text-xs text-zinc-500 space-y-1">
        <p>
          • <strong className="text-zinc-700">Quy chế chốt sổ:</strong> Sổ tự động đóng sau 21:00 (sau giờ điểm danh tối của đơn vị). Chỉ huy có quyền chốt sổ sớm hoặc mở khóa để hiệu chỉnh nếu cần.
        </p>
        <p>
          • <strong className="text-zinc-700">Tiêu chí thi đua:</strong> Bảng điểm tự động điều chỉnh theo các tiêu chí đang được kích hoạt tại tab &ldquo;Sổ tay Tiêu chí&rdquo;.
        </p>
      </div>

      {/* ── MODAL: CHỐT SỔ & PHÊ DUYỆT ───────────────────────────────── */}
      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-lg border border-zinc-200 shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 border-b border-zinc-200 pb-3">
              <ShieldCheck className="w-5 h-5 text-[#b91c1c]" />
              <h3 className="font-bold text-sm uppercase">Chốt Sổ & Phê Duyệt Điểm Ngày</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Đồng chí đang thực hiện chốt sổ thi đua ngày <strong>{selectedDate}</strong> sau giờ điểm danh tối. Sau khi chốt, người chấm điểm sẽ không thể tùy ý thay đổi điểm số.
            </p>
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-zinc-700 block">
                Nhận xét & Ghi chú của Chỉ huy:
              </label>
              <textarea
                rows={3}
                value={lockNoteInput}
                onChange={(e) => setLockNoteInput(e.target.value)}
                placeholder="VD: Đã kiểm tra quân số và nhận xét điểm danh 21:00. Đồng ý phê duyệt kết quả thi đua trong ngày."
                className="w-full rounded border border-zinc-300 p-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setIsLockModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmLock}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded shadow-xs"
              >
                Xác nhận Chốt sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MỞ KHÓA SỔ ĐỂ HIỆU CHỈNH ───────────────────────────── */}
      {isUnlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-lg border border-zinc-200 shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 border-b border-zinc-200 pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm uppercase">Mở Khóa Sổ Thi Đua</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Mở khóa sổ ngày <strong>{selectedDate}</strong> cho phép cán bộ chấm điểm hiệu chỉnh lại điểm số hoặc bổ sung quyết định vi phạm/khen thưởng.
            </p>
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-zinc-700 block">
                Lý do mở khóa hiệu chỉnh (Bắt buộc để lưu biên bản kiểm toán) <span className="text-red-500">*</span>:
              </label>
              <textarea
                rows={3}
                required
                value={unlockReasonInput}
                onChange={(e) => setUnlockReasonInput(e.target.value)}
                placeholder="VD: Bổ sung biên bản kỷ luật vi phạm trễ giờ của Chiến sĩ Nguyễn Văn A..."
                className="w-full rounded border border-zinc-300 p-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlock}
                className="px-4 py-1.5 text-xs font-semibold text-amber-950 bg-amber-300 hover:bg-amber-400 rounded shadow-xs"
              >
                Xác nhận Mở khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: NHẬT KÝ MỞ KHÓA (AUDIT TRAIL) ───────────────────────── */}
      {showUnlockHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-lg border border-zinc-200 shadow-xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-zinc-700" />
                <h3 className="font-bold text-sm uppercase text-zinc-900">
                  Nhật Ký Mở Khóa Sổ — Ngày {selectedDate}
                </h3>
              </div>
              <button
                onClick={() => setShowUnlockHistoryModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {lockStatus.unlockHistory?.map((item, idx) => (
                <div key={idx} className="bg-zinc-50 border border-zinc-200 p-2.5 rounded">
                  <div className="flex justify-between items-center text-zinc-500 text-[11px] mb-1">
                    <span className="font-semibold text-zinc-800">{item.unlockedBy}</span>
                    <span className="font-mono">
                      {new Date(item.unlockedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-zinc-700 italic">&ldquo;{item.reason}&rdquo;</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2 border-t border-zinc-200">
              <button
                onClick={() => setShowUnlockHistoryModal(false)}
                className="px-3.5 py-1.5 text-xs bg-zinc-800 text-white rounded font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FULL EDIT MODAL FOR SOLDIER SCORE & DECISION ATTACHMENT ── */}
      {editingSoldier && dialogScore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 uppercase">
                  Chỉnh sửa Điểm Thi đua — {editingSoldier.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {editingSoldier.rank} • {editingSoldier.squadName} • Ngày {selectedDate}
                </p>
              </div>
              <button
                onClick={() => setEditingSoldier(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Dynamic Criteria Scores inputs */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                1. Điểm số các tiêu chí thi đua ({activeCriteria.length} tiêu chí áp dụng)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3 rounded-md border border-zinc-200">
                {activeCriteria.map((crit) => {
                  const currentVal = dialogScore.criteriaScores?.[crit.id] ?? crit.maxScore;

                  return (
                    <div key={crit.id}>
                      <span className="block text-[11px] font-medium text-zinc-700 mb-1 truncate" title={crit.name}>
                        {crit.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={crit.maxScore}
                          value={currentVal}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(crit.maxScore, parseInt(e.target.value) || 0));
                            setDialogScore({
                              ...dialogScore,
                              criteriaScores: {
                                ...(dialogScore.criteriaScores || {}),
                                [crit.id]: val,
                              },
                            });
                          }}
                          className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-center font-mono text-sm font-semibold focus:border-[#b91c1c] focus:outline-none"
                        />
                        <span className="text-[10px] text-zinc-400 font-mono">/{crit.maxScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total points summary */}
              <div className="flex justify-end pr-1 text-xs text-zinc-600 pt-1">
                Tổng cộng:{' '}
                <strong className="text-[#b91c1c] text-sm font-mono ml-1.5">
                  {activeCriteria.reduce(
                    (sum, c) => sum + (dialogScore.criteriaScores?.[c.id] ?? c.maxScore),
                    0
                  )}{' '}
                  / {activeCriteria.reduce((sum, c) => sum + c.maxScore, 0)} đ
                </strong>
              </div>
            </div>

            {/* Quick Violations Add & List */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                2. Ghi nhận vi phạm / thành tích
              </label>

              {/* Presets buttons */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_VIOLATION_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAddViolation(p.label, p.points)}
                    className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700"
                  >
                    <span>{p.label.replace(/ \([+-]\d+đ\)/, '')}</span>
                    <span
                      className={`font-mono font-bold text-[10px] ${
                        p.points > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {p.points > 0 ? `+${p.points}` : p.points}đ
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom violation input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Ghi nhận lỗi hoặc thành tích khác..."
                  value={customViolationText}
                  onChange={(e) => setCustomViolationText(e.target.value)}
                  className="flex-1 rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#b91c1c] focus:outline-none"
                />
                <select
                  value={violationTargetCrit}
                  onChange={(e) => setViolationTargetCrit(e.target.value)}
                  className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs"
                >
                  {activeCriteria.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={customViolationPoints}
                  onChange={(e) => setCustomViolationPoints(parseInt(e.target.value))}
                  className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs font-mono font-bold"
                >
                  <option value={-5}>-5 đ</option>
                  <option value={-10}>-10 đ</option>
                  <option value={-15}>-15 đ</option>
                  <option value={5}>+5 đ</option>
                  <option value={10}>+10 đ</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (customViolationText.trim()) {
                      handleAddViolation(customViolationText, customViolationPoints, violationTargetCrit);
                      setCustomViolationText('');
                    }
                  }}
                  className="rounded bg-zinc-800 text-white px-3 py-1.5 text-xs font-semibold hover:bg-zinc-700"
                >
                  Thêm
                </button>
              </div>

              {/* Active violations list */}
              {dialogScore.violations.length > 0 && (
                <div className="mt-2 space-y-1 rounded border border-zinc-200 bg-zinc-50/50 p-2">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                    Đã ghi nhận trong ngày:
                  </span>
                  <div className="space-y-1">
                    {dialogScore.violations.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between text-xs bg-white border border-zinc-200 px-2 py-1 rounded"
                      >
                        <span className="text-zinc-800">{v.content}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-xs ${
                              v.points > 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {v.points > 0 ? `+${v.points}` : v.points}đ
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveViolation(v.id)}
                            className="text-zinc-400 hover:text-red-600 p-0.5"
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. ATTACH DECISION FILE SECTION */}
            <div className="space-y-3 border-t border-zinc-200 pt-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-zinc-800">
                <input
                  type="checkbox"
                  checked={hasDecisionDoc}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasDecisionDoc(checked);
                    if (checked && !dialogScore.decisionDocument) {
                      setDialogScore({
                        ...dialogScore,
                        decisionDocument: {
                          documentNumber: '15/QĐ-ĐĐ1',
                          documentType: 'Quyết định kỷ luật khiển trách',
                          issuedBy: 'Đại đội trưởng',
                          issuedDate: selectedDate,
                          notes: '',
                        },
                      });
                    }
                  }}
                  className="h-4 w-4 accent-[#b91c1c]"
                />
                <span>3. Đính kèm Quyết định / Biên bản xử lý chính thức</span>
              </label>

              {hasDecisionDoc && (
                <div className="rounded-md border border-amber-200 bg-amber-50/40 p-3.5 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[11px] font-medium text-zinc-700 mb-1">
                        Số quyết định / Biên bản:
                      </span>
                      <input
                        type="text"
                        placeholder="VD: 15/QĐ-ĐĐ1 hoặc 04/BB-KL"
                        value={dialogScore.decisionDocument?.documentNumber || ''}
                        onChange={(e) =>
                          setDialogScore({
                            ...dialogScore,
                            decisionDocument: {
                              ...dialogScore.decisionDocument!,
                              documentNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#b91c1c] focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-zinc-700 mb-1">
                        Hình thức / Loại quyết định:
                      </span>
                      <select
                        value={dialogScore.decisionDocument?.documentType || 'Quyết định kỷ luật khiển trách'}
                        onChange={(e) =>
                          setDialogScore({
                            ...dialogScore,
                            decisionDocument: {
                              ...dialogScore.decisionDocument!,
                              documentType: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#b91c1c] focus:outline-none"
                      >
                        <option>Quyết định kỷ luật khiển trách</option>
                        <option>Quyết định kỷ luật cảnh cáo</option>
                        <option>Biên bản kiểm điểm trước đơn vị</option>
                        <option>Quyết định biểu dương khen thưởng</option>
                        <option>Văn bản chấn chỉnh nội vụ</option>
                      </select>
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-zinc-700 mb-1">
                        Cơ quan / Người ký:
                      </span>
                      <input
                        type="text"
                        placeholder="VD: Đại đội trưởng Nguyễn Thế Anh"
                        value={dialogScore.decisionDocument?.issuedBy || ''}
                        onChange={(e) =>
                          setDialogScore({
                            ...dialogScore,
                            decisionDocument: {
                              ...dialogScore.decisionDocument!,
                              issuedBy: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#b91c1c] focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-zinc-700 mb-1">
                        Ngày ban hành:
                      </span>
                      <input
                        type="date"
                        value={dialogScore.decisionDocument?.issuedDate || selectedDate}
                        onChange={(e) =>
                          setDialogScore({
                            ...dialogScore,
                            decisionDocument: {
                              ...dialogScore.decisionDocument!,
                              issuedDate: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#b91c1c] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* FILE ATTACHMENT UPLOAD INPUT */}
                  <div className="border border-dashed border-zinc-300 rounded-md p-3 bg-white">
                    <span className="block text-[11px] font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-zinc-500" />
                      Tệp đính kèm quyết định (PDF, Word, Ảnh quyết định):
                    </span>

                    {dialogScore.decisionDocument?.fileName ? (
                      <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1.5 text-xs">
                        <div className="flex items-center gap-2 text-zinc-800">
                          <FileText className="h-4 w-4 text-[#b91c1c]" />
                          <span className="font-medium truncate max-w-xs">
                            {dialogScore.decisionDocument.fileName}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {dialogScore.decisionDocument.fileSize}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setDialogScore({
                              ...dialogScore,
                              decisionDocument: {
                                ...dialogScore.decisionDocument!,
                                fileName: undefined,
                                fileSize: undefined,
                              },
                            })
                          }
                          className="text-zinc-400 hover:text-red-600 p-1"
                          title="Gỡ file đính kèm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 cursor-pointer py-2 text-xs text-zinc-600 hover:text-[#b91c1c] transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>Chọn tệp văn bản từ máy tính (PDF, DOCX, JPG...)</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-zinc-700 mb-1">
                      Trích yếu nội dung / Lý do:
                    </span>
                    <textarea
                      rows={2}
                      placeholder="Ghi rõ hành vi vi phạm hoặc lý do khen thưởng theo quyết định..."
                      value={dialogScore.decisionDocument?.notes || ''}
                      onChange={(e) =>
                        setDialogScore({
                          ...dialogScore,
                          decisionDocument: {
                            ...dialogScore.decisionDocument!,
                            notes: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#b91c1c] focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 border-t border-zinc-200 pt-4">
              <button
                type="button"
                onClick={() => setEditingSoldier(null)}
                className="rounded border border-zinc-300 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="rounded bg-[#b91c1c] px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-800 transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
