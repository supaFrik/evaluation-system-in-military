'use client';

import React, { useState } from 'react';
import { Soldier, DailyScore, Platoon, ScoreDecisionDocument, ViolationRecord } from '@/lib/types';
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
}

type EditField = 'politicalScore' | 'taskScore' | 'hygieneScore' | 'bearingScore';

interface InlineEditState {
  soldierId: string;
  field: EditField;
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
}: DailyScoringSheetProps) {
  const [selectedPlatoonId, setSelectedPlatoonId] = useState<string>(platoons[0]?.id || 'td1');
  const [localScores, setLocalScores] = useState<Record<string, DailyScore>>({});
  const [inlineEditState, setInlineEditState] = useState<InlineEditState | null>(null);

  // Dialog state for full soldier score edit & decision file attachment
  const [editingSoldier, setEditingSoldier] = useState<Soldier | null>(null);
  const [dialogScore, setDialogScore] = useState<DailyScore | null>(null);
  const [hasDecisionDoc, setHasDecisionDoc] = useState<boolean>(false);
  const [customViolationText, setCustomViolationText] = useState<string>('');
  const [customViolationPoints, setCustomViolationPoints] = useState<number>(-5);

  const platoonSoldiers = soldiers.filter((s) => s.platoonId === selectedPlatoonId);

  const getSoldierScore = (soldier: Soldier): DailyScore => {
    if (localScores[soldier.id]) return localScores[soldier.id];
    const existing = dailyScores.find(
      (s) => s.soldierId === soldier.id && s.date === selectedDate
    );
    if (existing) return existing;
    return {
      id: `sc-${soldier.id}-${selectedDate}`,
      soldierId: soldier.id,
      soldierName: soldier.name,
      platoonId: soldier.platoonId,
      date: selectedDate,
      politicalScore: 100,
      taskScore: 100,
      hygieneScore: 100,
      bearingScore: 100,
      totalScore: 400,
      violations: [],
      evaluatedBy: evaluatorName,
    };
  };

  // Inline single cell edit commit
  const commitInlineEdit = (soldier: Soldier) => {
    if (!inlineEditState || inlineEditState.soldierId !== soldier.id) return;
    const current = getSoldierScore(soldier);
    const clamped = Math.max(0, Math.min(100, parseInt(inlineEditState.value) || 0));
    const updated: DailyScore = {
      ...current,
      [inlineEditState.field]: clamped,
    };
    updated.totalScore =
      updated.politicalScore + updated.taskScore + updated.hygieneScore + updated.bearingScore;
    setLocalScores((prev) => ({ ...prev, [soldier.id]: updated }));
    setInlineEditState(null);
  };

  const cancelInlineEdit = () => setInlineEditState(null);

  const startInlineEdit = (soldierId: string, field: EditField, currentVal: number) => {
    setInlineEditState({ soldierId, field, value: String(currentVal) });
  };

  // Open full edit modal for a soldier
  const handleOpenEditModal = (soldier: Soldier) => {
    const sc = { ...getSoldierScore(soldier) };
    setEditingSoldier(soldier);
    setDialogScore(sc);
    setHasDecisionDoc(!!sc.decisionDocument);
    setCustomViolationText('');
  };

  const handleSaveModal = () => {
    if (!dialogScore || !editingSoldier) return;
    const updated: DailyScore = {
      ...dialogScore,
      decisionDocument: hasDecisionDoc ? dialogScore.decisionDocument : undefined,
      totalScore:
        dialogScore.politicalScore +
        dialogScore.taskScore +
        dialogScore.hygieneScore +
        dialogScore.bearingScore,
    };
    setLocalScores((prev) => ({ ...prev, [editingSoldier.id]: updated }));
    onSaveScore(updated);
    notify.success('Cập nhật thành công', `Đã lưu điểm và hồ sơ thi đua của ${editingSoldier.name}`);
    setEditingSoldier(null);
    setDialogScore(null);
  };

  // Add violation inside modal
  const handleAddViolation = (content: string, points: number, category: string) => {
    if (!dialogScore || !content.trim()) return;
    const newViolation: ViolationRecord = {
      id: `v-${Date.now()}`,
      category: category as any,
      content: content.trim(),
      points,
    };
    const fieldMap: Record<string, EditField> = {
      noi_vu: 'hygieneScore',
      chinh_tri: 'politicalScore',
      nhiem_vu: 'taskScore',
      tac_phong: 'bearingScore',
    };
    const field = fieldMap[category] || 'bearingScore';
    const newScore = Math.max(0, Math.min(100, dialogScore[field] + points));
    const nextViolations = [...dialogScore.violations, newViolation];

    setDialogScore({
      ...dialogScore,
      [field]: newScore,
      violations: nextViolations,
      totalScore:
        (field === 'politicalScore' ? newScore : dialogScore.politicalScore) +
        (field === 'taskScore' ? newScore : dialogScore.taskScore) +
        (field === 'hygieneScore' ? newScore : dialogScore.hygieneScore) +
        (field === 'bearingScore' ? newScore : dialogScore.bearingScore),
    });
  };

  const handleRemoveViolation = (violationId: string) => {
    if (!dialogScore) return;
    const v = dialogScore.violations.find((x) => x.id === violationId);
    if (!v) return;
    const fieldMap: Record<string, EditField> = {
      noi_vu: 'hygieneScore',
      chinh_tri: 'politicalScore',
      nhiem_vu: 'taskScore',
      tac_phong: 'bearingScore',
    };
    const field = fieldMap[v.category] || 'bearingScore';
    const revertedScore = Math.max(0, Math.min(100, dialogScore[field] - v.points));

    setDialogScore({
      ...dialogScore,
      [field]: revertedScore,
      violations: dialogScore.violations.filter((x) => x.id !== violationId),
      totalScore:
        (field === 'politicalScore' ? revertedScore : dialogScore.politicalScore) +
        (field === 'taskScore' ? revertedScore : dialogScore.taskScore) +
        (field === 'hygieneScore' ? revertedScore : dialogScore.hygieneScore) +
        (field === 'bearingScore' ? revertedScore : dialogScore.bearingScore),
    });
  };

  // Handle mock file upload for decision document
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
    platoonSoldiers.forEach((soldier) => {
      onSaveScore(getSoldierScore(soldier));
    });
    notify.success('Đã lưu toàn bộ bảng điểm thành công!');
  };

  // Totals for footer
  const platoonTotals = platoonSoldiers.reduce(
    (acc, s) => {
      const sc = getSoldierScore(s);
      return {
        political: acc.political + sc.politicalScore,
        task: acc.task + sc.taskScore,
        hygiene: acc.hygiene + sc.hygieneScore,
        bearing: acc.bearing + sc.bearingScore,
        total: acc.total + sc.totalScore,
      };
    },
    { political: 0, task: 0, hygiene: 0, bearing: 0, total: 0 }
  );
  const count = platoonSoldiers.length || 1;

  // Inline editable cell
  const ScoreCell = ({
    soldier,
    field,
    label,
  }: {
    soldier: Soldier;
    field: EditField;
    label: string;
  }) => {
    const score = getSoldierScore(soldier);
    const value = score[field];
    const isEditing =
      inlineEditState?.soldierId === soldier.id && inlineEditState?.field === field;

    if (isEditing) {
      return (
        <TableCell className="text-center p-1.5">
          <div className="flex items-center justify-center gap-1">
            <input
              autoFocus
              type="number"
              min={0}
              max={100}
              value={inlineEditState.value}
              onChange={(e) =>
                setInlineEditState((prev) => (prev ? { ...prev, value: e.target.value } : null))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitInlineEdit(soldier);
                if (e.key === 'Escape') cancelInlineEdit();
              }}
              className="w-14 rounded border border-[#b91c1c] py-0.5 text-center font-mono text-xs font-semibold focus:outline-none"
            />
            <button
              onClick={() => commitInlineEdit(soldier)}
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
      <TableCell className="text-center p-2 group">
        <button
          onClick={() => startInlineEdit(soldier.id, field, value)}
          title={`Chỉnh sửa ${label}`}
          className="inline-flex items-center gap-1 font-mono font-medium text-zinc-800 hover:text-[#b91c1c] transition-colors"
        >
          <span>{value}</span>
          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
        </button>
      </TableCell>
    );
  };

  return (
    <div className="w-full max-w-5xl py-2 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Nhập Điểm Thi Đua Hằng Ngày
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Nhấn nút <span className="font-semibold text-zinc-700">Chỉnh sửa</span> để cập nhật điểm, bổ sung vi phạm và đính kèm tệp quyết định kỷ luật/khen thưởng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPlatoonId}
            onChange={(e) => {
              setSelectedPlatoonId(e.target.value);
              setInlineEditState(null);
            }}
            className="rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 focus:border-[#b91c1c] focus:outline-none"
          >
            {platoons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                onChangeDate(e.target.value);
                setLocalScores({});
                setInlineEditState(null);
              }}
              className="rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-[#b91c1c]"
            />
          </div>

          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 rounded bg-[#b91c1c] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-800 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            Lưu bảng điểm
          </button>
        </div>
      </div>

      {/* Shadcn Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
            <TableHead className="w-10 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wide">
              STT
            </TableHead>
            <TableHead className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
              Quân nhân
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-zinc-600 uppercase tracking-wide whitespace-normal leading-tight w-24">
              1. Chính trị<br /><span className="font-normal text-zinc-400 normal-case">(100đ)</span>
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-zinc-600 uppercase tracking-wide whitespace-normal leading-tight w-24">
              2. Nhiệm vụ<br /><span className="font-normal text-zinc-400 normal-case">(100đ)</span>
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-zinc-600 uppercase tracking-wide whitespace-normal leading-tight w-24">
              3. Nội vụ<br /><span className="font-normal text-zinc-400 normal-case">(100đ)</span>
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-zinc-600 uppercase tracking-wide whitespace-normal leading-tight w-24">
              4. Tác phong<br /><span className="font-normal text-zinc-400 normal-case">(100đ)</span>
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-zinc-900 uppercase tracking-wide w-20">
              Tổng
            </TableHead>
            <TableHead className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
              Vi phạm / Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {platoonSoldiers.map((soldier, idx) => {
            const sc = getSoldierScore(soldier);

            return (
              <TableRow key={soldier.id}>
                <TableCell className="text-center text-xs text-zinc-400 font-mono">
                  {idx + 1}
                </TableCell>

                <TableCell>
                  <div className="font-semibold text-xs uppercase text-zinc-900">
                    {soldier.name}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {soldier.rank} — {soldier.squadName}
                  </div>
                </TableCell>

                <ScoreCell soldier={soldier} field="politicalScore" label="Chính trị" />
                <ScoreCell soldier={soldier} field="taskScore" label="Nhiệm vụ" />
                <ScoreCell soldier={soldier} field="hygieneScore" label="Nội vụ" />
                <ScoreCell soldier={soldier} field="bearingScore" label="Tác phong" />

                <TableCell className="text-center font-mono font-bold text-[#b91c1c]">
                  {sc.totalScore}
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* EDIT BUTTON replacing the old dropdown */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(soldier)}
                      className="inline-flex items-center gap-1 rounded border border-[#b91c1c] bg-red-50/50 px-2.5 py-1 text-xs font-semibold text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white transition-colors"
                      title="Chỉnh sửa chi tiết điểm và quyết định"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Chỉnh sửa</span>
                    </button>

                    {/* Commendation / reminder shortcut */}
                    <button
                      type="button"
                      onClick={() => onOpenCommendationModal(soldier)}
                      className="inline-flex items-center gap-1 rounded border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-600 hover:border-zinc-400 transition-colors"
                    >
                      Biểu dương / nhắc nhở
                    </button>
                  </div>

                  {/* Attached Decision Document badge */}
                  {sc.decisionDocument && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 max-w-fit">
                      <FileText className="h-3 w-3 text-amber-700" />
                      <span className="font-semibold">{sc.decisionDocument.documentNumber}</span>
                      {sc.decisionDocument.fileName && (
                        <span className="text-zinc-500 font-mono italic">({sc.decisionDocument.fileName})</span>
                      )}
                    </div>
                  )}

                  {/* Applied violations badges */}
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
          <TableRow className="bg-zinc-50 font-semibold">
            <TableCell colSpan={2} className="text-xs uppercase tracking-wide text-zinc-700">
              Trung bình cả trung đội
            </TableCell>
            <TableCell className="text-center font-mono text-xs">
              {(platoonTotals.political / count).toFixed(1)}
            </TableCell>
            <TableCell className="text-center font-mono text-xs">
              {(platoonTotals.task / count).toFixed(1)}
            </TableCell>
            <TableCell className="text-center font-mono text-xs">
              {(platoonTotals.hygiene / count).toFixed(1)}
            </TableCell>
            <TableCell className="text-center font-mono text-xs">
              {(platoonTotals.bearing / count).toFixed(1)}
            </TableCell>
            <TableCell className="text-center font-mono font-bold text-[#b91c1c]">
              {(platoonTotals.total / count).toFixed(1)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>

      {/* Guide */}
      <div className="border-t border-zinc-100 pt-3 text-xs text-zinc-500 space-y-1">
        <p>• <strong className="text-zinc-700">Nút Chỉnh sửa:</strong> Mở bảng chi tiết để chỉnh sửa điểm cả 4 tiêu chí, ghi nhận hành vi vi phạm, và tải lên/đính kèm tệp quyết định kỷ luật hoặc biểu dương.</p>
        <p>• <strong className="text-zinc-700">Chỉnh sửa nhanh:</strong> Nhấp trực tiếp vào số điểm trong bảng để chỉnh sửa nhanh từng ô.</p>
      </div>

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

            {/* 4 Criteria Scores inputs */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                1. Điểm số các tiêu chí (Thang điểm 100)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3 rounded-md border border-zinc-200">
                <div>
                  <span className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Chính trị
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={dialogScore.politicalScore}
                    onChange={(e) =>
                      setDialogScore({
                        ...dialogScore,
                        politicalScore: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-center font-mono text-sm font-semibold focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Nhiệm vụ
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={dialogScore.taskScore}
                    onChange={(e) =>
                      setDialogScore({
                        ...dialogScore,
                        taskScore: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-center font-mono text-sm font-semibold focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Nội vụ vệ sinh
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={dialogScore.hygieneScore}
                    onChange={(e) =>
                      setDialogScore({
                        ...dialogScore,
                        hygieneScore: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-center font-mono text-sm font-semibold focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Lễ tiết tác phong
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={dialogScore.bearingScore}
                    onChange={(e) =>
                      setDialogScore({
                        ...dialogScore,
                        bearingScore: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-center font-mono text-sm font-semibold focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pr-1 text-xs text-zinc-600">
                Tổng cộng:{' '}
                <strong className="text-[#b91c1c] text-sm font-mono ml-1.5">
                  {dialogScore.politicalScore +
                    dialogScore.taskScore +
                    dialogScore.hygieneScore +
                    dialogScore.bearingScore}{' '}
                  / 400 đ
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
                    onClick={() => handleAddViolation(p.label, p.points, p.category)}
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
                      handleAddViolation(customViolationText, customViolationPoints, 'tac_phong');
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
